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

## Every other time

```bash
./start.sh   # start the server
./stop.sh    # stop it
```
