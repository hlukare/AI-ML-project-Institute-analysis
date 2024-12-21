from flask import Flask, request, jsonify
import os
import torch
from torchvision import transforms
from PIL import Image
import torch.nn as nn
import torchvision.models as models

app = Flask(__name__)

CLASSES = ["classroom_images", "classroom_training", "teacher_teaching", "extra_activities"]

MODEL_PATH = "classroom_activity_model.pth"

# Load ResNet18 pretrained weights without the custom layers
base_resnet = models.resnet18(weights="IMAGENET1K_V1")

# Initialize your custom model and transfer weights
class ClassroomActivityModel(torch.nn.Module):
    def __init__(self):
        super(ClassroomActivityModel, self).__init__()
        self.resnet = models.resnet18(weights="IMAGENET1K_V1")  # Updated method to load pretrained weights

    def forward(self, x):
        return self.resnet(x)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = ClassroomActivityModel()
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model = model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def predict_image(image_path):
    try:
        image = Image.open(image_path).convert("RGB")
        image_tensor = transform(image).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]
            class_index = probabilities.argmax().item()
        return CLASSES[class_index]
    except Exception as e:
        return None

@app.route('/upload-folder', methods=['POST'])
def upload_folder():
    data = request.get_json()
    if not data or 'folder_path' not in data:
        return jsonify({"error": "No folder path provided in the request"}), 400

    folder_path = data['folder_path']
    if not os.path.isdir(folder_path):
        return jsonify({"error": f"Provided path '{folder_path}' is not a valid directory"}), 400

    valid_extensions = ('.jpg', '.jpeg', '.png')
    image_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith(valid_extensions)]

    if not image_files:
        return jsonify({"error": "No valid image files found in the folder"}), 400

    class_counts = {class_name: 0 for class_name in CLASSES}
    total_images = 0
    for image_file in image_files:
        class_name = predict_image(image_file)
        if class_name:
            class_counts[class_name] += 1
            total_images += 1

    if total_images == 0:
        return jsonify({"error": "No images were classified"}), 400

    output = []
    for class_name, count in class_counts.items():
        percentage = (count / total_images) * 100
        output.append(f"{class_name}: {percentage:.2f}%")

    return jsonify({"result": output})

if __name__ == '__main__':
    app.run(debug=True)
