#!/usr/bin/env bash
# Stops the GANPaint editing server started by start.sh.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
exec script/stop_ganpaint.sh
