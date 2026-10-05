package ledger

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

type EntityType string

const (
	Users           EntityType = "users"
	Accounts        EntityType = "accounts"
	Transactions    EntityType = "transactions"
	Assets          EntityType = "assets"
	Budgets         EntityType = "budgets"
	Loans           EntityType = "loans"
	SavingsGoals    EntityType = "savingsGoals"
	SavingsPlans    EntityType = "savingsPlans"
	CategoryRules   EntityType = "categoryRules"
	ImportErrorLogs EntityType = "importErrorLogs"
	ExchangeRates   EntityType = "exchangeRates"
	ThemeConfigs    EntityType = "themeConfigs"
)

type Record struct {
	ID         string          `json:"id"`
	EntityType EntityType      `json:"entityType"`
	AccountID  *string         `json:"accountId,omitempty"`
	UserID     *string         `json:"userId,omitempty"`
	Payload    json.RawMessage `json:"payload"`
	UpdatedAt  string          `json:"updatedAt"`
}

type ImportFailure struct {
	LineNumber   int    `json:"lineNumber"`
	RawData      string `json:"rawData"`
	ErrorMessage string `json:"errorMessage"`
	ErrorType    string `json:"errorType"`
}

type ImportResult struct {
	Imported            int             `json:"imported"`
	Skipped             int             `json:"skipped"`
	Errors              int             `json:"errors"`
	FailedRows          []ImportFailure `json:"failedRows,omitempty"`
	LoanRepayments      int             `json:"loanRepayments,omitempty"`
	LoanRepaymentAmount float64         `json:"loanRepaymentAmount,omitempty"`
}

type LoanRepaymentClassificationResult struct {
	Applied int     `json:"applied"`
	Amount  float64 `json:"amount"`
	Skipped int     `json:"skipped"`
}

type Repository interface {
	AccountBelongsToUser(context.Context, string, string) (bool, error)
	GoalBelongsToUser(context.Context, string, string) (bool, error)
	EntityBelongsToUser(context.Context, string, EntityType, string) (bool, error)
	EntityExists(context.Context, EntityType, string) (bool, error)
	UpsertEntity(context.Context, EntityType, map[string]json.RawMessage) error
	DeleteEntity(context.Context, EntityType, string) error
	ListSyncRecords(context.Context, string, string) ([]Record, error)
	ListAccounts(context.Context, string) ([]json.RawMessage, error)
	GetAccount(context.Context, string, string) (json.RawMessage, bool, error)
	GetUser(context.Context, string) (json.RawMessage, bool, error)
	ListByAccount(context.Context, EntityType, string) ([]json.RawMessage, error)
	ListSavingsPlans(context.Context, string) ([]json.RawMessage, error)
	ListExchangeRates(context.Context) ([]json.RawMessage, error)
	GetEntity(context.Context, EntityType, string) (json.RawMessage, bool, error)
	ListTransactions(context.Context, string, int, int, *string) ([]json.RawMessage, error)
	ListTransactionMonths(context.Context, string) ([]string, error)
	GetThemeConfig(context.Context, string) (json.RawMessage, bool, error)
	ImportTransactions(context.Context, string, string, []json.RawMessage) (ImportResult, error)
	ApplyLoanRepaymentClassifications(context.Context, string, string, []json.RawMessage) (LoanRepaymentClassificationResult, error)
}

type Service struct {
	repository Repository
	now        func() time.Time
}

type Error struct {
	Status  int
	Message string
}

func (errorValue *Error) Error() string { return errorValue.Message }

func NewService(repository Repository) *Service {
	return &Service{repository: repository, now: time.Now}
}

func (service *Service) ListRecords(context context.Context, userID, accountID string) ([]Record, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, errorValue
	}
	allowed, err := service.repository.AccountBelongsToUser(context, userID, accountID)
	if err != nil {
		return nil, databaseError(err)
	}
	if !allowed {
		return nil, forbidden("无权访问该账本")
	}
	records, err := service.repository.ListSyncRecords(context, accountID, userID)
	if err != nil {
		return nil, databaseError(err)
	}
	return records, nil
}

