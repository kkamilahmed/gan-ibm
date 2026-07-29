#!/usr/bin/env bash
# Starts the GANPaint editing server and opens the demo in your browser.
# Stays attached in the foreground -- press Ctrl+C to stop the server.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
exec script/run_ganpaint.sh
