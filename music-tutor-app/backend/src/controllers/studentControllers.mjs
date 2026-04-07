import { loadSql } from "../queries/loadSql.mjs";
import { query } from "../config/pool.mjs";

const getStudentDashboardQuery = loadSql("getStudentDashboard.sql");

export const getMyStudentProfile = async (req, res, next) => {
  const userId = req.user?.user_id;
  const role = req.user?.role;

  if (!userId) {
    res.status(401);
    return next(new Error("No user id found for this user"));
  }

  if (role !== "student") {
    res.status(403);
    return next(new Error("No student profile found for this user"));
  }

  try {
    const dbRes = await query(getStudentDashboardQuery, [userId]);
    const user = dbRes?.rows?.[0];

    if (!user) {
      res.status(404);
      return next(new Error("Student profile not found"));
    }

    return res.json( user );
  } catch (error) {
    return next(error);
  }
};
