#!/usr/bin/env bash
# One-shot setup for a freshly cloned copy of this repo on a new machine:
# installs uv if missing, gets the churchoutdoor demo data in place (from an
# explicit archive path, or auto-downloaded from GitHub Releases), then
# starts the GANPaint server via start.sh.
#
# Usage: setup.sh [path-to-church_demo_data.tar.gz]

set -euo pipefail

# Resolve a relative archive path against the caller's cwd before we cd away.
ORIG_PWD="$(pwd)"

# Start from parent directory of script
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if ! command -v uv >/dev/null 2>&1; then
    echo "uv not found -- installing..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="${HOME}/.local/bin:${PATH}"
fi

# GitHub caps release assets at ~2GB, so the archive is split into parts.
RELEASE_URL="https://github.com/kkamilahmed/gan-ibm/releases/download/church-demo-data-v1"
RELEASE_PARTS=(church_demo_data.tar.gz.part00 church_demo_data.tar.gz.part01 church_demo_data.tar.gz.part02)

if [[ $# -ge 1 ]]; then
    ARCHIVE="$1"
    case "${ARCHIVE}" in
        /*) ;;
        *) ARCHIVE="${ORIG_PWD}/${ARCHIVE}" ;;
    esac
    script/unpack_church_demo.sh "${ARCHIVE}"
elif [[ ! -f models/karras/churchoutdoor_lsun.pth || ! -d dissect/churchoutdoor ]]; then
    echo "Demo data not found locally -- downloading from GitHub Releases..."
    DLDIR="$(mktemp -d)"
    for part in "${RELEASE_PARTS[@]}"; do
        echo "Fetching ${part}..."
        curl -fSL "${RELEASE_URL}/${part}" -o "${DLDIR}/${part}"
    done
    cat "${DLDIR}"/church_demo_data.tar.gz.part* > "${DLDIR}/church_demo_data.tar.gz"
    script/unpack_church_demo.sh "${DLDIR}/church_demo_data.tar.gz"
    rm -rf "${DLDIR}"
fi

exec ./start.sh
