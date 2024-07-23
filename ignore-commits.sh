#!/bin/sh

# https://vercel.com/docs/projects/project-configuration#ignorecommand

LATEST_COMMIT_MESSAGE=$(git show-branch --no-name HEAD)

# Starts with Chore(Release)
if echo "$LATEST_COMMIT_MESSAGE" | grep -qi "^Chore(Release)"; then
  # Build
  exit 1
else
  # Skip build
  exit 0
fi
