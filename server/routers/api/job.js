/**
 * Created by VLER on 2018/10/25.
 */
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const moment = require('moment');
const request = require('request');
const Config = require('../../config/config');
const tools = require('../../utils/tools');
const JobLogic = require('../../db/mongo/dao/job');
const VideoKeyFrameLogic = require('../../db/mongo/dao/videokeyframe');
const videoKeyFrameLogic = new VideoKeyFrameLogic();

const jobLogic = new JobLogic();

module.exports = function (router) {
    // 获取视频列表
    router.get('/job/:videoid', async(ctx) => {
        let ok = tools.required(ctx, ['videoid']);
        if (ok) {
            let videoid = ctx.params.videoid;

            let item = await jobLogic.list(videoid);
            if (item) {
                ctx.body = {code: 200, data: item};
            } else {
                ctx.body = {code: 404, data: item};
            }
        }
    });
    // 创建查询任务
    router.post('/job', async(ctx) => {
        let ok = tools.required(ctx, ["videoid", "name", "desc"]);
        if (ok) {
            let item = await jobLogic.create(ctx.request.body);

            // 查询任务
            let options = {
                method: 'get',
                url: `${Config.server.service.uri}/job?id=${item['_id']}`,
                json: true,
                headers: {
                    "content-type": "application/json",
                }
            };
            console.log(`call python :\t\x1B[33m${Config.server.service.uri}/job?id=${item['_id']} \t \x1B[0m \x1B[36m  \x1B[0m`);
            request(options, function (err, res, body) {
                if (err) {
                    console.log(err);
                }else{
                    console.log(`python response :\t\x1B[33m${Config.server.service.uri}/job \t \x1B[0m \x1B[36m ${body} \x1B[0m`);

                }
            });

            ctx.body = {code: 200, data: item};
        }
    });
    // 删除
    router.delete('/job', async(ctx) => {
        let items = await jobLogic.removeByIds(ctx.request.body);
        ctx.body = {code: 200};
    });

    // 获取关键帧列表
    router.get('/job/key/frame/:jobid', async(ctx) => {
        let ok = tools.required(ctx, ['jobid']);
        if (ok) {
            let jobid = ctx.params.jobid;
            let items = await videoKeyFrameLogic.list(jobid);
            ctx.body = {code: 200, data: items};
        }
    });

    // 添加关键帧
    router.post('/job/key/frame', async(ctx) => {
        let ok = tools.required(ctx, ["jobid", "frameno"]);
        if (ok) {
            let item = await videoKeyFrameLogic.create(ctx.request.body);
            ctx.body = {code: 200, data: item};
        }
    });
};
