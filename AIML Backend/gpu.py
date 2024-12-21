import torch
print(torch.cuda.is_available())  # Should return True
print(torch.version.cuda)         # Check CUDA version
print(torch.cuda.get_device_name(0))  # Prints your GPU's name

