#!/usr/bin/env bash
# Used by Vercel "Ignore Build Step" for the LMS app.
# Exit 0 = run build, exit 1 = skip build.

set -e

# If no git or we can't determine changes, build to be safe
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  exit 0
fi

# Script lives at <repo>/scripts/should-build-lms.sh; go to repo root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

# Vercel sets these; fall back to HEAD^ for local or when only one commit
PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$PREV" ]; then
  # First deploy or no previous SHA: always build
  exit 0
fi

# Skip build only if no relevant files changed (LMS app or shared packages)
if git diff --quiet "$PREV" HEAD -- apps/lms packages 2>/dev/null; then
  exit 1
fi

exit 0
