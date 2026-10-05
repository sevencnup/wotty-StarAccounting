package database

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"strconv"
	"strings"
	"time"

	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/ledger"
)

type fieldKind uint8

const (
	stringField fieldKind = iota
	nullableStringField
	decimalField
	nullableDecimalField
	integerField
	nullableFloatField
	booleanField
	dateTimeField
	nullableDateTimeField
	rawTextField
)

type entityField struct {
	JSON   string
	Column string
	Kind   fieldKind
}

type entitySpec struct {
	Table           string
	Fields          []entityField
	HidePassword    bool
	UpdatedAtColumn string
}

var entitySpecs = map[ledger.EntityType]entitySpec{
	ledger.Users: {
		Table:        "user",
		HidePassword: true,
		Fields: []entityField{
			{"id", "id", stringField}, {"email", "email", stringField}, {"password", "password", stringField},
			{"name", "name", nullableStringField}, {"defaultAccountId", "defaultAccountId", nullableStringField},
			{"role", "role", stringField}, {"createdAt", "createdAt", dateTimeField}, {"updatedAt", "updatedAt", dateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.Accounts: {
		Table: "account",
		Fields: []entityField{
			{"id", "id", stringField}, {"name", "name", stringField}, {"ownerId", "ownerId", stringField},
			{"openingBalance", "openingBalance", nullableDecimalField}, {"openingBalanceDate", "openingBalanceDate", nullableDateTimeField},
			{"createdAt", "createdAt", dateTimeField}, {"updatedAt", "updatedAt", dateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.Transactions: {
		Table: "transaction",
		Fields: []entityField{
			{"id", "id", stringField}, {"userId", "userId", stringField}, {"accountId", "accountId", stringField},
			{"amount", "amount", decimalField}, {"type", "type", stringField}, {"category", "category", stringField},
			{"platform", "platform", stringField}, {"merchant", "merchant", nullableStringField}, {"date", "date", dateTimeField},
			{"description", "description", nullableStringField}, {"orderId", "orderId", nullableStringField},
			{"paymentMethod", "paymentMethod", nullableStringField}, {"status", "status", nullableStringField},
			{"loanId", "loanId", nullableStringField}, {"remarkCategory", "remarkCategory", nullableStringField},
			{"createdAt", "createdAt", dateTimeField}, {"updatedAt", "updatedAt", dateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.Assets: {
		Table: "asset",
		Fields: []entityField{
			{"id", "id", stringField}, {"userId", "userId", stringField}, {"accountId", "accountId", stringField},
			{"name", "name", stringField}, {"type", "type", stringField}, {"balance", "balance", decimalField},
			{"currency", "currency", stringField}, {"createdAt", "createdAt", dateTimeField}, {"updatedAt", "updatedAt", dateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.Budgets: {
		Table: "budget",
		Fields: []entityField{
			{"id", "id", stringField}, {"userId", "userId", stringField}, {"accountId", "accountId", stringField},
			{"amount", "amount", decimalField}, {"category", "category", stringField}, {"period", "period", stringField},
			{"createdAt", "createdAt", dateTimeField}, {"updatedAt", "updatedAt", dateTimeField},
			{"alertPercent", "alertPercent", integerField}, {"platform", "platform", nullableStringField}, {"scopeType", "scopeType", stringField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.ExchangeRates: {
		Table: "exchangerate",
		Fields: []entityField{
			{"id", "id", stringField}, {"from", "from", stringField}, {"to", "to", stringField},
			{"rate", "rate", decimalField}, {"updatedAt", "updatedAt", dateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.ImportErrorLogs: {
		Table: "importerrorlog",
		Fields: []entityField{
			{"id", "id", stringField}, {"userId", "userId", stringField}, {"accountId", "accountId", stringField},
			{"fileName", "fileName", stringField}, {"lineNumber", "lineNumber", integerField}, {"rawData", "rawData", stringField},
			{"errorMessage", "errorMessage", stringField}, {"errorType", "errorType", stringField}, {"resolved", "resolved", booleanField},
			{"createdAt", "createdAt", dateTimeField},
		},
		UpdatedAtColumn: "createdAt",
	},
	ledger.Loans: {
		Table: "loan",
		Fields: []entityField{
			{"id", "id", stringField}, {"userId", "userId", stringField}, {"accountId", "accountId", stringField},
			{"platform", "platform", stringField}, {"totalAmount", "totalAmount", decimalField}, {"remainingAmount", "remainingAmount", decimalField},
			{"periods", "periods", integerField}, {"paidPeriods", "paidPeriods", integerField}, {"monthlyPayment", "monthlyPayment", decimalField},
			{"dueDate", "dueDate", integerField}, {"status", "status", stringField}, {"matchKeywords", "matchKeywords", rawTextField},
			{"createdAt", "createdAt", dateTimeField}, {"updatedAt", "updatedAt", dateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.SavingsGoals: {
		Table: "savingsgoal",
		Fields: []entityField{
			{"id", "id", stringField}, {"userId", "userId", stringField}, {"accountId", "accountId", stringField},
			{"name", "name", stringField}, {"targetAmount", "targetAmount", decimalField}, {"currentAmount", "currentAmount", decimalField},
			{"deadline", "deadline", nullableDateTimeField}, {"type", "type", stringField}, {"status", "status", stringField},
			{"depositType", "depositType", stringField}, {"planConfig", "planConfig", rawTextField},
			{"createdAt", "createdAt", dateTimeField}, {"updatedAt", "updatedAt", dateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.SavingsPlans: {
		Table: "savingsplan",
		Fields: []entityField{
			{"id", "id", stringField}, {"goalId", "goalId", stringField}, {"amount", "amount", decimalField},
			{"status", "status", stringField}, {"month", "month", stringField}, {"createdAt", "createdAt", dateTimeField},
			{"updatedAt", "updatedAt", dateTimeField}, {"expenses", "expenses", rawTextField}, {"remark", "remark", nullableStringField},
			{"salary", "salary", nullableDecimalField}, {"proofImage", "proofImage", nullableStringField},
			{"actualAmount", "actualAmount", nullableDecimalField}, {"actualDate", "actualDate", nullableDateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.CategoryRules: {
		Table: "transactioncategoryrule",
		Fields: []entityField{
			{"id", "id", stringField}, {"userId", "userId", stringField}, {"accountId", "accountId", stringField},
			{"name", "name", nullableStringField}, {"merchant", "merchant", stringField}, {"merchantKey", "merchantKey", stringField},
			{"category", "category", stringField}, {"description", "description", nullableStringField}, {"isActive", "isActive", booleanField},
			{"createdAt", "createdAt", dateTimeField}, {"updatedAt", "updatedAt", dateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
	ledger.ThemeConfigs: {
		Table: "themeconfig",
		Fields: []entityField{
			{"id", "id", stringField}, {"userId", "userId", stringField}, {"accountId", "accountId", nullableStringField},
			{"themeId", "themeId", stringField}, {"primaryColor", "primaryColor", nullableStringField}, {"radius", "radius", nullableFloatField},
			{"isDarkMode", "isDarkMode", booleanField}, {"chartStyle", "chartStyle", rawTextField},
			{"createdAt", "createdAt", dateTimeField}, {"updatedAt", "updatedAt", dateTimeField},
		},
		UpdatedAtColumn: "updatedAt",
	},
}

func (store *Store) AccountBelongsToUser(context context.Context, userID, accountID string) (bool, error) {
	database, err := store.connection()
	if err != nil {
		return false, err
	}
	return exists(context, database, "SELECT 1 FROM account WHERE id = ? AND ownerId = ? LIMIT 1", accountID, userID)
}

func (store *Store) GoalBelongsToUser(context context.Context, userID, goalID string) (bool, error) {
	database, err := store.connection()
	if err != nil {
		return false, err
	}
	return exists(context, database, "SELECT 1 FROM savingsgoal WHERE id = ? AND accountId IN (SELECT id FROM account WHERE ownerId = ?) LIMIT 1", goalID, userID)
}

func (store *Store) EntityBelongsToUser(context context.Context, userID string, entityType ledger.EntityType, id string) (bool, error) {
	database, err := store.connection()
	if err != nil {
		return false, err
	}
	var query string
	var arguments []interface{}
	switch entityType {
	case ledger.Users:
		query, arguments = "SELECT 1 FROM `user` WHERE id = ? AND id = ? LIMIT 1", []interface{}{id, userID}
	case ledger.Accounts:
		query, arguments = "SELECT 1 FROM account WHERE id = ? AND ownerId = ? LIMIT 1", []interface{}{id, userID}
	case ledger.Transactions:
		query, arguments = "SELECT 1 FROM `transaction` WHERE id = ? AND accountId IN (SELECT id FROM account WHERE ownerId = ?) LIMIT 1", []interface{}{id, userID}
	case ledger.Assets:
		query, arguments = "SELECT 1 FROM asset WHERE id = ? AND accountId IN (SELECT id FROM account WHERE ownerId = ?) LIMIT 1", []interface{}{id, userID}
	case ledger.Budgets:
		query, arguments = "SELECT 1 FROM budget WHERE id = ? AND accountId IN (SELECT id FROM account WHERE ownerId = ?) LIMIT 1", []interface{}{id, userID}
	case ledger.Loans:
		query, arguments = "SELECT 1 FROM loan WHERE id = ? AND accountId IN (SELECT id FROM account WHERE ownerId = ?) LIMIT 1", []interface{}{id, userID}
	case ledger.SavingsGoals:
		query, arguments = "SELECT 1 FROM savingsgoal WHERE id = ? AND accountId IN (SELECT id FROM account WHERE ownerId = ?) LIMIT 1", []interface{}{id, userID}
	case ledger.SavingsPlans:
		query, arguments = "SELECT 1 FROM savingsplan WHERE id = ? AND goalId IN (SELECT id FROM savingsgoal WHERE accountId IN (SELECT id FROM account WHERE ownerId = ?)) LIMIT 1", []interface{}{id, userID}
	case ledger.CategoryRules:
		query, arguments = "SELECT 1 FROM transactioncategoryrule WHERE id = ? AND accountId IN (SELECT id FROM account WHERE ownerId = ?) LIMIT 1", []interface{}{id, userID}
	case ledger.ImportErrorLogs:
		query, arguments = "SELECT 1 FROM importerrorlog WHERE id = ? AND accountId IN (SELECT id FROM account WHERE ownerId = ?) LIMIT 1", []interface{}{id, userID}
	case ledger.ThemeConfigs:
		query, arguments = "SELECT 1 FROM themeconfig WHERE id = ? AND userId = ? LIMIT 1", []interface{}{id, userID}
	default:
		return false, nil
	}
	return exists(context, database, query, arguments...)
}

func (store *Store) EntityExists(context context.Context, entityType ledger.EntityType, id string) (bool, error) {
	specification, err := entitySpecification(entityType)
	if err != nil {
		return false, err
	}
	database, err := store.connection()
	if err != nil {
		return false, err
	}
	return exists(context, database, "SELECT 1 FROM `"+specification.Table+"` WHERE id = ? LIMIT 1", id)
}

func (store *Store) UpsertEntity(context context.Context, entityType ledger.EntityType, payload map[string]json.RawMessage) error {
	database, err := store.connection()
	if err != nil {
		return err
	}
	return upsertEntity(context, database, entityType, payload)
}

type sqlExecutor interface {
	ExecContext(context.Context, string, ...interface{}) (sql.Result, error)
}

func upsertEntity(context context.Context, executor sqlExecutor, entityType ledger.EntityType, payload map[string]json.RawMessage) error {
	specification, err := entitySpecification(entityType)
	if err != nil {
		return err
	}
	columns := make([]string, 0, len(specification.Fields))
	arguments := make([]interface{}, 0, len(specification.Fields))
	updates := make([]string, 0, len(specification.Fields)-1)
	for index, field := range specification.Fields {
		value, err := payloadValue(payload, field)
		if err != nil {
			return fmt.Errorf("%s.%s: %w", entityType, field.JSON, err)
		}
		columns = append(columns, "`"+field.Column+"`")
		arguments = append(arguments, value)
		if index > 0 {
			updates = append(updates, "`"+field.Column+"` = VALUES(`"+field.Column+"`)")
		}
	}
	query := "INSERT INTO `" + specification.Table + "` (" + strings.Join(columns, ", ") + ") VALUES (" + strings.TrimRight(strings.Repeat("?, ", len(columns)), ", ") + ") ON DUPLICATE KEY UPDATE " + strings.Join(updates, ", ")
	_, err = executor.ExecContext(context, query, arguments...)
	return err
}

func (store *Store) DeleteEntity(context context.Context, entityType ledger.EntityType, id string) error {
	specification, err := entitySpecification(entityType)
	if err != nil {
		return err
	}
	database, err := store.connection()
	if err != nil {
		return err
	}
	if entityType == ledger.SavingsGoals {
		transaction, err := database.BeginTx(context, nil)
		if err != nil {
			return err
		}
		if _, err := transaction.ExecContext(context, "DELETE FROM savingsplan WHERE goalId = ?", id); err != nil {
			_ = transaction.Rollback()
			return err
		}
		if _, err := transaction.ExecContext(context, "DELETE FROM `"+specification.Table+"` WHERE id = ?", id); err != nil {
			_ = transaction.Rollback()
			return err
		}
		return transaction.Commit()
	}
	_, err = database.ExecContext(context, "DELETE FROM `"+specification.Table+"` WHERE id = ?", id)
	return err
}

func (store *Store) ListAccounts(context context.Context, userID string) ([]json.RawMessage, error) {
	return store.listWhere(context, ledger.Accounts, "`ownerId` = ?", userID)
}

func (store *Store) GetAccount(context context.Context, id, userID string) (json.RawMessage, bool, error) {
	items, err := store.listWhere(context, ledger.Accounts, "`id` = ? AND `ownerId` = ?", id, userID)
	if err != nil || len(items) == 0 {
		return nil, false, err
	}
	return items[0], true, nil
}

func (store *Store) GetUser(context context.Context, userID string) (json.RawMessage, bool, error) {
	items, err := store.listWhere(context, ledger.Users, "`id` = ?", userID)
	if err != nil || len(items) == 0 {
		return nil, false, err
	}
	return items[0], true, nil
}

func (store *Store) ListByAccount(context context.Context, entityType ledger.EntityType, accountID string) ([]json.RawMessage, error) {
	switch entityType {
	case ledger.Assets, ledger.Budgets, ledger.Loans, ledger.SavingsGoals, ledger.CategoryRules, ledger.ImportErrorLogs:
		return store.listWhere(context, entityType, "`accountId` = ?", accountID)
	default:
		return nil, fmt.Errorf("entity type %s is not account-scoped", entityType)
	}
}

func (store *Store) ListSavingsPlans(context context.Context, goalID string) ([]json.RawMessage, error) {
	return store.listWhere(context, ledger.SavingsPlans, "`goalId` = ?", goalID)
}

func (store *Store) ListExchangeRates(context context.Context) ([]json.RawMessage, error) {
	return store.listWhere(context, ledger.ExchangeRates, "1 = 1")
}

func (store *Store) GetEntity(context context.Context, entityType ledger.EntityType, id string) (json.RawMessage, bool, error) {
	items, err := store.listWhere(context, entityType, "`id` = ?", id)
	if err != nil || len(items) == 0 {
		return nil, false, err
	}
	return items[0], true, nil
}

func (store *Store) ListTransactions(context context.Context, accountID string, page, pageSize int, month *string) ([]json.RawMessage, error) {
	specification, err := entitySpecification(ledger.Transactions)
	if err != nil {
		return nil, err
	}
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 1
	}
	columns := selectColumns(specification)
	where := "`accountId` = ?"
	arguments := []interface{}{accountID}
	if month != nil {
		start, end, err := reportingMonthBounds(*month)
		if err != nil {
			return nil, err
		}
		where += " AND `date` >= ? AND `date` < ?"
		arguments = append(arguments, start, end)
	}
	arguments = append(arguments, pageSize, (page-1)*pageSize)
	query := "SELECT " + strings.Join(columns, ", ") + " FROM `" + specification.Table + "` WHERE " + where + " ORDER BY `date` DESC, `id` DESC LIMIT ? OFFSET ?"
	return store.queryPayloads(context, specification, query, arguments...)
}

func (store *Store) ListTransactionMonths(context context.Context, accountID string) ([]string, error) {
	database, err := store.connection()
	if err != nil {
		return nil, err
	}
	rows, err := database.QueryContext(context, "SELECT DISTINCT DATE_FORMAT(`date`, '%Y-%m') FROM `transaction` WHERE `accountId` = ? ORDER BY DATE_FORMAT(`date`, '%Y-%m') DESC", accountID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	months := make([]string, 0)
	for rows.Next() {
		var month string
		if err := rows.Scan(&month); err != nil {
			return nil, err
		}
		months = append(months, month)
	}
	return months, rows.Err()
}

func (store *Store) GetThemeConfig(context context.Context, userID string) (json.RawMessage, bool, error) {
	items, err := store.listWhere(context, ledger.ThemeConfigs, "`userId` = ?", userID)
	if err != nil || len(items) == 0 {
		return nil, false, err
	}
	return items[0], true, nil
}

// ImportTransactions mirrors the legacy all-or-partial import contract: an
// invalid CSV row is reported in failedRows while valid rows from the same
// request are still committed. Loan repayments are updated in the same SQL
// transaction as their newly imported transaction.
func (store *Store) ImportTransactions(context context.Context, accountID, userID string, items []json.RawMessage) (ledger.ImportResult, error) {
	database, err := store.connection()
	if err != nil {
		return ledger.ImportResult{}, err
	}
	transaction, err := database.BeginTx(context, nil)
	if err != nil {
		return ledger.ImportResult{}, err
	}
	committed := false
	defer func() {
		if !committed {
			_ = transaction.Rollback()
		}
	}()

	existingOrderIDs, err := transactionOrderIDs(context, transaction, accountID)
	if err != nil {
		return ledger.ImportResult{}, err
	}
	result := ledger.ImportResult{FailedRows: make([]ledger.ImportFailure, 0)}
	for index, raw := range items {
		payload, payloadErr := decodeObjectPayload(raw)
		if payloadErr != nil {
			appendImportFailure(&result, index, raw, payloadErr)
			continue
		}
		orderID, hasOrderID, orderErr := nullablePayloadString(payload, "orderId")
		if orderErr != nil {
			appendImportFailure(&result, index, raw, orderErr)
			continue
		}
		if hasOrderID && strings.TrimSpace(orderID) != "" && existingOrderIDs[orderID] {
			result.Skipped++
			continue
		}

		normalizeTransactionPayload(payload, accountID, userID)
		if err := validateLoanRepayment(context, transaction, payload, accountID, userID); err != nil {
			appendImportFailure(&result, index, raw, err)
			continue
		}
		if err := upsertEntity(context, transaction, ledger.Transactions, payload); err != nil {
			appendImportFailure(&result, index, raw, err)
			continue
		}
		repaymentAmount, err := applyImportedLoanRepayment(context, transaction, payload, accountID, userID)
		if err != nil {
			appendImportFailure(&result, index, raw, err)
			continue
		}
		if hasOrderID && strings.TrimSpace(orderID) != "" {
			existingOrderIDs[orderID] = true
		}
		result.Imported++
		if repaymentAmount.Sign() > 0 {
			result.LoanRepayments++
			result.LoanRepaymentAmount += ratFloat64(repaymentAmount)
		}
	}
	if err := transaction.Commit(); err != nil {
		return ledger.ImportResult{}, err
	}
	committed = true
	return result, nil
}

// ApplyLoanRepaymentClassifications attaches a manually categorised existing
// transaction to a loan. A transaction that is already attached, missing, or
// points to a paid-off loan is intentionally counted as skipped rather than an
// error, matching the current Ktor endpoint.
func (store *Store) ApplyLoanRepaymentClassifications(context context.Context, accountID, userID string, items []json.RawMessage) (ledger.LoanRepaymentClassificationResult, error) {
	database, err := store.connection()
	if err != nil {
		return ledger.LoanRepaymentClassificationResult{}, err
	}
	transaction, err := database.BeginTx(context, nil)
	if err != nil {
		return ledger.LoanRepaymentClassificationResult{}, err
	}
	committed := false
	defer func() {
		if !committed {
			_ = transaction.Rollback()
		}
	}()

	result := ledger.LoanRepaymentClassificationResult{}
	for _, raw := range items {
		payload, err := decodeObjectPayload(raw)
		if err != nil {
			result.Skipped++
			continue
		}
		transactionID, hasTransactionID, transactionIDErr := nullablePayloadString(payload, "id")
		loanID, hasLoanID, loanIDErr := nullablePayloadString(payload, "loanId")
		transactionType, hasTransactionType, transactionTypeErr := nullablePayloadString(payload, "type")
		if transactionIDErr != nil || loanIDErr != nil || transactionTypeErr != nil || !hasTransactionID || strings.TrimSpace(transactionID) == "" || !hasLoanID || strings.TrimSpace(loanID) == "" || !hasTransactionType || transactionType != "REPAYMENT" {
			result.Skipped++
			continue
		}
		currentLoanID, found, err := transactionLoanID(context, transaction, transactionID, accountID, userID)
		if err != nil {
			return ledger.LoanRepaymentClassificationResult{}, err
		}
		if !found || currentLoanID != nil {
			result.Skipped++
			continue
		}
		processable, err := loanCanReceiveRepayment(context, transaction, loanID, accountID, userID)
		if err != nil {
			return ledger.LoanRepaymentClassificationResult{}, err
		}
		if !processable {
			result.Skipped++
			continue
		}

		normalizeTransactionPayload(payload, accountID, userID)
		if err := validateLoanRepayment(context, transaction, payload, accountID, userID); err != nil {
			return ledger.LoanRepaymentClassificationResult{}, err
		}
		if err := upsertEntity(context, transaction, ledger.Transactions, payload); err != nil {
			return ledger.LoanRepaymentClassificationResult{}, err
		}
		repaymentAmount, err := applyImportedLoanRepayment(context, transaction, payload, accountID, userID)
		if err != nil {
			return ledger.LoanRepaymentClassificationResult{}, err
		}
		if repaymentAmount.Sign() > 0 {
			result.Applied++
			result.Amount += ratFloat64(repaymentAmount)
		} else {
			result.Skipped++
		}
	}
	if err := transaction.Commit(); err != nil {
		return ledger.LoanRepaymentClassificationResult{}, err
	}
	committed = true
	return result, nil
}

func transactionOrderIDs(context context.Context, transaction *sql.Tx, accountID string) (map[string]bool, error) {
	rows, err := transaction.QueryContext(context, "SELECT `orderId` FROM `transaction` WHERE `accountId` = ? AND `orderId` IS NOT NULL", accountID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	identifiers := make(map[string]bool)
	for rows.Next() {
		var orderID string
		if err := rows.Scan(&orderID); err != nil {
			return nil, err
		}
		identifiers[orderID] = true
	}
	return identifiers, rows.Err()
}

func appendImportFailure(result *ledger.ImportResult, index int, raw json.RawMessage, cause error) {
	result.Errors++
	result.FailedRows = append(result.FailedRows, ledger.ImportFailure{
		LineNumber:   index + 1,
		RawData:      compactJSON(raw),
		ErrorMessage: errorMessage(cause),
		ErrorType:    "IMPORT",
	})
}

func decodeObjectPayload(raw json.RawMessage) (map[string]json.RawMessage, error) {
	var payload map[string]json.RawMessage
	if len(raw) == 0 || json.Unmarshal(raw, &payload) != nil || payload == nil {
		return nil, errors.New("请求数据无效")
	}
	return payload, nil
}

func normalizeTransactionPayload(payload map[string]json.RawMessage, accountID, userID string) {
	encodedAccountID, _ := json.Marshal(accountID)
	encodedUserID, _ := json.Marshal(userID)
	payload["accountId"] = encodedAccountID
	payload["userId"] = encodedUserID
}

func nullablePayloadString(payload map[string]json.RawMessage, key string) (string, bool, error) {
	raw, exists := payload[key]
	if !exists || bytes.Equal(bytes.TrimSpace(raw), []byte("null")) {
		return "", false, nil
	}
	value, err := jsonString(raw)
	if err != nil {
		return "", false, fmt.Errorf("%s: %w", key, err)
	}
	return value, true, nil
}

func validateLoanRepayment(context context.Context, transaction *sql.Tx, payload map[string]json.RawMessage, accountID, userID string) error {
	transactionType, _, err := nullablePayloadString(payload, "type")
	if err != nil || transactionType != "REPAYMENT" {
		return err
	}
	loanID, hasLoanID, err := nullablePayloadString(payload, "loanId")
	if err != nil {
		return err
	}
	if !hasLoanID {
		return nil
	}
	amount, err := payloadDecimal(payload, "amount")
	if err != nil {
		return err
	}
	if amount.Sign() <= 0 {
		return errors.New("还款金额必须大于 0")
	}
	var exists int
	err = transaction.QueryRowContext(context, "SELECT 1 FROM loan WHERE id = ? AND accountId = ? AND userId = ? LIMIT 1", loanID, accountID, userID).Scan(&exists)
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("关联贷款不存在或无权访问")
	}
	return err
}

func applyImportedLoanRepayment(context context.Context, transaction *sql.Tx, payload map[string]json.RawMessage, accountID, userID string) (*big.Rat, error) {
	transactionType, _, err := nullablePayloadString(payload, "type")
	if err != nil || transactionType != "REPAYMENT" {
		return new(big.Rat), err
	}
	loanID, hasLoanID, err := nullablePayloadString(payload, "loanId")
	if err != nil {
		return nil, err
	}
	if !hasLoanID {
		return new(big.Rat), nil
	}
	amount, err := payloadDecimal(payload, "amount")
	if err != nil {
		return nil, err
	}
	if amount.Sign() <= 0 {
		return new(big.Rat), nil
	}

	var remainingText, monthlyPaymentText, status string
	var periods, paidPeriods int
	err = transaction.QueryRowContext(context, "SELECT remainingAmount, monthlyPayment, periods, paidPeriods, status FROM loan WHERE id = ? AND accountId = ? AND userId = ? LIMIT 1 FOR UPDATE", loanID, accountID, userID).Scan(&remainingText, &monthlyPaymentText, &periods, &paidPeriods, &status)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("关联贷款不存在或无权访问")
	}
	if err != nil {
		return nil, err
	}
	remainingAmount, err := decimalRat(remainingText)
	if err != nil {
		return nil, fmt.Errorf("invalid loan remaining amount: %w", err)
	}
	if remainingAmount.Sign() <= 0 || status == "PAID_OFF" {
		return new(big.Rat), nil
	}
	monthlyPayment, err := decimalRat(monthlyPaymentText)
	if err != nil {
		return nil, fmt.Errorf("invalid loan monthly payment: %w", err)
	}
	reducedAmount := new(big.Rat).Set(amount)
	if reducedAmount.Cmp(remainingAmount) > 0 {
		reducedAmount.Set(remainingAmount)
	}
	nextRemainingAmount := new(big.Rat).Sub(remainingAmount, reducedAmount)
	if monthlyPayment.Sign() > 0 && amount.Cmp(monthlyPayment) >= 0 && paidPeriods < periods {
		paidPeriods++
	}
	nextStatus := status
	if nextRemainingAmount.Sign() <= 0 {
		nextStatus = "PAID_OFF"
	}
	updatedAt, err := payloadValue(payload, entityField{JSON: "updatedAt", Kind: dateTimeField})
	if err != nil {
		return nil, err
	}
	if _, err := transaction.ExecContext(context, "UPDATE loan SET remainingAmount = ?, paidPeriods = ?, status = ?, updatedAt = ? WHERE id = ?", decimalText(nextRemainingAmount), paidPeriods, nextStatus, updatedAt, loanID); err != nil {
		return nil, err
	}
	return reducedAmount, nil
}

func transactionLoanID(context context.Context, transaction *sql.Tx, transactionID, accountID, userID string) (*string, bool, error) {
	var loanID sql.NullString
	err := transaction.QueryRowContext(context, "SELECT loanId FROM `transaction` WHERE id = ? AND accountId = ? AND userId = ? LIMIT 1", transactionID, accountID, userID).Scan(&loanID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, false, nil
	}
	if err != nil {
		return nil, false, err
	}
	if !loanID.Valid {
		return nil, true, nil
	}
	value := loanID.String
	return &value, true, nil
}

func loanCanReceiveRepayment(context context.Context, transaction *sql.Tx, loanID, accountID, userID string) (bool, error) {
	var remainingText, status string
	err := transaction.QueryRowContext(context, "SELECT remainingAmount, status FROM loan WHERE id = ? AND accountId = ? AND userId = ? LIMIT 1", loanID, accountID, userID).Scan(&remainingText, &status)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	remainingAmount, err := decimalRat(remainingText)
	if err != nil {
		return false, err
	}
	return status != "PAID_OFF" && remainingAmount.Sign() > 0, nil
}

func payloadDecimal(payload map[string]json.RawMessage, key string) (*big.Rat, error) {
	raw, exists := payload[key]
	if !exists || bytes.Equal(bytes.TrimSpace(raw), []byte("null")) {
		return nil, fmt.Errorf("%s: missing required value", key)
	}
	value, err := jsonNumber(raw)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", key, err)
	}
	return decimalRat(value)
}

func decimalRat(value string) (*big.Rat, error) {
	parsed, ok := new(big.Rat).SetString(value)
	if !ok {
		return nil, errors.New("must be a decimal number")
	}
	return parsed, nil
}

func decimalText(value *big.Rat) string {
	return value.FloatString(30)
}

func ratFloat64(value *big.Rat) float64 {
	result, _ := new(big.Float).SetRat(value).Float64()
	return result
}

func compactJSON(raw json.RawMessage) string {
	var compact bytes.Buffer
	if err := json.Compact(&compact, raw); err != nil {
		return string(raw)
	}
	return compact.String()
}

func errorMessage(cause error) string {
	if cause == nil || strings.TrimSpace(cause.Error()) == "" {
		return "无法保存该行"
	}
	return cause.Error()
}

func (store *Store) ListSyncRecords(context context.Context, accountID, userID string) ([]ledger.Record, error) {
	records := make([]ledger.Record, 0)
	appendItems := func(entityType ledger.EntityType, where string, arguments ...interface{}) error {
		items, err := store.listWhere(context, entityType, where, arguments...)
		if err != nil {
			return err
		}
		for _, payload := range items {
			record, err := syncRecord(entityType, payload)
			if err != nil {
				return err
			}
			records = append(records, record)
		}
		return nil
	}

	if user, exists, err := store.GetUser(context, userID); err != nil {
		return nil, err
	} else if exists {
		record, err := syncRecord(ledger.Users, user)
		if err != nil {
			return nil, err
		}
		records = append(records, record)
	}
	if err := appendItems(ledger.Accounts, "`id` = ?", accountID); err != nil {
		return nil, err
	}
	for _, entityType := range []ledger.EntityType{ledger.Transactions, ledger.Assets, ledger.Budgets, ledger.Loans, ledger.SavingsGoals, ledger.CategoryRules, ledger.ImportErrorLogs} {
		if err := appendItems(entityType, "`accountId` = ?", accountID); err != nil {
			return nil, err
		}
	}
	if err := appendItems(ledger.SavingsPlans, "`goalId` IN (SELECT id FROM savingsgoal WHERE accountId = ?)", accountID); err != nil {
		return nil, err
	}
	if err := appendItems(ledger.ExchangeRates, "1 = 1"); err != nil {
		return nil, err
	}
	if err := appendItems(ledger.ThemeConfigs, "`userId` = ? AND (`accountId` = ? OR `accountId` IS NULL)", userID, accountID); err != nil {
		return nil, err
	}
	return records, nil
}

func (store *Store) listWhere(context context.Context, entityType ledger.EntityType, where string, arguments ...interface{}) ([]json.RawMessage, error) {
	specification, err := entitySpecification(entityType)
	if err != nil {
		return nil, err
	}
	query := "SELECT " + strings.Join(selectColumns(specification), ", ") + " FROM `" + specification.Table + "` WHERE " + where
	return store.queryPayloads(context, specification, query, arguments...)
}

func (store *Store) queryPayloads(context context.Context, specification entitySpec, query string, arguments ...interface{}) ([]json.RawMessage, error) {
	database, err := store.connection()
	if err != nil {
		return nil, err
	}
	rows, err := database.QueryContext(context, query, arguments...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := make([]json.RawMessage, 0)
	for rows.Next() {
		payload, err := scanPayload(rows, specification)
		if err != nil {
			return nil, err
		}
		items = append(items, payload)
	}
	return items, rows.Err()
}

func selectColumns(specification entitySpec) []string {
	columns := make([]string, 0, len(specification.Fields))
	for _, field := range specification.Fields {
		columns = append(columns, "`"+field.Column+"`")
	}
	return columns
}

func reportingMonthBounds(month string) (time.Time, time.Time, error) {
	start, err := time.Parse("2006-01", month)
	if err != nil || start.Format("2006-01") != month {
		return time.Time{}, time.Time{}, errors.New("invalid month; expected YYYY-MM")
	}
	return start, start.AddDate(0, 1, 0), nil
}

func exists(context context.Context, database *sql.DB, query string, arguments ...interface{}) (bool, error) {
	var value int
	err := database.QueryRowContext(context, query, arguments...).Scan(&value)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

func entitySpecification(entityType ledger.EntityType) (entitySpec, error) {
	specification, exists := entitySpecs[entityType]
	if !exists {
		return entitySpec{}, fmt.Errorf("unsupported entity type: %s", entityType)
	}
	return specification, nil
}

func payloadValue(payload map[string]json.RawMessage, field entityField) (interface{}, error) {
	raw, exists := payload[field.JSON]
	nullable := field.Kind == nullableStringField || field.Kind == nullableDecimalField || field.Kind == nullableFloatField || field.Kind == nullableDateTimeField || field.Kind == rawTextField
	if !exists || bytes.Equal(bytes.TrimSpace(raw), []byte("null")) {
		if nullable {
			return nil, nil
		}
		return nil, errors.New("missing required value")
	}
	switch field.Kind {
	case stringField, nullableStringField:
		return jsonString(raw)
	case decimalField, nullableDecimalField, nullableFloatField:
		return jsonNumber(raw)
	case integerField:
		value, err := jsonNumber(raw)
		if err != nil {
			return nil, err
		}
		if _, err := strconv.ParseInt(value, 10, 64); err != nil {
			return nil, errors.New("must be an integer")
		}
		return value, nil
	case booleanField:
		var value bool
		if err := json.Unmarshal(raw, &value); err != nil {
			return nil, errors.New("must be a boolean")
		}
		return value, nil
	case dateTimeField, nullableDateTimeField:
		value, err := jsonString(raw)
		if err != nil {
			return nil, err
		}
		return parseDateTime(value)
	case rawTextField:
		var value string
		if err := json.Unmarshal(raw, &value); err == nil {
			return value, nil
		}
		var compact bytes.Buffer
		if err := json.Compact(&compact, raw); err != nil {
			return nil, errors.New("must be valid JSON")
		}
		return compact.String(), nil
	default:
		return nil, errors.New("unsupported value type")
	}
}

func jsonString(raw json.RawMessage) (string, error) {
	var value string
	if err := json.Unmarshal(raw, &value); err == nil {
		return value, nil
	}
	var number json.Number
	decoder := json.NewDecoder(bytes.NewReader(raw))
	decoder.UseNumber()
	if err := decoder.Decode(&number); err == nil && number.String() != "" {
		return number.String(), nil
	}
	return "", errors.New("must be a string")
}

func jsonNumber(raw json.RawMessage) (string, error) {
	var value string
	if err := json.Unmarshal(raw, &value); err == nil {
		if _, err := strconv.ParseFloat(value, 64); err != nil {
			return "", errors.New("must be a number")
		}
		return value, nil
	}
	var number json.Number
	decoder := json.NewDecoder(bytes.NewReader(raw))
	decoder.UseNumber()
	if err := decoder.Decode(&number); err != nil || number.String() == "" {
		return "", errors.New("must be a number")
	}
	if _, err := strconv.ParseFloat(number.String(), 64); err != nil {
		return "", errors.New("must be a number")
	}
	return number.String(), nil
}

func parseDateTime(value string) (time.Time, error) {
	normalized := strings.TrimSpace(value)
	normalized = strings.TrimSuffix(normalized, "Z")
	normalized = strings.ReplaceAll(normalized, "T", " ")
	if len(normalized) == len("2006-01-02") {
		return time.ParseInLocation("2006-01-02", normalized, time.UTC)
	}
	if len(normalized) >= len("2006-01-02 15:04:05") {
		return time.ParseInLocation("2006-01-02 15:04:05", normalized[:19], time.UTC)
	}
	return time.Time{}, errors.New("unsupported datetime format")
}

func scanPayload(rows *sql.Rows, specification entitySpec) (json.RawMessage, error) {
	values := make([]interface{}, len(specification.Fields))
	destinations := make([]interface{}, len(values))
	for index := range values {
		destinations[index] = &values[index]
	}
	if err := rows.Scan(destinations...); err != nil {
		return nil, err
	}
	payload := make(map[string]json.RawMessage, len(specification.Fields))
	for index, field := range specification.Fields {
		encoded, err := databaseJSON(values[index], field.Kind)
		if err != nil {
			return nil, fmt.Errorf("encode %s: %w", field.JSON, err)
		}
		payload[field.JSON] = encoded
	}
	if specification.HidePassword {
		payload["password"] = json.RawMessage(`""`)
	}
	encoded, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return encoded, nil
}

func databaseJSON(value interface{}, kind fieldKind) (json.RawMessage, error) {
	if value == nil {
		return json.RawMessage("null"), nil
	}
	if kind == dateTimeField || kind == nullableDateTimeField {
		switch typed := value.(type) {
		case time.Time:
			return json.Marshal(typed.Format("2006-01-02 15:04:05"))
		default:
			return json.Marshal(databaseText(typed))
		}
	}
	if kind == booleanField {
		switch typed := value.(type) {
		case bool:
			return json.Marshal(typed)
		case int64:
			return json.Marshal(typed != 0)
		case []byte:
			return json.Marshal(string(typed) == "1" || strings.EqualFold(string(typed), "true"))
		case string:
			return json.Marshal(typed == "1" || strings.EqualFold(typed, "true"))
		default:
			return nil, errors.New("unsupported boolean database value")
		}
	}
	if kind == integerField {
		text := databaseText(value)
		if _, err := strconv.ParseInt(text, 10, 64); err != nil {
			return nil, err
		}
		return json.RawMessage(text), nil
	}
	if kind == decimalField || kind == nullableDecimalField || kind == nullableFloatField {
		text := databaseText(value)
		if _, err := strconv.ParseFloat(text, 64); err != nil {
			return nil, err
		}
		return json.RawMessage(text), nil
	}
	return json.Marshal(databaseText(value))
}

func databaseText(value interface{}) string {
	switch typed := value.(type) {
	case []byte:
		return string(typed)
	case string:
		return typed
	case time.Time:
		return typed.Format("2006-01-02 15:04:05")
	default:
		return fmt.Sprint(typed)
	}
}

func syncRecord(entityType ledger.EntityType, payload json.RawMessage) (ledger.Record, error) {
	var values map[string]json.RawMessage
	if err := json.Unmarshal(payload, &values); err != nil {
		return ledger.Record{}, err
	}
	id, exists := rawString(values, "id")
	if !exists {
		return ledger.Record{}, errors.New("sync payload is missing id")
	}
	updatedAt, exists := rawString(values, "updatedAt")
	if !exists {
		updatedAt, _ = rawString(values, "createdAt")
	}
	record := ledger.Record{ID: id, EntityType: entityType, Payload: payload, UpdatedAt: updatedAt}
	switch entityType {
	case ledger.Users:
		record.AccountID = rawStringPointer(values, "defaultAccountId")
		record.UserID = rawStringPointer(values, "id")
	case ledger.Accounts:
		record.AccountID = rawStringPointer(values, "id")
		record.UserID = rawStringPointer(values, "ownerId")
	case ledger.SavingsPlans, ledger.ExchangeRates:
		// Ktor exposes no direct account/user fields for these record types.
	case ledger.ThemeConfigs:
		record.AccountID = rawStringPointer(values, "accountId")
		record.UserID = rawStringPointer(values, "userId")
	default:
		record.AccountID = rawStringPointer(values, "accountId")
		record.UserID = rawStringPointer(values, "userId")
	}
	return record, nil
}

func rawString(values map[string]json.RawMessage, key string) (string, bool) {
	raw, exists := values[key]
	if !exists || bytes.Equal(bytes.TrimSpace(raw), []byte("null")) {
		return "", false
	}
	var value string
	if err := json.Unmarshal(raw, &value); err != nil {
		return "", false
	}
	return value, true
}

func rawStringPointer(values map[string]json.RawMessage, key string) *string {
	value, exists := rawString(values, key)
	if !exists {
		return nil
	}
	return &value
}
