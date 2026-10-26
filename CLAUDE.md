# gpt-translate-json

## Working on a developer machine

Applies to every coding agent (Claude Code, Codex, Cursor and others) on macOS, Windows and Linux.
Developers often run several sessions at once; keep CPU, memory and disk quiet.

- **Scratch work:** put extra clones, temporary installs, test databases and caches in the
  repo's own worktree folder (`.claude/worktrees/`) or the OS temp directory, never across the
  developer's repos folder. Delete a clone or worktree as soon as its work is pushed; keep at most
  two at a time. On macOS, prefer a temp folder whose name ends in `.noindex` (Spotlight skips it).
- **Tests:** run local tests on one worker, one suite at a time (Jest/Vitest `--maxWorkers=1`,
  Playwright `--workers=1`; never two suites in parallel) and pass `--forceExit` to Jest runs you
  script. Several sessions share the machine; parallel runs locked it. CI sizes its own workers.
- **Flaky tests:** run a new or changed test repeatedly before marking a PR ready (Playwright
  `--repeat-each=5`, Vitest `--sequence.shuffle --repeat=3`, Jest `--randomize`); it must pass every
  time. Wait for state, not time; no real clocks, randomness or network; each test sets up its own
  data. Never raise retries or timeouts to hide a flake (QualyHQ/standards STANDARDS "Tests that
  don't flake").
- **Processes:** stop every background process you started (test runners, mongod, dev servers,
  watchers) before finishing, and give long waits a time limit. Never stop processes another
  session or the developer started; report them instead.
- **Machine setup:** if installs or tests are unexpectedly slow, run
  `node scripts/dev-machine-check.mjs` from QualyHQ/standards and pass on what it reports
  (indexing and antivirus scanning of `node_modules` are the usual cause).
