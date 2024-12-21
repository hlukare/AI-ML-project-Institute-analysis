import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import os

# Define the same model structure used for training
class SimpleNN(nn.Module):
    def __init__(self):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(28*28, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 10)

    def forward(self, x):
        x = x.view(-1, 28*28)
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        x = self.fc3(x)
        return x

# Load the trained model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = SimpleNN().to(device)
model.load_state_dict(torch.load("mnist_model.pth"))
model.eval()  # Set the model to evaluation mode

# Define a custom dataset class for your image dataset
class CustomImageDataset(Dataset):
    def __init__(self, image_dir, transform=None):
        self.image_dir = image_dir
        self.image_paths = [os.path.join(image_dir, fname) for fname in os.listdir(image_dir)]
        self.transform = transform
    
    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        image = Image.open(image_path).convert("L")  # Convert to grayscale (MNIST is grayscale)
        
        if self.transform:
            image = self.transform(image)
        
        return image

# Define the image transformation
transform = transforms.Compose([
    transforms.Resize((28, 28)),  # Resize to 28x28
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# Load your custom dataset
image_dir = "C:\\Users\\Harish\\Desktop\\Pytorch\\test_images"  # Use double backslashes

custom_dataset = CustomImageDataset(image_dir=image_dir, transform=transform)
custom_loader = DataLoader(custom_dataset, batch_size=1, shuffle=False)

# Predict on the custom dataset
with torch.no_grad():  # No need to compute gradients for inference
    for image in custom_loader:
        image = image.to(device)  # Move image to GPU if available
        
        # Get model predictions
        output = model(image)
        _, predicted = torch.max(output, 1)  # Get the class with the highest probability
        
        # Print the prediction (class)
        print(f"Predicted class: {predicted.item()}")
