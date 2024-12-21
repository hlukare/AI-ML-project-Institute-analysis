import os
import pdfplumber
import re
from flask import Flask, request, jsonify
from groq import Groq

# Set up the Flask app
app = Flask(__name__)

# Set up Groq API Key
os.environ["GROQ_API_KEY"] = "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"
client = Groq(api_key=os.environ["GROQ_API_KEY"])

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Curriculum Processing API!"

@app.route('/favicon.ico')
def favicon():
    return '', 204

def extract_text_from_pdf(pdf_path):
    syllabus_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                syllabus_text += page.extract_text()
        return syllabus_text
    except Exception as e:
        return f"Error extracting text from PDF: {e}"

def analyze_curriculum(course_curriculum):
    """
    Use Groq API to extract key details from the course curriculum.
    """
    prompt = (
        f"Analyze the following course syllabus and provide the following details:\n"
        f"1. Key Topics: List the main topics covered in the syllabus (2-3 lines).\n"
        f"2. Difficulty Level: Provide an overview of the difficulty level with 2-3 sentences.\n"
        f"3. Recommended Prerequisites: Suggest the necessary prerequisites (2-3 sentences).\n\n"
        f"Syllabus Content:\n{course_curriculum}"
    )

    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-8b-8192",  # You can choose a different model here if needed
    )
    
    return response.choices[0].message.content

def extract_total_lectures(curriculum_analysis):
    """
    Extract and sum the lecture hours from the Groq API response.
    Handles variations like "hours" and "hrs."
    """
    normalized_text = curriculum_analysis.replace("hrs", "hours").replace("Hrs", "hours")
    
    lecture_hours = re.findall(r"(\d+)\s*hours", normalized_text, re.IGNORECASE)
    return sum(map(int, lecture_hours))

def calculate_scores(total_lectures_taken, avg_attendance, avg_marks, curriculum_lectures):
    """
    Calculate the scores for students' performance and faculty's consistency.
    """
    # Faculty Consistency Score
    faculty_score = min((total_lectures_taken / curriculum_lectures) * 20, 20)
    
    # Student Attendance Score based on attendance percentage
    attendance_percentage = (avg_attendance / total_lectures_taken) * 100
    if attendance_percentage >= 75:
        attendance_score = 20
    elif attendance_percentage >= 65:
        attendance_score = 18
    elif attendance_percentage >= 55:
        attendance_score = 16
    elif attendance_percentage >= 45:
        attendance_score = 14
    else:
        attendance_score = 10

    # Student Marks Score based on average marks
    if avg_marks >= 80:
        marks_score = 20
    elif avg_marks >= 70:
        marks_score = 18
    elif avg_marks >= 60:
        marks_score = 16
    elif avg_marks >= 50:
        marks_score = 14
    else:
        marks_score = 10
    student_score = (attendance_score + marks_score) / 2
    student_score = min(student_score, 20) 
    
    return round(faculty_score, 2), round(attendance_score, 2), round(marks_score, 2), round(student_score, 2)


# For students
@app.route('/process_scores', methods=['POST'])
def process_scores():
    """
    Process the scores based on the POST request data from the frontend.
    """
    data = request.get_json()

    total_lectures_taken = data.get('total_lectures_taken')
    avg_attendance = data.get('avg_attendance')
    avg_marks = data.get('avg_marks')
    course_curriculum = data.get('course_curriculum')

    syllabus_text = extract_text_from_pdf(course_curriculum)

    if syllabus_text.startswith("Error"):
        return jsonify({"error": syllabus_text}), 400

    curriculum_analysis = analyze_curriculum(syllabus_text)
    
    curriculum_lectures = extract_total_lectures(curriculum_analysis)

    if curriculum_lectures == 0:
        return jsonify({"error": "Could not determine total lectures assigned. Please verify the curriculum input."}), 400
    
    # Calculate scores
    faculty_score, attendance_score, marks_score, student_score = calculate_scores(total_lectures_taken, avg_attendance, avg_marks, curriculum_lectures)

    results = {
        "faculty_score": faculty_score,
        "attendance_score": attendance_score,
        "marks_score": marks_score,
        "student_score": student_score,
        "total_lectures_assigned": curriculum_lectures,
        "curriculum_analysis": curriculum_analysis
    }

    return jsonify(results)   

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    
    app.run(host='0.0.0.0', port=5000)
