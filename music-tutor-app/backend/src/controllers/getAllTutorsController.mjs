import { pool } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";

const getAllTutorsQuery = loadSql("tutors/getAllTutors.sql");
//console.log(getAllTutorsQuery);

export const getAllTutors = async(req, res) => {
    try {
        const {rows} = await pool.query(getAllTutorsQuery);
        res.json(rows);
    } catch (error) {
        console.error("Databse error: ", error);
        res.status(500).json({message: 'Database error'});
    }
}