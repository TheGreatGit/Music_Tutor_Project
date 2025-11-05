import {readFileSync} from 'fs';
import {resolve} from 'path';

/*
    The resolve function creates filepaths on a relative basis from the Current Working Directory (CWD)
    The CWD will be where you run the node runtime process ('npm run dev') from (music_tutor_app/backend) - not necessarily the server.mjs file location

    It does not matter that within the .json file  the 'npm run dev' command runs the server.mjs file
     by the relative path to it from the json file i.e. './src/server.mjs.

*/
export function loadSql(fileName){
    // resolve is using the CWD + src/queries + fileName  when creating the file path
    // note that resolve adds the / to CWD so you don't write "/src/queries"

    const filePath = resolve("src/queries", fileName);
    console.log(filePath);
    // this is reading the Sql query file and returning ot as a string by specifiying utf8 encoding
    return readFileSync(filePath, "utf8");
}

 //console.log('cwd is: ', process.cwd());
