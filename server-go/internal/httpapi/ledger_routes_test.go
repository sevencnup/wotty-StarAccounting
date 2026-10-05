package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/auth"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/ledger"
)

func TestLedgerAccountRoutesReturnOwnedAccountsAndScopeWrites(t *testing.T) {
	repository := &httpLedgerRepository{
		accounts: []json.RawMessage{json.RawMessage(`{"id":"account-1","name":"默认账本","ownerId":"user-1"}`)},
	}
	handler, token := newLedgerHandler(t, repository)

	listRequest := httptest.NewRequest(http.MethodGet, "/api/accounts", nil)
	listRequest.Header.Set("Authorization", "Bearer "+token)
	listRecorder := httptest.NewRecorder()
	handler.ServeHTTP(listRecorder, listRequest)
	if listRecorder.Code != http.StatusOK || !strings.Contains(listRecorder.Body.String(), `"ownerId":"user-1"`) {
		t.Fatalf("list accounts = %d %s", listRecorder.Code, listRecorder.Body.String())
	}

	body := `{"id":"account-2","name":"新账本","ownerId":"attacker","openingBalance":0,"openingBalanceDate":null,"createdAt":"2026-10-05 12:00:00","updatedAt":"2026-10-05 12:00:00"}`
	saveRequest := httptest.NewRequest(http.MethodPost, "/api/accounts", strings.NewReader(body))
	saveRequest.Header.Set("Authorization", "Bearer "+token)
	saveRecorder := httptest.NewRecorder()
	handler.ServeHTTP(saveRecorder, saveRequest)
	if saveRecorder.Code != http.StatusNoContent {
		t.Fatalf("save account = %d %s", saveRecorder.Code, saveRecorder.Body.String())
	}
	if value := rawString(repository.upsertedPayload["ownerId"]); value != "user-1" {
		t.Fatalf("ownerId was not scoped to logged-in user: %q", value)
	}
}

func TestLedgerSyncScopesPayloadAndRejectsForeignAccount(t *testing.T) {
	repository := &httpLedgerRepository{}
	handler, token := newLedgerHandler(t, repository)

	foreignRequest := httptest.NewRequest(http.MethodGet, "/api/sync?accountId=foreign-account", nil)
	foreignRequest.Header.Set("Authorization", "Bearer "+token)
	foreignRecorder := httptest.NewRecorder()
	handler.ServeHTTP(foreignRecorder, foreignRequest)
	if foreignRecorder.Code != http.StatusForbidden || !strings.Contains(foreignRecorder.Body.String(), "无权访问该账本") {
		t.Fatalf("foreign sync = %d %s", foreignRecorder.Code, foreignRecorder.Body.String())
	}

	body := `{"id":"asset-1","entityType":"assets","accountId":"account-1","userId":"attacker","payload":{"id":"asset-1","accountId":"account-1","userId":"attacker"},"updatedAt":"2026-10-05 12:00:00"}`
	saveRequest := httptest.NewRequest(http.MethodPost, "/api/sync", strings.NewReader(body))
	saveRequest.Header.Set("Authorization", "Bearer "+token)
	saveRecorder := httptest.NewRecorder()
	handler.ServeHTTP(saveRecorder, saveRequest)
	if saveRecorder.Code != http.StatusNoContent {
		t.Fatalf("save sync record = %d %s", saveRecorder.Code, saveRecorder.Body.String())
	}
	if value := rawString(repository.upsertedPayload["userId"]); value != "user-1" {
		t.Fatalf("sync userId was not scoped to logged-in user: %q", value)
	}
}

func TestLedgerSyncOmitsNullScopeFields(t *testing.T) {
	repository := &httpLedgerRepository{
		records: []ledger.Record{{
			ID:         "plan-1",
			EntityType: ledger.SavingsPlans,
			Payload:    json.RawMessage(`{"id":"plan-1","goalId":"goal-1"}`),
			UpdatedAt:  "2026-10-05 12:00:00",
		}},
	}
	handler, token := newLedgerHandler(t, repository)
	request := httptest.NewRequest(http.MethodGet, "/api/sync?accountId=account-1", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("sync = %d %s", recorder.Code, recorder.Body.String())
	}
	if strings.Contains(recorder.Body.String(), `"accountId":null`) || strings.Contains(recorder.Body.String(), `"userId":null`) {
		t.Fatalf("sync emitted null scope fields: %s", recorder.Body.String())
	}
}

