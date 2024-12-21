from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import cv2
import os
import time
import threading
import requests
import json

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Secret key for session management

# Store the footage capture status
capturing = {}

# File to store log data
LOG_FILE = "capture_log.json"

# Helper Functions
def load_log():
    """Load log data from the JSON file."""
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as file:
            return json.load(file)
    return {}

def save_log(log_data):
    """Save log data to the JSON file."""
    with open(LOG_FILE, "w") as file:
        json.dump(log_data, file, indent=4)

def update_log(course_id, camera_id=None, latest_frame_time=None, send_time=None):
    """Update the log with new data."""
    log_data = load_log()
    if course_id not in log_data:
        log_data[course_id] = {}

    if camera_id is not None:
        log_data[course_id]['camera_id'] = camera_id
    if latest_frame_time is not None:
        log_data[course_id]['latest_frame_time'] = latest_frame_time
    if send_time is not None:
        log_data[course_id]['send_time'] = send_time

    save_log(log_data)

# Function to capture frames
def capture_frames(camera_id, course_id):
    """Capture frames from the specified camera."""
    if camera_id.isdigit():  # Local camera
        cap = cv2.VideoCapture(int(camera_id))
    else:  # CCTV camera using HTTP
        cap = cv2.VideoCapture(camera_id)

    if not cap.isOpened():
        print(f"Error: Cannot open camera {camera_id}")
        return

    # Create folder for storing frames if it doesn't exist
    capture_folder = f"./static/captures/{course_id}"
    if not os.path.exists(capture_folder):
        os.makedirs(capture_folder)

    while capturing.get(camera_id, False):
        ret, frame = cap.read()
        if ret:
            timestamp = int(time.time())
            frame_filename = f"{capture_folder}/{timestamp}.jpg"
            cv2.imwrite(frame_filename, frame)  # Save frame as JPEG

            # Update log with latest frame time
            update_log(course_id, camera_id, latest_frame_time=timestamp)

        time.sleep(5)  # Wait for 5 seconds before capturing the next frame

    cap.release()

# Route to render the login page
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        # Make a POST request to your Node.js server for login
        url = "https://p5t5rg4f-3000.inc1.devtunnels.ms/api/v1/auth/login"
        payload = {'email': email, 'password': password}
        
        try:
            response = requests.post(url, data=payload)
            print(response)
            if response.status_code == 200:
                response_data = response.json()
                access_token = response_data['data']['accessToken']
                refresh_token = response_data['data']['refreshToken']
                institute_id = response_data['data']['user']['institute']['_id']

                session['access_token'] = access_token
                session['refresh_token'] = refresh_token
                session['institute_id'] = institute_id
                session['user'] = email

                return redirect(url_for('index'))  # Redirect to the index page
            else:
                return render_template('login.html', error="Invalid email or password")

        except requests.exceptions.RequestException as e:
            return render_template('login.html', error="An error occurred during login")

    return render_template('login.html')

# Route to render the frontend HTML
@app.route('/')
def index():
    if 'user' not in session:
        return redirect(url_for('login'))  # Redirect to login if not logged in
    return render_template('index.html')

# API to start capturing frames
@app.route('/start_capture', methods=['POST'])
def start_capture():
    course_id = request.form.get('course_id')
    camera_id = request.form.get('camera_id')
    
    if camera_id not in capturing or not capturing[camera_id]:
        capturing[camera_id] = True
        threading.Thread(target=capture_frames, args=(camera_id, course_id)).start()
        return jsonify({"status": "success", "message": f"Started capturing frames for course ID: {course_id}"})
    else:
        return jsonify({"status": "error", "message": "Already capturing frames"})

# API to stop capturing frames
@app.route('/stop_capture', methods=['POST'])
def stop_capture():
    camera_id = request.form.get('camera_id')
    
    if camera_id in capturing and capturing[camera_id]:
        capturing[camera_id] = False
        return jsonify({"status": "success", "message": "Stopped capturing frames"})
    else:
        return jsonify({"status": "error", "message": "No capture in progress"})

