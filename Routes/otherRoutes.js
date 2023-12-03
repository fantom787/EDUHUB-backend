import express from "express";
import {
  authorizedAdmin,
  isAuthenticated,
} from "../Middleware/isAuthenticated.js";
import {
  contact,
  courseRequest,
  getDashboardStats,
} from "../Controller/otherController.js";

const otherRouter = express.Router();

// contact form
otherRouter.route("/contact").post(contact);

// request form
otherRouter.route("/courserequest").post(courseRequest);

// Get Admin Dashboard Stats

otherRouter
  .route("/admin/stats")
  .get(isAuthenticated, authorizedAdmin, getDashboardStats);

export default otherRouter;
