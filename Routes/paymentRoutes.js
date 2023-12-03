import express from "express";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";
import {
  buySubscription,
  cancelSubscription,
  getRazorPayKey,
  paymentVerification,
} from "../Controller/PaymentController.js";
const paymentRouter = express.Router();

// Buy Subscription
paymentRouter.route("/subscribe").get(isAuthenticated, buySubscription);

// verify payment and save reference in database
paymentRouter
  .route("/paymentverification")
  .post(isAuthenticated, paymentVerification);

// get razor pay key
paymentRouter.route("/razorpaykey").get(getRazorPayKey);

// cancel subscription
paymentRouter
  .route("/subscribe/cancel")
  .delete(isAuthenticated, cancelSubscription);

export default paymentRouter;