func (service *Service) UpsertRecord(context context.Context, userID string, record Record) *Error {
	if errorValue := service.available(); errorValue != nil {
		return errorValue
	}
	payload, errorValue := decodePayload(record.Payload)
	if errorValue != nil {
		return errorValue
	}
	if !known(record.EntityType) {
		// Ktor retains rolling-upgrade compatibility for unknown records, but
		// only after it has proved that their payload is scoped to an account the
		// caller owns. The outer sync envelope is not trusted for this check.
		if deleted(payload) {
			return forbidden("You do not have access to this resource")
		}
		return service.authorizeUnknownSyncRecord(context, userID, payload)
	}
	if deleted(payload) {
		return service.DeleteEntity(context, userID, record.EntityType, record.ID)
	}
	return service.upsertPayload(context, userID, record.EntityType, payload)
}

func (service *Service) UpsertPayload(context context.Context, userID string, entityType EntityType, payload json.RawMessage) *Error {
	if errorValue := service.available(); errorValue != nil {
		return errorValue
	}
	if !known(entityType) {
		return nil
	}
	values, errorValue := decodePayload(payload)
	if errorValue != nil {
		return errorValue
	}
	if deleted(values) {
		id, exists := stringValue(values, "id")
		if !exists {
			return forbidden("Missing entity id")
		}
		return service.DeleteEntity(context, userID, entityType, id)
	}
	return service.upsertPayload(context, userID, entityType, values)
}

func (service *Service) DeleteEntity(context context.Context, userID string, entityType EntityType, id string) *Error {
	if errorValue := service.available(); errorValue != nil {
		return errorValue
	}
	if !known(entityType) {
		return nil
	}
	belongs, err := service.repository.EntityBelongsToUser(context, userID, entityType, id)
	if err != nil {
		return databaseError(err)
	}
	if !belongs {
		return forbidden("You do not have access to this resource")
	}
	if err := service.repository.DeleteEntity(context, entityType, id); err != nil {
		return databaseError(err)
	}
	return nil
}

func (service *Service) ListAccounts(context context.Context, userID string) ([]json.RawMessage, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, errorValue
	}
	accounts, err := service.repository.ListAccounts(context, userID)
	if err != nil {
		return nil, databaseError(err)
	}
	return accounts, nil
}

func (service *Service) GetAccount(context context.Context, userID, id string) (json.RawMessage, bool, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, false, errorValue
	}
	account, exists, err := service.repository.GetAccount(context, id, userID)
	if err != nil {
		return nil, false, databaseError(err)
	}
	return account, exists, nil
}

func (service *Service) GetUser(context context.Context, userID string) (json.RawMessage, bool, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, false, errorValue
	}
	user, exists, err := service.repository.GetUser(context, userID)
	if err != nil {
		return nil, false, databaseError(err)
	}
	return user, exists, nil
}

// ListAccountEntities reads a resource that is directly scoped to an account.
// Keeping the ownership check here prevents a new REST route from accidentally
// exposing another account merely by omitting the same check.
func (service *Service) ListAccountEntities(context context.Context, userID, accountID string, entityType EntityType) ([]json.RawMessage, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, errorValue
	}
	if !accountScoped(entityType) {
		return nil, &Error{Status: 400, Message: "不支持的账本数据类型"}
	}
	if errorValue := service.requireAccountAccess(context, userID, accountID); errorValue != nil {
		return nil, errorValue
	}
	items, err := service.repository.ListByAccount(context, entityType, accountID)
	if err != nil {
		return nil, databaseError(err)
	}
	return items, nil
}

func (service *Service) ListTransactions(context context.Context, userID, accountID string, page, pageSize int, month *string) ([]json.RawMessage, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, errorValue
	}
	if errorValue := service.requireAccountAccess(context, userID, accountID); errorValue != nil {
		return nil, errorValue
	}
	items, err := service.repository.ListTransactions(context, accountID, page, pageSize, month)
	if err != nil {
		return nil, databaseError(err)
	}
	return items, nil
}

func (service *Service) ListTransactionMonths(context context.Context, userID, accountID string) ([]string, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, errorValue
	}
	if errorValue := service.requireAccountAccess(context, userID, accountID); errorValue != nil {
		return nil, errorValue
	}
	months, err := service.repository.ListTransactionMonths(context, accountID)
	if err != nil {
		return nil, databaseError(err)
	}
	return months, nil
}

