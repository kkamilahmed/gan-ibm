# GANDissect

## First time

```bash
git clone https://github.com/kkamilahmed/gan-ibm.git
cd gan-ibm
./setup.sh
```

This installs `uv` if needed, downloads the precomputed `churchoutdoor` GAN
and its dissection data, and starts the GANPaint server at
[http://localhost:5001/client/ganpaint.html](http://localhost:5001/client/ganpaint.html).
Stays attached in your terminal -- press Ctrl+C to stop it.

## Every other time

```bash
./start.sh   # start the server (Ctrl+C to stop)
./stop.sh    # or stop it from another terminal
```
