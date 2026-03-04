import torch

def get_device():
    if torch.backends.mps.is_available():
        return torch.device("mps")
    elif torch.cuda.is_available():
        return torch.device("cuda")
    else:
        return torch.device("cpu")

def is_cuda_enabled():
    return torch.cuda.is_available()

def is_mps_enabled():
    return torch.backends.mps.is_available()

def move_to_device(obj):
    if hasattr(obj, 'to'):
        return obj.to(get_device())
    return obj
