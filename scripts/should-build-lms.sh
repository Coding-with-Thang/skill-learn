#!/usr/bin/env bash
# Used by Vercel "Ignore Build Step" for the LMS app.
# Vercel: exit 0 = SKIP build, exit 1 (or non-zero) = RUN build.

set -e

# Production branch (main): always run the build when a deploy is triggered
REF="${VERCEL_GIT_COMMIT_REF:-}"
if [ "$REF" = "main" ] || [ "$REF" = "master" ]; then
  exit 1
fi

# If no git or we can't determine changes, run build to be safe
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  exit 1
fi

# Script lives at <repo>/scripts/should-build-lms.sh; go to repo root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

# First deploy or no previous SHA: run build
PREV="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$PREV" ]; then
  exit 1
fi

# Skip build only if no relevant files changed (LMS app or shared packages)
if git diff --quiet "$PREV" HEAD -- apps/lms packages 2>/dev/null; then
  exit 0
fi

# Changes detected: run build
exit 1
