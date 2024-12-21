import ApiError from "../../../utils/ApiError.js";

function validateTimetable(timetable) {
  // Check if timetable is an array
  if (!Array.isArray(timetable)) {
    throw new ApiError(400, "Timetable must be an array");
  }

  // Iterate over each timetable item
  timetable.forEach((timetableItem, index) => {
    // Validate day field
    if (!timetableItem.day) {
      throw new ApiError(400, `Day is required at index ${index}`);
    }

    // Check if day is valid
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (!validDays.includes(timetableItem.day)) {
      throw new ApiError(
        400,
        `Invalid day "${timetableItem.day}" at index ${index}`,
      );
    }

    // Validate sessions array
    if (!Array.isArray(timetableItem.sessions)) {
      throw new ApiError(400, `Sessions must be an array at index ${index}`);
    }

    // Validate each session
    timetableItem.sessions.forEach((session, sessionIndex) => {
      // Ensure start_time and end_time are provided
      if (!session.start_time || !session.end_time) {
        throw new ApiError(
          400,
          `Start and end times are required at index ${index}, session ${sessionIndex}`,
        );
      }

      // Validate time format for start_time and end_time
      const timePattern = /\b([01]\d|2[0-3]):([0-5]\d):([0-5]\d)\b/;
      if (!timePattern.test(session.start_time)) {
        throw new ApiError(
          400,
          `Invalid start time format at index ${index}, session ${sessionIndex}`,
        );
      }

      if (!timePattern.test(session.end_time)) {
        throw new ApiError(
          400,
          `Invalid end time format at index ${index}, session ${sessionIndex}`,
        );
      }

      // Ensure topic is provided
      if (!session.topic) {
        throw new ApiError(
          400,
          `Topic is required at index ${index}, session ${sessionIndex}`,
        );
      }

      // Validate topic length
      if (session.topic.trim().length < 3) {
        throw new ApiError(
          400,
          `Topic must be at least 3 characters long at index ${index}, session ${sessionIndex}`,
        );
      }
    });
  });
}

export default validateTimetable;
