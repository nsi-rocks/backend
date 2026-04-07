#!/usr/bin/env bash
set -euo pipefail

# Backup the remote D1 database into backups/d1.
DB_NAME="${D1_DB_NAME:-nsi-rocks}"
BACKUP_DIR="${D1_BACKUP_DIR:-./backups/d1}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
OUTPUT_PATH="${1:-${BACKUP_DIR}/${DB_NAME}-remote-${TIMESTAMP}.sql}"
MAX_RETRIES="${D1_EXPORT_MAX_RETRIES:-3}"

mkdir -p "$(dirname "$OUTPUT_PATH")"

echo "[d1-backup] Exporting remote database '${DB_NAME}' to '${OUTPUT_PATH}'"
attempt=1
while true; do
	if CI=1 pnpm exec wrangler d1 export "${DB_NAME}" --remote --output "${OUTPUT_PATH}"; then
		break
	fi

	if [ "$attempt" -ge "$MAX_RETRIES" ]; then
		echo "[d1-backup] Export failed after ${MAX_RETRIES} attempts"
		exit 1
	fi

	attempt=$((attempt + 1))
	echo "[d1-backup] Retrying export (${attempt}/${MAX_RETRIES}) in 2s..."
	sleep 2
done
echo "[d1-backup] Backup completed"
