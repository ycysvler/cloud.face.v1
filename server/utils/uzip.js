/**
 * 解压缩
 *
 * copy from yzhanghongqing on 2018/7/17.
 */

const exec = require('child_process').exec;

function uzip(zip, target){
    return new Promise((resolve, reject) => {
        let command = 'unzip -o '+ zip +' -d ' + target;
        exec(command, function (err, stdout, stderr) {
            if (err) {
                reject(stderr);
            }
            else {
                resolve(stdout);
            }
        });
    });
}
module.exports = uzip;