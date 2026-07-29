#!/usr/bin/env bash
# Restores the archive created by script/package_church_demo.sh into place
# so start.sh can run without re-downloading the model or re-running
# dissection on this machine.

set -euo pipefail

# Resolve a relative archive path against the caller's cwd before we cd away.
ORIG_PWD="$(pwd)"

# Start from parent directory of script
cd "$(dirname "${BASH_SOURCE[0]}")/.."

ARCHIVE="${1:?Usage: $0 <path-to-church_demo_data.tar.gz>}"
case "${ARCHIVE}" in
    /*) ;;
    *) ARCHIVE="${ORIG_PWD}/${ARCHIVE}" ;;
esac

if [[ ! -f "${ARCHIVE}" ]]; then
    echo "No such file: ${ARCHIVE}" >&2
    exit 1
fi

echo "Extracting ${ARCHIVE} into $(pwd)..."
tar -xzf "${ARCHIVE}"

echo "Done. models/karras/churchoutdoor_lsun.pth and dissect/churchoutdoor/ are in place."
echo "Run ./start.sh to launch the demo."
