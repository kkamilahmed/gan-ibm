#!/usr/bin/env bash
# Starts the GANPaint editing server in the background and opens the demo.
# Safe to re-run: if it's already up, just opens the browser.

set -e

# Start from parent directory of script
cd "$(dirname "${BASH_SOURCE[0]}")/.."

PORT=5001
RUNDIR=.run
PIDFILE="${RUNDIR}/server.pid"
LOGFILE="${RUNDIR}/server.log"
URL="http://localhost:${PORT}/client/ganpaint.html"

mkdir -p "${RUNDIR}"

is_running() {
    [[ -f "${PIDFILE}" ]] && kill -0 "$(cat "${PIDFILE}")" 2>/dev/null
}

if is_running; then
    echo "GANPaint server already running (pid $(cat "${PIDFILE}"))."
else
    echo "Syncing server dependencies (uv sync --extra server)..."
    uv sync --extra server

    echo "Starting GANPaint server on port ${PORT}..."
    nohup uv run python -m netdissect.server --address 0.0.0.0 --port "${PORT}" \
        > "${LOGFILE}" 2>&1 &
    echo $! > "${PIDFILE}"
    disown

    # Give it a moment to bind the port or fail fast.
    for _ in 1 2 3 4 5 6 7 8 9 10; do
        if ! kill -0 "$(cat "${PIDFILE}")" 2>/dev/null; then
            echo "Server exited immediately -- check ${LOGFILE}:"
            tail -n 30 "${LOGFILE}"
            exit 1
        fi
        if curl -sf "http://localhost:${PORT}/api/all_projects" > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    echo "Server running (pid $(cat "${PIDFILE}")). Logs: ${LOGFILE}"
fi

echo "Opening ${URL}"
open "${URL}" 2>/dev/null || echo "Open this manually: ${URL}"
