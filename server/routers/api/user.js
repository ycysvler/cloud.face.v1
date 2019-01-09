/**
 * Created by VLER on 2018/10/25.
 */
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const request = require('request');
const tools = require('../../utils/tools');
const Config = require('../../config/config');
const UserLogic = require('../../db/mongo/dao/user');
const logic = new UserLogic();

module.exports = function (router) {

    /*
     * 添加用户
     * { "group_id":"22", "user_id":"09", "desc":"真厉害" }
     * */
    router.post('/faceset/user/add', async(ctx) => {
        let ok = tools.required(ctx, ["group_id", "user_id"]);
        if (ok) {
            let error_code = 0;
            let data = null;
            let error_msg = null;

            data = await logic.create(ctx.request.body).catch(function (err) {
                error_code = err.code;
                error_msg = err.errmsg;
            });

            ctx.body = error_code ?
                {error_code: error_code, error_msg} :
                {error_code: error_code, data: data};
        }
    });

    /*
    * 获取用户列表
    * http://localhost:4001/rest/face/v3/faceset/group/getusers?group_id=22&start=0&length=4
    * */
    router.get('/faceset/group/getusers', async(ctx) => {
        let ok = tools.required(ctx, ["group_id"]);
        if (ok) {
            let error_code = 0;
            let data = null;
            let error_msg = null;

            let group_id = ctx.request.query['group_id'];
            let start = ctx.request.query['start'] ? parseInt(ctx.request.query['start']) : 0;
            let length = ctx.request.query['length'] ? parseInt(ctx.request.query['length']) : 10;

            data = await logic.list(group_id,start,length).catch(function (err) {
                error_code = err.code;
                error_msg = err.errmsg;
            });

            ctx.body = error_code ?
                {error_code: error_code, error_msg} :
                {error_code: error_code, user_id_list: data};
        }
    });

    /*
     * 删除用户
     * { "group_id":"1" }
     * */
    router.delete('/faceset/user/delete', async(ctx) => {
        let ok = tools.required(ctx, ["group_id","user_id"]);
        if (ok) {
            let error_code = 0;
            let data = null;
            let error_msg = null;

            data = await logic.remove(ctx.request.body).catch(function (err) {
                error_code = err.code;
                error_msg = err.errmsg;
            });
            ctx.body = error_code ?
                {error_code: error_code, error_msg} :
                {error_code: error_code};
        }
    });

    /*
    * 批量删除用户
    * {"group_id":"1", "user_ids":["1","2"]}
    * */
    router.delete('/faceset/user/deleteids', async(ctx) => {
        if (true) {
            let error_code = 0;
            let data = null;
            let error_msg = null;

            data = await logic.removeByIds(ctx.request.body.group_id,ctx.request.body.user_ids ).catch(function (err) {
                error_code = err.code;
                error_msg = err.errmsg;
            });

            ctx.body = error_code ?
                {error_code: error_code, error_msg} :
                {error_code: error_code};
        }
    });
};