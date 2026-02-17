import { verifyToken } from "../services/tokenService.mjs";
import { buildUserInfo, findUserByUserId } from "../services/userService.mjs";

// custom middleware to protect routes from unauthorised users -CURRENTLY UNUSED
export const protect = async (req, res, next) => {
  // check for JWT called token -as per signUserToken function
  const token = req.cookies?.token;
  if (!token) {
    // error for error handler in express
    res.status(401);
    return next(new Error("Not authenticated- no token provided")); // use return to stop the code below from running
  }

  let payload;
  try {
    payload = verifyToken(token); // will return payload on success or throw error on fail. payload currently looks like {userId, iat, exp}
  } catch (error) {
    res.status(401);
    return next(new Error("Invalid or expired token")); //again use return to prevent further code running
  }

  // get user from DB using id stored in payload
  try {
    const user = await findUserByUserId(payload.userId);
    if (!user) {
      res.status(401);
      return next(new Error("User not found"));
    }

    // add user details (id, name, email address as per findUSerByUserId) to req object and pass on to next middleware in chain
    req.user = buildUserInfo(user);
    // console.log(req.user);
    return next();
  } catch (err) {
    // pass other errors out to error handler in express
    return next(err);
  }
};
