import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { GlobalErrorHandler } from "./middleware/globalErrorHandler.mjs";
import tutorRouter from "./routes/searchTutorRoutes.mjs";
import filterRouter from "./routes/filterRoutes.mjs";
import registerRouter from "./routes/registerRoutes.mjs";
import loginRouter from "./routes/loginRoute.mjs";
import logoutRouter from "./routes/logOutRoute.mjs";
import bookingsRouter from "./routes/bookingsRoutes.mjs";
import http from "http";
import { Server } from "socket.io";
import { verifyToken } from "./services/tokenService.mjs";
import { buildUserInfo, findUserByUserId } from "./services/userService.mjs";


// load environment variables in to process.ENV
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// basic middleware
app.use(express.json()); // process json-formatted client requests
app.use(cookieParser()); // needed  for reading client-sent cokkies with JWT in it
app.use(express.urlencoded({ extended: true }));

// Allow CORS between express server and React fontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // the specific site that cross-origin requests are to be allowed for
    credentials: true, // the server tells rthe browser that it is allowed to expose the response to broswer JS if the browser request sent credentials.
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // http request methods the server will accept from the browser
  }),
); // used to permit CORS between react front-end and express backend. Cors middleware will send the required response headers to tell the browser to allow response to be read by frontend's JS

// ROUTES
// by using app.use instead of e.g. app.post, this mounts the router (and handlers) from the router defined in routes/auth.mjs for all http request types

// this route is simply for searching for tutors
app.use("/api/tutors", tutorRouter);

//routes for getting filter data for real-time inout filtering (currently for cities and instruments only)
app.use("/api/filters", filterRouter);

// route for REGISTERING tutors and students.
app.use("/api/register", registerRouter);

// route for login any user
app.use("/api", loginRouter);

//logout route
app.use("/api", logoutRouter);

//bookings router
app.use("/api/bookings", bookingsRouter);

// api health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// catch-all not-found route that is compatible with express v5+
app.use((req, res, next) => {
  res.status(404);
  return next(new Error("404 not found"));
});

// express global error handler
app.use(GlobalErrorHandler);

//----------------- SOCKET.IO CODE------------------------------

// create an explicit http server and give it the express() app variable as a request handler
const httpServer = http.createServer(app);

// create socket.io server instance and attach it to the http server; now the socket.io instance runs in the server on the same port and handles the websocket stuff while express handles normal http stuff
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// set up basic socket.io behaviour
// io.on represents the socket event listener with an event name and a callback for action
// the 'socket' in the callback represents a single socket that has successfully been connected between client and server
// if e.g. 100 sockets connect, you'll see this message 100 times
// io.on refers to the whole server whereas socket.on refers to the indiividual socket.
// e.g. socket.emit() will means just the socket sends soemthign from from server to client, but io.emit means the server will wmit to all connected sockets

// SOCKET.IO MIDDLEWARE
io.use(async (socket, next) => {
  try {
    // socket.io itself does not recive http req/res objects, so access JWT as below:
    const cookieHeader = socket.handshake.headers.cookie || "";
    //console.log('socket headers cookie from client', cookieHeader);

    /* because cookies separate their key/value pairs with ';' or '; ', use split(';) to get an array of separated cookie info.
      (currently, the cookie only has the JWT token so the split via ';' isn't strictly necessary, but I keep it for futureproofing) 
     then trim(), and then, because the 'setAuthCookie' function adds the signed JWT and names is 'token', the JWT appears in the cookie as token=(JWTString).
     This means you can grab it with array find() method using the string 'token='
     */
    const tokenPairString = cookieHeader.split(";").map((cookieString)=> cookieString.trim()).find((string)=> string.startsWith("token="));
    // console.log("token string:", tokenPairString);
    if(!tokenPairString){
      console.log('socket.io auth middleware: no token');
      return next(new Error("Unauthorised"));
    } 

    // to get the JWT string stripped of the cookie's key of 'token=', slice it by the length of 'token='
    const tokenStringOnly = tokenPairString.slice("token=".length).trim();
    // console.log('Token string only:', tokenStringOnly);

    const decoded = verifyToken(tokenStringOnly); // returned value has the shape of {userId, iat, exp}
    console.log('decoded = ', decoded);
    // use JWT's userId to search DB
    const userRow = await findUserByUserId(decoded.userId);
    if(!userRow) {
      console.log('In socket.io auth middleware, no user found with JWT\'s user id');
      return next (new Error('Unauthorised'))};
    socket.user = buildUserInfo(userRow);
    return next();
  } catch (error) {
    console.log('error in socket.io mioddleware', error);
    return next(new Error("Error in socket.io auth middleware"));
  }
});

// normal socket.io code
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  console.log('connected userId:', socket.user.user_id);
  console.log('socket.io user:', socket.user);
  
  //listen for event called 'chat-message' received from client-side of socket
  socket.on("chat_message", (data) => {
    console.log("message received from client:", data);
    socket.emit("server_message", {
      ok: true,
      message: "message received, bro",
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected:", socket.id, reason);
  });
});

// repalce the app.listen with the http server listen.  app.listen() creates an http server under-the-hood anyway, but here is used an explicit http server in order to have so0cket.io running as well.
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
