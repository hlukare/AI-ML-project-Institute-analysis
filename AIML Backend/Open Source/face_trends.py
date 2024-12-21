import os
import pdfplumber
from flask import Flask, request, jsonify
import tempfile
from werkzeug.utils import secure_filename
from huggingface_hub.inference_api import InferenceApi

# Set up Hugging Face Inference API
HF_API_TOKEN = "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"  # Replace with your Hugging Face API token
model_name = "Qwen/Qwen2.5-72B-Instruct"
hf_client = InferenceApi(repo_id=model_name, token=HF_API_TOKEN)

# Initialize Flask app
app = Flask(__name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    syllabus_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                syllabus_text += page.extract_text()
        return syllabus_text
    except Exception as e:
        return f"Error extracting text from PDF: {e}"

def analyze_text_with_hf(user_input):
    try:
        prompt = (
            "Analyze the following syllabus and provide the following details:\n"
            "1. Key Topics: List the main topics covered in the syllabus (2-3 lines).\n"
            "2. Difficulty Level: Provide an overview of the difficulty level with 2-3 sentences.\n"
            "3. Recommended Prerequisites: Suggest the necessary prerequisites (2-3 sentences)."
            f"\n\nSyllabus Content:\n{user_input}"
        )

        response = hf_client(inputs=prompt)


        if "error" in response:
            return {"error": response["error"]}

        # Assuming the model outputs structured content in plain text
        analysis = {
            "Key Topics": response.split("Key Topics:")[1].split("Difficulty Level:")[0].strip(),
            "Difficulty Level": response.split("Difficulty Level:")[1].split("Recommended Prerequisites:")[0].strip(),
            "Recommended Prerequisites": response.split("Recommended Prerequisites:")[1].strip(),
        }

        return analysis
    except Exception as e:
        return {"error": f"Error: {e}"}

@app.route('/trends1', methods=['POST'])
def upload_syllabus():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        # Save the file temporarily
        temp_dir = tempfile.mkdtemp()
        filepath = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(filepath)

        # Extract text from the syllabus PDF
        syllabus_text = extract_text_from_pdf(filepath)
        if syllabus_text.startswith("Error"):
            return jsonify({"error": syllabus_text}), 400

        # Analyze the extracted text with Hugging Face Inference API
        analysis_result = analyze_text_with_hf(syllabus_text)

        # Clean up temporary directory
        os.remove(filepath)

        # Return the structured analysis result in JSON format
        return jsonify({
            "message": "Syllabus processed successfully",
            "analysis_result": analysis_result
        })

if __name__ == '__main__':
    # Expose Flask app
    app.run(debug=True, use_reloader=False)
