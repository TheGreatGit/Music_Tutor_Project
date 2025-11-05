import { pool } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";

// get the pre-written SQL query as a string
const getAllTutorsQuery = loadSql("tutors/getAllTutors.sql");

export const getAllTutors = async(req, res) => {
    try {
        // DB query is asynchronous so needs await
        const {rows} = await pool.query(getAllTutorsQuery);
        // res.json is synchronous so no 'await' needed
        res.json(rows);
    } catch (error) {
        console.error("Databse error: ", error);
        res.status(500).json({message: 'Database error'});
    }
}