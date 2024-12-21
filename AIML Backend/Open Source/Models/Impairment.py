# Import Libraries
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os

# Define the device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Directory paths
data_dir = r"C:\\Users\\Harish\\Desktop\\Python\\Visuals"

# Define image transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Load dataset
train_data = datasets.ImageFolder(root=data_dir, transform=transform)
train_loader = DataLoader(train_data, batch_size=16, shuffle=True)

# Define the model (ResNet18 in this case)
model = models.resnet18(pretrained=True)
for param in model.parameters():
    param.requires_grad = False  # Freeze the pre-trained weights

# Modify the final layer to match our number of classes (4 classes)
model.fc = nn.Linear(model.fc.in_features, len(train_data.classes))

# Move model to device
model = model.to(device)

# Define loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=0.001)

# Train the model
num_epochs = 20
for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        # Zero the parameter gradients
        optimizer.zero_grad()

        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)

        # Backward pass and optimization
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {running_loss/len(train_loader):.4f}, Accuracy: {100 * correct/total:.2f}%")

# Save the trained model
torch.save(model.state_dict(), "impairment_detection_model.pth")
print("Model saved as 'impairment_detection_model.pth'.")

# Infrastructure suggestions
infrastructure_suggestions = {
    "Visual Impairment": "Suggested infrastructure: Braille display, screen reader, magnifier.",
    "Hearing Impairment": "Suggested infrastructure: Hearing aids, sign language interpreter, captioning.",
    "Physical Disability": "Suggested infrastructure: Wheelchair, handstick, ramp access.",
    "Normal Students": "Suggested infrastructure: Teaching board, presentation, Bench"
}

# Function to check infrastructure suggestion based on prediction
def get_infrastructure_suggestion(class_name):
    return infrastructure_suggestions.get(class_name, "No infrastructure suggestion available.")

# Function to predict the class and suggestion
def predict_class_and_suggestion(model, image_path):
    model.eval()
    image = transforms.ToTensor()(image_path).unsqueeze(0).to(device)
    output = model(image)
    _, predicted = torch.max(output, 1)
    predicted_class = train_data.classes[predicted.item()]
    suggestion = get_infrastructure_suggestion(predicted_class)
    return predicted_class, suggestion

# Example of how to use the model to predict and give suggestions
# For testing, you'd load an image and use it here
# Example: image_path = 'path_to_image.jpg'
# predicted_class, suggestion = predict_class_and_suggestion(model, image_path)
# print(f"Predicted Class: {predicted_class}")
# print(f"Infrastructure Suggestion: {suggestion}")
