package database

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/sevencnup/wotty-StarAccounting/server-go/internal/auth"
)

const registrationEnabledSetting = "registration-enabled"

func (store *Store) FindUserByID(context context.Context, id string) (auth.User, error) {
	database, err := store.connection()
	if err != nil {
		return auth.User{}, err
	}
	return scanAuthUser(database.QueryRowContext(context,
		"SELECT id, email, password, name, defaultAccountId, role, createdAt, updatedAt FROM `user` WHERE id = ? LIMIT 1", id))
}

func (store *Store) FindUserByEmail(context context.Context, email string) (auth.User, error) {
	database, err := store.connection()
	if err != nil {
		return auth.User{}, err
	}
	return scanAuthUser(database.QueryRowContext(context,
		"SELECT id, email, password, name, defaultAccountId, role, createdAt, updatedAt FROM `user` WHERE email = ? LIMIT 1", email))
}

func (store *Store) RegistrationEnabled(context context.Context) (bool, error) {
	database, err := store.connection()
	if err != nil {
		return false, err
	}
	var value string
	err = database.QueryRowContext(context, `SELECT settingValue FROM authsetting WHERE settingKey = ? LIMIT 1`, registrationEnabledSetting).Scan(&value)
	if errors.Is(err, sql.ErrNoRows) {
		return true, nil
	}
	if err != nil {
		return false, err
	}
	return !strings.EqualFold(value, "false"), nil
}

func (store *Store) SetRegistrationEnabled(context context.Context, enabled bool) error {
	database, err := store.connection()
	if err != nil {
		return err
	}
	value := "false"
	if enabled {
		value = "true"
	}
	_, err = database.ExecContext(context, `
		INSERT INTO authsetting (settingKey, settingValue, updatedAt) VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE settingValue = VALUES(settingValue), updatedAt = VALUES(updatedAt)`,
		registrationEnabledSetting, value, time.Now().UTC())
	return err
}

func (store *Store) RegisterUser(context context.Context, email, passwordHash string, name *string) (auth.User, error) {
	database, err := store.connection()
	if err != nil {
		return auth.User{}, err
	}
	transaction, err := database.BeginTx(context, nil)
	if err != nil {
		return auth.User{}, err
	}
	committed := false
	defer func() {
		if !committed {
			_ = transaction.Rollback()
		}
	}()

	var registrationValue string
	err = transaction.QueryRowContext(context, `SELECT settingValue FROM authsetting WHERE settingKey = ? LIMIT 1`, registrationEnabledSetting).Scan(&registrationValue)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return auth.User{}, err
	}
	if err == nil && strings.EqualFold(registrationValue, "false") {
		return auth.User{}, errors.New("registration is disabled")
	}

	userID, err := generatedID("user")
	if err != nil {
		return auth.User{}, err
	}
	accountID, err := generatedID("account")
	if err != nil {
		return auth.User{}, err
	}
	// Ktor stores LocalDateTime.now() at the database's microsecond precision.
	// Keep that precision for both the stored value and the object returned by
	// registration: MySQL DATETIME(6) cannot preserve Go's extra nanoseconds.
	now := time.Now().UTC().Truncate(time.Microsecond)
	name = trimmedName(name)
	if _, err = transaction.ExecContext(context,
		"INSERT INTO `user` (id, email, password, name, defaultAccountId, createdAt, updatedAt, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		userID, email, passwordHash, name, accountID, now, now, "USER"); err != nil {
		return auth.User{}, err
	}
	if _, err = transaction.ExecContext(context, `
		INSERT INTO account (id, name, ownerId, openingBalance, createdAt, updatedAt)
		VALUES (?, ?, ?, ?, ?, ?)`,
		accountID, "默认账本", userID, 0, now, now); err != nil {
		return auth.User{}, err
	}
	if err = transaction.Commit(); err != nil {
		return auth.User{}, err
	}
	committed = true
	return auth.User{
		ID:               userID,
		Email:            email,
		Password:         passwordHash,
		Name:             name,
		DefaultAccountID: stringPointer(accountID),
		Role:             "USER",
		CreatedAt:        now,
		UpdatedAt:        now,
	}, nil
}

func (store *Store) UpdatePassword(context context.Context, userID, passwordHash string) error {
	database, err := store.connection()
	if err != nil {
		return err
	}
	_, err = database.ExecContext(context, "UPDATE `user` SET password = ?, updatedAt = ? WHERE id = ?", passwordHash, time.Now().UTC(), userID)
	return err
}

type rowScanner interface {
	Scan(...interface{}) error
}

func scanAuthUser(row rowScanner) (auth.User, error) {
	var user auth.User
	var name sql.NullString
	var defaultAccountID sql.NullString
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&name,
		&defaultAccountID,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return auth.User{}, auth.ErrNotFound
	}
	if err != nil {
		return auth.User{}, err
	}
	if name.Valid {
		user.Name = stringPointer(name.String)
	}
	if defaultAccountID.Valid {
		user.DefaultAccountID = stringPointer(defaultAccountID.String)
	}
	return user, nil
}

func generatedID(prefix string) (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("generate identifier: %w", err)
	}
	bytes[6] = (bytes[6] & 0x0f) | 0x40
	bytes[8] = (bytes[8] & 0x3f) | 0x80
	encoded := hex.EncodeToString(bytes)
	return fmt.Sprintf("%s-%s-%s-%s-%s-%s", prefix, encoded[0:8], encoded[8:12], encoded[12:16], encoded[16:20], encoded[20:]), nil
}

func trimmedName(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func stringPointer(value string) *string {
	return &value
}
