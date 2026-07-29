#!/usr/bin/env bash
# Starts the GANPaint editing server and opens the demo in your browser.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
exec script/run_ganpaint.sh
