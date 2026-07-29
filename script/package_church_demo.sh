#!/usr/bin/env bash
# Packages the churchoutdoor GAN model and its precomputed dissection into a
# single archive, so it can be copied to another machine instead of
# re-downloading the model and re-running dissection there.
# See script/unpack_church_demo.sh to restore it on the new machine.

set -euo pipefail

# Resolve a relative output path against the caller's cwd before we cd away.
ORIG_PWD="$(pwd)"

# Start from parent directory of script
cd "$(dirname "${BASH_SOURCE[0]}")/.."

OUT="${1:-church_demo_data.tar.gz}"
case "${OUT}" in
    /*) ;;
    *) OUT="${ORIG_PWD}/${OUT}" ;;
esac

for f in models/karras/churchoutdoor_lsun.pth dissect/churchoutdoor; do
    if [[ ! -e "${f}" ]]; then
        echo "Missing ${f} -- nothing to package. Run the dissection pipeline first." >&2
        exit 1
    fi
done

echo "Packaging models/karras/churchoutdoor_lsun.pth and dissect/churchoutdoor/ into ${OUT}..."
tar -czf "${OUT}" \
    models/karras/churchoutdoor_lsun.pth \
    dissect/churchoutdoor

echo "Done: $(du -h "${OUT}" | cut -f1) -> ${OUT}"
echo "Copy this file to the new machine, then run: script/unpack_church_demo.sh ${OUT}"
