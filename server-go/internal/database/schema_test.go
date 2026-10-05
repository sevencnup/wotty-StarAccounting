package database

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestSchemaContainsEveryLedgerStorageColumn(t *testing.T) {
	tables := make(map[string]schemaTable, len(schemaTables))
	for _, table := range schemaTables {
		if _, exists := tables[table.Name]; exists {
			t.Fatalf("duplicate schema table %q", table.Name)
		}
		tables[table.Name] = table
	}
	for entityType, specification := range entitySpecs {
		table, exists := tables[specification.Table]
		if !exists {
			t.Fatalf("schema has no table for %s (%s)", entityType, specification.Table)
		}
		columns := make(map[string]bool, len(table.Columns))
		for _, column := range table.Columns {
			columns[column.Name] = true
		}
		for _, field := range specification.Fields {
			if !columns[field.Column] {
				t.Errorf("schema table %s is missing %s for %s", specification.Table, field.Column, entityType)
			}
		}
	}
	for _, required := range []string{"user", "authsetting", "account", "transaction"} {
		if _, exists := tables[required]; !exists {
			t.Errorf("schema misses required table %s", required)
		}
	}
}

func TestSchemaCreateStatementsStayAdditive(t *testing.T) {
	for _, table := range schemaTables {
		statement := strings.ToUpper(table.Create)
		if !strings.Contains(statement, "CREATE TABLE IF NOT EXISTS") {
			t.Errorf("%s does not use CREATE TABLE IF NOT EXISTS", table.Name)
		}
		if strings.Contains(statement, " DROP ") || strings.Contains(statement, " TRUNCATE ") || strings.Contains(statement, " DELETE ") {
			t.Errorf("%s contains a destructive schema statement", table.Name)
		}
	}
}

func TestSchemaUsesKtorCompatibleMicrosecondDateTimes(t *testing.T) {
	for _, table := range schemaTables {
		if strings.Contains(table.Create, "DATETIME(3)") || strings.Contains(table.Create, "CURRENT_TIMESTAMP(3)") {
			t.Errorf("%s truncates new timestamps to milliseconds", table.Name)
		}
		for _, column := range table.Columns {
			if strings.Contains(column.Definition, "DATETIME") && !strings.Contains(column.Definition, "DATETIME(6)") {
				t.Errorf("%s.%s is not microsecond precision: %s", table.Name, column.Name, column.Definition)
			}
		}
	}
}

func TestQuoteIdentifierEscapesBackticks(t *testing.T) {
	if quoted := quoteIdentifier("strange`name"); quoted != "`strange``name`" {
		t.Fatalf("quoteIdentifier() = %q", quoted)
	}
}

func TestPayloadValueUsesKtorMissingFieldMessage(t *testing.T) {
	_, err := payloadValue(map[string]json.RawMessage{}, entityField{JSON: "type", Kind: stringField})
	if err == nil || err.Error() != "Key type is missing in the map." {
		t.Fatalf("payloadValue() error = %v", err)
	}
}

func TestDatabaseJSONNormalizesMySQLDecimalPaddingLikeKtor(t *testing.T) {
	encoded, err := databaseJSON([]byte("12.340000000000000000000000000000"), decimalField)
	if err != nil {
		t.Fatalf("databaseJSON() error = %v", err)
	}
	if string(encoded) != "12.34" {
		t.Fatalf("databaseJSON() = %s, want 12.34", encoded)
	}
}
