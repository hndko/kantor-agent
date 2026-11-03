#!/usr/bin/env bash
# install-skills.sh - Install all bundled skills to Antigravity / Claude Code global config
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/skills"

if [ ! -d "$SKILLS_SRC" ]; then
  echo "Error: Direktori skills tidak ditemukan di $SKILLS_SRC"
  exit 1
fi

TARGETS=(
  "$HOME/.gemini/config/skills"
  "$HOME/.claude/skills"
)

echo "Menginstal seluruh skill & preset kantor ke konfigurasi global..."

for TARGET in "${TARGETS[@]}"; do
  mkdir -p "$TARGET"
  echo "Target: $TARGET"
  for SKILL in "$SKILLS_SRC"/*; do
    if [ -d "$SKILL" ]; then
      NAME=$(basename "$SKILL")
      cp -r "$SKILL" "$TARGET/"
      echo "  + $NAME"
    fi
  done
done

echo ""
echo "Sukses! Seluruh skill & preset telah terpasang di komputer ini."
echo "Sekarang Anda dapat menggunakan /studio-team, /fullstack-team, /aoi-team, /db-team, dll di semua project!"
