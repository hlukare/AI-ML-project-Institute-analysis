import os
from flask import Flask, request, jsonify
from groq import Groq

app = Flask(__name__)

# Configure Groq API key
client = Groq(api_key="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")  # Replace with your actual API key

@app.route('/teacher', methods=['POST'])
def calculate_teacher_points():
    data = request.get_json()
    
    # Input variables
    avg_experience = data.get('avg_experience')
    live_in_out_ratio = data.get('live_in_out_ratio')
    educational_qualifications = data.get('educational_qualifications')
    total_teachers = data.get('total_teachers')
    course_curriculum = data.get('course_curriculum')
    
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

    # Analyze curriculum alignment using Groq AI
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
    
    # Calculate alignment score
    alignment_score = 0
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

    # Calculate average points
    average_points = (experience_points + live_in_out_points + phd_points + post_graduate_points +
                      graduate_points + alignment_score) / 6

    result = {
        "average_points": round(average_points, 2),
        "alignment_score": alignment_score,
        # "gemini_response": gemini_response.strip()  # Including Groq AI's response
    }
    
    return jsonify(result)

def extract_text_from_pdf(pdf_path):
    return "Curriculum extracted from the syllabus PDF."

def analyze_curriculum(curriculum_text):
    return "Analyzing the curriculum to align with teacher's qualifications."

def get_alignment_percentage(gemini_response):
    if "aligned" in gemini_response.lower():
        return 80
    else:
        return 40 

if __name__ == '__main__':
    app.run(debug=True)
