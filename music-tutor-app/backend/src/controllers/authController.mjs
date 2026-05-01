import { signUserToken, verifyToken } from "../services/tokenService.mjs";
import {
  buildUserInfo,
  findUserByEmail,
  findUserByUserId,
  validatePassword,
} from "../services/userService.mjs";
import { cookieOptions, setAuthCookie } from "../utils/cookie.mjs";

// handler for login route (works for any user as it just requires an email and password)
export const login = async (req, res, next) => {
  try {
    // get user input
    const { email, password } = req.body || {};
    // console.log(email, password);

    if (!email || !password) {
      res.status(400);
      return next(new Error("Provide all required fields"));
    }

    const lowerCasedEmail = email.toLowerCase().trim();
    // find user in DB
    const user = await findUserByEmail(lowerCasedEmail); // will return a matching  DB row from APP_USERS, STUDENTS, TUTORS, AND ROLE tables as an object. It will include entire row including password
    if (!user) {
      res.status(401);
      return next(new Error("Invalid credentials"));
    }

    // if matching email found, check password in result
    const valid = await validatePassword(password, user.password_hash);
    if (!valid) {
      res.status(401);
      return next(new Error("Invalid credentials"));
    }

    // build user info to be sent to frontend for rendering
    const strippedUser = buildUserInfo(user); // will have {user_id, role, first_name, last_name, email, student/tutor/admin_id}

    //create JWT with user id as payload -CONTAINS ONLY USER_ID AND NO OTHER USER DATA
    const token = signUserToken(strippedUser.user_id);
    //add token to cookie
    setAuthCookie(res, token);

    // alias strippedUser as user because frontend will use {user} for rendering
    return res.status(200).json({ user: strippedUser });
  } catch (error) {
    // receives errors passed in to next() in above code as well as any other errors e.g. connection issues beofre sql can run
    console.error("Login error: ", error);
    // pass to global error handler
    return next(error);
  }
};

// handler for logout
export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions); // to ensure deletion of the cookie, clearCookie() method must be supplied with the same options as the cookie was when it was created
  return res.status(200).json({ message: "Logged out successfully" });
};

// handler for getting current user. This is used so frontend can rebuild user after the app's state is reset to defaults on full page reload
export const getCurrentUser = async (req, res) => {
  try {
    const token = req?.cookies?.token;

    // amended this code so that absence of a token does not throw an error
    if (!token) {
      res.status(401);
      return res.status(401).json({ user: null, message: "Not authenticated" });
    }

    const decoded = verifyToken(token);
    const user = await findUserByUserId(decoded.userId);

    if (!user) {
      return res.status(401).json({ user: null, message: "User not found" });
    }
    const strippedUser = buildUserInfo(user);
    return res.status(200).json({ user: strippedUser });
  } catch (error) {
    console.log("error in 'getCurrentUser' handler", error);
    return res
      .status(401)
      .json({ user: null, message: "invalid or expored token" });
  }
};
