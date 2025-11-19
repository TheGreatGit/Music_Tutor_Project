import { query } from "../config/pool.mjs"
import { loadSql } from "../queries/loadSql.mjs"

const instrumentQueryString = loadSql('getInstruments.sql');
console.log(instrumentQueryString);
const cityQueryString = loadSql('getCities.sql');
console.log('city query string:', cityQueryString);


export const  getInstruments = async (req,res, next)=>{
    try {
        const {rows} = await query(instrumentQueryString);
        //console.log(rows);
        return res.json(rows)
        
    } catch (error) {
        console.error('Error in getInstruments: ', error);
        // pass error out to global handler
        next(error);
    }
}

export const getCities = async(req,res,next)=>{
    try {
        const {rows} = await query(cityQueryString);
        //console.log(rows);
        return res.json(rows);
        
    } catch (error) {
        console.error('error in get cities: ', error);
        next(error);
    }
}