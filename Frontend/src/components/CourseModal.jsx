import React from "react";

import {
  XIcon,
  AcademicCapIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  BookOpenIcon,
  DesktopComputerIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
} from "@heroicons/react/outline";
const CourseModal = ({ isOpen, onClose, course }) => {
  if (!isOpen) return null;
  const {
    course_name,
    course_code,
    course_duration,
    course_fee,
    course_description,
    course_objectives,
    infrastructure_requirements,
    timetable,
    syllabus,
    teacher,
  } = course;

  return (
    <div className="fixed inset-0 mt-16 bg-black bg-opacity-50 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{course_name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-6 space-y-2">
            <p className="text-lg text-gray-600 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-500" />
              Course Code: {course_code}
            </p>
            <p className="text-lg text-gray-600 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
              Duration: {course_duration}{" "}
              {course_duration === 1 ? "Month" : "Months"}
            </p>
            <p className="text-lg text-gray-600 flex items-center">
              <CurrencyRupeeIcon className="h-5 w-5 mr-2 text-gray-500" />
              Fee: ₹{course_fee.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-2 text-gray-700" />
              Course Description
            </h3>
            <p className="text-gray-700">{course_description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <AcademicCapIcon className="h-6 w-6 mr-2 text-gray-700" />
              Course Objectives
            </h3>
            <ul className="list-disc pl-5">
              {course_objectives.map((objective, index) => (
                <li key={index} className="text-gray-700">
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <DesktopComputerIcon className="h-6 w-6 mr-2 text-gray-700" />
              Infrastructure Requirements
            </h3>
            <ul className="list-disc pl-5">
              {infrastructure_requirements.map((requirement, index) => (
                <li key={index} className="text-gray-700">
                  {requirement}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2 text-gray-700" />
              Timetable
            </h3>
            {timetable.map((day, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-semibold text-lg">{day.day}</h4>
                <ul className="list-none pl-5">
                  {day.sessions.map((session, sessionIndex) => (
                    <li key={sessionIndex} className="text-gray-700">
                      {session.start_time.slice(0, 5)} -{" "}
                      {session.end_time.slice(0, 5)}: {session.topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2 text-gray-700" />
              Syllabus
            </h3>
            <a
              href={syllabus}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            >
              View Syllabus
            </a>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-gray-700" />
              Instructor Information
            </h3>
            <p className="text-gray-700">
              Name: {teacher?.name ? teacher.name : "N/A"}
            </p>
            <p className="text-gray-700">
              Email: {teacher?.email ? teacher.email : "N/A"}
            </p>
            <p className="text-gray-700">
              Degrees:{" "}
              {teacher?.degrees &&
                teacher.degrees.length > 0 &&
                teacher.degrees.join(", ")}
            </p>
            <p className="text-gray-700">
              Experience: {teacher?.experience ? teacher.experience : "N/A"}{" "}
              years
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
