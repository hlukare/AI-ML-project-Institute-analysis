import os
from flask import Flask, request, jsonify
from groq import Groq

# Initialize Groq client
client = Groq(api_key="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")

# Initialize Flask app
app = Flask(__name__)

@app.route('/overall', methods=['POST'])
def calculate_institute_score():
    data = request.get_json()

    # Extracting the required data from input JSON
    impairment_analysis = data.get("impairment_analysis", {})
    infrastructure_suggestions = data.get("infrastructure_suggestions", {})
    analysis_result = data.get("analysis_result", {})
    attendance_score = data.get("attendance_score", 0)
    faculty_score = data.get("faculty_score", 0)
    marks_score = data.get("marks_score", 0)
    student_score = data.get("student_score", 0)
    extra_curricular_score = data.get("average_score of extra curricular activities", 0)
    alignment_score = data.get("alignment_score", 0)
    average_points = data.get("average_points", 0)

    # Real-time analysis using Groq
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": f"Analyze the following syllabus: \n\nDifficulty Level: {analysis_result.get('Difficulty Level')}\nKey Topics: {', '.join(analysis_result.get('Key Topics', []))}\nRecommended Prerequisites: {', '.join(analysis_result.get('Recommended Prerequisites', []))}"
                }
            ],
            model="llama3-8b-8192"
        )
        real_time_analysis = chat_completion.choices[0].message.content
    except Exception as e:
        real_time_analysis = f"Error in real-time analysis: {e}"

    # Calculate suitability percentages
    suitability_percentages = {
        category: max(0, 100 - value) for category, value in impairment_analysis.items()
    }

    # Calculate overall score
    scores = [attendance_score, faculty_score, marks_score, student_score, extra_curricular_score, alignment_score, average_points]
    overall_score = sum(scores) / len(scores)

    # Prepare result
    result = {
        "institute_overall_score": round(overall_score, 2),
        "suitability_percentages": suitability_percentages,
        "real_time_analysis": real_time_analysis,
        "infrastructure_suggestions": infrastructure_suggestions
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
