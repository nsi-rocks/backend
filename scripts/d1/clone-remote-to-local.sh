#!/usr/bin/env bash
set -euo pipefail

# Clone remote D1 into local persisted D1 used by wrangler dev.
DB_NAME="${D1_DB_NAME:-nsi-rocks}"
PERSIST_DIR="${D1_PERSIST_DIR:-./.wrangler/state}"
TMP_DIR="${D1_TMP_DIR:-./.tmp/d1}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
EXPORT_PATH="${TMP_DIR}/${DB_NAME}-remote-snapshot-${TIMESTAMP}.sql"
IMPORT_PATH="${TMP_DIR}/${DB_NAME}-remote-snapshot-${TIMESTAMP}.import.sql"
MAX_RETRIES="${D1_EXPORT_MAX_RETRIES:-3}"

mkdir -p "${TMP_DIR}"

echo "[d1-clone] Exporting remote database '${DB_NAME}'"
attempt=1
while true; do
	if CI=1 pnpm exec wrangler d1 export "${DB_NAME}" --remote --output "${EXPORT_PATH}"; then
		break
	fi

	if [ "$attempt" -ge "$MAX_RETRIES" ]; then
		echo "[d1-clone] Export failed after ${MAX_RETRIES} attempts"
		exit 1
	fi

	attempt=$((attempt + 1))
	echo "[d1-clone] Retrying export (${attempt}/${MAX_RETRIES}) in 2s..."
	sleep 2
done

echo "[d1-clone] Preparing import SQL for local D1"
awk '
	BEGIN { skip = 0 }
	/^CREATE TABLE d1_migrations\(/ { skip = 1; next }
	skip == 1 && /^\);$/ { skip = 0; next }
	skip == 1 { next }
	/INSERT INTO "d1_migrations"/ { next }
	/INSERT INTO "sqlite_sequence" .*\x27d1_migrations\x27/ { next }
	{ print }
' "${EXPORT_PATH}" > "${IMPORT_PATH}"

echo "[d1-clone] Resetting local persisted D1 state in '${PERSIST_DIR}/v3/d1'"
rm -rf "${PERSIST_DIR}/v3/d1"

echo "[d1-clone] Importing snapshot into local D1"
CI=1 pnpm exec wrangler d1 execute "${DB_NAME}" --local --persist-to "${PERSIST_DIR}" --file "${IMPORT_PATH}"

echo "[d1-clone] Local clone completed"
