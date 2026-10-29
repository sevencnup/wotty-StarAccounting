package auth

import (
	"context"
	"encoding/base64"
	"errors"
	"strings"
	"testing"
	"time"

	"golang.org/x/crypto/argon2"
)

func TestPasswordCompatibility(t *testing.T) {
	hash, err := HashPassword("correct-password")
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}
	if !VerifyPassword("correct-password", hash) || VerifyPassword("wrong-password", hash) {
		t.Fatalf("PBKDF2 verification failed for %q", hash)
	}

	salt := []byte("legacy-argon2-salt")
	digest := argon2.IDKey([]byte("correct-password"), salt, 2, 8192, 1, 32)
	legacy := "$argon2id$v=19$m=8192,t=2,p=1$" + base64.RawStdEncoding.EncodeToString(salt) + "$" + base64.RawStdEncoding.EncodeToString(digest)
	if !VerifyPassword("correct-password", legacy) || VerifyPassword("wrong-password", legacy) {
		t.Fatalf("Argon2id verification failed for %q", legacy)
	}
	if !VerifyPassword("legacy-password", "legacy-password") || VerifyPassword("wrong", "legacy-password") {
		t.Fatal("legacy plaintext compatibility failed")
	}
}

func TestLoginIssuesAndVerifiesKtorCompatibleToken(t *testing.T) {
	password, err := HashPassword("correct-password")
	if err != nil {
		t.Fatal(err)
	}
	user := testUser("user-1", "person@example.com", password)
	repository := &memoryRepository{users: map[string]User{user.ID: user}, registrationEnabled: true}
	service := NewService(repository, Config{JWTSecret: "12345678901234567890123456789012"})
	service.now = func() time.Time { return time.Date(2026, time.October, 5, 6, 0, 0, 0, time.UTC) }

	response, errorValue := service.Login(context.Background(), Credentials{Email: " PERSON@EXAMPLE.COM ", Password: "correct-password"})
	if errorValue != nil {
		t.Fatalf("Login() error = %#v", errorValue)
	}
	if response.User.ID != user.ID || response.Token == "" {
		t.Fatalf("login response = %#v", response)
	}
	authenticated, errorValue := service.Authenticate(context.Background(), response.Token)
	if errorValue != nil || authenticated.ID != user.ID {
		t.Fatalf("Authenticate() = %#v, %#v", authenticated, errorValue)
	}
}

func TestRegisterAndRecoveryHonorExistingRules(t *testing.T) {
	repository := &memoryRepository{users: make(map[string]User), registrationEnabled: true}
	service := NewService(repository, Config{JWTSecret: "12345678901234567890123456789012", AccountAdminKey: "administrator"})
	response, errorValue := service.Register(context.Background(), Credentials{Email: "new@example.com", Password: "correct-password", Name: stringValue(" 新用户 ")})
	if errorValue != nil || response.User.Name == nil || *response.User.Name != "新用户" {
		t.Fatalf("Register() = %#v, %#v", response, errorValue)
	}
	if _, errorValue = service.Register(context.Background(), Credentials{Email: "new@example.com", Password: "correct-password"}); errorValue == nil || errorValue.Status != 409 {
		t.Fatalf("duplicate registration error = %#v", errorValue)
	}
	if _, errorValue = service.RecoverPassword(context.Background(), PasswordRecoveryRequest{
		Email: "new@example.com", NewPassword: "replacement", ConfirmPassword: "replacement", AdminKey: "wrong",
	}); errorValue == nil || errorValue.Status != 403 {
		t.Fatalf("bad admin key error = %#v", errorValue)
	}
	if _, errorValue = service.RecoverPassword(context.Background(), PasswordRecoveryRequest{
		Email: "new@example.com", NewPassword: "replacement", ConfirmPassword: "replacement", AdminKey: "administrator",
	}); errorValue != nil {
		t.Fatalf("RecoverPassword() error = %#v", errorValue)
	}
	if _, errorValue = service.Login(context.Background(), Credentials{Email: "new@example.com", Password: "replacement"}); errorValue != nil {
		t.Fatalf("Login() after recovery error = %#v", errorValue)
	}
}

