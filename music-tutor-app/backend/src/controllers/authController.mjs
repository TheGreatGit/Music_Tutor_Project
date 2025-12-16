import { signUserToken } from "../services/tokenService.mjs";
import { findUserByEmail, validatePassword } from "../services/userService.mjs";
import { cookieOptions, setAuthCookie } from "../utils/cookie.mjs";

// handler for login route (works for any user as it just requires an email and password)
export const login = async (req, res, next) => {
  try {
    // get user input
    const { email, password } = req.body || {};
    // console.log(email, password);

    if (!email || !password) {
      res.status(400);
      return next(new Error('Provide all required fields'));
    }

    const lowerCasedEmail = email.toLowerCase().trim();
    // find user in DB
    const user = await findUserByEmail(lowerCasedEmail); // will return a matching  DB row from APP_USERS, STUDENTS, TUTORS, AND ROLE tables as an object. It will include entire row including password
    if (!user) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    // if matching email found, check password in result
    const valid = await validatePassword(password, user.password_hash);
    if (!valid) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    // begin to acquire user details dependant on their role
    const { user_id } = user;
    const userRole = user.role_name;
    let roleSpecificId;
    let firstName;
    let lastName;

    if (userRole === "tutor") {
      roleSpecificId = user.tutor_id;
      firstName = user.tutor_first_name;
      lastName = user.tutor_last_name;
    } else if (userRole === "student") {
      roleSpecificId = user.student_id;
      firstName = user.student_first_name;
      lastName = user.student_last_name;
    } else {
      // change to admin later
      roleSpecificId = null;
      firstName = null;
      lastName = null;
    }

    // create a stripped user object for frontend (i.e. minus password)
    const strippedUser = {
      user_id,
      role: userRole,
      firstName,
      lastName,
      email: user.email,
    };

    // add tutor or student id in
    if (userRole === "student") {
      strippedUser.student_id = roleSpecificId;
    }
    if (userRole === "tutor") {
      strippedUser.tutor_id = roleSpecificId;
    }
    console.log("stripped user from DB in login route", strippedUser);

    //create JWT with user id as payload -CONTAINS ONLY USER_ID AND NO OTHER USER DATA
    const token = signUserToken(user_id);
    //add token to cookie
    setAuthCookie(res, token);

    // alias strippedUser as user because frontend will use {user} for rendering
    return res.json({ user: strippedUser });
  } catch (error) {
    // receives errors passed in to next() in above code as well as any other errors e.g. connection issues beofre sql can run
    console.error("Login error: ", error);
    // pass to global error handler
    return next(error);
  }
};

// handler for logout
export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.json({ message: "Logged out successfully" });
};

// handler for getting current user - NOT CURRENTLY USED
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
