import ExtraCurricular from "../../../models/extraCurrricular.model.js";
import ApiError from "../../../utils/ApiError.js";
import Institute from "../../../models/institute.model.js";
import Course from "../../../models/course.model.js";
import axios from "axios";
import config from "../../../config/config.js";
import { EXTRA_CURRICULAR_ACTIVITIES } from "../../../constants.js";
export default async function addExtraCurricular(
  institute_id,
  course_id,
  activities,
) {
  try {
    if (!institute_id || !course_id || !activities) {
      throw new ApiError(
        400,
        "Institute ID, Course ID and Activities are required",
      );
    }
    const institute = await Institute.findById(institute_id);
    if (!institute) {
      throw new ApiError(400, "Institute not found");
    }
    const course = await Course.findById(course_id);
    if (!course) {
      throw new ApiError(400, "Course not found");
    }
    if (!Array.isArray(activities)) {
      throw new ApiError(400, "Activities must be an array");
    } else {
      activities.forEach((activity) => {
        if (!activity.name) {
          throw new ApiError(400, "Activity name is required");
        }
      });
    }
    //TODO: ANALYSIS
    //!DEMONSTRATION ONLY
    const analysisObj = activities.reduce((obj, activity) => {
      if (
        activity.name === "recreation_session" ||
        activity.name == "cultural_activity"
      ) {
        obj[activity.name] = activity.is_conducted;
      } else {
        obj[activity.name] = activity.count;
      }
      return obj;
    }, {});

    const analysis = await axios.post(`${config.AI_URL}/extra_curricular`, {
      ...analysisObj,
    });
    const extraCurricular = await ExtraCurricular.create({
      institute_id,
      course_id,
      activities,
      analysis: analysis.data,
    });

    //INCREMENT COUNT FOR EACH ACTIVITY OF THE COURSE IF IT IS CONDUCTED BY THE INSTITUTE
    activities.forEach(async (activity) => {
      if (!activity.is_conducted) {
        return;
      }
      const activityExists = institute.extra_curriculars.some(
        (act) => act.activity === activity.name,
      );

      if (activityExists) {
        // Increment count if the activity is found
        await Institute.findOneAndUpdate(
          {
            _id: institute_id,
            "extra_curriculars.activity": activity.name,
          },
          { $inc: { "extra_curriculars.$.count": 1 } },
        );
      } else {
        // Push new activity if not found
        institute.extra_curriculars.push({
          activity: activity.name,
          count: 1,
        });
        await institute.save();
      }
    });
    return extraCurricular;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}
