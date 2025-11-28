import { signUserToken } from "../services/tokenService.mjs";
import { findUserByEmail, validatePassword } from "../services/userService.mjs";
import { cookieOptions, setAuthCookie } from "../utils/cookie.mjs";
import { query } from "../config/pool.mjs";

// handler for login route (works for any user as it just requires an email and password)
export const login = async (req, res, next) => {
  try {
    // get user input
    const { email, password } = req.body || {};
    console.log(email, password);

    if (!email || !password) {
      res.status(400);
      return next(new Error("Provide all required fields"));
    }

    // find user in DB
    const user = await findUserByEmail(email.toLowerCase()); // will return a matching  DB row from APP_USERS table as an object. It will include entire row including password
    if (!user) {
      res.status(400);
      return next(new Error("Invalid credentials"));
    }

    // if matching email found, check password in APP_USERS table
    const valid = await validatePassword(password, user.password_hash);
    if (!valid) {
      res.status(400);
      return next(new Error("Invalid credentials"));
    }

    // destructure user id  and role id and email
    // in destructure, cant just use 'email' for field name as 'email' is a differnet variabel earlier in the code
    // to mitigate this, destructure the email from user but alias it as dbEmail
    const { user_id, role_id, email: dbEmail } = user;

    // get user's role as string from DB
    const roleQuery = await query(
      `select role_name from roles where role_id = $1`,
      [role_id]
    );
    // console.log(roleQuery);
    if (!roleQuery.rows.length) {
      res.status(500);
      return next(new Error("USer Role not found"));
    }
    // use thr role-as-string to then search the correct DB i.e. tutors or students
    const roleAsString = roleQuery.rows[0].role_name;
    // console.log(roleAsString);
    const nameQuery = await query(
      `select first_name, last_name from ${
        roleAsString + `s`
      } where user_id = $1`,
      [user_id]
    );
    if (!nameQuery.rows.length) {
      res.status(500);
      return next(new Error("User name data not found"));
    }
    const nameRows = nameQuery.rows[0];

    // create a stripped user object for frontend (i.e. minus password)
    const strippedUser = {
      user_id,
      role: roleAsString,
      firstName: nameRows.first_name,
      lastName: nameRows.last_name,
      email: dbEmail,
    };
    console.log("stripped user from DB in login route", strippedUser);

    //create JWT with user id as payload -CONTAINS ONLY USER_ID AND NO OTHER USER DATA
    const token = signUserToken(user_id);
    //add token to cookie
    setAuthCookie(res, token);

    // alias strippedUser as user because frontend will use {user} for rendering
    return res.json({ user: strippedUser });
  } catch (error) {
    // receives errors passed in to next() in above code
    console.error("Login error: ", error);
    // pass to global error handler
    return next(error);
  }
};

// handler for logout
export const logout = (req, res) => {
  res.clearCookie("token",  cookieOptions );
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
