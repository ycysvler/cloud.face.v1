/**
 * 心跳
 *
 * Created by VLER on 2018/7/18.
 */
const moment = require('moment');

module.exports = function (router) {
    router.get('/heartbeat', async (ctx) => {
        ctx.body = {
            code: 200,
            date: moment().format("YYYY-MM-DD hh:mm:ss")
        };
    });
};