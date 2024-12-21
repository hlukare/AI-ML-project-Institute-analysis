import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Textarea from "../components/TextArea.jsx";
import Label from "../components/Label.jsx";
import { useSelector, useDispatch } from "react-redux";

export default function Personal() {
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    console.log("Form submitted");
  };

  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({});

  return (
    <>
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl mx-auto p-2"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
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

        <div className="space-y-2">
          <Label htmlFor="about">About</Label>
          <Textarea
            id="about"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("about", {
              required: "About section is required",
              minLength: {
                value: 10,
                message: "About section must be at least 10 characters",
              },
            })}
            aria-invalid={errors.about ? "true" : "false"}
          />
          {errors.about && (
            <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptors">Descriptors</Label>
          <Input
            id="descriptors"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("descriptors")}
            placeholder="Separate with commas"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Upload Avatar</Label>
          <Input
            id="file"
            type="file"
            accept="image/*"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("file")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github">GitHub URL</Label>
          <Input
            id="github"
            type="url"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("github", {
              pattern: {
                value: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
                message: "Invalid GitHub URL",
              },
            })}
          />
          {errors.github && (
            <p className="text-red-500 text-sm mt-1">{errors.github.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            type="url"
            disabled={!isEditing}
            className={`${isEditing ? "" : "cursor-not-allowed bg-slate-200"}`}
            {...register("linkedin", {
              pattern: {
                value:
                  /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
                message: "Invalid LinkedIn URL",
              },
            })}
          />
          {errors.linkedin && (
            <p className="text-red-500 text-sm mt-1">
              {errors.linkedin.message}
            </p>
          )}
        </div>

        <Button type="submit" className={`w-full ${isEditing ? "" : "hidden"}`}>
          Save Personal Information
        </Button>
      </form>
    </>
  );
}
