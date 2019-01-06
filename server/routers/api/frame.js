/**
 * Created by VLER on 2018/10/25.
 */
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const moment = require('moment');

const tools = require('../../utils/tools');
const VideoLogic = require('../../db/mongo/dao/video');
const VideoSourceFrameLogic = require('../../db/mongo/dao/videosourceframe');
const videoSourceFrameLogic = new VideoSourceFrameLogic();

module.exports = function (router) {
    // 获取原始帧列表
    router.get('/video/source/frame/:videoid', async (ctx) => {
        let ok = tools.required(ctx, ['videoid']);
        if (ok) {
            let videoid = ctx.params.videoid;
            let items = await videoSourceFrameLogic.list(videoid);
            ctx.body = {code: 200, data: items};
        }
    });

    // 获取原始帧数据
    router.get('/video/source/frame/info/:id', async(ctx)=>{
        let ok = tools.required(ctx, ['id']);
        console.log('ctx.params.id', ctx.params.id);
        if (ok) {
            let id = ctx.params.id;
            let item = await videoSourceFrameLogic.single(id);
            if(item === null){
                ctx.body =  {code: 404, data: item};
            }
            else{
                let data = {};
                data.source = item.source;
                data._id = item._id;
                data.frameno = item.frameno;
                data.time = item.time;
                data.videoid = item.videoid;
                data.faces = item.faces;

                data.source = 'data:image/png;base64,' + data.source.toString('base64');
                for(let f of data.faces){
                    f.source = 'data:image/png;base64,' + f.source.toString('base64');
                }
                ctx.body =  {code: 200, data: data};
            }
        }
    });

    router.get('/video/source/face/:id/:trackid', async (ctx) => {
        let ok = tools.required(ctx, ['id','trackid']);
        if (ok) {
            let id = ctx.params.id;
            let trackid = ctx.params.trackid;

            let item = await videoSourceFrameLogic.single(id);

            let buffer = null;

            for(let f of item.faces){
                if(f.trackid === trackid)
                    // 这里这个buffer老蛋疼了
                    // 因为schema声明了外面source的类型，所以source实际类型是buffer
                    // 但是这个face是Binary类型，要取一下buffer才跟source是一个东西
                    buffer = f.source.buffer;
            }
            ctx.body = buffer;
        }
    });

};
