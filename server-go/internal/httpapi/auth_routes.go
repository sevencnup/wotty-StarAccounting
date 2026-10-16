package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/auth"
)

type authenticatedUserContextKey struct{}

func registerAuthRoutes(router chi.Router, service *auth.Service) {
	router.Get("/api/auth/registration", func(writer http.ResponseWriter, request *http.Request) {
		response, errorValue := service.RegistrationStatus(request.Context())
		if errorValue != nil {
			respondAuthError(writer, errorValue)
			return
		}
		writeJSON(writer, http.StatusOK, response)
	})

	router.Post("/api/auth/register", func(writer http.ResponseWriter, request *http.Request) {
		var credentials auth.Credentials
		if !decodeJSON(writer, request, &credentials) {
			return
		}
		response, errorValue := service.Register(request.Context(), credentials)
		if errorValue != nil {
			respondAuthError(writer, errorValue)
			return
		}
		writeJSON(writer, http.StatusOK, response)
	})

	router.Post("/api/auth/login", func(writer http.ResponseWriter, request *http.Request) {
		var credentials auth.Credentials
		if !decodeJSON(writer, request, &credentials) {
			return
		}
		response, errorValue := service.Login(request.Context(), credentials)
		if errorValue != nil {
			respondAuthError(writer, errorValue)
			return
		}
		writeJSON(writer, http.StatusOK, response)
	})

	router.Post("/api/auth/password/recover", func(writer http.ResponseWriter, request *http.Request) {
		var passwordRequest auth.PasswordRecoveryRequest
		if !decodeJSON(writer, request, &passwordRequest) {
			return
		}
		response, errorValue := service.RecoverPassword(request.Context(), passwordRequest)
		if errorValue != nil {
			respondAuthError(writer, errorValue)
			return
		}
		writeJSON(writer, http.StatusOK, response)
	})

	router.Group(func(protected chi.Router) {
		protected.Use(requireAuthentication(service))
		protected.Post("/api/auth/registration", func(writer http.ResponseWriter, request *http.Request) {
			var registrationRequest auth.RegistrationSettingRequest
			if !decodeJSON(writer, request, &registrationRequest) {
				return
			}
			response, errorValue := service.SetRegistrationEnabled(request.Context(), registrationRequest)
			if errorValue != nil {
				respondAuthError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, response)
		})

		protected.Post("/api/auth/password", func(writer http.ResponseWriter, request *http.Request) {
			var passwordRequest auth.PasswordResetRequest
			if !decodeJSON(writer, request, &passwordRequest) {
				return
			}
			user, exists := authenticatedUser(request.Context())
			if !exists {
				respondAuthError(writer, &auth.Error{Status: http.StatusUnauthorized, Message: "登录已失效，请重新登录"})
				return
			}
			response, errorValue := service.ResetPassword(request.Context(), user.ID, passwordRequest)
			if errorValue != nil {
				respondAuthError(writer, errorValue)
				return
			}
			writeJSON(writer, http.StatusOK, response)
		})

		protected.Get("/api/auth/me", func(writer http.ResponseWriter, request *http.Request) {
			user, exists := authenticatedUser(request.Context())
			if !exists {
				respondAuthError(writer, &auth.Error{Status: http.StatusUnauthorized, Message: "登录已失效，请重新登录"})
				return
			}
			writeJSON(writer, http.StatusOK, user.Response())
		})

		protected.Post("/api/auth/logout", func(writer http.ResponseWriter, request *http.Request) {
			writer.WriteHeader(http.StatusNoContent)
		})
	})
}

func requireAuthentication(service *auth.Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			authorization := strings.TrimSpace(request.Header.Get("Authorization"))
			if !strings.HasPrefix(authorization, "Bearer ") {
				respondAuthError(writer, &auth.Error{Status: http.StatusUnauthorized, Message: "请先登录云端账户"})
				return
			}
			user, errorValue := service.Authenticate(request.Context(), strings.TrimSpace(strings.TrimPrefix(authorization, "Bearer ")))
			if errorValue != nil {
				respondAuthError(writer, errorValue)
				return
			}
			request = request.WithContext(context.WithValue(request.Context(), authenticatedUserContextKey{}, user))
			next.ServeHTTP(writer, request)
		})
	}
}

func authenticatedUser(context context.Context) (auth.User, bool) {
	user, exists := context.Value(authenticatedUserContextKey{}).(auth.User)
	return user, exists
}

func decodeJSON(writer http.ResponseWriter, request *http.Request, destination interface{}) bool {
	request.Body = http.MaxBytesReader(writer, request.Body, 1<<20)
	decoder := json.NewDecoder(request.Body)
	if err := decoder.Decode(destination); err != nil {
		writeJSON(writer, http.StatusBadRequest, map[string]string{"error": "请求数据无效"})
		return false
	}
	return true
}

func respondAuthError(writer http.ResponseWriter, errorValue *auth.Error) {
	writeJSON(writer, errorValue.Status, map[string]string{"error": errorValue.Message})
}
