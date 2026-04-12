#!/usr/bin/env bash
# Working solution — native bash globbing, safe with spaces, quotes,
# special characters and leading dashes. Idempotent (skips already-prefixed files).
set -euo pipefail
shopt -s nullglob

for file in *.txt; do
    [[ "$file" == backup_* ]] && continue
    mv -- "$file" "backup_$file"
done
