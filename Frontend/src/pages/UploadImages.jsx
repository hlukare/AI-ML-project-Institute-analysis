"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import Button from "./../components/Button";
import Dropdown from "../components/Dropdown";
import Label from "../components/Label";
import { useSelector } from "react-redux";
import { API_URL } from "../constants";
export default function CourseForm() {
  const [courseName, setCourseName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(null);
  // Institute Head
  const [selectedCourses, setSelectedCourses] = useState("");
  const [coursesOptions, setCoursesOptions] = useState([]);

  //Institute Image
  const { user, role } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchCourses = async () => {
      const response = await axios.get(
        `${API_URL}/location/institute/course/${user.institute._id}`
      );
      const data = response.data.data;
      const formattedData = data.map((course) => ({
        value: course._id,
        label: course.course_name,
      }));
      console.log(formattedData);
      setCoursesOptions(formattedData);
    };
    fetchCourses();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append("courseName", courseName);

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("images", selectedFiles[i]);
      }
    }

    try {
      const response = await axios.post(
        `${API_URL}/images/upload/${user.institute._id}/${selectedCourses}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        console.log("Analysis: ", response.data.data);
        alert("Course submitted successfully!");
        setCourseName("");
        setSelectedFiles(null);
        if (document.getElementById("images")) {
          document.getElementById("images").value = "";
        }
      } else {
        throw new Error("Failed to submit course");
      }
    } catch (error) {
      console.error("Error submitting course:", error);
      alert("Failed to submit course. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white shadow-md rounded-lg overflow-hidden"
    >
      <div className="px-6 py-4 space-y-6">
        {/* COURSE LEAD */}
        <div className="space-y-2">
          <Label htmlFor="email">Course</Label>
          <Dropdown
            id="institute_lead_id"
            options={coursesOptions}
            value={selectedCourses}
            onChange={(value) => setSelectedCourses(value)}
            className={`cursor-not-allowed bg-slate-200`}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="images"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Images
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => document.getElementById("images").click()}
              className="w-full h-24 relative border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-500">
                  {selectedFiles
                    ? `${selectedFiles.length} file(s) selected`
                    : "Click to upload images"}
                </span>
              </div>
            </button>
          </div>
          <p className="text-sm text-gray-500">Supported formats: JPG, PNG</p>
        </div>

        <Button
          type="submit"
          disabled={isUploading}
          className={`w-full px-4 py-2 text-white bg-black-2 font-medium rounded-md ${
            isUploading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </div>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </form>
  );
}
