import os
from flask import Flask, request, jsonify
from groq import Groq

# Flask app setup
app = Flask(__name__)

# Set up Groq API key
client = Groq(api_key="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")

# Scoring function based on the given criteria
def calculate_scores(hackathons, sports, olympiads, seminars, recreational_sessions, cultural_activity):
    # Hackathons score
    if hackathons > 5:
        hackathons_score = 20
    elif hackathons == 4:
        hackathons_score = 16
    elif hackathons == 3:
        hackathons_score = 12
    elif hackathons == 2:
        hackathons_score = 8
    elif hackathons == 1:
        hackathons_score = 4
    else:
        hackathons_score = 0

    # Sports score
    if sports > 5:
        sports_score = 20
    elif sports == 4:
        sports_score = 16
    elif sports == 3:
        sports_score = 12
    elif sports == 2:
        sports_score = 8
    elif sports == 1:
        sports_score = 4
    else:
        sports_score = 0

    # Olympiads score
    if olympiads > 5:
        olympiads_score = 20
    elif olympiads == 4:
        olympiads_score = 16
    elif olympiads == 3:
        olympiads_score = 12
    elif olympiads == 2:
        olympiads_score = 8
    elif olympiads == 1:
        olympiads_score = 4
    else:
        olympiads_score = 0

    # Seminars score
    if seminars > 3:
        seminars_score = 20
    elif seminars == 2:
        seminars_score = 15
    elif seminars == 1:
        seminars_score = 10
    else:
        seminars_score = 0

    # Recreational sessions score
    recreational_sessions_score = 10 if recreational_sessions else 0

    # Cultural activity score
    cultural_activity_score = 20 if cultural_activity else 0

    # Calculate average score
    total_score = (hackathons_score + sports_score + olympiads_score + seminars_score + recreational_sessions_score + cultural_activity_score)
    average_score = total_score / 100 * 100  # out of 100
    return average_score

# Function to analyze and compare with other institutions using Groq API
def compare_with_other_institutes(data, tier):
    prompt = f"Compare the following data of a {tier}-tier institute with other similar institutions.\n{data}"
    
    # Use Groq API to generate content for comparison
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-8b-8192"
    )
    return response.choices[0].message.content

@app.route('/extra_curricular', methods=['POST'])
def evaluate_institute():
    # Get input data from the frontend (e.g., API request)
    data = request.get_json()

    hackathons = data.get('hackathons', 0)
    sports = data.get('sports', 0)
    olympiads = data.get('olympiads', 0)
    seminars = data.get('seminars', 0)
    recreational_sessions = data.get('recreational_sessions', False)
    cultural_activity = data.get('cultural_activity', False)
    institute_tier = data.get('institute_tier', '3')  # Default to 3-tier if not provided

    average_score = calculate_scores(hackathons, sports, olympiads, seminars, recreational_sessions, cultural_activity)

    # Prepare the data for Groq API comparison
    institute_data = {
        "hackathons": hackathons,
        "sports": sports,
        "olympiads": olympiads,
        "seminars": seminars,
        "recreational_sessions": recreational_sessions,
        "cultural_activity": cultural_activity
    }

    comparison_result = compare_with_other_institutes(institute_data, institute_tier)

    # Prepare the response
    response = {
        "extra_curricular_avg": average_score,
        # "comparison_with_other_institutes": comparison_result
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
