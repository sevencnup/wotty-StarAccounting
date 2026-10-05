package httpapi

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/auth"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/ledger"
)

var reportingMonthPattern = regexp.MustCompile(`^\d{4}-(0[1-9]|1[0-2])$`)

type syncRecordRequest struct {
	ID         string            `json:"id"`
	EntityType ledger.EntityType `json:"entityType"`
	AccountID  *string           `json:"accountId"`
	UserID     *string           `json:"userId"`
	Payload    json.RawMessage   `json:"payload"`
	UpdatedAt  string            `json:"updatedAt"`
}

func registerLedgerRoutes(router chi.Router, authService *auth.Service, service *ledger.Service) {
	router.Group(func(protected chi.Router) {
		protected.Use(requireAuthentication(authService))

		protected.Get("/api/user/me", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			payload, exists, errorValue := service.GetUser(request.Context(), user.ID)
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			if !exists {
				writeJSON(writer, http.StatusOK, nil)
				return
			}
			writeJSON(writer, http.StatusOK, payload)
		})
		protected.Post("/api/user", upsertEntityHandler(service, ledger.Users))

		protected.Get("/api/accounts", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			accounts, errorValue := service.ListAccounts(request.Context(), user.ID)
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, accounts)
		})
		protected.Get("/api/accounts/{id}", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			account, exists, errorValue := service.GetAccount(request.Context(), user.ID, chi.URLParam(request, "id"))
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			if !exists {
				writeJSON(writer, http.StatusOK, nil)
				return
			}
			writeJSON(writer, http.StatusOK, account)
		})
		protected.Post("/api/accounts", upsertEntityHandler(service, ledger.Accounts))
		protected.Delete("/api/accounts/{id}", deleteEntityHandler(service, ledger.Accounts))

		protected.Get("/api/transactions", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			accountID := queryOrDefault(request, "accountId", "default")
			month, valid := validatedMonth(request)
			if !valid {
				writeJSON(writer, http.StatusBadRequest, map[string]string{"error": "Invalid month; expected YYYY-MM"})
				return
			}
			items, errorValue := service.ListTransactions(
				request.Context(), user.ID, accountID,
				positiveQuery(request, "page", 1, 1, 0),
				positiveQuery(request, "pageSize", 50, 1, 500),
				month,
			)
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, items)
		})
		protected.Get("/api/transactions/months", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			months, errorValue := service.ListTransactionMonths(request.Context(), user.ID, queryOrDefault(request, "accountId", "default"))
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, months)
		})
		protected.Post("/api/transactions/import", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			items, ok := decodeJSONArray(writer, request)
			if !ok {
				return
			}
			result, errorValue := service.ImportTransactions(request.Context(), user.ID, queryOrDefault(request, "accountId", "default"), items)
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, result)
		})
		protected.Post("/api/transactions/loan-repayments", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			items, ok := decodeJSONArray(writer, request)
			if !ok {
				return
			}
			result, errorValue := service.ApplyLoanRepaymentClassifications(request.Context(), user.ID, queryOrDefault(request, "accountId", "default"), items)
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, result)
		})
		protected.Get("/api/transactions/{id}", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			transaction, exists, errorValue := service.GetTransaction(request.Context(), user.ID, chi.URLParam(request, "id"))
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			if !exists {
				writeJSON(writer, http.StatusOK, nil)
				return
			}
			writeJSON(writer, http.StatusOK, transaction)
		})
		protected.Post("/api/transactions", upsertEntityHandler(service, ledger.Transactions))
		protected.Delete("/api/transactions/{id}", deleteEntityHandler(service, ledger.Transactions))

		protected.Get("/api/sync", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			records, errorValue := service.ListRecords(request.Context(), user.ID, queryOrDefault(request, "accountId", "default"))
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, records)
		})
		protected.Post("/api/sync", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			var payload syncRecordRequest
			if !decodeJSON(writer, request, &payload) {
				return
			}
			if errorValue := service.UpsertRecord(request.Context(), user.ID, ledger.Record{
				ID:         payload.ID,
				EntityType: payload.EntityType,
				AccountID:  payload.AccountID,
				UserID:     payload.UserID,
				Payload:    payload.Payload,
				UpdatedAt:  payload.UpdatedAt,
			}); errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			writer.WriteHeader(http.StatusNoContent)
		})

		registerAccountEntityRoutes(protected, service, "/api/assets", ledger.Assets)
		registerAccountEntityRoutes(protected, service, "/api/budgets", ledger.Budgets)
		registerAccountEntityRoutes(protected, service, "/api/loans", ledger.Loans)
		registerAccountEntityRoutes(protected, service, "/api/savings-goals", ledger.SavingsGoals)

		protected.Get("/api/savings-plans", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			plans, errorValue := service.ListSavingsPlans(request.Context(), user.ID, queryOrDefault(request, "goalId", ""))
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, plans)
		})
		protected.Post("/api/savings-plans", upsertEntityHandler(service, ledger.SavingsPlans))
		protected.Delete("/api/savings-plans/{id}", deleteEntityHandler(service, ledger.SavingsPlans))

		registerAccountEntityReadWriteRoutes(protected, service, "/api/category-rules", ledger.CategoryRules)
		registerAccountEntityReadWriteRoutes(protected, service, "/api/import-errors", ledger.ImportErrorLogs)

		protected.Get("/api/exchange-rates", func(writer http.ResponseWriter, request *http.Request) {
			rates, errorValue := service.ListExchangeRates(request.Context())
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, rates)
		})

		protected.Get("/api/theme-config/{userId}", func(writer http.ResponseWriter, request *http.Request) {
			user, ok := ledgerUser(writer, request)
			if !ok {
				return
			}
			if chi.URLParam(request, "userId") != user.ID {
				writeJSON(writer, http.StatusForbidden, map[string]string{"error": "无权访问该用户配置"})
				return
			}
			config, exists, errorValue := service.GetThemeConfig(request.Context(), user.ID)
			if errorValue != nil {
				respondLedgerError(writer, errorValue)
				return
			}
			if !exists {
				writeJSON(writer, http.StatusOK, nil)
				return
			}
			writeJSON(writer, http.StatusOK, config)
		})
		protected.Put("/api/theme-config", upsertEntityHandler(service, ledger.ThemeConfigs))
	})
}

