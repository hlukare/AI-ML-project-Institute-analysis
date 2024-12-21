import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from torchvision.models import ResNet50_Weights
from PIL import Image
import numpy as np

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Parameters
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 20
LEARNING_RATE = 0.0001
TRAIN_DIR = r"C:\Users\Harish\Desktop\Python\train" 
VAL_DIR = r"C:\Users\Harish\Desktop\Python\valid" 
TEST_DIR = r"C:\Users\Harish\Desktop\Python\test" 
CLASSES = ["classroom_images", "classroom_training", "extra_activities", "teacher_teaching"]

# Data Augmentation and Normalization
transform = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Load Datasets
train_dataset = datasets.ImageFolder(root=TRAIN_DIR, transform=transform)
val_dataset = datasets.ImageFolder(root=VAL_DIR, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

model = models.resnet50(weights=ResNet50_Weights.DEFAULT)

# Freeze all layers in the pretrained model
for param in model.parameters():
    param.requires_grad = False

# Modify the final layer to match the number of classes
model.fc = nn.Sequential(
    nn.Linear(model.fc.in_features, 256),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(256, len(CLASSES)),
    nn.Softmax(dim=1)
)

model = model.to(device)

# Define Loss Function and Optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=LEARNING_RATE)

# Train the Model
for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for inputs, labels in train_loader:
        inputs, labels = inputs.to(device), labels.to(device)

        optimizer.zero_grad()

        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {running_loss/len(train_loader):.4f}, Accuracy: {100 * correct / total:.2f}%")

    # Validation Step
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(device), labels.to(device)

            outputs = model(inputs)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    print(f"Validation Accuracy: {100 * correct / total:.2f}%")

# Save the Model
torch.save(model.load_state_dict(torch.load("classroom_activity_model.pth", weights_only=True)))
print("Model saved as 'classroom_activity_model.pth'.")

# Test Function
def predict_image(model, image_path, classes, img_size=(224, 224)):
    img = Image.open(image_path).convert("RGB")
    img = img.resize(img_size)
    img = transform(img).unsqueeze(0).to(device)

    model.eval()
    with torch.no_grad():
        output = model(img)
        _, predicted_class = torch.max(output, 1)
        confidence = torch.softmax(output, dim=1)[0][predicted_class].item()

    if confidence < 0.5:
        return "No matching class found"
    return f"{classes[predicted_class]} ({confidence * 100:.2f}%)"

# Predict Function for Directory
def predict_images_in_directory(model, test_dir, classes, img_size=(224, 224)):
    for image_name in os.listdir(test_dir):
        image_path = os.path.join(test_dir, image_name)
        result = predict_image(model, image_path, classes, img_size)
        print(f"Image: {image_name} -> Prediction: {result}")

model.load_state_dict(torch.load("classroom_activity_model.pth"))
print("Model loaded successfully.")
predict_images_in_directory(model, TEST_DIR, CLASSES)
