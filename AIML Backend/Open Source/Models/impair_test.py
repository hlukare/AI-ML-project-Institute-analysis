# Import Libraries
import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os

# Define the device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Directory paths
model_path = "impairment_detection_model.pth"
test_data_dir = r"C:\\Users\\Harish\\Desktop\\Python\\impair_test"

# Define image transformations for testing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Load the dataset
test_data = datasets.ImageFolder(root=test_data_dir, transform=transform)
test_loader = DataLoader(test_data, batch_size=16, shuffle=False)

# Load the model
model = models.resnet18()
model.fc = nn.Linear(model.fc.in_features, len(test_data.classes))
model.load_state_dict(torch.load(model_path))
model = model.to(device)
model.eval()

# Infrastructure suggestions
infrastructure_suggestions = {
    "Visual Impairment": "screen reader.",
    "Hearing Impairment": "captioning.",
    "Physical Disability": "ramp access.",
    "Normal Students": "No proper communication between teacher and students."
}

# Analyze the test images
class_counts = {class_name: 0 for class_name in test_data.classes}
total_images = 0

with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        outputs = model(images)
        _, predicted = torch.max(outputs, 1)

        # Count predictions
        for pred in predicted:
            class_name = test_data.classes[pred.item()]
            class_counts[class_name] += 1
        total_images += labels.size(0)

# Calculate percentages
class_percentages = {
    class_name: (count / total_images) * 100 for class_name, count in class_counts.items()
}

# Print results
print("Class-wise Prediction Percentages:")
for class_name, percentage in class_percentages.items():
    print(f"{class_name}: {percentage:.2f}%")

print("\nInfrastructure Suggestions:")
for class_name, suggestion in infrastructure_suggestions.items():
    print(f"{class_name}: {suggestion}")