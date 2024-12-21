from flask import Flask, request, jsonify
import torch
from torchvision import transforms, models
from PIL import Image
import os
from collections import Counter

app = Flask(__name__)

# Define the directory to save uploaded images
save_dir = "test_images"
os.makedirs(save_dir, exist_ok=True)

# Define global variables
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_path = "impairment_detection_model.pth"
class_names = ["Visual Impairment", "Hearing Impairment", "Physical Disability", "Normal Students"]

# Infrastructure suggestions
infrastructure_suggestions = {
    "Visual Impairment": "screen magnifier.",
    "Hearing Impairment": "captioning tools.",
    "Physical Disability": "ramp access.",
    "Normal Students": "interactive learning tools (Smart board)."
}

# Load model
model = models.resnet18()
model.fc = torch.nn.Linear(model.fc.in_features, len(class_names))
model.load_state_dict(torch.load(model_path, map_location=device))
model = model.to(device)
model.eval()

# Define image transformations globally
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.route('/score', methods=['POST'])
def analyze():
    if 'images' not in request.files:
        return jsonify({"error": "No images provided"}), 400

    files = request.files.getlist('images')  # Get all uploaded files
    if not files:
        return jsonify({"error": "No images found in the request"}), 400

    # Initialize counters
    class_counts = Counter()
    total_images = 0
    filepaths = []  # To track file paths

    # Process each image
    for file in files:
        try:
            # Save the image
            file_path = os.path.join(save_dir, file.filename)
            file.save(file_path)
            filepaths.append(file_path)

            # Open and preprocess the image
            image = Image.open(file_path).convert('RGB')
            image = transform(image).unsqueeze(0).to(device)

            # Make prediction
            with torch.no_grad():
                outputs = model(image)
                _, predicted = torch.max(outputs, 1)
                predicted_class = class_names[predicted.item()]

            # Update counters
            class_counts[predicted_class] += 1
            total_images += 1
        except Exception as e:
            return jsonify({"error": f"Error processing file {file.filename}: {str(e)}"}), 500

    # Calculate percentages
    class_percentages = {
        class_name: (count / total_images) * 100 for class_name, count in class_counts.items()
    }

    # Generate infrastructure suggestions
    suggestion_summary = {
        class_name: infrastructure_suggestions[class_name]
        for class_name in class_names
    }

    # Prepare response
    response = {
        "class_percentages": class_percentages,
        "infrastructure_suggestions": suggestion_summary
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
