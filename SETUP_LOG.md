# Setup Log - GANDissect on macOS (MPS)

This document tracks the steps taken to set up GANDissect on macOS with MPS support and perform layer dissection.

## Steps Taken

1.  **Initialize Setup Log**: Created `SETUP_LOG.md`.
2.  **Create Virtual Environment**: Created a Python 3.9 venv and upgraded pip.
3.  **Install Dependencies**: Installed `torch`, `torchvision`, and other requirements. Used modern versions of `torch` for MPS support.
4.  **Centralize Device Management**: Created `netdissect/deviceutil.py` to handle MPS/CUDA/CPU device selection.
5.  **Update for MPS Support**: Systematically updated several files to use the new device utility instead of hardcoded `.cuda()` calls:
    - `netdissect/modelconfig.py`
    - `netdissect/segmenter.py`
    - `netdissect/dissection.py` (updated logic to use `get_device()`)
    - `netdissect/__main__.py` (updated device detection and logic)
    - `netdissect/serverstate.py` (updated `GanTester` to use device utility)
6.  **Download Pretrained Models**: Downloaded the `churchoutdoor` GAN model and the Unified Parsing Segmenter models.
7.  **Create Dissection Script**: Created `script/dissect_church_7_8.sh` to perform dissection on layers 7 and 8 of the `churchoutdoor` model.

## How to Fork the Repository

To transition this local clone to your own fork:

1.  Go to the original repository on GitHub: [https://github.com/CSAILVision/gandissect](https://github.com/CSAILVision/gandissect)
2.  Click the **Fork** button in the top-right corner.
3.  Once forked, copy the URL of your new fork (e.g., `https://github.com/YOUR_USERNAME/gandissect.git`).
4.  In your terminal, rename the current `origin` to `upstream`:
    ```bash
    git remote rename origin upstream
    ```
5.  Add your fork as the new `origin`:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/gandissect.git
    ```
6.  Verify your remotes:
    ```bash
    git remote -v
    ```
