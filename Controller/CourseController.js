import { CatchAsyncError } from "../Middleware/CatchAsyncErrors.js";
import { Course } from "../Model/CourseModel.js";
import { Stats } from "../Model/StatsModel.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import { getDataUri } from "../Utils/dataUri.js";
import cloudinary from "cloudinary";
export const getAllCourses = CatchAsyncError(async (req, res, next) => {
  const keyword = req.query.keyword || "";
  const category = req.query.category || "";

  const courses = await Course.find({
    title: {
      $regex: keyword,
      $options: "i",
    },
    category:{
      $regex: category,
      $options: "i",
    }
  }).select("-lectures");
  res.status(200).json({
    success: true,
    courses,
  });
});
export const createCourse = CatchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;
  const file = req.file;

  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  if (!title || !description || !category || !createdBy) {
    return next(new ErrorHandler("Please Add All Fields", 400));
  }
  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Course Created Successfully. You Can Add Lectures Now",
  });
});

export const getCourseLectures = CatchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorHandler("Course not Found", 404));
  }
  course.views += 1;
  await course.save();
  res.status(200).json({
    success: true,
    lectures: course.lectures,
  });
});

// max video size 100 mb
export const addLecture = CatchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  // const file = req.file

  const course = await Course.findById(id);
  if (!course) {
    return next(new ErrorHandler("Course not Found", 404));
  }
  const file = req.file;

  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });
  course.lectures.push({
    title,
    description,
    video: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  course.numOfVideos = course.lectures.length;

  await course.save();
  res.status(200).json({
    success: true,
    message: "Lecture Added in Course",
  });
});

export const deleteCourse = CatchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    return next(new ErrorHandler("Course not Found", 404));
  }

  await cloudinary.v2.uploader.destroy(course.poster.public_id);
  for (let i = 0; i < course.lectures.length; i++) {
    await cloudinary.v2.uploader.destroy(course.lectures[i].video.public_id, {
      resource_type: "video",
    });
  }

  await course.deleteOne();
  res.status(200).json({
    success: true,
    message: "Course Deleted Successfully",
  });
});

export const deleteLecture = CatchAsyncError(async (req, res, next) => {
  const { courseId, lectureId } = req.query;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not Found", 404));
  }
  const lecture = course.lectures.find((item) => {
    if (item._id.toString() === lectureId.toString()) {
      return item;
    }
  });
  await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
    resource_type: "video",
  });
  course.lectures = course.lectures.filter((item) => {
    if (item._id.toString() !== lectureId.toString()) {
      return item;
    }
  });

  course.numOfVideos = course.lectures.length;
  await course.save();
  res.status(200).json({
    success: true,
    message: "Lecture Deleted Successfully",
  });
});

Course.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  const courses = await Course.find({});
  let totalViews = 0;
  for (let i = 0; i < courses.length; i++) {
    totalViews += courses[i].views;
  }
  stats[0].views = totalViews;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
