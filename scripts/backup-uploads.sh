#!/bin/bash
# Off-box backup of the uploads directory. NOT scheduled yet.
#
# Fill in BACKUP_DEST below (e.g. "backupuser@1.2.3.4:/backups/skybell-uploads"),
# make sure key-based SSH auth works to that host as that user, then add to cron:
#   0 3 * * * /var/www/skybell-tracker/scripts/backup-uploads.sh >> /var/log/skybell-backup.log 2>&1

set -euo pipefail

SOURCE_DIR="/var/www/skybell-uploads/"
BACKUP_DEST=""   # e.g. "backupuser@1.2.3.4:/backups/skybell-uploads/"

if [ -z "$BACKUP_DEST" ]; then
  echo "BACKUP_DEST is not set. Edit this script before running." >&2
  exit 1
fi

rsync -az --delete "$SOURCE_DIR" "$BACKUP_DEST"
