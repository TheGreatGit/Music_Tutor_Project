import {readFileSync} from 'fs';
import {resolve} from 'path';

export function loadSql(fileName){
    const filePath = resolve("src/queries", fileName);
    console.log(filePath);
    return readFileSync(filePath, "utf8");
}