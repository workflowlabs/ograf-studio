#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APPS_DIST_DIR="$REPO_ROOT/../../dist/apps"
GRAF_APP_DIST_DIR="$APPS_DIST_DIR/ograf.app"
EDITOR_DIST_DIR="$REPO_ROOT/apps/editor/dist"

echo "Apps dist dir: $APPS_DIST_DIR"

rm -rf "$GRAF_APP_DIST_DIR"

cd "$REPO_ROOT"
npm run build -d

mkdir -p "$(dirname "$GRAF_APP_DIST_DIR")"

echo "Moving dist to: $GRAF_APP_DIST_DIR"

mv "$EDITOR_DIST_DIR" "$GRAF_APP_DIST_DIR"
