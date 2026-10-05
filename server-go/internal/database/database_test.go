package database

import (
	"strings"
	"testing"
)

func TestBuildDSNConvertsJDBCURL(t *testing.T) {
	dsn, err := BuildDSN("jdbc:mysql://127.0.0.1:3307/star_accounting?useUnicode=true", "accounting", "example-password")
	if err != nil {
		t.Fatalf("BuildDSN() error = %v", err)
	}
	for _, expected := range []string{"accounting:example-password@tcp(127.0.0.1:3307)/star_accounting", "parseTime=true", "charset=utf8mb4"} {
		if !strings.Contains(dsn, expected) {
			t.Fatalf("DSN %q does not contain %q", dsn, expected)
		}
	}
}

func TestBuildDSNRejectsUnexpectedURL(t *testing.T) {
	if _, err := BuildDSN("mysql://localhost/stark", "user", "password"); err == nil {
		t.Fatal("BuildDSN() accepted a non-JDBC URL")
	}
}
