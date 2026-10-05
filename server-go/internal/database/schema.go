package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/go-sql-driver/mysql"
)

// ensureSchema is deliberately additive. It creates a fresh deployment's
// tables and adds columns or indexes that a later application version needs;
// it never drops, renames, or rewrites existing user data.
func ensureSchema(context context.Context, database *sql.DB) error {
	for _, table := range schemaTables {
		if _, err := database.ExecContext(context, table.Create); err != nil {
			return fmt.Errorf("create table %s: %w", table.Name, err)
		}
		for _, column := range table.Columns {
			if err := ensureColumn(context, database, table.Name, column); err != nil {
				return err
			}
		}
		for _, index := range table.Indexes {
			if err := ensureIndex(context, database, table.Name, index); err != nil {
				return err
			}
		}
	}
	return nil
}

func ensureColumn(context context.Context, database *sql.DB, table string, column schemaColumn) error {
	var count int
	err := database.QueryRowContext(context, `
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`, table, column.Name).Scan(&count)
	if err != nil {
		return fmt.Errorf("inspect %s.%s: %w", table, column.Name, err)
	}
	if count > 0 {
		return nil
	}
	_, err = database.ExecContext(context, "ALTER TABLE "+quoteIdentifier(table)+" ADD COLUMN "+quoteIdentifier(column.Name)+" "+column.Definition)
	if duplicateColumn(err) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("add column %s.%s: %w", table, column.Name, err)
	}
	return nil
}

func ensureIndex(context context.Context, database *sql.DB, table string, index schemaIndex) error {
	var count int
	err := database.QueryRowContext(context, `
		SELECT COUNT(*) FROM information_schema.statistics
		WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`, table, index.Name).Scan(&count)
	if err != nil {
		return fmt.Errorf("inspect index %s.%s: %w", table, index.Name, err)
	}
	if count > 0 {
		return nil
	}
	prefix := "CREATE INDEX "
	if index.Unique {
		prefix = "CREATE UNIQUE INDEX "
	}
	_, err = database.ExecContext(context, prefix+quoteIdentifier(index.Name)+" ON "+quoteIdentifier(table)+" ("+strings.Join(index.Columns, ", ")+")")
	if duplicateIndex(err) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("create index %s.%s: %w", table, index.Name, err)
	}
	return nil
}

func quoteIdentifier(value string) string {
	return "`" + strings.ReplaceAll(value, "`", "``") + "`"
}

func duplicateColumn(err error) bool {
	var mysqlError *mysql.MySQLError
	return errors.As(err, &mysqlError) && mysqlError.Number == 1060
}

func duplicateIndex(err error) bool {
	var mysqlError *mysql.MySQLError
	return errors.As(err, &mysqlError) && mysqlError.Number == 1061
}

type schemaTable struct {
	Name    string
	Create  string
	Columns []schemaColumn
	Indexes []schemaIndex
}

type schemaColumn struct {
	Name       string
	Definition string
}

type schemaIndex struct {
	Name    string
	Columns []string
	Unique  bool
}