func TestLedgerTransactionRouteValidatesMonthAndBoundsPageSize(t *testing.T) {
	repository := &httpLedgerRepository{}
	handler, token := newLedgerHandler(t, repository)

	invalidRequest := httptest.NewRequest(http.MethodGet, "/api/transactions?accountId=account-1&month=2026-13", nil)
	invalidRequest.Header.Set("Authorization", "Bearer "+token)
	invalidRecorder := httptest.NewRecorder()
	handler.ServeHTTP(invalidRecorder, invalidRequest)
	if invalidRecorder.Code != http.StatusBadRequest {
		t.Fatalf("invalid month = %d %s", invalidRecorder.Code, invalidRecorder.Body.String())
	}

	validRequest := httptest.NewRequest(http.MethodGet, "/api/transactions?accountId=account-1&month=2026-10&page=0&pageSize=999", nil)
	validRequest.Header.Set("Authorization", "Bearer "+token)
	validRecorder := httptest.NewRecorder()
	handler.ServeHTTP(validRecorder, validRequest)
	if validRecorder.Code != http.StatusOK {
		t.Fatalf("valid transaction query = %d %s", validRecorder.Code, validRecorder.Body.String())
	}
	if repository.transactionPage != 1 || repository.transactionPageSize != 500 || repository.transactionMonth == nil || *repository.transactionMonth != "2026-10" {
		t.Fatalf("transaction query = page=%d size=%d month=%#v", repository.transactionPage, repository.transactionPageSize, repository.transactionMonth)
	}
}

func TestLedgerImportAndLoanRepaymentRoutesUseAuthenticatedAccount(t *testing.T) {
	repository := &httpLedgerRepository{
		importResult: ledger.ImportResult{Imported: 1, FailedRows: []ledger.ImportFailure{}},
		loanResult:   ledger.LoanRepaymentClassificationResult{Applied: 1, Amount: 100},
	}
	handler, token := newLedgerHandler(t, repository)
	body := `[{"id":"transaction-1","accountId":"attacker-account"}]`

	importRequest := httptest.NewRequest(http.MethodPost, "/api/transactions/import?accountId=account-1", strings.NewReader(body))
	importRequest.Header.Set("Authorization", "Bearer "+token)
	importRecorder := httptest.NewRecorder()
	handler.ServeHTTP(importRecorder, importRequest)
	if importRecorder.Code != http.StatusOK || repository.importAccountID != "account-1" || repository.importUserID != "user-1" || len(repository.importItems) != 1 {
		t.Fatalf("import = %d %s, call=%q/%q items=%d", importRecorder.Code, importRecorder.Body.String(), repository.importAccountID, repository.importUserID, len(repository.importItems))
	}
	for _, optionalField := range []string{`"failedRows"`, `"loanRepayments"`, `"loanRepaymentAmount"`} {
		if strings.Contains(importRecorder.Body.String(), optionalField) {
			t.Fatalf("successful import emitted empty optional field %s: %s", optionalField, importRecorder.Body.String())
		}
	}

	loanRequest := httptest.NewRequest(http.MethodPost, "/api/transactions/loan-repayments?accountId=account-1", strings.NewReader(body))
	loanRequest.Header.Set("Authorization", "Bearer "+token)
	loanRecorder := httptest.NewRecorder()
	handler.ServeHTTP(loanRecorder, loanRequest)
	if loanRecorder.Code != http.StatusOK || repository.loanAccountID != "account-1" || repository.loanUserID != "user-1" || len(repository.loanItems) != 1 {
		t.Fatalf("loan repayments = %d %s, call=%q/%q items=%d", loanRecorder.Code, loanRecorder.Body.String(), repository.loanAccountID, repository.loanUserID, len(repository.loanItems))
	}
}

func newLedgerHandler(t *testing.T, repository *httpLedgerRepository) (http.Handler, string) {
	t.Helper()
	password, err := auth.HashPassword("correct-password")
	if err != nil {
		t.Fatal(err)
	}
	user := auth.User{
		ID:        "user-1",
		Email:     "person@example.com",
		Password:  password,
		Role:      "USER",
		CreatedAt: time.Date(2026, time.October, 5, 5, 0, 0, 0, time.UTC),
		UpdatedAt: time.Date(2026, time.October, 5, 5, 0, 0, 0, time.UTC),
	}
	authService := auth.NewService(&httpAuthRepository{user: user, registrationEnabled: true}, auth.Config{JWTSecret: "12345678901234567890123456789012"})
	handler := NewHandler(Options{Database: fakeDatabase(true), Auth: authService, Ledger: ledger.NewService(repository)})

	loginRequest := httptest.NewRequest(http.MethodPost, "/api/auth/login", strings.NewReader(`{"email":"person@example.com","password":"correct-password"}`))
	loginRecorder := httptest.NewRecorder()
	handler.ServeHTTP(loginRecorder, loginRequest)
	if loginRecorder.Code != http.StatusOK {
		t.Fatalf("login = %d %s", loginRecorder.Code, loginRecorder.Body.String())
	}
	var response struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(loginRecorder.Body.Bytes(), &response); err != nil || response.Token == "" {
		t.Fatalf("login response = %q (%v)", loginRecorder.Body.String(), err)
	}
	return handler, response.Token
}