func TestLoginReloadsUserAfterLegacyPasswordUpgrade(t *testing.T) {
	user := testUser("legacy-user", "legacy@example.com", "legacy-password")
	repository := &memoryRepository{
		users:               map[string]User{user.ID: user},
		updatedAt:           time.Date(2026, time.October, 5, 8, 30, 0, 123_000_000, time.UTC),
		registrationEnabled: true,
	}
	service := NewService(repository, Config{JWTSecret: "12345678901234567890123456789012"})

	response, errorValue := service.Login(context.Background(), Credentials{Email: user.Email, Password: "legacy-password"})
	if errorValue != nil {
		t.Fatalf("Login() error = %#v", errorValue)
	}
	if response.User.UpdatedAt != "2026-10-05 08:30:00.123" {
		t.Fatalf("updatedAt = %q", response.User.UpdatedAt)
	}
	if stored := repository.users[user.ID].Password; !strings.HasPrefix(stored, "pbkdf2-sha256$") {
		t.Fatalf("legacy password was not upgraded: %q", stored)
	}
}

func TestFormatDateTimeMatchesKtorAuthResponse(t *testing.T) {
	cases := []struct {
		name     string
		value    time.Time
		expected string
	}{
		{
			name:     "whole seconds",
			value:    time.Date(2026, time.October, 5, 7, 0, 0, 0, time.UTC),
			expected: "2026-10-05 07:00:00",
		},
		{
			name:     "milliseconds retain three digits",
			value:    time.Date(2026, time.October, 5, 7, 0, 0, 120_000_000, time.UTC),
			expected: "2026-10-05 07:00:00.120",
		},
		{
			name:     "microseconds retain six digits",
			value:    time.Date(2026, time.October, 5, 7, 0, 0, 120_456_000, time.UTC),
			expected: "2026-10-05 07:00:00.120456",
		},
		{
			name:     "nanoseconds retain nine digits",
			value:    time.Date(2026, time.October, 5, 7, 0, 0, 120_456_789, time.UTC),
			expected: "2026-10-05 07:00:00.120456789",
		},
	}

	for _, testCase := range cases {
		t.Run(testCase.name, func(t *testing.T) {
			if actual := formatDateTime(testCase.value); actual != testCase.expected {
				t.Fatalf("formatDateTime() = %q, want %q", actual, testCase.expected)
			}
		})
	}
}

type memoryRepository struct {
	users               map[string]User
	registrationEnabled bool
	updatedAt           time.Time
}

func (repository *memoryRepository) FindUserByID(_ context.Context, id string) (User, error) {
	user, exists := repository.users[id]
	if !exists {
		return User{}, ErrNotFound
	}
	return user, nil
}

func (repository *memoryRepository) FindUserByEmail(_ context.Context, email string) (User, error) {
	for _, user := range repository.users {
		if user.Email == email {
			return user, nil
		}
	}
	return User{}, ErrNotFound
}

func (repository *memoryRepository) RegistrationEnabled(context.Context) (bool, error) {
	return repository.registrationEnabled, nil
}

func (repository *memoryRepository) SetRegistrationEnabled(_ context.Context, enabled bool) error {
	repository.registrationEnabled = enabled
	return nil
}

func (repository *memoryRepository) RegisterUser(_ context.Context, email, password string, name *string) (User, error) {
	if _, err := repository.FindUserByEmail(context.Background(), email); !errors.Is(err, ErrNotFound) {
		return User{}, errors.New("duplicate user")
	}
	user := testUser("user-"+email, email, password)
	user.Name = name
	repository.users[user.ID] = user
	return user, nil
}

func (repository *memoryRepository) UpdatePassword(_ context.Context, id, password string) error {
	user, exists := repository.users[id]
	if !exists {
		return ErrNotFound
	}
	user.Password = password
	if !repository.updatedAt.IsZero() {
		user.UpdatedAt = repository.updatedAt
	}
	repository.users[id] = user
	return nil
}

func testUser(id, email, password string) User {
	createdAt := time.Date(2026, time.October, 5, 5, 0, 0, 0, time.UTC)
	return User{
		ID:               id,
		Email:            email,
		Password:         password,
		DefaultAccountID: stringValue("account-1"),
		Role:             "USER",
		CreatedAt:        createdAt,
		UpdatedAt:        createdAt,
	}
}

func stringValue(value string) *string { return &value }
