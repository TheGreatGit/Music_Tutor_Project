import { pool } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";

// read-in sql file with parameterised query
const dbQueryString = loadSql("tutors/getTutors.sql");

// create the actual controller

export const getTutors= async (req, res)=>{
    try {
        // attempt to grab url query params from front-end (anything after the'?' in url)
        const {instrument, city} = req.query || {};
        const instrumentSearchParam = instrument ? `%${instrument.trim()}%` : null; // the '%' are added before and after the param as the actual sql query is using ILIKE rather than exact matching
        const citySearchParam = city ? `%${city.trim()}%` : null;
        
        // supply sql text then add search params in an array
        const {rows} = await pool.query(dbQueryString, [instrumentSearchParam, citySearchParam]);
        res.json(rows);
    } catch (error) {
        console.error("Database error (get tutors):", error);
        res.status(500).json({message:"database error"});
    }
}