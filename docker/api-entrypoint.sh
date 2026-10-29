#!/bin/sh
set -eu

if [ -d /run/secrets/db ] || [ -d /run/secrets/api ]; then
    for secret_file in /run/secrets/db/password /run/secrets/api/jwt_secret /run/secrets/api/account_admin_key; do
        if [ ! -s "$secret_file" ]; then
            echo "Missing deployment credential: $secret_file" >&2
            exit 1
        fi
    done

    DB_PASSWORD=$(cat /run/secrets/db/password)
    JWT_SECRET=$(cat /run/secrets/api/jwt_secret)
    ACCOUNT_ADMIN_KEY=$(cat /run/secrets/api/account_admin_key)
    export DB_PASSWORD JWT_SECRET ACCOUNT_ADMIN_KEY
fi

exec /app/wotty-stark-api "$@"
