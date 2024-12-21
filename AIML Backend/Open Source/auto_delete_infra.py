import os
import torch
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from torchvision import models, transforms
from PIL import Image
from collections import Counter

app = Flask(__name__)

# Define device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Parameters for first model
IMG_SIZE = (224, 224)
CLASSES = ["classroom_images", "classroom_training", "extra_activities", "teacher_teaching"]

transform_classroom = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

classroom_model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)

for param in classroom_model.parameters():
    param.requires_grad = False

classroom_model.fc = torch.nn.Sequential(
    torch.nn.Linear(classroom_model.fc.in_features, 256),
    torch.nn.ReLU(),
    torch.nn.Dropout(0.5),
    torch.nn.Linear(256, len(CLASSES)),
    torch.nn.Softmax(dim=1)
)

classroom_model.load_state_dict(torch.load("classroom_activity_model.pth"))
classroom_model = classroom_model.to(device)
classroom_model.eval()

# Parameters for second model
model_path = "impairment_detection_model.pth"
impairment_model = models.resnet18()
impairment_model.fc = torch.nn.Linear(impairment_model.fc.in_features, 4)  # Adjust for 4 classes
impairment_model.load_state_dict(torch.load(model_path, map_location=device))
impairment_model = impairment_model.to(device)
impairment_model.eval()

class_names = ["Visual Impairment", "Hearing Impairment", "Physical Disability", "Normal Students"]

transform_impairment = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

infrastructure_suggestions = {
    "Visual Impairment": "screen magnifier.",
    "Hearing Impairment": "captioning tools.",
    "Physical Disability": "ramp access.",
    "Normal Students": "interactive learning tools (Smart board)."
}

save_dir = "uploads"
os.makedirs(save_dir, exist_ok=True)


def predict_classroom(model, image):
    img = image.convert("RGB")
    img = img.resize(IMG_SIZE)
    img = transform_classroom(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img)
        probabilities = torch.softmax(output, dim=1).squeeze(0).cpu().numpy()

    return probabilities


def predict_impairment(model, image):
    img = image.convert("RGB")
    img = transform_impairment(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img)
        _, predicted = torch.max(output, 1)

    return predicted.item()


@app.route('/score', methods=['POST'])
def analyze():
    if 'images' not in request.files:
        return jsonify({"error": "No images provided"}), 400

    files = request.files.getlist('images')
    if not files:
        return jsonify({"error": "No images found in the request"}), 400

    classroom_scores = [0] * len(CLASSES)
    impairment_counts = Counter({class_name: 0 for class_name in class_names})
    total_images = 0
    filepaths = []

    for file in files:
        try:
            # Save the image
            filename = secure_filename(file.filename)
            filepath = os.path.join(save_dir, filename)
            file.save(filepath)
            filepaths.append(filepath)

            # Open image
            image = Image.open(filepath)

            # Predictions for classroom model
            classroom_probabilities = predict_classroom(classroom_model, image)
            classroom_scores = [classroom_scores[i] + classroom_probabilities[i] for i in range(len(CLASSES))]

            # Predictions for impairment model
            predicted_class_idx = predict_impairment(impairment_model, image)
            predicted_class = class_names[predicted_class_idx]
            impairment_counts[predicted_class] += 1

            total_images += 1
        except Exception as e:
            return jsonify({"error": f"Error processing file {file.filename}: {str(e)}"}), 500

    # Compute classroom results
    if total_images > 0:
        average_classroom_scores = [classroom_scores[i] / total_images for i in range(len(CLASSES))]
        best_classroom_index = average_classroom_scores.index(max(average_classroom_scores))
        best_classroom_activity = CLASSES[best_classroom_index]
    else:
        best_classroom_activity = "No valid images processed"

    # Compute impairment results
    class_percentages = {class_name: (count / total_images) * 100 for class_name, count in impairment_counts.items()}

    # Prepare final response
    response = {
        "best_classroom_activity": best_classroom_activity,
        "impairment_analysis": class_percentages,
        "infrastructure_suggestions": infrastructure_suggestions
    }

    # Cleanup
    # for filepath in filepaths:
    #     if os.path.exists(filepath):
    #         os.remove(filepath)

    return jsonify(response)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

