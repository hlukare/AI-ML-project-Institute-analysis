import os
import pdfplumber
from flask import Flask, request, jsonify
import google.generativeai as genai
import tensorflow as tf
import tempfile
from werkzeug.utils import secure_filename

# Initialize TensorFlow GPU settings
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)

print("Using GPU for processing...")

# Set your Google API key
os.environ["API_KEY"] = "AIzaSyChKD-Wrucx_pqnTcymkXZLrQ4lXjOGEIY"
genai.configure(api_key=os.environ["API_KEY"])

# Initialize the model
model = genai.GenerativeModel("gemini-1.5-flash")

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

def analyze_text_with_gemini(user_input):
    try:
        # Generate structured output dynamically
        prompt = (
            "Analyze the following syllabus and provide the following details:\n"
            "1. Key Topics: List the main topics covered in the syllabus (2-3 lines).\n"
            "2. Difficulty Level: Provide an overview of the difficulty level with 2-3 sentences.\n"
            "3. Recommended Prerequisites: Suggest the necessary prerequisites (2-3 sentences)."
            f"\n\nSyllabus Content:\n{user_input}"
        )
        
        response = model.generate_content(prompt)

        # Placeholder logic to parse the Gemini API response
        # Assuming response.text contains the structured data in the required format
        analysis = {
            "Key Topics": response.text.split("Key Topics:")[1].split("Difficulty Level:")[0].strip(),
            "Difficulty Level": response.text.split("Difficulty Level:")[1].split("Recommended Prerequisites:")[0].strip(),
            "Recommended Prerequisites": response.text.split("Recommended Prerequisites:")[1].strip(),
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

        # Analyze the extracted text with Gemini model
        analysis_result = analyze_text_with_gemini(syllabus_text)
        
        # Clean up temporary directory
        os.remove(filepath)
        
        # Return the structured analysis result in JSON format
        return jsonify({
            "message": "Syllabus processed successfully",
            "analysis_result": analysis_result
        })

if __name__ == '__main__':
    # Expose Flask app using Ngrok (if running locally)
    app.run(debug=True, use_reloader=False)
