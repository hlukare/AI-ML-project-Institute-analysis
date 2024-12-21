import os
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

os.environ["API_KEY"] = "AIzaSyChKD-Wrucx_pqnTcymkXZLrQ4lXjOGEIY"  # Replace with your API key
# No need to configure or use Gemini API anymore

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Curriculum Processing API!"

@app.route('/favicon.ico')
def favicon():
    return '', 204

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
    total_lectures_assigned = data.get('total_lectures_assigned')  # Manual input for total lectures assigned

    if total_lectures_assigned is None:
        return jsonify({"error": "Total lectures assigned must be provided."}), 400

    # Calculate scores
    faculty_score, attendance_score, marks_score, student_score = calculate_scores(total_lectures_taken, avg_attendance, avg_marks, total_lectures_assigned)

    results = {
        "faculty_score": faculty_score,
        "attendance_score": attendance_score,
        "marks_score": marks_score,
        "student_score": student_score,
        # "total_lectures_assigned": total_lectures_assigned,
    }

    return jsonify(results)   

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    
    app.run(host='0.0.0.0', port=5000)
