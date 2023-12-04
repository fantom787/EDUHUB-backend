import express from "express";
import { config } from "dotenv";
import courseRouter from "./Routes/CourseRoutes.js";
import userRouter from "./Routes/UserRoutes.js";
import paymentRouter from "./Routes/paymentRoutes.js";
import { ErrorMiddleware } from "./Middleware/ErrorMiddleware.js";
import cookieParser from "cookie-parser";
import otherRouter from "./Routes/otherRoutes.js";
import cors from "cors";
config({
  path: "./Config/config.env",
});

const app = express();
// Using Middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: "true",
  })
);

app.use(cookieParser());

console.log(process.env.FRONTEND_URL);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/** Course Routes */
app.use("/api/v1", courseRouter);
/** User Routes */
app.use("/api/v1", userRouter);
// payment router
app.use("/api/v1", paymentRouter);

// other router
app.use("/api/v1", otherRouter);

export default app;

app.use(ErrorMiddleware);
