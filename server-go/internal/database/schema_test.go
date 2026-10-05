package database

import (
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

func TestQuoteIdentifierEscapesBackticks(t *testing.T) {
	if quoted := quoteIdentifier("strange`name"); quoted != "`strange``name`" {
		t.Fatalf("quoteIdentifier() = %q", quoted)
	}
}
