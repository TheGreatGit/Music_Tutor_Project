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
import { generateRoomNumber } from "./utils/utilFunctions.mjs";


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
    credentials: true, // the server tells rthe browser that the browser is allowed to expose the response to broswer JS if the browser request sent credentials.
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

//----------------- SOCKET.IO CODE------------------------------

// create an explicit http server and give it the express() app variable as a request handler
const httpServer = http.createServer(app);

// create socket.io server instance and attach it to the http server; now the socket.io instance runs in the server on the same port and handles the websocket stuff while express handles normal http stuff
// even though socket.io mostly uses websockets, it starts off with http requests (e.g. the socket's handshake) so it needs CORS configuration
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
  // get logged-in-user/student's info in order to start room stuff
  const myUserId = socket.user?.user_id;
  const myName = socket.user?.display_name ?? `user ${myUserId}`;

  //create data store on socket for storing details of the 'other' user i.e. intended chat target i.e. tutor which will be stored during the 'join_room' event emitted by client-side ChatWindow
  // if the data is absent i.e. after initial login and prior to starting a webchat, initialise it as {}.
  socket.data.dmPeers = socket.data.dmPeers ?? {};
  
  console.log("socket connected:", socket.id, myUserId, myName);
  // console.log('socket is', socket);
  
  // Join a personalised room at the start so that a logged-in tutor-user cna be notified of student messages (this coce will run for ANY logged-in user type)
  // basically creating a personal room in the socket that can be used to notify the user of messages
  if(Number.isInteger(myUserId) && myUserId >0){
    socket.join(`user:${myUserId}`);
  }
  
  /*
    This 'join_room' event comes from the frontend's chatwindow component; it is triggered vaia a useEffect() hook as soon as the chatwindow is opened with
    clicking the 'message tutor' button in the FocusedtutorCard compomnent in the TutorProfilePage component.
    Once opened, The ChatWindow udeEffect() hook runs and emits its 'joon_room' event where it sends the other user id i.e. tutor id to the server.

    The server then takes this other user id/ tutor id and combines it with the student id from the socket.user object created in the above middleware
    to create a room number for the student and tutor to be able to join and chat in.

    First, on the server, the student joins this student/tutor room and then the server emits its own 'join_room' event where it sends
    the student/tutor room number to the front end so that the frontend can use state to store this in its room variable.
    The room variable will be used in the ChatWindow's 'chat_message' event which is emitted when a chat message is sent by the student
    The client's 'chst_message' event sends back the room number and the user's chat message
  */
  socket.on('join_room', async(payload)=>{
    try {
      const otherUserId = Number(payload?.otherUserId);

      if(!Number.isInteger(myUserId)|| myUserId <= 0){
        return socket.emit('chat_error', {message: 'Unauthorised'});
      }

      if(!Number.isInteger(otherUserId) || otherUserId <= 0){
        return socket.emit('chat_error', {message: 'Invalid otherUserId'});
      }

      if(myUserId === otherUserId){
        return socket.emit('chat_error', {message: 'Cannot chat with self'});
      }


      //--------ADD DB CODE LATER ------------------
      // tutor info has aleady been obtained by TutorProfilePage so just get chat history here by isong tutor user id and/or room number directly

      const room =`dm:${generateRoomNumber(myUserId, otherUserId)}`;
      // join this user to the student-tutor room
      socket.join(room);

      // store details of the other chat member in this room from the perspective of this socket user (i.e. the user id of the tutor the student has tried to emssage)
      socket.data.dmPeers[room] = otherUserId;
      console.log('socket peers',socket.data.dmPeers); // format of { 'room name': 'other user id'}
      console.log(`User ${myName} joined room ${room}`);

      // send room details to frontend-- the ChatWindow component is listening for the server-side 'join_room' event because it will use the room name for sending messages to the server
      socket.emit('join_room', {room});
    } catch (error) {
      console.log('socket.io join room error', error);
      socket.emit('chat_error', {message: 'Failed to join room :('});
    }
  });

  //listen for event called 'chat-message' received from client-side of socket
  socket.on("chat_message", async(payload) => {
    console.log("message received from client:", payload);
    try {
      const room = payload?.room;
      const text = String(payload?.text ?? "").trim(); // casting to string not strictly necessary but do it for safety

      if(!room || typeof room !== "string"){
        return socket.emit('chat_error', {message: "Missing room"});
      }
      if(!text) return;

      if(!socket.rooms.has(room)){
        return socket.emit('chat_error', {message: 'Not in the room'});
      }

      // -------- add DB code to save chat and message details to server and then return DB info to gather info for sending to frontend in the below variable
      const out = {
        room,
        text,
        fromUserId: myUserId,
        fromName: myName,
        sentAt: new Date().toISOString()
      }

      // use io.to() rather than socket.to() in order to broascast the data from the 'out' object to both parties in the room
      io.to(room).emit('chat_message', out);

      // notify other user via their personal room that was created after they logged in
      const recipientUserId = socket.data.dmPeers?.[room]; // this data was added to the socket instance in the socket.on('join_room) event listener above
      if(Number.isInteger(recipientUserId) && recipientUserId >0){
        io.to(`user:${recipientUserId}`).emit('incoming_chat', {
          room, // room should be used later so the ChatWIndow component can  use it to get chat history from DB
          fromUserId: myUserId,
          fromName: myName,
          preview: text.slice(0,120),
          sentAt: out.sentAt // re-use out object's sent at so that you don't get even a small time-drift that could occur by creating a new Date object here.
        });
      }

      console.log(`message in room ${room} from ${myName}: ${text}`);

    } catch (error) {
      console.log('chat_message_error:', error);
      socket.emit('chat_error', {message: 'Failed to send message'});
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected:", socket.id, reason);
  });
});

// express global error handler
app.use(GlobalErrorHandler);

// repalce the app.listen with the http server listen.  app.listen() creates an http server under-the-hood anyway, but here is used an explicit http server in order to have so0cket.io running as well.
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
