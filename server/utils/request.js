const request = require('request');

module.exports = (options)=>{
    return new Promise((resolve, reject) => {
        request(options, (err, res, body)=>{
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        })
    });
};