func (service *Service) GetTransaction(context context.Context, userID, id string) (json.RawMessage, bool, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, false, errorValue
	}
	belongs, err := service.repository.EntityBelongsToUser(context, userID, Transactions, id)
	if err != nil {
		return nil, false, databaseError(err)
	}
	if !belongs {
		return nil, false, forbidden("无权访问该交易")
	}
	transaction, exists, err := service.repository.GetEntity(context, Transactions, id)
	if err != nil {
		return nil, false, databaseError(err)
	}
	return transaction, exists, nil
}

// ListSavingsPlans intentionally returns an empty list for an inaccessible
// goal. The Ktor API historically behaved this way because the ownership
// predicate was part of its SELECT instead of a separate authorization error.
func (service *Service) ListSavingsPlans(context context.Context, userID, goalID string) ([]json.RawMessage, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, errorValue
	}
	allowed, err := service.repository.GoalBelongsToUser(context, userID, goalID)
	if err != nil {
		return nil, databaseError(err)
	}
	if !allowed {
		return []json.RawMessage{}, nil
	}
	plans, err := service.repository.ListSavingsPlans(context, goalID)
	if err != nil {
		return nil, databaseError(err)
	}
	return plans, nil
}

func (service *Service) ListExchangeRates(context context.Context) ([]json.RawMessage, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, errorValue
	}
	rates, err := service.repository.ListExchangeRates(context)
	if err != nil {
		return nil, databaseError(err)
	}
	return rates, nil
}

func (service *Service) GetThemeConfig(context context.Context, userID string) (json.RawMessage, bool, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, false, errorValue
	}
	config, exists, err := service.repository.GetThemeConfig(context, userID)
	if err != nil {
		return nil, false, databaseError(err)
	}
	return config, exists, nil
}

func (service *Service) ImportTransactions(context context.Context, userID, accountID string, items []json.RawMessage) (ImportResult, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return ImportResult{}, errorValue
	}
	if errorValue := service.requireAccountAccess(context, userID, accountID); errorValue != nil {
		return ImportResult{}, errorValue
	}
	result, err := service.repository.ImportTransactions(context, accountID, userID, items)
	if err != nil {
		return ImportResult{}, databaseError(err)
	}
	return result, nil
}

func (service *Service) ApplyLoanRepaymentClassifications(context context.Context, userID, accountID string, items []json.RawMessage) (LoanRepaymentClassificationResult, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return LoanRepaymentClassificationResult{}, errorValue
	}
	if errorValue := service.requireAccountAccess(context, userID, accountID); errorValue != nil {
		return LoanRepaymentClassificationResult{}, errorValue
	}
	result, err := service.repository.ApplyLoanRepaymentClassifications(context, accountID, userID, items)
	if err != nil {
		return LoanRepaymentClassificationResult{}, databaseError(err)
	}
	return result, nil
}

func (service *Service) upsertPayload(context context.Context, userID string, entityType EntityType, payload map[string]json.RawMessage) *Error {
	id, exists := stringValue(payload, "id")
	if !exists || strings.TrimSpace(id) == "" {
		return forbidden("Missing entity id")
	}
	normalizePayloadForUser(entityType, payload, userID)
	belongs, err := service.repository.EntityBelongsToUser(context, userID, entityType, id)
	if err != nil {
		return databaseError(err)
	}
	if !belongs {
		exists, err := service.repository.EntityExists(context, entityType, id)
		if err != nil {
			return databaseError(err)
		}
		if exists {
			return forbidden("You do not have access to this resource")
		}
	}

	switch entityType {
	case Users:
		if id != userID {
			return forbidden("You do not have access to this resource")
		}
	case Accounts:
		ownerID, ownerExists := stringValue(payload, "ownerId")
		if !belongs && (!ownerExists || ownerID != userID) {
			return forbidden("You do not have access to this resource")
		}
	case SavingsPlans:
		goalID, goalExists := stringValue(payload, "goalId")
		if !goalExists {
			return forbidden("You do not have access to this resource")
		}
		if !belongs {
			allowed, err := service.repository.GoalBelongsToUser(context, userID, goalID)
			if err != nil {
				return databaseError(err)
			}
			if !allowed {
				return forbidden("You do not have access to this resource")
			}
		}
	case ThemeConfigs:
		configuredUserID, configured := stringValue(payload, "userId")
		if !belongs && (!configured || configuredUserID != userID) {
			return forbidden("You do not have access to this resource")
		}
	case ExchangeRates:
		return forbidden("You do not have access to this resource")
	default:
		accountID, accountExists := stringValue(payload, "accountId")
		if !belongs {
			if !accountExists {
				return forbidden("You do not have access to this resource")
			}
			allowed, err := service.repository.AccountBelongsToUser(context, userID, accountID)
			if err != nil {
				return databaseError(err)
			}
			if !allowed {
				return forbidden("You do not have access to this resource")
			}
		}
	}

	if err := service.repository.UpsertEntity(context, entityType, payload); err != nil {
		return databaseError(err)
	}
	return nil
}

