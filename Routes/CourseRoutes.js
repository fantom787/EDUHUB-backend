import express from "express";
import {
  addLecture,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllCourses,
  getCourseLectures,
} from "../Controller/CourseController.js";
import singleUpload from "../Middleware/multer.js";
import {
  authorizedAdmin,
  authorizedSubscribers,
  isAuthenticated,
} from "../Middleware/isAuthenticated.js";

const courseRouter = express.Router();

// Get all Course without Lectures
courseRouter.route("/courses").get(getAllCourses);

//Create a new Course - Only Admin
courseRouter
  .route("/createcourse")
  .post(isAuthenticated, authorizedAdmin, singleUpload, createCourse);

// Add Lecture ,Delete Course  , Get Course Details
courseRouter
  .route("/course/:id")
  .get(isAuthenticated, authorizedSubscribers, getCourseLectures)
  .post(isAuthenticated, authorizedAdmin, singleUpload, addLecture)
  .delete(isAuthenticated, authorizedAdmin, deleteCourse);

//Delete Lecture
courseRouter
  .route("/lecture")
  .delete(isAuthenticated, authorizedAdmin, deleteLecture);
export default courseRouter;
