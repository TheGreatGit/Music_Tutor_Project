import {Pool} from 'pg';
import dotenv from 'dotenv';

// load env variables locally
dotenv.config();

/* as per https://node-postgres.com/guides/project-structure, creating databse connection and query code in a file like this
  means that you can make central/global changes to the behaviour by making the change in this file ratehr than having
  to track down every route handler that makes a db query.
*/

// as per https://node-postgres.com/features/connecting
// Create a connection pool
// pool is used instead of client because client needs to open and close connection for each request whereas pool keeps open connections to be used when needed
// a pool allows multiple concurrent queries whereas a client connection allows only serial queries from the requesting source.
export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
});

pool.on('connect', ()=>{
    console.log('connected to DB');
    
});

pool.on('error', ()=>{
    console.log('Database error');
    
})
// useful custom wrapper function so you don't have to connect to pool in other files
// pool.query returns a promise so whatever calls it , e.g. route handler middleware, should use async/await
// in pool.query() text is just sql query text and 'params' is an array of parameters inserted into the $1,2 etc placeholders in the text query
export const query = (text, params) => pool.query(text, params); // pool.query handles the opening and closing of inidivdual connections