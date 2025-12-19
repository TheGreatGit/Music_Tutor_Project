import { query } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";
import bcrypt from "bcrypt";

export const findUserByEmail = async (email) => {
  const queryString = loadSql('checkEmails.sql');
  // console.log(queryString);
  
  const { rows } = await query(queryString, [email]);
  // rows is an array of all rows matched by the query where each row is an individual object
  // console.log('find user by email result: ', rows[0]);
  return rows[0] || null;
};


export const validatePassword = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};

