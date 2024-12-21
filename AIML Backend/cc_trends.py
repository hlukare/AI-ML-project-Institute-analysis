import google.generativeai as genai
import os
import pdfplumber
import json
import tensorflow as tf

gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)

print("Using GPU for processing...")

os.environ["API_KEY"] = "AIzaSyChKD-Wrucx_pqnTcymkXZLrQ4lXjOGEIY"

genai.configure(api_key=os.environ["API_KEY"])

# Initialize the model
model = genai.GenerativeModel("gemini-1.5-flash")

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
        # Gemini model inference
        response = model.generate_content(user_input)
        return response.text
    except Exception as e:
        return f"Error: {e}"

def save_analysis_result(analysis_result, json_path, text_path):
    with open(json_path, 'w') as json_file:
        json.dump(analysis_result, json_file, indent=4)

    with open(text_path, 'w') as text_file:
        text_file.write(analysis_result)

if __name__ == "__main__":
    # pdf_path = input("Enter the path to the syllabus PDF: ")
    pdf_path = r"C:\Users\Harish\Desktop\Python\DBMS Syllabus.pdf"
    
    # Extract text from the syllabus PDF
    syllabus_text = extract_text_from_pdf(pdf_path)
    
    if syllabus_text.startswith("Error"):
        print(syllabus_text)
    else:
        analysis_result = analyze_text_with_gemini(syllabus_text)
        print("Analysis Result:", analysis_result)
        
        json_path = "syllabus_analysis_result.json"
        text_path = "syllabus_analysis_result.txt"
    
        save_analysis_result(analysis_result, json_path, text_path)
        
        print(f"Analysis saved to {json_path} and {text_path}")

#os.environ["API_KEY"] = "AIzaSyChKD-Wrucx_pqnTcymkXZLrQ4lXjOGEIY"