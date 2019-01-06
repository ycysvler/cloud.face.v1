/**
 * redis 消息中心
 *
 * Created by zhanghongqing on 2018/7/2.
 */
const Redis = require('ioredis');
const config = require('../config/config');
/**
 * 获取log实例
 * @param  {string}     name    日志名称，同时用于日志文件名
 * @return {object}             日志对象
 */
class MessageCenter {
    constructor() {
        this.redis = new Redis(config.redis);
        this.pub = new Redis(config.redis);

        this.redis.on('message', this.onMessage);

        this.redis.subscribe('Log',
            'Feature:BuildFeature',
            'State:StateChange',
            'HeartBeat:TimeChange',
            'Search:ProgressChange',
            'Search:Complete',
            (err, count) => {
                console.log('redis subscribe > ', err, count);
            }
        );
    }

    onMessage(channel, message) {
       if(channel === "HeartBeat:TimeChange"){

       }else{
           console.log('onMessage >',channel, message);
       }
    }

    publish(type, message){
        this.pub.publish(type, JSON.stringify(message));
    }
}

module.exports = new MessageCenter();