# Function to send frames to the backend
def send_folder_to_backend(institute_id, course_id):
    folder_path = f"./static/captures/{course_id}"
    if not os.path.exists(folder_path):
        return {"status": "error", "message": f"No frames found for course ID: {course_id}"}

    image_paths = [os.path.join(folder_path, file) for file in os.listdir(folder_path) if file.endswith(".jpg")]
    if not image_paths:
        return {"status": "error", "message": "No frames to send"}

    files = [('images', (os.path.basename(img), open(img, 'rb'), 'image/jpeg')) for img in image_paths]
    access_token = session.get('access_token')
    if not access_token:
        return {"status": "error", "message": "Access token is missing in session"}

    url = f"https://p5t5rg4f-3000.inc1.devtunnels.ms/api/v1/images/upload/{institute_id}/{course_id}"
    headers = {'Authorization': f'Bearer {access_token}'}

    try:
        response = requests.post(url, files=files, headers=headers)
        for file in files:
            file[1][1].close()

        if response.status_code == 200:
            for img in image_paths:
                os.remove(img)

            send_time = int(time.time())
            update_log(course_id, send_time=send_time)

            return {"status": "success", "message": "Frames sent successfully"}
        else:
            return {"status": "error", "message": f"Failed to send frames: {response.status_code}", "error": response.text}

    except requests.exceptions.RequestException as e:
        return {"status": "error", "message": "An error occurred while sending frames", "error": str(e)}

# API to send all frames
@app.route('/send_frames', methods=['POST'])
def send_frames():
    institute_id = session.get('institute_id')
    base_folder = "./static/captures"
    if not os.path.exists(base_folder):
        return jsonify({"status": "error", "message": "No folders found"})

    results = []
    for course_id in os.listdir(base_folder):
        folder_path = os.path.join(base_folder, course_id)
        if os.path.isdir(folder_path):
            result = send_folder_to_backend(institute_id, course_id)
            results.append({"result": result})

    return jsonify({"results": results})




# API to fetch courses for a specific institute
@app.route('/get_courses', methods=['GET'])
def get_courses():
    if 'access_token' not in session or 'institute_id' not in session:
        return jsonify({"status": "error", "message": "Missing access token or institute ID in session"})

    institute_id = session['institute_id']                                      
    access_token = session['access_token']
    url = f"https://p5t5rg4f-3000.inc1.devtunnels.ms/api/v1/location/institute/course/{institute_id}"
    headers = {'Authorization': f'Bearer {access_token}'}

    try:
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            return jsonify({"status": "success", "courses": response.json()})
        else:
            return jsonify({"status": "error", "message": f"Failed to fetch courses: {response.status_code}", "error": response.text})

    except requests.exceptions.RequestException as e:
        return jsonify({"status": "error", "message": "An error occurred while fetching courses", "error": str(e)})
#TEST HERE
@app.route('/get_courses_with_cameras', methods=['GET'])
def get_courses_with_cameras():
    if 'access_token' not in session or 'institute_id' not in session:
        return jsonify({"status": "error", "message": "Missing access token or institute ID in session"})

    institute_id = session['institute_id']
    access_token = session['access_token']
    url = f"https://p5t5rg4f-3000.inc1.devtunnels.ms/api/v1/location/institute/course/{institute_id}"
    headers = {'Authorization': f'Bearer {access_token}'}

    try:
        # Fetch courses
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return jsonify({"status": "error", "message": f"Failed to fetch courses: {response.status_code}", "error": response.text})
        
        courses = response.json().get('data', [])
        print(courses)
        # Load capture_log.json
        capture_log = load_log()
        
        # Combine course and camera data
        for course in courses:
            course_id = course.get('_id')
            course['camera_id'] = capture_log.get(course_id, {}).get('camera_id', "Not Assigned")  # Use a placeholder

        return jsonify({"status": "success", "courses": courses})
    except requests.exceptions.RequestException as e:
        return jsonify({"status": "error", "message": "An error occurred while fetching courses", "error": str(e)})


@app.route('/update_camera_id', methods=['POST'])
def update_camera_id():
    course_id = request.form.get('course_id')
    new_camera_id = request.form.get('camera_id')

    if not course_id or not new_camera_id:
        return jsonify({"status": "error", "message": "Missing course ID or camera ID"})

    # Update the capture_log.json file
    try:
        update_log(course_id, camera_id=new_camera_id)
        return jsonify({"status": "success", "message": "Camera ID updated successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to update Camera ID: {str(e)}"})




if __name__ == "__main__":
    app.run(debug=True)
    