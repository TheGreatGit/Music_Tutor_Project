import { signUserToken } from "../services/tokenService.mjs";
import {
  createNewUser,
  findUserByEmail,
  validatePassword,
} from "../services/userService.mjs";
import { cookieOptions, setAuthCookie } from "../utils/cookie.mjs";

// handler for the /register route
export const register = async (req, res, next) => {
  try {
    // get form data and use || {} to safely handle there being no req.body from client
    const { name, email, password } = req.body || {};

    //check if data missing and send error to global error handler
    if (!name || !email || !password) {
      res.status(400);
      return next(new Error("Provide required fields"));
    }

    // if data present, check if user already registered by email (emails are to be unique per user)
    // find user bhy email returns entire DB row if matched
    const userExists = await findUserByEmail(email);
    if (userExists) {
      res.status(400);
      return next(new Error("User already registered"));
    }

    // otherwise, create a new user- password is hashed via bcrypt in this function
    // the SQL query in createNewUser returns user's DB id and name and email.
    // User's DB id is returned so it can be used in the JWT for authentication
    const user = await createNewUser({ name, email, password });
    console.log("user from createNewUser() in register route,", user);

    // create a JWT with user's DB id as payload
    const token = signUserToken(user.id);
    // add JWT to cookie
    setAuthCookie(res, token);

    // send created user data -minus password- to frontend for confirmatory rendering
    res.status(201).json({ user });
  } catch (error) {
    console.error("Registration error: ", error);
    // pass to global error handler
    return next(error);
  }
};

// handler for login route
export const login = async (req, res, next) => {
  try {
    // get user input
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400);
      return next(new Error("Provide all required fields"));
    }

    // find user in DB
    const user = await findUserByEmail(email); // will return a matching  DB row as an object. It will include entire row including password
    if (!user) {
      res.status(400);
      return next(new Error("Invalid credentials"));
    }

    // if matching email found, check password
    const valid = await validatePassword(password, user.password);
    if (!valid) {
      res.status(400);
      return next(new Error("Invalid credentials"));
    }

    //create JWT with user id as payload
    const token = signUserToken(user.id);
    //add token to cookie
    setAuthCookie(res, token);

    // strip user password etc before sending details
    // in stripping, cant just use 'email' for field name as 'email' is a differnet variabel earlier in the code
    // to mitigate this, destructure the email from user but alias it as dbEmail
    // add this in to strippedUser
    const { id, name, email: dbEmail } = user;
    const strippedUser = { id, name, email: dbEmail }; // use the email:dbEmail form because we want the object to have the shape of {id,name,email} for frontend
    console.log("stripped user from DB in login route", strippedUser);

    // alias strippedUser as user because frontend will use {user} for rendering
    return res.json({ user: strippedUser });
  } catch (error) {
    console.error("Login error: ", error);
    // pass to global error handler
    return next(error);
  }
};

// handler for logout
export const logout = (req, res) => {
  res.clearCookie("token", { cookieOptions });
  return res.json({ message: "Logged out successfully" });
};

// handler for getting current user
export const getCurrentUser = (req, res, next) => {
  // current user should have been added to the request object by the 'protect' middleware
  try {
    if (!req.user) {
       res.status(401);
       return next(new Error("Not authenticated"));
    }
    return res.json(req.user);
  } catch (error) {
    // pass error to express general error handler
    return next(error);
  }
};