func registerAccountEntityRoutes(router chi.Router, service *ledger.Service, path string, entityType ledger.EntityType) {
	registerAccountEntityReadWriteRoutes(router, service, path, entityType)
	router.Delete(path+"/{id}", deleteEntityHandler(service, entityType))
}

func registerAccountEntityReadWriteRoutes(router chi.Router, service *ledger.Service, path string, entityType ledger.EntityType) {
	router.Get(path, func(writer http.ResponseWriter, request *http.Request) {
		user, ok := ledgerUser(writer, request)
		if !ok {
			return
		}
		items, errorValue := service.ListAccountEntities(request.Context(), user.ID, queryOrDefault(request, "accountId", "default"), entityType)
		if errorValue != nil {
			respondLedgerError(writer, errorValue)
			return
		}
		writeJSON(writer, http.StatusOK, items)
	})
	router.Post(path, upsertEntityHandler(service, entityType))
}

func upsertEntityHandler(service *ledger.Service, entityType ledger.EntityType) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		user, ok := ledgerUser(writer, request)
		if !ok {
			return
		}
		payload, ok := decodeJSONObject(writer, request)
		if !ok {
			return
		}
		if errorValue := service.UpsertPayload(request.Context(), user.ID, entityType, payload); errorValue != nil {
			respondLedgerError(writer, errorValue)
			return
		}
		writer.WriteHeader(http.StatusNoContent)
	}
}

func deleteEntityHandler(service *ledger.Service, entityType ledger.EntityType) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		user, ok := ledgerUser(writer, request)
		if !ok {
			return
		}
		if errorValue := service.DeleteEntity(request.Context(), user.ID, entityType, chi.URLParam(request, "id")); errorValue != nil {
			respondLedgerError(writer, errorValue)
			return
		}
		writer.WriteHeader(http.StatusNoContent)
	}
}

func ledgerUser(writer http.ResponseWriter, request *http.Request) (auth.User, bool) {
	user, exists := authenticatedUser(request.Context())
	if exists {
		return user, true
	}
	respondAuthError(writer, &auth.Error{Status: http.StatusUnauthorized, Message: "登录已失效，请重新登录"})
	return auth.User{}, false
}

func decodeJSONObject(writer http.ResponseWriter, request *http.Request) (json.RawMessage, bool) {
	var payload json.RawMessage
	if !decodeJSON(writer, request, &payload) {
		return nil, false
	}
	var values map[string]json.RawMessage
	if len(payload) == 0 || json.Unmarshal(payload, &values) != nil || values == nil {
		writeJSON(writer, http.StatusBadRequest, map[string]string{"error": "请求数据无效"})
		return nil, false
	}
	return payload, true
}

func decodeJSONArray(writer http.ResponseWriter, request *http.Request) ([]json.RawMessage, bool) {
	var items []json.RawMessage
	if !decodeJSON(writer, request, &items) {
		return nil, false
	}
	if items == nil {
		writeJSON(writer, http.StatusBadRequest, map[string]string{"error": "请求数据无效"})
		return nil, false
	}
	for _, item := range items {
		var value map[string]json.RawMessage
		if len(item) == 0 || json.Unmarshal(item, &value) != nil || value == nil {
			writeJSON(writer, http.StatusBadRequest, map[string]string{"error": "请求数据无效"})
			return nil, false
		}
	}
	return items, true
}

func respondLedgerError(writer http.ResponseWriter, errorValue *ledger.Error) {
	writeJSON(writer, errorValue.Status, map[string]string{"error": errorValue.Message})
}

func queryOrDefault(request *http.Request, name, fallback string) string {
	values, exists := request.URL.Query()[name]
	if !exists || len(values) == 0 {
		return fallback
	}
	return values[0]
}

func validatedMonth(request *http.Request) (*string, bool) {
	values, exists := request.URL.Query()["month"]
	if !exists || len(values) == 0 {
		return nil, true
	}
	month := values[0]
	if !reportingMonthPattern.MatchString(month) {
		return nil, false
	}
	return &month, true
}

func positiveQuery(request *http.Request, name string, fallback, minimum, maximum int) int {
	value := queryOrDefault(request, name, "")
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	if parsed < minimum {
		return minimum
	}
	if maximum > 0 && parsed > maximum {
		return maximum
	}
	return parsed
}
