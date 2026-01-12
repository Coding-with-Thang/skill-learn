#!/bin/bash
# Combined check: Branch + Path-based
# Only builds if branch is "main" AND CMS files changed

# First check: Must be on main branch
if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then
  echo "Not on main branch, skipping CMS build"
  exit 0  # SKIP
fi

# Second check: CMS files must have changed
BASE_BRANCH=${VERCEL_GIT_COMMIT_REF:-main}
PREVIOUS_SHA=${VERCEL_GIT_PREVIOUS_SHA:-}

# Determine what to compare against
if [ -n "$PREVIOUS_SHA" ]; then
  DIFF_BASE="$PREVIOUS_SHA"
else
  # Try to find merge base with main branch
  DIFF_BASE=$(git merge-base HEAD origin/$BASE_BRANCH 2>/dev/null || echo HEAD~1)
fi

# Check if CMS-related files changed
if git diff --quiet "$DIFF_BASE" HEAD -- apps/cms packages/ turbo.json package.json package-lock.json 2>/dev/null; then
  echo "No CMS-related changes detected, skipping CMS build"
  exit 0  # SKIP
fi

# Both conditions met: branch is main AND CMS files changed
echo "Branch is main AND CMS files changed, proceeding with CMS build"
exit 1  # BUILD