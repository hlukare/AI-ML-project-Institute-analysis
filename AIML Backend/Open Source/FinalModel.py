import os
import re
import pdfplumber
from flask import Flask, request, jsonify
from groq import Groq
import tensorflow as tf
import tempfile
from werkzeug.utils import secure_filename
import torch
from torchvision import models, transforms
from PIL import Image
from collections import Counter



app = Flask(__name__)
os.environ["GROQ_API_KEY"] = "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"

# Initialize the Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

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
        "total_lectures_assigned": total_lectures_assigned,
    }

    return jsonify(results) 

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
        # Generate structured output dynamically using the Groq Llama model
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
        
        # Parse the response from the model
        analysis = {
            "Key Topics": chat_completion.choices[0].message.content.split("Key Topics:")[1].split("Difficulty Level:")[0].strip(),
            "Difficulty Level": chat_completion.choices[0].message.content.split("Difficulty Level:")[1].split("Recommended Prerequisites:")[0].strip(),
            "Recommended Prerequisites": chat_completion.choices[0].message.content.split("Recommended Prerequisites:")[1].strip(),
        }

        return analysis
    except Exception as e:
        return {"error": f"Error: {e}"}

@app.route('/trends', methods=['POST'])
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

        # Analyze the extracted text with Llama model
        analysis_result = analyze_text_with_llama(syllabus_text)
        
        # Clean up temporary directory
        os.remove(filepath)
        
        # Return the structured analysis result in JSON format
        return jsonify({
            "message": "Syllabus processed successfully",
            "analysis_result": analysis_result
        })
    
model_path = "impairment_detection_model.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet18()
model.fc = torch.nn.Linear(model.fc.in_features, 4)  # Adjust for 4 classes
model.load_state_dict(torch.load(model_path, map_location=device))
model = model.to(device)
model.eval()

# Class names
class_names = ["Visual Impairment", "Hearing Impairment", "Physical Disability", "Normal Students"]

# Define the image transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Infrastructure suggestions
infrastructure_suggestions = {
    "Visual Impairment": "screen magnifier.",
    "Hearing Impairment": "captioning tools.",
    "Physical Disability": "ramp access.",
    "Normal Students": "interactive learning tools (Smart board)."
}

# Directory to save uploaded images
save_dir = "test_images"
os.makedirs(save_dir, exist_ok=True)

@app.route('/special_needs', methods=['POST'])
def predict():
    if 'images' not in request.files:
        return jsonify({"error": "No images provided"}), 400
    
    files = request.files.getlist('images')  # Get all uploaded files
    if not files:
        return jsonify({"error": "No images found in the request"}), 400

    # Initialize counters
    class_counts = Counter()
    total_images = 0

    # Process each image
    for file in files:
        try:
            # Save the image
            file_path = os.path.join(save_dir, file.filename)
            file.save(file_path)

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

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Parameters for first model
IMG_SIZE = (224, 224)
CLASSES = ["classroom_images", "classroom_training", "extra_activities", "teacher_teaching"]

transform_classroom = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

classroom_model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)

for param in classroom_model.parameters():
    param.requires_grad = False

classroom_model.fc = torch.nn.Sequential(
    torch.nn.Linear(classroom_model.fc.in_features, 256),
    torch.nn.ReLU(),
    torch.nn.Dropout(0.5),
    torch.nn.Linear(256, len(CLASSES)),
    torch.nn.Softmax(dim=1)
)

classroom_model.load_state_dict(torch.load("classroom_activity_model.pth"))
classroom_model = classroom_model.to(device)
classroom_model.eval()

# Parameters for second model
model_path = "impairment_detection_model.pth"
impairment_model = models.resnet18()
impairment_model.fc = torch.nn.Linear(impairment_model.fc.in_features, 4)  # Adjust for 4 classes
impairment_model.load_state_dict(torch.load(model_path, map_location=device))
impairment_model = impairment_model.to(device)
impairment_model.eval()

class_names = ["Visual Impairment", "Hearing Impairment", "Physical Disability", "Normal Students"]

transform_impairment = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

infrastructure_suggestions = {
    "Visual Impairment": "screen magnifier.",
    "Hearing Impairment": "captioning tools.",
    "Physical Disability": "ramp access.",
    "Normal Students": "interactive learning tools (Smart board)."
}

save_dir = "uploads"
os.makedirs(save_dir, exist_ok=True)


def predict_classroom(model, image):
    img = image.convert("RGB")
    img = img.resize(IMG_SIZE)
    img = transform_classroom(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img)
        probabilities = torch.softmax(output, dim=1).squeeze(0).cpu().numpy()

    return probabilities


def predict_impairment(model, image):
    img = image.convert("RGB")
    img = transform_impairment(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img)
        _, predicted = torch.max(output, 1)

    return predicted.item()


@app.route('/score', methods=['POST'])
def analyze():
    if 'images' not in request.files:
        return jsonify({"error": "No images provided"}), 400

    files = request.files.getlist('images')
    if not files:
        return jsonify({"error": "No images found in the request"}), 400

    classroom_scores = [0] * len(CLASSES)
    impairment_counts = Counter({class_name: 0 for class_name in class_names})
    total_images = 0
    filepaths = []

    for file in files:
        try:
            # Save the image
            filename = secure_filename(file.filename)
            filepath = os.path.join(save_dir, filename)
            file.save(filepath)
            filepaths.append(filepath)

            # Open image
            image = Image.open(filepath)

            # Predictions for classroom model
            classroom_probabilities = predict_classroom(classroom_model, image)
            classroom_scores = [classroom_scores[i] + classroom_probabilities[i] for i in range(len(CLASSES))]

            # Predictions for impairment model
            predicted_class_idx = predict_impairment(impairment_model, image)
            predicted_class = class_names[predicted_class_idx]
            impairment_counts[predicted_class] += 1

            total_images += 1
        except Exception as e:
            return jsonify({"error": f"Error processing file {file.filename}: {str(e)}"}), 500

    # Compute classroom results
    if total_images > 0:
        average_classroom_scores = [classroom_scores[i] / total_images for i in range(len(CLASSES))]
        best_classroom_index = average_classroom_scores.index(max(average_classroom_scores))
        best_classroom_activity = CLASSES[best_classroom_index]
    else:
        best_classroom_activity = "No valid images processed"

    # Compute impairment results
    class_percentages = {class_name: (count / total_images) * 100 for class_name, count in impairment_counts.items()}

    # Prepare final response
    response = {
        "best_classroom_activity": best_classroom_activity,
        "impairment_analysis": class_percentages,
        "infrastructure_suggestions": infrastructure_suggestions
    }

    # Cleanup
    # for filepath in filepaths:
    #     if os.path.exists(filepath):
    #         os.remove(filepath)

    return jsonify(response)

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
        "average_score": average_score,
        # "comparison_with_other_institutes": comparison_result
    }

    return jsonify(response)

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(host='0.0.0.0', port=5000)

