#!/usr/bin/env bash
# One-shot setup for a new machine: installs uv if needed, gets the demo
# data in place (auto-downloaded from GitHub Releases, or pass a local
# archive path as $1), and starts the GANPaint server.
set -euo pipefail
# Do NOT cd here -- bootstrap_new_machine.sh needs the caller's original
# cwd (still $PWD at this point) to resolve a relative archive path.
exec "$(dirname "${BASH_SOURCE[0]}")/script/bootstrap_new_machine.sh" "$@"
