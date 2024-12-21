//! NOTE: Any changes in this file will be reflected in the frontend and in models
export const API_VERSION = "v1";

export const USER_STATUS = {
  active: "Active",
  inactive: "Inactive",
};

export const USER_ROLE = {
  superAdmin: "SuperAdmin",
  regionLead: "RegionLead",
  unitLead: "UnitLead",
  instituteHead: "InstituteHead",
  teacher: "Teacher",
};

export const IMAGE_STATUS = {
  uploaded: "Uploaded",
  analysed: "Analyzed",
};

export const IMAGE_TYPE = {
  image: "Image",
  video: "Video",
};

//!IMAGE UPLOADING
export const MAX_IMAGES_UPLOAD = 300;
export const MAX_FILE_SIZE = 1; //In mb
export const UPLOAD_FOLDER = "/uploads/images";
export const BATCH_SIZE_IMAGE_UPLOAD = 50;
export const MAX_CONCURRENT_UPLOADS = 10;
export const MAX_CONCURRENT_DELETIONS = 10;
export const MAX_TOTAL_CONCURRENT_REQUESTS = 10; // Adjust to Cloudinary's API limits
export const MAX_RETRIES = 3; // Maximum retry attempts
export const RETRY_DELAY_MS = 1000; // Initial retry delay in milliseconds

//! Extra-Curricular Activites
export const EXTRA_CURRICULAR_ACTIVITIES = [
  "hackathons",
  "sports",
  "olympiads",
  "seminars",
  "recreation_session",
  "cultural_activity",
  "institute_tier",
];

export const ACTIVITIES = [
  "classroom_images",
  "classroom_training",
  "extra_activities",
  "teacher_teaching",
];
