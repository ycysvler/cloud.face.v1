let faceSchemas = require('./faceschemas');
const pool = new Map();

let getMongoPool = (dbname)=>{
    dbname = "facedb";

    if(!pool.has(dbname)){
        let schemas = new faceSchemas();
        pool.set(dbname, schemas);
    }
    let db = pool.get(dbname);
    return db;
}

module.exports = getMongoPool;