import os
import base64
import google.generativeai as genai
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image

# Setting up API key for Gemini API
os.environ["API_KEY"] = "AIzaSyChKD-Wrucx_pqnTcymkXZLrQ4lXjOGEIY"
genai.configure(api_key=os.environ["API_KEY"])

# Initialize Flask application
app = Flask(__name__)

# Define categories
CLASSES = ["classroom_images", "classroom_training", "extra_activities", "teacher_teaching"]

# Function to convert image to base64
def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

# Function to analyze image using Gemini API
def analyze_image_with_gemini(image_path):
    image_base64 = image_to_base64(image_path)
    
    # Construct the prompt
    prompt = f"""
    Analyze the following base64-encoded image and classify it into one of the following categories:
    - {', '.join(CLASSES)}
    Image (base64 encoded):
    {image_base64}
    """
    # Send prompt to Gemini API
    response = genai.GenerativeModel("gemini-1.5-flash").generate_content(prompt)
    return response.text.strip()  # Return the analysis result

@app.route('/predict_gemini', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    files = request.files.getlist('file')
    if not files:
        return jsonify({"error": "No files selected"}), 400

    # Create temporary folder for uploaded images
    folder_path = "uploads"
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    results = {}
    try:
        for file in files:
            if file.filename == '':
                continue
            filename = secure_filename(file.filename)
            filepath = os.path.join(folder_path, filename)
            file.save(filepath)

            # Analyze image using Gemini API
            analysis_result = analyze_image_with_gemini(filepath)
            results[filename] = analysis_result
        
        # Return analysis results
        return jsonify(results)
    finally:
        # Delete the folder and its contents after processing
        for file in os.listdir(folder_path):
            os.remove(os.path.join(folder_path, file))
        os.rmdir(folder_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
