# gpt-translate-json

## Working on a developer machine

Applies to every coding agent (Claude Code, Codex, Cursor and others) on macOS, Windows and Linux.
Developers often run several sessions at once; keep CPU, memory and disk quiet.

- **Scratch work:** put extra clones, temporary installs, test databases and caches in the
  repo's own worktree folder (`.claude/worktrees/`) or the OS temp directory, never across the
  developer's repos folder. Delete a clone or worktree as soon as its work is pushed; keep at most
  two at a time. On macOS, prefer a temp folder whose name ends in `.noindex` (Spotlight skips it).
- **Tests:** cap local parallelism at two workers (Jest/Vitest `--maxWorkers=2`, Playwright
  `--workers=2`) and pass `--forceExit` to Jest runs you script.
- **Processes:** stop every background process you started (test runners, mongod, dev servers,
  watchers) before finishing, and give long waits a time limit. Never stop processes another
  session or the developer started; report them instead.
- **Machine setup:** if installs or tests are unexpectedly slow, run
  `node scripts/dev-machine-check.mjs` from QualyHQ/standards and pass on what it reports
  (indexing and antivirus scanning of `node_modules` are the usual cause).