var schemaTables = []schemaTable{
	{
		Name: "user",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`user`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`email`" + ` VARCHAR(191) NOT NULL,
			` + "`password`" + ` VARCHAR(191) NOT NULL,
			` + "`name`" + ` VARCHAR(191) NULL,
			` + "`defaultAccountId`" + ` VARCHAR(191) NULL,
			` + "`role`" + ` VARCHAR(191) NOT NULL DEFAULT 'USER',
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `),
			UNIQUE KEY ` + "`User_email_key`" + ` (` + "`email`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"},
			{"email", "VARCHAR(191) NOT NULL"},
			{"password", "VARCHAR(191) NOT NULL"},
			{"name", "VARCHAR(191) NULL"},
			{"defaultAccountId", "VARCHAR(191) NULL"},
			{"role", "VARCHAR(191) NOT NULL DEFAULT 'USER'"},
			{"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
			{"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
		Indexes: []schemaIndex{{Name: "User_email_key", Columns: []string{"`email`"}, Unique: true}},
	},
	{
		Name: "authsetting",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`authsetting`" + ` (
			` + "`settingKey`" + ` VARCHAR(64) NOT NULL,
			` + "`settingValue`" + ` VARCHAR(64) NOT NULL,
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`settingKey`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"settingKey", "VARCHAR(64) NOT NULL"},
			{"settingValue", "VARCHAR(64) NOT NULL"},
			{"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
	},
	{
		Name: "account",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`account`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`name`" + ` VARCHAR(191) NOT NULL,
			` + "`ownerId`" + ` VARCHAR(191) NOT NULL,
			` + "`openingBalance`" + ` DECIMAL(65,30) NULL,
			` + "`openingBalanceDate`" + ` DATETIME(3) NULL,
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `),
			KEY ` + "`Account_ownerId_idx`" + ` (` + "`ownerId`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"},
			{"name", "VARCHAR(191) NOT NULL"},
			{"ownerId", "VARCHAR(191) NOT NULL"},
			{"openingBalance", "DECIMAL(65,30) NULL"},
			{"openingBalanceDate", "DATETIME(3) NULL"},
			{"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
			{"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
		Indexes: []schemaIndex{{Name: "Account_ownerId_idx", Columns: []string{"`ownerId`"}}},
	},
	{
		Name: "asset",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`asset`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`userId`" + ` VARCHAR(191) NOT NULL,
			` + "`accountId`" + ` VARCHAR(191) NOT NULL,
			` + "`name`" + ` VARCHAR(191) NOT NULL,
			` + "`type`" + ` VARCHAR(191) NOT NULL DEFAULT 'OTHER',
			` + "`balance`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`currency`" + ` VARCHAR(191) NOT NULL DEFAULT 'CNY',
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `),
			KEY ` + "`Asset_accountId_idx`" + ` (` + "`accountId`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"userId", "VARCHAR(191) NOT NULL"}, {"accountId", "VARCHAR(191) NOT NULL"},
			{"name", "VARCHAR(191) NOT NULL"}, {"type", "VARCHAR(191) NOT NULL DEFAULT 'OTHER'"}, {"balance", "DECIMAL(65,30) NOT NULL DEFAULT 0"},
			{"currency", "VARCHAR(191) NOT NULL DEFAULT 'CNY'"}, {"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"}, {"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
		Indexes: []schemaIndex{{Name: "Asset_accountId_idx", Columns: []string{"`accountId`"}}},
	},
	{
		Name: "budget",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`budget`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`userId`" + ` VARCHAR(191) NOT NULL,
			` + "`accountId`" + ` VARCHAR(191) NOT NULL,
			` + "`amount`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`category`" + ` VARCHAR(191) NOT NULL DEFAULT 'ALL',
			` + "`period`" + ` VARCHAR(32) NOT NULL DEFAULT 'MONTHLY',
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`alertPercent`" + ` INT NOT NULL DEFAULT 80,
			` + "`platform`" + ` VARCHAR(191) NULL,
			` + "`scopeType`" + ` VARCHAR(32) NOT NULL DEFAULT 'GLOBAL',
			PRIMARY KEY (` + "`id`" + `),
			KEY ` + "`Budget_accountId_idx`" + ` (` + "`accountId`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"userId", "VARCHAR(191) NOT NULL"}, {"accountId", "VARCHAR(191) NOT NULL"},
			{"amount", "DECIMAL(65,30) NOT NULL DEFAULT 0"}, {"category", "VARCHAR(191) NOT NULL DEFAULT 'ALL'"}, {"period", "VARCHAR(32) NOT NULL DEFAULT 'MONTHLY'"},
			{"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"}, {"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
			{"alertPercent", "INT NOT NULL DEFAULT 80"}, {"platform", "VARCHAR(191) NULL"}, {"scopeType", "VARCHAR(32) NOT NULL DEFAULT 'GLOBAL'"},
		},
		Indexes: []schemaIndex{{Name: "Budget_accountId_idx", Columns: []string{"`accountId`"}}},
	},
	{
		Name: "exchangerate",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`exchangerate`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`from`" + ` VARCHAR(191) NOT NULL,
			` + "`to`" + ` VARCHAR(191) NOT NULL,
			` + "`rate`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"from", "VARCHAR(191) NOT NULL"}, {"to", "VARCHAR(191) NOT NULL"},
			{"rate", "DECIMAL(65,30) NOT NULL DEFAULT 0"}, {"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
	},
	{
		Name: "importerrorlog",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`importerrorlog`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`userId`" + ` VARCHAR(191) NOT NULL,
			` + "`accountId`" + ` VARCHAR(191) NOT NULL,
			` + "`fileName`" + ` VARCHAR(191) NOT NULL,
			` + "`lineNumber`" + ` INT NOT NULL,
			` + "`rawData`" + ` TEXT NOT NULL,
			` + "`errorMessage`" + ` TEXT NOT NULL,
			` + "`errorType`" + ` VARCHAR(191) NOT NULL,
			` + "`resolved`" + ` BOOLEAN NOT NULL DEFAULT FALSE,
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `),
			KEY ` + "`ImportErrorLog_accountId_idx`" + ` (` + "`accountId`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"userId", "VARCHAR(191) NOT NULL"}, {"accountId", "VARCHAR(191) NOT NULL"},
			{"fileName", "VARCHAR(191) NOT NULL"}, {"lineNumber", "INT NOT NULL DEFAULT 0"}, {"rawData", "TEXT NOT NULL"},
			{"errorMessage", "TEXT NOT NULL"}, {"errorType", "VARCHAR(191) NOT NULL DEFAULT 'IMPORT'"}, {"resolved", "BOOLEAN NOT NULL DEFAULT FALSE"},
			{"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
		Indexes: []schemaIndex{{Name: "ImportErrorLog_accountId_idx", Columns: []string{"`accountId`"}}},
	},
	{
		Name: "loan",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`loan`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`userId`" + ` VARCHAR(191) NOT NULL,
			` + "`accountId`" + ` VARCHAR(191) NOT NULL,
			` + "`platform`" + ` VARCHAR(191) NOT NULL,
			` + "`totalAmount`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`remainingAmount`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`periods`" + ` INT NOT NULL DEFAULT 0,
			` + "`paidPeriods`" + ` INT NOT NULL DEFAULT 0,
			` + "`monthlyPayment`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`dueDate`" + ` INT NOT NULL DEFAULT 1,
			` + "`status`" + ` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
			` + "`matchKeywords`" + ` TEXT NULL,
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `),
			KEY ` + "`Loan_accountId_idx`" + ` (` + "`accountId`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"userId", "VARCHAR(191) NOT NULL"}, {"accountId", "VARCHAR(191) NOT NULL"}, {"platform", "VARCHAR(191) NOT NULL"},
			{"totalAmount", "DECIMAL(65,30) NOT NULL DEFAULT 0"}, {"remainingAmount", "DECIMAL(65,30) NOT NULL DEFAULT 0"}, {"periods", "INT NOT NULL DEFAULT 0"}, {"paidPeriods", "INT NOT NULL DEFAULT 0"},
			{"monthlyPayment", "DECIMAL(65,30) NOT NULL DEFAULT 0"}, {"dueDate", "INT NOT NULL DEFAULT 1"}, {"status", "VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'"},
			{"matchKeywords", "TEXT NULL"}, {"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"}, {"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
		Indexes: []schemaIndex{{Name: "Loan_accountId_idx", Columns: []string{"`accountId`"}}},
	},
	{
		Name: "savingsgoal",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`savingsgoal`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`userId`" + ` VARCHAR(191) NOT NULL,
			` + "`accountId`" + ` VARCHAR(191) NOT NULL,
			` + "`name`" + ` VARCHAR(191) NOT NULL,
			` + "`targetAmount`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`currentAmount`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`deadline`" + ` DATETIME(3) NULL,
			` + "`type`" + ` VARCHAR(64) NOT NULL DEFAULT 'LONG_TERM',
			` + "`status`" + ` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
			` + "`depositType`" + ` VARCHAR(32) NOT NULL DEFAULT 'CASH',
			` + "`planConfig`" + ` TEXT NULL,
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `),
			KEY ` + "`SavingsGoal_accountId_idx`" + ` (` + "`accountId`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"userId", "VARCHAR(191) NOT NULL"}, {"accountId", "VARCHAR(191) NOT NULL"}, {"name", "VARCHAR(191) NOT NULL"},
			{"targetAmount", "DECIMAL(65,30) NOT NULL DEFAULT 0"}, {"currentAmount", "DECIMAL(65,30) NOT NULL DEFAULT 0"}, {"deadline", "DATETIME(3) NULL"},
			{"type", "VARCHAR(64) NOT NULL DEFAULT 'LONG_TERM'"}, {"status", "VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'"}, {"depositType", "VARCHAR(32) NOT NULL DEFAULT 'CASH'"}, {"planConfig", "TEXT NULL"},
			{"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"}, {"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
		Indexes: []schemaIndex{{Name: "SavingsGoal_accountId_idx", Columns: []string{"`accountId`"}}},
	},
	{
		Name: "savingsplan",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`savingsplan`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`goalId`" + ` VARCHAR(191) NOT NULL,
			` + "`amount`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`status`" + ` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
			` + "`month`" + ` VARCHAR(191) NOT NULL,
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`expenses`" + ` TEXT NULL,
			` + "`remark`" + ` VARCHAR(191) NULL,
			` + "`salary`" + ` DECIMAL(65,30) NULL,
			` + "`proofImage`" + ` TEXT NULL,
			` + "`actualAmount`" + ` DECIMAL(65,30) NULL,
			` + "`actualDate`" + ` DATETIME(3) NULL,
			PRIMARY KEY (` + "`id`" + `),
			KEY ` + "`SavingsPlan_goalId_idx`" + ` (` + "`goalId`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"goalId", "VARCHAR(191) NOT NULL"}, {"amount", "DECIMAL(65,30) NOT NULL DEFAULT 0"}, {"status", "VARCHAR(32) NOT NULL DEFAULT 'PENDING'"},
			{"month", "VARCHAR(191) NOT NULL DEFAULT ''"}, {"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"}, {"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
			{"expenses", "TEXT NULL"}, {"remark", "VARCHAR(191) NULL"}, {"salary", "DECIMAL(65,30) NULL"}, {"proofImage", "TEXT NULL"}, {"actualAmount", "DECIMAL(65,30) NULL"}, {"actualDate", "DATETIME(3) NULL"},
		},
		Indexes: []schemaIndex{{Name: "SavingsPlan_goalId_idx", Columns: []string{"`goalId`"}}},
	},
	{
		Name: "themeconfig",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`themeconfig`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`userId`" + ` VARCHAR(191) NOT NULL,
			` + "`accountId`" + ` VARCHAR(191) NULL,
			` + "`themeId`" + ` VARCHAR(191) NOT NULL DEFAULT 'default',
			` + "`primaryColor`" + ` VARCHAR(191) NULL,
			` + "`radius`" + ` DOUBLE NULL,
			` + "`isDarkMode`" + ` BOOLEAN NOT NULL DEFAULT FALSE,
			` + "`chartStyle`" + ` TEXT NULL,
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `),
			UNIQUE KEY ` + "`ThemeConfig_userId_key`" + ` (` + "`userId`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"userId", "VARCHAR(191) NOT NULL"}, {"accountId", "VARCHAR(191) NULL"}, {"themeId", "VARCHAR(191) NOT NULL DEFAULT 'default'"},
			{"primaryColor", "VARCHAR(191) NULL"}, {"radius", "DOUBLE NULL"}, {"isDarkMode", "BOOLEAN NOT NULL DEFAULT FALSE"}, {"chartStyle", "TEXT NULL"},
			{"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"}, {"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
		Indexes: []schemaIndex{{Name: "ThemeConfig_userId_key", Columns: []string{"`userId`"}, Unique: true}},
	},
	{
		Name: "transaction",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`transaction`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`userId`" + ` VARCHAR(191) NOT NULL,
			` + "`accountId`" + ` VARCHAR(191) NOT NULL,
			` + "`amount`" + ` DECIMAL(65,30) NOT NULL DEFAULT 0,
			` + "`type`" + ` VARCHAR(32) NOT NULL,
			` + "`category`" + ` VARCHAR(191) NOT NULL,
			` + "`platform`" + ` VARCHAR(191) NOT NULL,
			` + "`merchant`" + ` TEXT NULL,
			` + "`date`" + ` DATETIME(3) NOT NULL,
			` + "`description`" + ` TEXT NULL,
			` + "`orderId`" + ` VARCHAR(191) NULL,
			` + "`paymentMethod`" + ` VARCHAR(191) NULL,
			` + "`status`" + ` VARCHAR(191) NULL,
			` + "`loanId`" + ` VARCHAR(191) NULL,
			` + "`remarkCategory`" + ` VARCHAR(191) NULL,
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `),
			KEY ` + "`Transaction_accountId_idx`" + ` (` + "`accountId`" + `),
			KEY ` + "`Transaction_accountId_date_idx`" + ` (` + "`accountId`" + `, ` + "`date`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"userId", "VARCHAR(191) NOT NULL"}, {"accountId", "VARCHAR(191) NOT NULL"}, {"amount", "DECIMAL(65,30) NOT NULL DEFAULT 0"},
			{"type", "VARCHAR(32) NOT NULL DEFAULT ''"}, {"category", "VARCHAR(191) NOT NULL DEFAULT ''"}, {"platform", "VARCHAR(191) NOT NULL DEFAULT ''"}, {"merchant", "TEXT NULL"},
			{"date", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"}, {"description", "TEXT NULL"}, {"orderId", "VARCHAR(191) NULL"}, {"paymentMethod", "VARCHAR(191) NULL"},
			{"status", "VARCHAR(191) NULL"}, {"loanId", "VARCHAR(191) NULL"}, {"remarkCategory", "VARCHAR(191) NULL"},
			{"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"}, {"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
		Indexes: []schemaIndex{
			{Name: "Transaction_accountId_idx", Columns: []string{"`accountId`"}},
			{Name: "Transaction_accountId_date_idx", Columns: []string{"`accountId`", "`date`"}},
		},
	},
	{
		Name: "transactioncategoryrule",
		Create: `CREATE TABLE IF NOT EXISTS ` + "`transactioncategoryrule`" + ` (
			` + "`id`" + ` VARCHAR(191) NOT NULL,
			` + "`userId`" + ` VARCHAR(191) NOT NULL,
			` + "`accountId`" + ` VARCHAR(191) NOT NULL,
			` + "`name`" + ` VARCHAR(191) NULL,
			` + "`merchant`" + ` VARCHAR(191) NOT NULL,
			` + "`merchantKey`" + ` VARCHAR(191) NOT NULL,
			` + "`category`" + ` VARCHAR(191) NOT NULL,
			` + "`description`" + ` VARCHAR(191) NULL,
			` + "`isActive`" + ` BOOLEAN NOT NULL DEFAULT TRUE,
			` + "`createdAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			` + "`updatedAt`" + ` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
			PRIMARY KEY (` + "`id`" + `),
			KEY ` + "`TransactionCategoryRule_accountId_idx`" + ` (` + "`accountId`" + `)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		Columns: []schemaColumn{
			{"id", "VARCHAR(191) NOT NULL"}, {"userId", "VARCHAR(191) NOT NULL"}, {"accountId", "VARCHAR(191) NOT NULL"}, {"name", "VARCHAR(191) NULL"},
			{"merchant", "VARCHAR(191) NOT NULL DEFAULT ''"}, {"merchantKey", "VARCHAR(191) NOT NULL DEFAULT ''"}, {"category", "VARCHAR(191) NOT NULL DEFAULT ''"}, {"description", "VARCHAR(191) NULL"},
			{"isActive", "BOOLEAN NOT NULL DEFAULT TRUE"}, {"createdAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"}, {"updatedAt", "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)"},
		},
		Indexes: []schemaIndex{{Name: "TransactionCategoryRule_accountId_idx", Columns: []string{"`accountId`"}}},
	},
}