type httpLedgerRepository struct {
	accounts            []json.RawMessage
	records             []ledger.Record
	upsertedPayload     map[string]json.RawMessage
	transactionPage     int
	transactionPageSize int
	transactionMonth    *string
	importAccountID     string
	importUserID        string
	importItems         []json.RawMessage
	importResult        ledger.ImportResult
	loanAccountID       string
	loanUserID          string
	loanItems           []json.RawMessage
	loanResult          ledger.LoanRepaymentClassificationResult
}

func (repository *httpLedgerRepository) AccountBelongsToUser(_ context.Context, _ string, accountID string) (bool, error) {
	return accountID == "account-1", nil
}

func (repository *httpLedgerRepository) GoalBelongsToUser(context.Context, string, string) (bool, error) {
	return false, nil
}

func (repository *httpLedgerRepository) EntityBelongsToUser(context.Context, string, ledger.EntityType, string) (bool, error) {
	return false, nil
}

func (repository *httpLedgerRepository) EntityExists(context.Context, ledger.EntityType, string) (bool, error) {
	return false, nil
}

func (repository *httpLedgerRepository) UpsertEntity(_ context.Context, _ ledger.EntityType, payload map[string]json.RawMessage) error {
	repository.upsertedPayload = payload
	return nil
}

func (repository *httpLedgerRepository) DeleteEntity(context.Context, ledger.EntityType, string) error {
	return nil
}

func (repository *httpLedgerRepository) ListSyncRecords(context.Context, string, string) ([]ledger.Record, error) {
	return repository.records, nil
}

func (repository *httpLedgerRepository) ListAccounts(context.Context, string) ([]json.RawMessage, error) {
	return repository.accounts, nil
}

func (repository *httpLedgerRepository) GetAccount(context.Context, string, string) (json.RawMessage, bool, error) {
	return nil, false, nil
}

func (repository *httpLedgerRepository) GetUser(context.Context, string) (json.RawMessage, bool, error) {
	return nil, false, nil
}

func (repository *httpLedgerRepository) ListByAccount(context.Context, ledger.EntityType, string) ([]json.RawMessage, error) {
	return []json.RawMessage{}, nil
}

func (repository *httpLedgerRepository) ListSavingsPlans(context.Context, string) ([]json.RawMessage, error) {
	return []json.RawMessage{}, nil
}

func (repository *httpLedgerRepository) ListExchangeRates(context.Context) ([]json.RawMessage, error) {
	return []json.RawMessage{}, nil
}

func (repository *httpLedgerRepository) GetEntity(context.Context, ledger.EntityType, string) (json.RawMessage, bool, error) {
	return nil, false, nil
}

func (repository *httpLedgerRepository) ListTransactions(_ context.Context, _ string, page, pageSize int, month *string) ([]json.RawMessage, error) {
	repository.transactionPage = page
	repository.transactionPageSize = pageSize
	repository.transactionMonth = month
	return []json.RawMessage{}, nil
}

func (repository *httpLedgerRepository) ListTransactionMonths(context.Context, string) ([]string, error) {
	return []string{}, nil
}

func (repository *httpLedgerRepository) GetThemeConfig(context.Context, string) (json.RawMessage, bool, error) {
	return nil, false, nil
}

func (repository *httpLedgerRepository) ImportTransactions(_ context.Context, accountID, userID string, items []json.RawMessage) (ledger.ImportResult, error) {
	repository.importAccountID = accountID
	repository.importUserID = userID
	repository.importItems = items
	return repository.importResult, nil
}

func (repository *httpLedgerRepository) ApplyLoanRepaymentClassifications(_ context.Context, accountID, userID string, items []json.RawMessage) (ledger.LoanRepaymentClassificationResult, error) {
	repository.loanAccountID = accountID
	repository.loanUserID = userID
	repository.loanItems = items
	return repository.loanResult, nil
}

func rawString(raw json.RawMessage) string {
	var value string
	_ = json.Unmarshal(raw, &value)
	return value
}

var _ ledger.Repository = (*httpLedgerRepository)(nil)
