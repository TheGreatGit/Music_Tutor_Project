import { query } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";
import bcrypt from "bcrypt";

export const findUserByEmail = async (email) => {
  const queryString = loadSql("checkEmails.sql");
  // console.log(queryString);

  const { rows } = await query(queryString, [email]);
  // rows is an array of all rows matched by the query where each row is an individual object
  // console.log('find user by email result: ', rows[0]);
  return rows[0] || null;
};

// the result of this function will get fed in to the buildUserInfo function  below
export const findUserByUserId = async (userId) => {
  const queryString = loadSql("findUserByUserId.sql");

  const { rows } = await query(queryString, [userId]);
  return rows[0] || null;
};

export const validatePassword = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};

/* produces object of the shape { 
user_id, role, first_name, last_name, email, display_name, tutor/student/admin_id}
*/
export const buildUserInfo = (user) => {
  // begin to acquire user details dependant on their role
  const { user_id } = user;
  const userRole = user.role_name;
  let roleSpecificId;
  let first_name;
  let last_name;

  if (userRole === "tutor") {
    roleSpecificId = user.tutor_id;
    first_name = user.tutor_first_name;
    last_name = user.tutor_last_name;
  } else if (userRole === "student") {
    roleSpecificId = user.student_id;
    first_name = user.student_first_name;
    last_name = user.student_last_name;
  } else if (userRole === "admin") {
    // change to admin later
    roleSpecificId = user.admin_id;
    first_name = user.admin_first_name;
    last_name = user.admin_last_name;
  } else {
    throw new Error("Unsupported role");
  }

  // create a stripped user info object to hide password. This object will be used in login handler, protect handler, and socket.io auth, but each handler will extract only its required fields
  // add a display name to be used in sokcet.io stuff later
  const userInfo = {
    user_id,
    role: userRole,
    first_name,
    last_name,
    email: user.email,
    display_name : `${first_name} ${last_name}`.trim()
  };

  // add tutor or student id in
  if (userRole === "student") {
    userInfo.student_id = roleSpecificId;
  }
  if (userRole === "tutor") {
    userInfo.tutor_id = roleSpecificId;
  }
  if (userRole === "admin") {
    userInfo.admin_id = roleSpecificId;
  }
  // console.log("stripped user from DB in login route", userInfo);

  return userInfo;
};
