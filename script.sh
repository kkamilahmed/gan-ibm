python3 -m netdissect \
    --gan \
    --model "netdissect.proggan.from_pth_file('models/karras/churchoutdoor_lsun.pth')" \
    --layers layer4 layer5 \
    --outdir dissect/churchoutdoor_7_8 \
    --size 100 \
    --batch_size 10
