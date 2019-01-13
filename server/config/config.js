/**
 * 全局配置文件
 *
 * Created by zhanghongqing on 2018/6/29.
 */

module.exports = {
    // mongodb 相关配置
    mongodb: {
        uri: 'mongodb://192.168.31.69/',
        options: {
            useNewUrlParser:true,
            auto_reconnect: true,
            poolSize: 10
        }
    },

    // server 相关配置
    server: {

        face: {
            port: 4001                          // 服务启动端口号
        },
        service: {
            uri: 'http://localhost:4003',   // python service 地址
        }
    }
};