package database

import (
	"strings"
	"testing"
)

func TestSubscriptionOwnershipQueryUsesCompatibleCollation(t *testing.T) {
	const collation = "COLLATE utf8mb4_unicode_ci"
	if strings.Count(subscriptionOwnershipQuery, collation) != 2 {
		t.Fatalf("subscription ownership query must compare both IDs with %s: %s", collation, subscriptionOwnershipQuery)
	}
}
