import React, { useState, useEffect, useRef } from "react";
import { set, useForm } from "react-hook-form";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import Textarea from "../../components/TextArea.jsx";
import Label from "../../components/Label.jsx";
import Dropdown from "../../components/Dropdown.jsx";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { API_URL } from "../../constants.js";
import { useNavigate, useLocation } from "react-router-dom";
import { XIcon } from "@heroicons/react/solid";
export default function CourseForm() {
  const [isEditing, setIsEditing] = useState(false);
  // Institute Head
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherOptions, setTeacherOptions] = useState([]);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { course, operation } = location.state || {};
  const institute = useSelector((state) => state.auth.user.institute);

  const [infrastructureRequirements, setInfrastructureRequirements] = useState(
    []
  );
  const [
    currentInfrastructureRequirement,
    setCurrentInfrastructureRequirement,
  ] = useState("");
  const [courseObjectives, setCourseObjectives] = useState([]);
  const [currentCourseObjective, setCurrentCourseObjective] = useState("");

  const handleAddInfrastructureRequirement = (e) => {
    e.preventDefault();
    if (
      currentInfrastructureRequirement.trim() &&
      !infrastructureRequirements.includes(
        currentInfrastructureRequirement.trim()
      )
    ) {
      setInfrastructureRequirements([
        ...infrastructureRequirements,
        currentInfrastructureRequirement.trim(),
      ]);
      setCurrentInfrastructureRequirement("");
    }
  };

  const removeInfrastructureRequirement = (requirementToRemove) => {
    setInfrastructureRequirements(
      infrastructureRequirements.filter(
        (requirement) => requirement !== requirementToRemove
      )
    );
  };

  const handleAddCourseObjective = (e) => {
    e.preventDefault();
    if (
      currentCourseObjective.trim() &&
      !courseObjectives.includes(currentCourseObjective.trim())
    ) {
      setCourseObjectives([...courseObjectives, currentCourseObjective.trim()]);
      setCurrentCourseObjective("");
    }
  };

  const removeCourseObjective = (objectiveToRemove) => {
    setCourseObjectives(
      courseObjectives.filter((objective) => objective !== objectiveToRemove)
    );
  };

  let defaultTeacherOption = {};
  let defaultInfrastructureRequirementOption = {};
  let defaultCourseObjectiveOption = {};
  useEffect(() => {
    if (operation === "edit") {
      defaultTeacherOption = {
        value: course?.teacher?._id,
        label: course?.teacher?.name,
      };
      setCourseObjectives(course?.course_objectives);
      setInfrastructureRequirements(course?.infrastructure_requirements);
      setSelectedTeacher(defaultTeacherOption.value);
    } else {
      setIsEditing(true);
    }
  }, []);

  // Fetch unit leads, regions and institute heads
  useEffect(() => {
    const fetchTeachers = async () => {
      const response = await axios.get(`${API_URL}/user`, {
        params: {
          role: "Teacher",
          institute_id: institute._id,
        },
      });
      const data = response.data.data;
      const formattedData = data.map((teacher) => ({
        value: teacher._id,
        label: teacher.name,
      }));
      setTeacherOptions(formattedData);
    };
    fetchTeachers();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues:
      operation === "edit"
        ? {
            course_name: course?.course_name,
            course_code: course?.course_code,
            course_description: course?.course_description,
            course_duration: course?.course_duration,
            course_fee: course?.course_fee,
            course_objectives: course?.course_objectives,
            infrastructure_requirements: course?.infrastructure_requirements,
          }
        : {},
  });

  // Handle form submit
  const onSubmit = async (data) => {
    try {
      console.log("Form submitted", data);
      console.log("Infra Requirements:", infrastructureRequirements);
      console.log("Course Objectives:", courseObjectives);
      console.log("Teacher ID:", selectedTeacher);

      let response = null;
      if (operation === "edit") {
        const dataEdit = {
          course_name: data.course_name,
          course_code: data.course_code,
          course_description: data.course_description,
          course_duration: data.course_duration,
          course_objectives: courseObjectives,
          infrastructure_requirements: infrastructureRequirements,
          course_fee: data.course_fee,
          teacher: selectedTeacher,
          institute_id: institute._id,
        };
        if (data?.syllabus && data.syllabus.length > 0) {
          dataEdit.syllabus = data.syllabus[0];
        }
        response = await axios.put(
          `${API_URL}/location/institute/course/${institute._id}/${course._id}`,
          dataEdit,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/location/institute/course`,
          {
            course_name: data.course_name,
            course_code: data.course_code,
            course_description: data.course_description,
            course_duration: data.course_duration,
            course_objectives: courseObjectives,
            infrastructure_requirements: infrastructureRequirements,
            course_fee: data.course_fee,
            teacher: selectedTeacher,
            syllabus: data.syllabus[0],
            institute_id: institute._id,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
      if (response.status === 201 || response.status == 200) {
        console.log("Institute created successfully");
        setIsEditing(false);
        navigate(-1);
      } else {
        console.log("Error creating unit");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {operation === "edit" ? (
        <div className="w-full flex justify-end">
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2 "
              >
                <path d="m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982" />
                <path d="m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353" />
                <path d="m15 5 4 4" />
                <path d="m2 2 20 20" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2"
              >
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                <path d="m15 5 4 4" />
              </svg>
            )}

            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl mx-auto p-2"
        encType="multipart/form-data"
      >
        {/* COURSE NAME */}
        <div className="space-y-2">
          <Label htmlFor="course_name">Course Name</Label>
          <Input
            id="course_name"
            placeholder="Enter the course name"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("course_name", {
              required: "Course name is required",
              minLength: {
                value: 2,
                message: "Course name must be at least 2 characters",
              },
            })}
            aria-invalid={errors.course_name ? "true" : "false"}
          />
          {errors.course_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.course_name.message}
            </p>
          )}
        </div>
        {/* COURSE CODE */}
        <div className="space-y-2">
          <Label htmlFor="course_code">Course Code</Label>
          <Input
            id="course_code"
            placeholder="Enter the course name"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("course_code", {
              required: "Course name is required",
              minLength: {
                value: 2,
                message: "Course name must be at least 2 characters",
              },
            })}
            aria-invalid={errors.course_code ? "true" : "false"}
          />
          {errors.course_code && (
            <p className="text-red-500 text-sm mt-1">
              {errors.course_code.message}
            </p>
          )}
        </div>
        {/* COURSE DURATION */}
        <div className="space-y-2">
          <Label htmlFor="course_duration">Course Duration</Label>
          <Input
            id="course_duration"
            type="number"
            placeholder="Enter the course duration in months"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("course_duration", {
              required: "Course duration is required",
              min: {
                value: 1,
                message: "Course duration must be at least 1 month",
              },
              max: {
                value: 36,
                message: "Course duration must be at most 36 months",
              },
            })}
            aria-invalid={errors.course_duration ? "true" : "false"}
          />
          {errors.course_duration && (
            <p className="text-red-500 text-sm mt-1">
              {errors.course_duration.message}
            </p>
          )}
        </div>

        {/* COURSE FEE */}
        <div className="space-y-2">
          <Label htmlFor="course_fee">Course Fee</Label>
          <Input
            id="course_fee"
            type="number"
            placeholder="Enter the course fee in INR"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("course_fee", {
              required: "Course fee is required",
              min: {
                value: 1,
                message: "Course fee must be at least 1 INR",
              },
            })}
            aria-invalid={errors.course_fee ? "true" : "false"}
          />
          {errors.course_fee && (
            <p className="text-red-500 text-sm mt-1">
              {errors.course_fee.message}
            </p>
          )}
        </div>

        {/* COURSE DESCRIPTION */}
        <div className="space-y-2">
          <Label htmlFor="course_description">Course Description</Label>
          <Textarea
            id="course_description"
            placeholder="Enter the course description"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("course_description", {
              required: "Course description is required",
            })}
            aria-invalid={errors.course_description ? "true" : "false"}
          />
          {errors.course_description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.course_description.message}
            </p>
          )}
        </div>

        {/* SYLLABUS */}
        <div className="space-y-2">
          <Label htmlFor="syllabus">Syllabus</Label>
          <Input
            id="syllabus"
            type="file"
            placeholder="Select the syllabus file"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("syllabus", {
              required:
                operation === "edit" ? false : "Syllabus file is required",
              validate: {
                validType: (value) => {
                  if (!value) return true;
                  const types = [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ];
                  return types.includes(value.length > 0 && value[0].type);
                },
                validSize: (value) => {
                  if (!value || value?.length == 0) return true;
                  const maxFileSize = 5 * 1024 * 1024; // 5MB
                  return value[0].size <= maxFileSize;
                },
              },
            })}
            aria-invalid={errors.syllabus ? "true" : "false"}
            accept=".pdf,.docx"
          />
          {errors.syllabus && (
            <p className="text-red-500 text-sm mt-1">
              {errors.syllabus.message}
            </p>
          )}
        </div>

        {/* TEACHER */}
        <div className="space-y-2">
          <Label htmlFor="email">Teacher</Label>
          <Dropdown
            id="teacher"
            ref={dropdownRef}
            options={teacherOptions}
            defaultOption={defaultTeacherOption}
            value={selectedTeacher}
            onChange={(value) => setSelectedTeacher(value)}
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
          />
          {errors.teacher && (
            <p className="text-red-500 text-sm mt-1">
              {errors.teacher.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="infrastructure_requirements"
            className="block text-sm font-medium text-gray-700"
          >
            Infrastructure Requirements
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              id="infrastructure_requirements"
              value={currentInfrastructureRequirement}
              onChange={(e) =>
                setCurrentInfrastructureRequirement(e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter an infrastructure requirement"
            />
            <button
              type="submit"
              onClick={handleAddInfrastructureRequirement}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          {infrastructureRequirements?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {infrastructureRequirements.map((infra, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  <span>{infra}</span>
                  <button
                    onClick={() => removeInfrastructureRequirement(infra)}
                    className="w-4 h-4 flex items-center justify-center hover:text-red-500 transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="course_objectives"
            className="block text-sm font-medium text-gray-700"
          >
            Course Objectives
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              id="course_objectives"
              value={currentCourseObjective}
              onChange={(e) => setCurrentCourseObjective(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter a course objective"
            />
            <button
              type="submit"
              onClick={handleAddCourseObjective}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          {courseObjectives?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {courseObjectives.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  <span>{objective}</span>
                  <button
                    onClick={() => removeCourseObjective(objective)}
                    className="w-4 h-4 flex items-center justify-center hover:text-red-500 transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" className={`w-full ${isEditing ? "" : "hidden"}`}>
          {operation === "edit" ? "Update Update" : "Create Course"}
        </Button>
      </form>
    </>
  );
}
