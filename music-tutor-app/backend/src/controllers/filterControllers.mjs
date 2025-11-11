import { pool } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";

// note that loadSql is pointing at src/queries, so you add route to sql files from there
const dbCitiesQueryString = loadSql('getCities.sql');
const dbInstrumentsQueryString = loadSql('getInstruments.sql');

export const getCitiesController = async(req, res)=>{
    try {
        const {rows} = await pool.query(dbCitiesQueryString);
        // console.log(rows);
        res.json(rows);
    } catch (error) {
        console.error('Database error in getCityController ', error);
        res.status(500).json({message:"database error"});
    }
}

export const getInstrumentsController = async(req, res) =>{
    try {
        const {rows} = await pool.query(dbInstrumentsQueryString);
        res.json(rows);
    } catch (error) {
        console.error('error in getInstrumentsController ', error);
        res.status(500).json({message:"database error"});
    }
}