#!/usr/bin/env bash
# Claude Code PostToolUse hook (QualyHQ/standards templates/claude): format and lint the file an
# agent just edited, so the repo's ESLint guardrails apply while it writes, not only at push.
# Only files inside this repo: formatting a sibling repo's files with this repo's Prettier
# config flipped their quote style and broke a deploy. ESLint errors go back to the agent (exit 2).
set -u
file=$(jq -r '.tool_input.file_path // empty')
root=${CLAUDE_PROJECT_DIR:-$(pwd)}
case "$file" in
  "$root"/*) ;;
  *) exit 0 ;;
esac
case "$file" in
  *.ts|*.tsx|*.js|*.mjs|*.cjs|*.vue) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0
cd "$root" || exit 0
[ -x node_modules/.bin/prettier ] && npx --no-install prettier --write --log-level warn "$file" >/dev/null 2>&1
if [ -x node_modules/.bin/eslint ]; then
  out=$(npx --no-install eslint --quiet --no-warn-ignored "$file" 2>&1) || { echo "$out" >&2; exit 2; }
fi
exit 0
