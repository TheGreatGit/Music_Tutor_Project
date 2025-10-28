import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.mjs";
import { errorHandler } from "./middleware/errorHandler.mjs";


// load environment variables in to process.ENV
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// basic middleware
app.use(express.json()); // process json-formatted client requests
app.use(cookieParser()); // needed  for reading client-sent cokkies with JWT in it
app.use(urlencoded({ extended: true }));

// Allow CORS between express server and React fontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // the specific site that cross-origin requests are to be allowed for
    credentials: true, // the server tells rthe browser that it is allowed to expose the response to broswer JS if the browser request sent credentials.
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // http request methods the server will accept from the browser
  })
); // used to permit CORS between react front-end and express backend. Cors middleware will send the required response headers to tell the browser to allow response to be read by frontend's JS

// ROUTES
// by using app.use instead of e.g. app.post, this mounts the router (and handlers) from the router defined in routes/auth.mjs for all http request types
app.use("/api/auth", authRouter);

// api health check
app.get('/api/health', (req, res)=> {res.json({ok:true})});

// catch-all not-found route that is compatible with express v5+
app.use((req, res, next) => {
  res.status(404);
  return next(new Error('404 not found'));
});


// express global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
