#!/usr/bin/env bash
# Seeds AWS Secrets Manager entries for NutriTracker dev.
# Required: MONGO_ROOT_PASSWORD, SMTP_PASS, SMTP_USER
# Optional: AWS_REGION (default eu-central-1), MONGO_ROOT_USERNAME, SMTP_*, EMAIL_FROM, TOKEN_EXPIRY_MINUTES

set -euo pipefail

AWS_REGION="${AWS_REGION:-eu-central-1}"
MONGO_ROOT_USERNAME="${MONGO_ROOT_USERNAME:-admin}"
MONGO_ROOT_PASSWORD="${MONGO_ROOT_PASSWORD:?MONGO_ROOT_PASSWORD is required}"
SMTP_HOST="${SMTP_HOST:-smtp.gmail.com}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_USER="${SMTP_USER:?SMTP_USER is required}"
SMTP_PASS="${SMTP_PASS:?SMTP_PASS is required}"
EMAIL_FROM="${EMAIL_FROM:-$SMTP_USER}"
TOKEN_EXPIRY_MINUTES="${TOKEN_EXPIRY_MINUTES:-15}"

upsert_secret() {
  local name="$1"
  local json="$2"

  if aws secretsmanager describe-secret --secret-id "$name" --region "$AWS_REGION" >/dev/null 2>&1; then
    echo "Updating secret: $name"
    aws secretsmanager put-secret-value \
      --secret-id "$name" \
      --secret-string "$json" \
      --region "$AWS_REGION" >/dev/null
  else
    echo "Creating secret: $name"
    aws secretsmanager create-secret \
      --name "$name" \
      --secret-string "$json" \
      --region "$AWS_REGION" >/dev/null
  fi
}

MONGO_URI_BASE="mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongo:27017"

upsert_secret "nutritracker/dev/mongo" "$(cat <<EOF
{"MONGO_INITDB_ROOT_USERNAME":"${MONGO_ROOT_USERNAME}","MONGO_INITDB_ROOT_PASSWORD":"${MONGO_ROOT_PASSWORD}"}
EOF
)"

upsert_secret "nutritracker/dev/goal-service" "$(cat <<EOF
{"PORT":"3002","MONGO_URI":"${MONGO_URI_BASE}/cozy-calories-goals?authSource=admin"}
EOF
)"

upsert_secret "nutritracker/dev/user-service" "$(cat <<EOF
{"PORT":"3001","MONGO_URI":"${MONGO_URI_BASE}/cozy-calories-users?authSource=admin","TOKEN_EXPIRY_MINUTES":"${TOKEN_EXPIRY_MINUTES}","SMTP_HOST":"${SMTP_HOST}","SMTP_PORT":"${SMTP_PORT}","SMTP_USER":"${SMTP_USER}","SMTP_PASS":"${SMTP_PASS}","EMAIL_FROM":"${EMAIL_FROM}"}
EOF
)"

upsert_secret "nutritracker/dev/daily-log-service" "$(cat <<EOF
{"PORT":"3003","MONGO_URI":"${MONGO_URI_BASE}/cozy-calories-logs?authSource=admin","GOAL_SERVICE_URL":"http://goal-service:3002"}
EOF
)"

echo "Done. Secrets created/updated under nutritracker/dev/* in ${AWS_REGION}."
