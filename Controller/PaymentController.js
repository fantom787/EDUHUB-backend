import { CatchAsyncError } from "../Middleware/CatchAsyncErrors.js";
import { User } from "../Model/UserModal.js";
import { Payment } from "../Model/PaymentModel.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto";

export const buySubscription = CatchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.role === "admin") {
    return next(new ErrorHandler("Admin Cannot Buy Subscription", 404));
  }
  const plan_id = process.env.PLAN_ID || "plan_N7s0LwcXt3UHpO";

  const subscription = await instance.subscriptions.create({
    plan_id: plan_id,
    customer_notify: 1,
    total_count: 12,
  });

  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;
  await user.save();

  res.status(201).json({
    success: true,
    subscriptionId: subscription.id,
  });
});

export const paymentVerification = CatchAsyncError(async (req, res, next) => {
  const { razorpay_signature, razorpay_subscription_id, razorpay_payment_id } =
    req.body;

  const user = await User.findById(req.user._id);

  const subscription_id = user.subscription.id;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
    .digest("hex");

  const isAuthentic = generated_signature === razorpay_signature;

  if (!isAuthentic) {
    return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);
  }
  // database comes here

  await Payment.create({
    razorpay_signature,
    razorpay_subscription_id,
    razorpay_payment_id,
  });

  user.subscription.status = "active";
  await user.save();
  res.redirect(
    `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
  );
});

export const getRazorPayKey = CatchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_API_KEY,
  });
});

export const cancelSubscription = CatchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const subscriptionId = user.subscription.id;
  let refund = false;
  await instance.subscriptions.cancel(subscriptionId);

  const payment = await Payment.findOne({
    razorpay_subscription_id: subscriptionId,
  });

  const gap = Date.now() - payment.createdAt;

  const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

  if (gap < refundTime) {
    await instance.payments.refund(payment.razorpay_payment_id);
    refund = true;
  }
  await payment.deleteOne();
  user.subscription.status = undefined;
  user.subscription.id = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: refund
      ? "Subscription Cancelled, You Will recieve full refund within 7 days."
      : "Subscription Cancelled, No refund initiated as subscription was cancelled after 7 days.",
  });
});
