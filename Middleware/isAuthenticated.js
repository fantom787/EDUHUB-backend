import jwt from "jsonwebtoken";
import { CatchAsyncError } from "./CatchAsyncErrors.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import { User } from "../Model/UserModal.js";

export const isAuthenticated = CatchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Not LoggedIn", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);

  next();
});

export const authorizedAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this resource`,
        403
      )
    );
  }
  next();
};

export const authorizedSubscribers = (req, res, next) => {
  if (req.user.subscription.status !== "active" && req.user.role !== "admin") {
    return next(
      new ErrorHandler(`Only Subscribers can access this resource`, 403)
    );
  }
  next();
};
