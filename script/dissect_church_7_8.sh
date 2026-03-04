#!/usr/bin/env bash

# Start from parent directory of script
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Activate venv
source venv/bin/activate

# Run netdissect on churchoutdoor model for layers 7 and 8
# Using a smaller size (100) and batch_size (10) for initial testing.
python3 -m netdissect \
    --gan \
    --model "netdissect.proggan.from_pth_file('models/karras/churchoutdoor_lsun.pth')" \
    --layers layer7 layer8 \
    --outdir dissect/churchoutdoor_7_8 \
    --size 100 \
    --batch_size 10
