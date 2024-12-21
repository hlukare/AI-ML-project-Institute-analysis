import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Label from "../components/Label.jsx";
import Dropdown from "../components/Dropdown.jsx";
import axios from "axios";
import { API_URL } from "../constants.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { XIcon } from "@heroicons/react/solid";
XIcon;
export default function UserRegistration() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { region, operation } = location.state || {};
  const user = useSelector((state) => state.auth.user);
  let defaultOption = {};
  const [degrees, setDegrees] = useState([]);
  const [currentDegrees, setCurrentDegrees] = useState("");

  const handleAddDegrees = (e) => {
    e.preventDefault();
    if (currentDegrees.trim() && !degrees.includes(currentDegrees.trim())) {
      setDegrees([...degrees, currentDegrees.trim()]);
      setCurrentDegrees("");
    }
  };

  const removeDegrees = (requirementToRemove) => {
    setDegrees(
      degrees.filter((requirement) => requirement !== requirementToRemove)
    );
  };

  const roleMapping = useMemo(() => {
    return {
      InstituteHead: [{ value: "Teacher", label: "Teacher" }],
      UnitLead: [{ value: "InstituteHead", label: "Institute Head" }],
      RegionLead: [
        { value: "InstituteHead", label: "Institute Head" },
        { value: "UnitLead", label: "Unit Lead" },
      ],
      SuperAdmin: [
        { value: "InstituteHead", label: "Institute Head" },
        { value: "UnitLead", label: "Unit Lead" },
        { value: "RegionLead", label: "Region Lead" },
      ],
    };
  });

  useEffect(() => {
    if (operation === "edit") {
      defaultOption =
        operation === "edit"
          ? { value: region.region_lead._id, label: region.region_lead.name }
          : {};
      setSelectedRole(region.region_lead._id);
    } else {
      setIsEditing(true);
    }
  }, []);

  // Fetch region leads
  useEffect(() => {
    const validRoleOptions = roleMapping[user.role] || [];
    setRoleOptions(validRoleOptions);
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
            name: region.name,
          }
        : {},
  });

  // Handle form submit
  const onSubmit = async (data) => {
    try {
      let response = null;
      if (operation === "edit") {
        console.log("edit");
        // response = await axios.put(`${API_URL}/location/region/${region._id}`, {
        //   name: data.name,
        //   region_lead_id: selectedRole,
        // });
      } else {
        const newUser = {
          name: data.name,
          role: selectedRole,
          email: data.email,
          password: data.password,
        };
        if (selectedRole === "Teacher") {
          newUser.degrees = degrees;
          newUser.experience = data.experience;
          newUser.institute_id = user.institute._id;
        }
        console.log(user);
        response = await axios.post(`${API_URL}/auth/registerUser`, newUser);
      }
      if (response.status === 201 || response.status == 200) {
        console.log("Region created successfully");
        setIsEditing(false);
        navigate(-1);
      } else {
        console.log("Error creating region");
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
      >
        {/* USER NAME */}
        <div className="space-y-2">
          <Label htmlFor="name">User Name</Label>
          <Input
            id="name"
            placeholder="Enter the user's name"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("name", {
              required: "User name is required",
              minLength: {
                value: 2,
                message: "User name must be at least 2 characters",
              },
            })}
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter the user's email"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter the user's password"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="email">Role</Label>
          <Dropdown
            id="region_lead_id"
            ref={dropdownRef}
            options={roleOptions}
            defaultOption={defaultOption}
            value={selectedRole}
            onChange={(value) => setSelectedRole(value)}
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
          />
          {errors.region_lead_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.region_lead_id.message}
            </p>
          )}
        </div>
        {selectedRole == "Teacher" ? (
          <>
            <div className="space-y-2">
              <label
                htmlFor="infrastructure_requirements"
                className="block text-sm font-medium text-gray-700"
              >
                Degrees
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  id="infrastructure_requirements"
                  value={currentDegrees}
                  onChange={(e) => setCurrentDegrees(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Enter an infrastructure requirement"
                />
                <button
                  type="submit"
                  onClick={handleAddDegrees}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
              {degrees?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {degrees.map((infra, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      <span>{infra}</span>
                      <button
                        onClick={() => removeDegrees(infra)}
                        className="w-4 h-4 flex items-center justify-center hover:text-red-500 transition-colors"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* EXPERIENCE */}
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input
                id="experience"
                type="number"
                placeholder="Enter the number of years"
                disabled={!isEditing}
                className={`${
                  isEditing ? "" : "cursor-not-allowed bg-slate-200"
                }`}
                {...register("experience", {
                  required: "Experience is required",
                  min: {
                    value: 0,
                    message: "Experience cannot be negative",
                  },
                })}
                aria-invalid={errors.experience ? "true" : "false"}
              />
              {errors.experience && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.experience.message}
                </p>
              )}
            </div>
          </>
        ) : null}
        <Button type="submit" className={`w-full ${isEditing ? "" : "hidden"}`}>
          {operation === "edit" ? "Update User" : "Create User"}
        </Button>
      </form>
    </>
  );
}
