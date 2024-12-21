import os
import torch
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from torchvision import models, transforms
from PIL import Image

# Initialize Flask application
app = Flask(__name__)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Parameters
IMG_SIZE = (224, 224)
CLASSES = ["classroom_images", "classroom_training", "extra_activities", "teacher_teaching"]

transform = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)

for param in model.parameters():
    param.requires_grad = False

model.fc = torch.nn.Sequential(
    torch.nn.Linear(model.fc.in_features, 256),
    torch.nn.ReLU(),
    torch.nn.Dropout(0.5),
    torch.nn.Linear(256, len(CLASSES)),
    torch.nn.Softmax(dim=1)
)

model.load_state_dict(torch.load("classroom_activity_model.pth"))
model = model.to(device)
model.eval()

def predict_image(model, image, classes, img_size=(224, 224)):
    img = image.convert("RGB")
    img = img.resize(img_size)
    img = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img)
        probabilities = torch.softmax(output, dim=1).squeeze(0).cpu().numpy()

    return probabilities

@app.route('/predict_auto', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    files = request.files.getlist('file')
    if not files:
        return jsonify({"error": "No files selected"}), 400

    total_probabilities = [0] * len(CLASSES)
    num_images = 0

    for file in files:
        if file.filename == '':
            continue
        filename = secure_filename(file.filename)
        filepath = os.path.join('uploads', filename)
        file.save(filepath)

        image = Image.open(filepath)

        probabilities = predict_image(model, image, CLASSES)

        total_probabilities = [total_probabilities[i] + probabilities[i] for i in range(len(CLASSES))]
        num_images += 1

    if num_images > 0:
        average_probabilities = [total_probabilities[i] / num_images for i in range(len(CLASSES))]
        max_index = average_probabilities.index(max(average_probabilities))
        predicted_class = CLASSES[max_index]

    return jsonify({"predicted_class": predicted_class})


if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')

    app.run(host='0.0.0.0', port=5000)
