package ledger

import (
	"context"
	"encoding/json"
	"testing"
)

func TestUpsertPayloadScopesNewTransactionToAuthenticatedUser(t *testing.T) {
	repository := &serviceRepository{accountAllowed: true}
	service := NewService(repository)
	payload := json.RawMessage(`{"id":"transaction-1","accountId":"account-1"}`)

	if errorValue := service.UpsertPayload(context.Background(), "user-1", Transactions, payload); errorValue != nil {
		t.Fatalf("UpsertPayload() error = %#v", errorValue)
	}
	if repository.upsertedType != Transactions {
		t.Fatalf("upserted type = %q", repository.upsertedType)
	}
	if value, ok := payloadString(repository.upsertedPayload, "userId"); !ok || value != "user-1" {
		t.Fatalf("normalized userId = %q, %v", value, ok)
	}
}

func TestListAccountEntitiesRejectsForeignAccountBeforeDataQuery(t *testing.T) {
	repository := &serviceRepository{accountAllowed: false}
	service := NewService(repository)

	_, errorValue := service.ListAccountEntities(context.Background(), "user-1", "other-account", Assets)
	if errorValue == nil || errorValue.Status != 403 || errorValue.Message != "无权访问该账本" {
		t.Fatalf("ListAccountEntities() error = %#v", errorValue)
	}
	if repository.listByAccountCalled {
		t.Fatal("ListByAccount was called for an inaccessible account")
	}
}

func TestListSavingsPlansKeepsLegacyEmptyResponseForForeignGoal(t *testing.T) {
	repository := &serviceRepository{goalAllowed: false}
	service := NewService(repository)

	plans, errorValue := service.ListSavingsPlans(context.Background(), "user-1", "other-goal")
	if errorValue != nil {
		t.Fatalf("ListSavingsPlans() error = %#v", errorValue)
	}
	if plans == nil || len(plans) != 0 {
		t.Fatalf("plans = %#v", plans)
	}
	if repository.listSavingsPlansCalled {
		t.Fatal("ListSavingsPlans repository query was called for a foreign goal")
	}
}

func TestGetTransactionKeepsSpecificAccessError(t *testing.T) {
	repository := &serviceRepository{entityAllowed: false}
	service := NewService(repository)

	_, _, errorValue := service.GetTransaction(context.Background(), "user-1", "transaction-1")
	if errorValue == nil || errorValue.Status != 403 || errorValue.Message != "无权访问该交易" {
		t.Fatalf("GetTransaction() error = %#v", errorValue)
	}
}

func TestDeleteSavingsGoalDelegatesAfterOwnershipCheck(t *testing.T) {
	repository := &serviceRepository{entityAllowed: true}
	service := NewService(repository)

	if errorValue := service.DeleteEntity(context.Background(), "user-1", SavingsGoals, "goal-1"); errorValue != nil {
		t.Fatalf("DeleteEntity() error = %#v", errorValue)
	}
	if repository.deletedType != SavingsGoals || repository.deletedID != "goal-1" {
		t.Fatalf("deleted = %q/%q", repository.deletedType, repository.deletedID)
	}
}

type serviceRepository struct {
	accountAllowed          bool
	goalAllowed             bool
	entityAllowed           bool
	entityExists            bool
	upsertedType            EntityType
	upsertedPayload         map[string]json.RawMessage
	deletedType             EntityType
	deletedID               string
	listByAccountCalled     bool
	listSavingsPlansCalled  bool
	listTransactionsResult  []json.RawMessage
	listTransactionMonths   []string
	listExchangeRatesResult []json.RawMessage
}

func (repository *serviceRepository) AccountBelongsToUser(context.Context, string, string) (bool, error) {
	return repository.accountAllowed, nil
}

func (repository *serviceRepository) GoalBelongsToUser(context.Context, string, string) (bool, error) {
	return repository.goalAllowed, nil
}

func (repository *serviceRepository) EntityBelongsToUser(context.Context, string, EntityType, string) (bool, error) {
	return repository.entityAllowed, nil
}

func (repository *serviceRepository) EntityExists(context.Context, EntityType, string) (bool, error) {
	return repository.entityExists, nil
}

func (repository *serviceRepository) UpsertEntity(_ context.Context, entityType EntityType, payload map[string]json.RawMessage) error {
	repository.upsertedType = entityType
	repository.upsertedPayload = payload
	return nil
}

func (repository *serviceRepository) DeleteEntity(_ context.Context, entityType EntityType, id string) error {
	repository.deletedType = entityType
	repository.deletedID = id
	return nil
}

func (repository *serviceRepository) ListSyncRecords(context.Context, string, string) ([]Record, error) {
	return nil, nil
}

func (repository *serviceRepository) ListAccounts(context.Context, string) ([]json.RawMessage, error) {
	return nil, nil
}

func (repository *serviceRepository) GetAccount(context.Context, string, string) (json.RawMessage, bool, error) {
	return nil, false, nil
}

func (repository *serviceRepository) GetUser(context.Context, string) (json.RawMessage, bool, error) {
	return nil, false, nil
}

func (repository *serviceRepository) ListByAccount(context.Context, EntityType, string) ([]json.RawMessage, error) {
	repository.listByAccountCalled = true
	return nil, nil
}

func (repository *serviceRepository) ListSavingsPlans(context.Context, string) ([]json.RawMessage, error) {
	repository.listSavingsPlansCalled = true
	return nil, nil
}

func (repository *serviceRepository) ListExchangeRates(context.Context) ([]json.RawMessage, error) {
	return repository.listExchangeRatesResult, nil
}

func (repository *serviceRepository) GetEntity(context.Context, EntityType, string) (json.RawMessage, bool, error) {
	return nil, false, nil
}

func (repository *serviceRepository) ListTransactions(context.Context, string, int, int, *string) ([]json.RawMessage, error) {
	return repository.listTransactionsResult, nil
}

func (repository *serviceRepository) ListTransactionMonths(context.Context, string) ([]string, error) {
	return repository.listTransactionMonths, nil
}

func (repository *serviceRepository) GetThemeConfig(context.Context, string) (json.RawMessage, bool, error) {
	return nil, false, nil
}

func (repository *serviceRepository) ImportTransactions(context.Context, string, string, []json.RawMessage) (ImportResult, error) {
	return ImportResult{}, nil
}

func (repository *serviceRepository) ApplyLoanRepaymentClassifications(context.Context, string, string, []json.RawMessage) (LoanRepaymentClassificationResult, error) {
	return LoanRepaymentClassificationResult{}, nil
}

func payloadString(payload map[string]json.RawMessage, key string) (string, bool) {
	raw, exists := payload[key]
	if !exists {
		return "", false
	}
	var value string
	if err := json.Unmarshal(raw, &value); err != nil {
		return "", false
	}
	return value, true
}

var _ Repository = (*serviceRepository)(nil)
