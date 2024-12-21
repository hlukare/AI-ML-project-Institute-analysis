import express from "express";
import config from "./config/config.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import ApiError from "./utils/ApiError.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

//*Middlewares
app.use(
  cors({
    origin: config.CORS_ORIGIN,
  }),
);
app.use(express.json({ limit: "100mb" })); //!Define the max incoming json size
app.use(express.urlencoded({ extended: true, limit: "100mb" })); //!Define the max size of data from url
app.use(express.static("public"));
app.use(cookieParser());
// Middleware to attach request time
app.use((req, res, next) => {
  req.requestTime = new Date(); // Attach the current time
  next(); // Proceed to the next middleware or route handler
});

//*Routes
import apiV1Routes from "./routes/index.routes.js";
app.get("/", (req, res) => {
  res.send("Hello World");
});

// API routes
app.use("/api/v1", apiV1Routes);

//*Error Testing
app.get("/error-test", (req, res, next) => {
  next(new ApiError("This is a test error"));
});

//*Error Handling
app.use(errorHandler);

app.listen(config.PORT, async () => {
  await connectDB(config.MONGO_URI);
  console.log(`Server started at http://localhost:${config.PORT}`);
});
export default app;
