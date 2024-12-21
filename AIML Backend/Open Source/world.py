from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/data', methods=['GET'])
def get_data():
    data = {
    "infrastructure_suggestions": {
        "Hearing Impairment": "captioning tools.",
        "Normal Students": "interactive learning tools (Smart board).",
        "Physical Disability": "ramp access.",
        "Visual Impairment": "screen magnifier."
    },
    "institute_overall_score": 50.14,
    "real_time_analysis": "Here's an analysis of the syllabus:\n\n**Difficulty Level:** Hard\n\n* This suggests that the course will cover advanced concepts and require a significant amount of effort, focus, and prior knowledge to successfully complete. Students who enroll in this course should be prepared to put in a substantial amount of time and effort to grasp the material.\n\n**Key Topics:**\n\n* **Database Management Systems:** This topic is a fundamental area of computer science, and the course will likely cover the design and implementation of databases, including database models, data modeling, and query languages.\n* **SQL:** SQL (Structured Query Language) is a crucial skill for any database professional. The course will likely cover the basics of SQL, including data definition, data manipulation, and querying.\n* **NoSQL:** NoSQL (Not Only SQL) databases are a type of database that don't use the traditional table-based relational model used in SQL databases. This topic will likely cover the concepts and practical applications of NoSQL databases, including key-value stores, document-oriented databases, and graph databases.\n\n**Recommended Prerequisites:**\n\n* **Data Structures:** Data structures are the foundation of computer science, and understanding basic data structures such as arrays, linked lists, stacks, and queues is essential for understanding database management systems. Students who have already studied data structures will have a solid foundation to build upon.\n* **Algorithms:** Algorithms are the building blocks of computer science, and understanding basic algorithms such as sorting, searching, and graph traversal is essential for database management systems. Students who have already studied algorithms will have a solid understanding of how to apply them to database problems.\n\n**Inferences:**\n\n* This course is likely geared towards advanced undergraduate or graduate students who have a strong foundation in computer science and programming.\n* The course will likely build upon the students' prior knowledge of data structures and algorithms, and students without this background may struggle to keep up.\n* The course will cover both theoretical and practical aspects of database management systems, including SQL and NoSQL databases.\n* Students who complete this course will likely have a solid understanding of database design, implementation, and querying, as well as the ability to applied this knowledge to real-world problems.",
    "suitability_percentages": {
        "Hearing Impairment": 80,
        "Normal Students": 55,
        "Physical Disability": 80,
        "Visual Impairment": 55
    }
}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
