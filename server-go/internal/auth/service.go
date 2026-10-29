package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/argon2"
	"golang.org/x/crypto/pbkdf2"
)

const (
	issuer                = "wotty-stark-api"
	audience              = "wotty-stark-client"
	tokenLifetime         = 30 * 24 * time.Hour
	pbkdf2Iterations      = 120000
	pbkdf2KeyLength       = 32
	minimumPasswordLength = 8
	minimumAdminKeyLength = 12
	recoveryAttemptLimit  = 5
	recoveryAttemptWindow = 10 * time.Minute
)

var emailPattern = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

type User struct {
	ID               string
	Email            string
	Password         string
	Name             *string
	DefaultAccountID *string
	Role             string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type UserResponse struct {
	ID               string  `json:"id"`
	Email            string  `json:"email"`
	Name             *string `json:"name,omitempty"`
	DefaultAccountID *string `json:"defaultAccountId,omitempty"`
	Role             string  `json:"role"`
	CreatedAt        string  `json:"createdAt"`
	UpdatedAt        string  `json:"updatedAt"`
}

type Credentials struct {
	Email    string  `json:"email"`
	Password string  `json:"password"`
	Name     *string `json:"name"`
}

type PasswordResetRequest struct {
	NewPassword     string `json:"newPassword"`
	ConfirmPassword string `json:"confirmPassword"`
}

type PasswordRecoveryRequest struct {
	Email           string `json:"email"`
	NewPassword     string `json:"newPassword"`
	ConfirmPassword string `json:"confirmPassword"`
	AdminKey        string `json:"adminKey"`
}

type RegistrationSettingRequest struct {
	RegistrationEnabled bool   `json:"registrationEnabled"`
	AdminKey            string `json:"adminKey"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

type RegistrationStatusResponse struct {
	RegistrationEnabled bool `json:"registrationEnabled"`
}

type Repository interface {
	FindUserByID(context.Context, string) (User, error)
	FindUserByEmail(context.Context, string) (User, error)
	RegistrationEnabled(context.Context) (bool, error)
	SetRegistrationEnabled(context.Context, bool) error
	RegisterUser(context.Context, string, string, *string) (User, error)
	UpdatePassword(context.Context, string, string) error
}

type Config struct {
	JWTSecret       string
	AccountAdminKey string
}

type Service struct {
	repository      Repository
	jwtSecret       []byte
	accountAdminKey string
	attempts        *recoveryAttempts
	now             func() time.Time
}

type Error struct {
	Status  int
	Message string
}

func (errorValue *Error) Error() string { return errorValue.Message }

func NewService(repository Repository, config Config) *Service {
	return &Service{
		repository:      repository,
		jwtSecret:       []byte(config.JWTSecret),
		accountAdminKey: strings.TrimSpace(config.AccountAdminKey),
		attempts:        &recoveryAttempts{byEmail: make(map[string][]time.Time)},
		now:             time.Now,
	}
}

func (service *Service) RegistrationStatus(context context.Context) (RegistrationStatusResponse, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return RegistrationStatusResponse{}, errorValue
	}
	enabled, err := service.repository.RegistrationEnabled(context)
	if err != nil {
		return RegistrationStatusResponse{}, databaseError(err)
	}
	return RegistrationStatusResponse{RegistrationEnabled: enabled}, nil
}

func (service *Service) Register(context context.Context, credentials Credentials) (AuthResponse, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return AuthResponse{}, errorValue
	}
	if message := validCredentials(credentials); message != "" {
		return AuthResponse{}, badRequest(message)
	}
	enabled, err := service.repository.RegistrationEnabled(context)
	if err != nil {
		return AuthResponse{}, databaseError(err)
	}
	if !enabled {
		return AuthResponse{}, forbidden("当前服务器已关闭新用户注册")
	}
	email := NormalizeEmail(credentials.Email)
	if _, err := service.repository.FindUserByEmail(context, email); err == nil {
		return AuthResponse{}, conflict("该邮箱已经注册，请直接登录")
	} else if !errors.Is(err, ErrNotFound) {
		return AuthResponse{}, databaseError(err)
	}
	passwordHash, err := HashPassword(credentials.Password)
	if err != nil {
		return AuthResponse{}, databaseError(err)
	}
	user, err := service.repository.RegisterUser(context, email, passwordHash, normalizeName(credentials.Name))
	if err != nil {
		return AuthResponse{}, databaseError(err)
	}
	return service.responseFor(user)
}

func (service *Service) Login(context context.Context, credentials Credentials) (AuthResponse, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return AuthResponse{}, errorValue
	}
	user, err := service.repository.FindUserByEmail(context, NormalizeEmail(credentials.Email))
	if errors.Is(err, ErrNotFound) || (err == nil && !VerifyPassword(credentials.Password, user.Password)) {
		return AuthResponse{}, unauthorized("邮箱或密码错误")
	}
	if err != nil {
		return AuthResponse{}, databaseError(err)
	}
	if !strings.HasPrefix(user.Password, "pbkdf2-sha256$") {
		upgraded, hashErr := HashPassword(credentials.Password)
		if hashErr != nil {
			return AuthResponse{}, databaseError(hashErr)
		}
		if err := service.repository.UpdatePassword(context, user.ID, upgraded); err != nil {
			return AuthResponse{}, databaseError(err)
		}
		// Ktor reloads after upgrading a legacy hash so the response carries the
		// database-written updatedAt value instead of the stale login snapshot.
		refreshed, refreshErr := service.repository.FindUserByID(context, user.ID)
		if refreshErr != nil {
			return AuthResponse{}, databaseError(refreshErr)
		}
		user = refreshed
	}
	return service.responseFor(user)
}

func (service *Service) RecoverPassword(context context.Context, request PasswordRecoveryRequest) (map[string]string, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, errorValue
	}
	email := NormalizeEmail(request.Email)
	if !emailPattern.MatchString(email) {
		return nil, badRequest("请输入有效的邮箱地址")
	}
	if message := validNewPassword(request.NewPassword, request.ConfirmPassword); message != "" {
		return nil, badRequest(message)
	}
	if !service.attempts.allow(email, service.now()) {
		return nil, &Error{Status: 429, Message: "尝试次数过多，请 10 分钟后再试"}
	}
	if errorValue := service.requireAdminKey(request.AdminKey); errorValue != nil {
		return nil, errorValue
	}
	user, err := service.repository.FindUserByEmail(context, email)
	if err == nil {
		hash, hashErr := HashPassword(request.NewPassword)
		if hashErr != nil {
			return nil, databaseError(hashErr)
		}
		if err := service.repository.UpdatePassword(context, user.ID, hash); err != nil {
			return nil, databaseError(err)
		}
	} else if !errors.Is(err, ErrNotFound) {
		return nil, databaseError(err)
	}
	return map[string]string{"message": "若该邮箱已注册，密码已重置，请使用新密码登录"}, nil
}

func (service *Service) SetRegistrationEnabled(context context.Context, request RegistrationSettingRequest) (RegistrationStatusResponse, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return RegistrationStatusResponse{}, errorValue
	}
	if errorValue := service.requireAdminKey(request.AdminKey); errorValue != nil {
		return RegistrationStatusResponse{}, errorValue
	}
	if err := service.repository.SetRegistrationEnabled(context, request.RegistrationEnabled); err != nil {
		return RegistrationStatusResponse{}, databaseError(err)
	}
	return RegistrationStatusResponse{RegistrationEnabled: request.RegistrationEnabled}, nil
}

func (service *Service) ResetPassword(context context.Context, userID string, request PasswordResetRequest) (map[string]string, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return nil, errorValue
	}
	if message := validNewPassword(request.NewPassword, request.ConfirmPassword); message != "" {
		return nil, badRequest(message)
	}
	if _, err := service.repository.FindUserByID(context, userID); errors.Is(err, ErrNotFound) {
		return nil, unauthorized("登录已失效，请重新登录")
	} else if err != nil {
		return nil, databaseError(err)
	}
	hash, err := HashPassword(request.NewPassword)
	if err != nil {
		return nil, databaseError(err)
	}
	if err := service.repository.UpdatePassword(context, userID, hash); err != nil {
		return nil, databaseError(err)
	}
	return map[string]string{"message": "密码修改成功"}, nil
}

func (service *Service) Authenticate(context context.Context, token string) (User, *Error) {
	if errorValue := service.available(); errorValue != nil {
		return User{}, errorValue
	}
	claims := &tokenClaims{}
	parsed, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("unexpected signing method")
		}
		return service.jwtSecret, nil
	}, jwt.WithAudience(audience), jwt.WithIssuer(issuer), jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil || !parsed.Valid || strings.TrimSpace(claims.UserID) == "" {
		return User{}, unauthorized("请先登录云端账户")
	}
	user, err := service.repository.FindUserByID(context, claims.UserID)
	if err != nil {
		return User{}, unauthorized("请先登录云端账户")
	}
	return user, nil
}

func (service *Service) responseFor(user User) (AuthResponse, *Error) {
	token, err := service.issue(user.ID)
	if err != nil {
		return AuthResponse{}, databaseError(err)
	}
	return AuthResponse{Token: token, User: user.Response()}, nil
}

func (service *Service) issue(userID string) (string, error) {
	now := service.now()
	claims := tokenClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    issuer,
			Subject:   userID,
			Audience:  jwt.ClaimStrings{audience},
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(tokenLifetime)),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(service.jwtSecret)
}

func (service *Service) available() *Error {
	if service == nil || service.repository == nil {
		return &Error{Status: 500, Message: "数据库未连接"}
	}
	return nil
}

func (service *Service) requireAdminKey(candidate string) *Error {
	if len(service.accountAdminKey) < minimumAdminKeyLength {
		return &Error{Status: 503, Message: "服务器尚未配置账户管理员恢复密钥"}
	}
	if subtle.ConstantTimeCompare([]byte(service.accountAdminKey), []byte(strings.TrimSpace(candidate))) != 1 {
		return forbidden("管理员恢复密钥无效")
	}
	return nil
}

func (user User) Response() UserResponse {
	return UserResponse{
		ID:               user.ID,
		Email:            user.Email,
		Name:             user.Name,
		DefaultAccountID: user.DefaultAccountID,
		Role:             user.Role,
		CreatedAt:        formatDateTime(user.CreatedAt),
		UpdatedAt:        formatDateTime(user.UpdatedAt),
	}
}

func NormalizeEmail(value string) string { return strings.ToLower(strings.TrimSpace(value)) }

func HashPassword(password string) (string, error) {
	if len(password) < minimumPasswordLength {
		return "", errors.New("Password must contain at least 8 characters")
	}
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("generate password salt: %w", err)
	}
	digest := pbkdf2.Key([]byte(password), salt, pbkdf2Iterations, pbkdf2KeyLength, sha256.New)
	return strings.Join([]string{
		"pbkdf2-sha256",
		strconv.Itoa(pbkdf2Iterations),
		base64.RawURLEncoding.EncodeToString(salt),
		base64.RawURLEncoding.EncodeToString(digest),
	}, "$"), nil
}

func VerifyPassword(password, stored string) bool {
	if strings.HasPrefix(stored, "pbkdf2-sha256$") {
		parts := strings.Split(stored, "$")
		if len(parts) != 4 {
			return false
		}
		iterations, err := strconv.Atoi(parts[1])
		if err != nil || iterations <= 0 || iterations > 10_000_000 {
			return false
		}
		salt, err := decodeRawURL(parts[2])
		if err != nil {
			return false
		}
		expected, err := decodeRawURL(parts[3])
		if err != nil || len(expected) == 0 {
			return false
		}
		actual := pbkdf2.Key([]byte(password), salt, iterations, len(expected), sha256.New)
		return subtle.ConstantTimeCompare(actual, expected) == 1
	}
	if strings.HasPrefix(stored, "$argon2id$") {
		return verifyArgon2ID(password, stored)
	}
	return subtle.ConstantTimeCompare([]byte(password), []byte(stored)) == 1
}

func validCredentials(credentials Credentials) string {
	if !emailPattern.MatchString(NormalizeEmail(credentials.Email)) {
		return "请输入有效的邮箱地址"
	}
	if len(credentials.Password) < minimumPasswordLength {
		return "密码至少需要 8 位"
	}
	return ""
}

func validNewPassword(newPassword, confirmPassword string) string {
	if len(newPassword) < minimumPasswordLength {
		return "新密码至少需要 8 位"
	}
	if newPassword != confirmPassword {
		return "两次输入的新密码不一致"
	}
	return ""
}

func normalizeName(name *string) *string {
	if name == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*name)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func formatDateTime(value time.Time) string {
	// AuthRoutes serialises Java's LocalDateTime with toString(), rather than
	// the second-precision formatter used by the ledger endpoints. Preserve
	// the same three/six/nine digit fractional-second behaviour so a client can
	// switch between Ktor and Go without seeing an artificial user change.
	base := value.Format("2006-01-02 15:04:05")
	nanoseconds := value.Nanosecond()
	switch {
	case nanoseconds == 0:
		return base
	case nanoseconds%1_000_000 == 0:
		return fmt.Sprintf("%s.%03d", base, nanoseconds/1_000_000)
	case nanoseconds%1_000 == 0:
		return fmt.Sprintf("%s.%06d", base, nanoseconds/1_000)
	default:
		return fmt.Sprintf("%s.%09d", base, nanoseconds)
	}
}

func decodeRawURL(value string) ([]byte, error) {
	decoded, err := base64.RawURLEncoding.DecodeString(value)
	if err == nil {
		return decoded, nil
	}
	return base64.URLEncoding.DecodeString(value)
}

func verifyArgon2ID(password, stored string) bool {
	parts := strings.Split(stored, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return false
	}
	parameters := make(map[string]string)
	for _, value := range strings.Split(parts[3], ",") {
		keyValue := strings.SplitN(value, "=", 2)
		if len(keyValue) == 2 {
			parameters[keyValue[0]] = keyValue[1]
		}
	}
	memory, memoryErr := strconv.ParseUint(parameters["m"], 10, 32)
	iterations, iterationsErr := strconv.ParseUint(parameters["t"], 10, 32)
	parallelism, parallelismErr := strconv.ParseUint(parameters["p"], 10, 8)
	if memoryErr != nil || iterationsErr != nil || parallelismErr != nil || memory == 0 || iterations == 0 || parallelism == 0 {
		return false
	}
	salt, saltErr := decodeRawStandard(parts[4])
	expected, expectedErr := decodeRawStandard(parts[5])
	if saltErr != nil || expectedErr != nil || len(expected) == 0 {
		return false
	}
	actual := argon2.IDKey([]byte(password), salt, uint32(iterations), uint32(memory), uint8(parallelism), uint32(len(expected)))
	return subtle.ConstantTimeCompare(actual, expected) == 1
}

func decodeRawStandard(value string) ([]byte, error) {
	decoded, err := base64.RawStdEncoding.DecodeString(value)
	if err == nil {
		return decoded, nil
	}
	return base64.StdEncoding.DecodeString(value)
}

func badRequest(message string) *Error      { return &Error{Status: 400, Message: message} }
func unauthorized(message string) *Error    { return &Error{Status: 401, Message: message} }
func forbidden(message string) *Error       { return &Error{Status: 403, Message: message} }
func conflict(message string) *Error        { return &Error{Status: 409, Message: message} }
func databaseError(errorValue error) *Error { return &Error{Status: 500, Message: errorValue.Error()} }

type tokenClaims struct {
	UserID string `json:"userId"`
	jwt.RegisteredClaims
}

type recoveryAttempts struct {
	mutex   sync.Mutex
	byEmail map[string][]time.Time
}

func (attempts *recoveryAttempts) allow(email string, now time.Time) bool {
	attempts.mutex.Lock()
	defer attempts.mutex.Unlock()
	values := attempts.byEmail[email]
	cutoff := now.Add(-recoveryAttemptWindow)
	kept := values[:0]
	for _, value := range values {
		if value.After(cutoff) {
			kept = append(kept, value)
		}
	}
	if len(kept) >= recoveryAttemptLimit {
		attempts.byEmail[email] = kept
		return false
	}
	attempts.byEmail[email] = append(kept, now)
	if len(attempts.byEmail) > 1024 {
		attempts.byEmail = make(map[string][]time.Time)
	}
	return true
}

var ErrNotFound = errors.New("record not found")
