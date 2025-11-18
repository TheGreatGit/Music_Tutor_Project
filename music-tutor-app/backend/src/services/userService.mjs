import { query } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";
import bcrypt from "bcrypt";

export const findUserByEmail = async (email) => {
  const queryString = loadSql('checkEmails.sql');
  console.log(queryString);
  
  const { rows } = await query(queryString, [email]);
  console.log(rows);
  
  // rows is an array of all rows matched by the query where each row is an individual object
  // console.log('find user by email result: ', rows[0]);

  return rows[0] || null;
};

export const createNewUser = async ({ firstName, lastName, email, password, phoneNumber }) => {
  // hash the supplied password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user in DB and get info returned
  const { rows } = await query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [name, email, hashedPassword]
  );
  return rows[0];
};

export const validatePassword = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};

export const findUserById = async (id) => {
  const { rows } = await query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [id]
  );
  return rows[0] || null;
};