func (service *Service) requireAccountAccess(context context.Context, userID, accountID string) *Error {
	allowed, err := service.repository.AccountBelongsToUser(context, userID, accountID)
	if err != nil {
		return databaseError(err)
	}
	if !allowed {
		return forbidden("无权访问该账本")
	}
	return nil
}

func (service *Service) authorizeUnknownSyncRecord(context context.Context, userID string, payload map[string]json.RawMessage) *Error {
	if _, exists := stringValue(payload, "id"); !exists {
		return forbidden("Missing entity id")
	}
	accountID, exists := stringValue(payload, "accountId")
	if !exists {
		return forbidden("You do not have access to this resource")
	}
	allowed, err := service.repository.AccountBelongsToUser(context, userID, accountID)
	if err != nil {
		return databaseError(err)
	}
	if !allowed {
		return forbidden("You do not have access to this resource")
	}
	return nil
}

func (service *Service) available() *Error {
	if service == nil || service.repository == nil {
		return &Error{Status: 500, Message: "数据库未连接"}
	}
	return nil
}

func decodePayload(raw json.RawMessage) (map[string]json.RawMessage, *Error) {
	var payload map[string]json.RawMessage
	if len(raw) == 0 || json.Unmarshal(raw, &payload) != nil || payload == nil {
		return nil, &Error{Status: 400, Message: "请求数据无效"}
	}
	return payload, nil
}

func normalizePayloadForUser(entityType EntityType, payload map[string]json.RawMessage, userID string) {
	encodedUserID, _ := json.Marshal(userID)
	switch entityType {
	case Accounts:
		payload["ownerId"] = encodedUserID
	case Users, ThemeConfigs, Transactions, Assets, Budgets, Loans, SavingsGoals, CategoryRules, ImportErrorLogs:
		payload["userId"] = encodedUserID
	}
}

func deleted(payload map[string]json.RawMessage) bool {
	var value bool
	return json.Unmarshal(payload["__deleted"], &value) == nil && value
}

func stringValue(payload map[string]json.RawMessage, key string) (string, bool) {
	raw, exists := payload[key]
	if !exists || string(raw) == "null" {
		return "", false
	}
	var value string
	if err := json.Unmarshal(raw, &value); err != nil {
		return "", false
	}
	return value, true
}

func known(entityType EntityType) bool {
	switch entityType {
	case Users, Accounts, Transactions, Assets, Budgets, Loans, SavingsGoals, SavingsPlans, CategoryRules, ImportErrorLogs, ExchangeRates, ThemeConfigs:
		return true
	default:
		return false
	}
}

func accountScoped(entityType EntityType) bool {
	switch entityType {
	case Assets, Budgets, Loans, SavingsGoals, CategoryRules, ImportErrorLogs:
		return true
	default:
		return false
	}
}

func forbidden(message string) *Error       { return &Error{Status: 403, Message: message} }
func databaseError(errorValue error) *Error { return &Error{Status: 500, Message: errorValue.Error()} }

var ErrUnsupportedEntity = errors.New("unsupported entity type")

func entityError(entityType EntityType) error {
	return fmt.Errorf("%w: %s", ErrUnsupportedEntity, entityType)
}
