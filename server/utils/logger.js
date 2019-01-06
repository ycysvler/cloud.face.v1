/**
 * logger , 创建log实例
 * 日志循环写，每天1个最多3个
 *
 * Created by zhanghongqing on 2018/6/29.
 */
const bunyan = require('bunyan');                       // 引用日志组件
const path = require('path');                           // 基础库

/**
 * 获取log实例
 * @param  {string}     name    日志名称，同时用于日志文件名
 * @return {object}             日志对象
 */
module.exports = function(name, level){
    level = level ? level : 'info';

    const log = bunyan.createLogger(
        {
            name: name,
            streams: [
                // 输出到控制台
                {level: level, stream: process.stdout},
                // 循环输出到文件
                {
                    level: level,
                    path: path.join(__dirname, '../logs/'+name+'.log'),
                    type: 'rotating-file',
                    period: '1d',
                    count: 3
                }
            ]
        });

    return log;
};