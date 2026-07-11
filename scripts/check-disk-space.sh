#!/bin/bash
# Warns when the root filesystem crosses a usage threshold.
# Run via cron; logs to syslog (journalctl -t skybell-disk) and a local log file.

THRESHOLD=90
LOG_FILE="/var/log/skybell-disk-check.log"

USAGE=$(df --output=pcent / | tail -1 | tr -dc '0-9')

if [ "$USAGE" -ge "$THRESHOLD" ]; then
  MSG="WARNING: root filesystem at ${USAGE}% (threshold ${THRESHOLD}%)"
  logger -t skybell-disk "$MSG"
  echo "$(date -Iseconds) $MSG" >> "$LOG_FILE"
fi
