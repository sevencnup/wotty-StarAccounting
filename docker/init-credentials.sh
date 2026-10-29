#!/bin/sh
set -eu

root_file=/run/secrets/mysql-root/password
db_file=/run/secrets/db/password
jwt_file=/run/secrets/api/jwt_secret
admin_file=/run/secrets/api/account_admin_key

for directory in /run/secrets/mysql-root /run/secrets/db /run/secrets/api; do
    mkdir -p "$directory"
    chmod 0755 "$directory"
done

random_secret() {
    head -c 32 /dev/urandom | od -An -tx1 | tr -d '[:space:]'
}

ensure_secret() {
    file=$1
    supplied=$2
    minimum_length=$3
    setting_name=$4

    if [ -s "$file" ]; then
        chmod 0444 "$file"
        return
    fi

    if [ -z "$supplied" ]; then
        supplied=$(random_secret)
    fi
    if [ "${#supplied}" -lt "$minimum_length" ]; then
        echo "$setting_name must contain at least $minimum_length characters" >&2
        exit 1
    fi

    temporary_file="$file.tmp.$$"
    printf '%s' "$supplied" > "$temporary_file"
    chmod 0444 "$temporary_file"
    mv -f "$temporary_file" "$file"
}

# MySQL only applies initial passwords when its data directory is empty.
# Never invent new database passwords for an existing database volume.
if [ -d /var/lib/mysql/mysql ]; then
    if [ ! -s "$root_file" ] && [ -z "${MYSQL_ROOT_PASSWORD:-}" ]; then
        echo 'Existing MySQL data needs its original MYSQL_ROOT_PASSWORD for credential migration.' >&2
        exit 1
    fi
    if [ ! -s "$db_file" ] && [ -z "${DB_PASSWORD:-}" ]; then
        echo 'Existing MySQL data needs its original DB_PASSWORD for credential migration.' >&2
        exit 1
    fi
fi

ensure_secret "$root_file" "${MYSQL_ROOT_PASSWORD:-}" 1 MYSQL_ROOT_PASSWORD
ensure_secret "$db_file" "${DB_PASSWORD:-}" 1 DB_PASSWORD
ensure_secret "$jwt_file" "${JWT_SECRET:-}" 32 JWT_SECRET
ensure_secret "$admin_file" "${ACCOUNT_ADMIN_KEY:-}" 12 ACCOUNT_ADMIN_KEY

echo 'Deployment credentials are ready.'
