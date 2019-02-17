/**
 * 一些常用的工具类
 *
 * Created by zhanghongqing on 2018/6/28.
 */

const logger = require('./logger');                             // 引用日志组建
const log = logger('utils');                                    // 日志
const fs = require('fs');
const os = require('os');
const exec = require('child_process').exec;

class tools {
    /*
    * 获取本机IP地址
    * */
    getIps(){
        //return "127.0.0.1";
        let ips = os.networkInterfaces();
        for(let key in ips){
            let p = ips[key];
            for(let i of p){
                if(i.family === 'IPv4' && i.address !== '127.0.0.1'){
                    return i.address;
                }
            }
        }
        return "";

        let IPv4s = [];
        let ent0 = os.networkInterfaces().en0 ? os.networkInterfaces().en0 : os.networkInterfaces().eth0;

        ent0 = ent0 ? ent0 : os.networkInterfaces().en1;

        ent0 = ent0 ? ent0 : os.networkInterfaces().eth1;

        let en0 = os.networkInterfaces().en0 ? os.networkInterfaces().en0:os.networkInterfaces().eth0;
        for(let item of en0){
            if(item.family === 'IPv4')
                IPv4s.push(item.address);
        }
        console.log('ipv4s', IPv4s);

        if(IPv4s.length > 0)
            return IPv4s[0];
        else
            return '';
    }

    /**
     * 检查必填参数
     * @param  {object} ctx     上下文
     * @param  {array} fields   需要的字段
     * @return {boolean}        是否全部满足
     */
    required(ctx, fields) {
        let ok = true, message = '';

        fields.forEach((item) => {                              // 循环判断field是否存在
            if ((ctx.request.body[item] === undefined) &&
                (ctx.request.query[item] === undefined) &&
                (ctx.params[item] === undefined)) {
                message += '[' + item + '] parameter is missing! ';
                ok = false;
            }
        });

        if (!ok) {
            ctx.status = 400;                                           // 设置状态吗
            ctx.body = {error_code: ctx.status, message: message};      // 设置消息体
            // 记录日志
            log.warn({'type': 'required', 'path': ctx.path, 'body': ctx.request.body}, message);
        }
        return ok;
    }

    /**
     * sleep
     * @param  {number} time  sleep时间
     */
    sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    async mkdir(dirpath){
        let ex = fs.existsSync(dirpath);
        if(!ex){
            fs.mkdirSync(dirpath);
        }
    }

    pm2(command) {
        return new Promise((resolve, reject) => {
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
}

module.exports = new tools();