/**
 * 下载文件
 *
 * copy from yzhanghongqing on 2018/7/17.
 */
const exec = require('child_process').exec;

function download(url, target) {
    return new Promise((resolve, reject) => {
        let command = 'wget -x -O ' + target + ' ' + url;
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
module.exports = download;