import express from "express";
import {
  addToPlaylist,
  changePassword,
  deleteMyProfile,
  deleteUser,
  forgetPassword,
  getAllUsers,
  getMyProfile,
  login,
  logout,
  register,
  removeFromPlaylist,
  resetPassword,
  updateProfile,
  updateProfilePicture,
  updateUserRole,
} from "../Controller/userController.js";
import {
  authorizedAdmin,
  isAuthenticated,
} from "../Middleware/isAuthenticated.js";
import singleUpload from "../Middleware/multer.js";

const userRouter = express.Router();
// to register a new user
userRouter.route("/register").post(singleUpload, register);

// login
userRouter.route("/login").post(login);

// logout
userRouter.route("/logout").get(isAuthenticated, logout);

// get my profile
userRouter.route("/me").get(isAuthenticated, getMyProfile);

// delete my profile
userRouter.route("/me").delete(isAuthenticated, deleteMyProfile);

// change password
userRouter.route("/changepassword").put(isAuthenticated, changePassword);

//update profile
userRouter.route("/updateprofile").put(isAuthenticated, updateProfile);
// update profile picture
userRouter
  .route("/updateprofilepicture")
  .put(isAuthenticated, singleUpload, updateProfilePicture);

// forget password
userRouter.route("/forgetpassword").post(forgetPassword);

// reset password
userRouter.route("/resetpassword/:token").put(resetPassword);

//add to playlist
userRouter.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);

// remove from playlist
userRouter
  .route("/removefromplaylist")
  .delete(isAuthenticated, removeFromPlaylist);

// get all users -- admin

userRouter
  .route("/admin/users")
  .get(isAuthenticated, authorizedAdmin, getAllUsers);

// update role
userRouter
  .route("/admin/users/:id")
  .put(isAuthenticated, authorizedAdmin, updateUserRole)
  .delete(isAuthenticated, authorizedAdmin, deleteUser);
export default userRouter;
