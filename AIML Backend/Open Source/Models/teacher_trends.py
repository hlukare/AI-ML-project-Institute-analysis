import os
import pdfplumber
from flask import Flask, request, jsonify
from groq import Groq
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

# Set up your API key for Groq (ensure the API key is set in the environment)
os.environ["GROQ_API_KEY"] = "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"

# Initialize the Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

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

def analyze_text_with_llama(user_input):
    try:
        chat_completion = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": f"Analyze the following syllabus and provide the following details:\n"
                           "1. Key Topics: List the main topics covered in the syllabus (2-3 lines).\n"
                           "2. Difficulty Level: Provide an overview of the difficulty level with 2-3 sentences.\n"
                           "3. Recommended Prerequisites: Suggest the necessary prerequisites (2-3 sentences)."
                           f"\n\nSyllabus Content:\n{user_input}"
            }],
            model="llama3-8b-8192"
        )
        analysis = {
            "Key Topics": chat_completion.choices[0].message.content.split("Key Topics:")[1].split("Difficulty Level:")[0].strip(),
            "Difficulty Level": chat_completion.choices[0].message.content.split("Difficulty Level:")[1].split("Recommended Prerequisites:")[0].strip(),
            "Recommended Prerequisites": chat_completion.choices[0].message.content.split("Recommended Prerequisites:")[1].strip(),
        }
        return analysis
    except Exception as e:
        return {"error": f"Error: {e}"}

def analyze_curriculum(curriculum_text):
    return "Analyzing the curriculum to align with teacher's qualifications."

def get_alignment_percentage(gemini_response):
    if "aligned" in gemini_response.lower():
        return 80
    else:
        return 40

@app.route('/teacher', methods=['POST'])
def process_request():
    data = request.get_json()

    response = {}

    # Check if file-based syllabus processing or teacher data is provided
    course_curriculum = data.get('course_curriculum')
    if course_curriculum:
        # PDF syllabus analysis
        if allowed_file(course_curriculum):
            syllabus_text = extract_text_from_pdf(course_curriculum)
            if syllabus_text.startswith("Error"):
                return jsonify({"error": syllabus_text}), 400
            analysis_result = analyze_text_with_llama(syllabus_text)
            response["analysis_result"] = {
                "message": "Syllabus processed successfully",
                "analysis_result": analysis_result
            }

    # Teacher points calculation
    avg_experience = data.get('avg_experience')
    live_in_out_ratio = data.get('live_in_out_ratio')
    educational_qualifications = data.get('educational_qualifications')
    total_teachers = data.get('total_teachers')

    if all([avg_experience, live_in_out_ratio, educational_qualifications, total_teachers]):
        # Calculate experience points
        if avg_experience > 5:
            experience_points = 20
        elif avg_experience > 4:
            experience_points = 17
        elif avg_experience > 3:
            experience_points = 15
        elif avg_experience > 2:
            experience_points = 12
        elif avg_experience > 1:
            experience_points = 9
        else:
            experience_points = 0

        # Calculate live-in/out ratio points
        if live_in_out_ratio > 8:
            live_in_out_points = 20
        elif live_in_out_ratio > 6:
            live_in_out_points = 16
        elif live_in_out_ratio > 4:
            live_in_out_points = 14
        else:
            live_in_out_points = 0

        # Calculate qualification points
        phd_percentage = (educational_qualifications['phd'] / total_teachers) * 100
        post_graduate_percentage = (educational_qualifications['post_graduate'] / total_teachers) * 100
        graduate_percentage = (educational_qualifications['graduate'] / total_teachers) * 100

        # PhD points calculation
        if phd_percentage > 10:
            phd_points = 20
        elif phd_percentage > 7:
            phd_points = 15
        elif phd_percentage > 5:
            phd_points = 10
        else:
            phd_points = 0

        # Postgraduate points calculation
        if post_graduate_percentage > 70:
            post_graduate_points = 20
        elif post_graduate_percentage > 50:
            post_graduate_points = 16
        elif post_graduate_percentage > 40:
            post_graduate_points = 14
        elif post_graduate_percentage > 30:
            post_graduate_points = 12
        elif post_graduate_percentage > 20:
            post_graduate_points = 10
        else:
            post_graduate_points = 0

        # Graduate points calculation
        if graduate_percentage > 70:
            graduate_points = 20
        elif graduate_percentage > 50:
            graduate_points = 16
        elif graduate_percentage > 40:
            graduate_points = 14
        elif graduate_percentage > 30:
            graduate_points = 12
        elif graduate_percentage > 20:
            graduate_points = 10
        else:
            graduate_points = 0

        alignment_score = 0
        alignment_percentage = 0

        if course_curriculum:
            syllabus_text = extract_text_from_pdf(course_curriculum)
            curriculum_analysis = analyze_curriculum(syllabus_text)

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": f"Does the teacher's qualifications align with the following curriculum?\n{curriculum_analysis}",
                    }
                ],
                model="llama3-8b-8192",
            )

            gemini_response = chat_completion.choices[0].message.content
            alignment_percentage = get_alignment_percentage(gemini_response)

            if alignment_percentage >= 80:
                alignment_score = 10
            elif alignment_percentage >= 70:
                alignment_score = 9
            elif alignment_percentage >= 60:
                alignment_score = 8
            elif alignment_percentage >= 50:
                alignment_score = 7
            elif alignment_percentage >= 40:
                alignment_score = 5
            elif alignment_percentage >= 30:
                alignment_score = 3
            else:
                alignment_score = 0

        average_points = (experience_points + live_in_out_points + phd_points + post_graduate_points +
                          graduate_points + alignment_score) / 6

        response["teacher_analysis"] = {
            "average_points": round(average_points, 2),
            "alignment_score": alignment_score
        }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
