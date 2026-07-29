#!/usr/bin/env bash
# Stops the GANPaint editing server started by run_ganpaint.sh.

# Start from parent directory of script
cd "$(dirname "${BASH_SOURCE[0]}")/.."

PIDFILE=.run/server.pid

if [[ -f "${PIDFILE}" ]] && kill -0 "$(cat "${PIDFILE}")" 2>/dev/null; then
    PID=$(cat "${PIDFILE}")
    kill "${PID}"
    echo "Stopped GANPaint server (pid ${PID})."
else
    echo "GANPaint server is not running (via this script)."
fi
rm -f "${PIDFILE}"
