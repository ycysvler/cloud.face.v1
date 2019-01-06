const config = require('../../config/config');
const mongoose = require('mongoose');

module.exports = class Schemas {
    constructor() {
        let uri = config.mongodb.uri + 'facedb';
        let conn = mongoose.createConnection(uri, config.mongodb.options);

        conn.then(function (db) {
            console.log("facedb mongodb connected!");
        });

        // 人像库
        this.catalogSchema = new mongoose.Schema({
            id: {type: String, index: {unique: true, dropDups: true}},      // 人像库ID
            parentid: {type: String},                                       // 上级ID
            name: String,                                                   // 目录名称
            desc: String,                                                   // 描述信息
            updatetime: {type: Date, index: true}                           // 更新时间
        });
        this.Catalog = conn.model('Catalog', this.catalogSchema);

        // 任务图像
        this.catalogImageSchema = new mongoose.Schema({
            cid: {type: String, index: true},                               // 人像目录ID
            name: String,                                                   // 人像图片名称
            source: Buffer,                                                 // 原始图像
            feature: Buffer,                                                // 人脸特征
            desc: String,                                                   // 描述信息
            updatetime: {type: Date, index: true}                           // 更新时间
        });
        this.CatalogImage = conn.model('CatalogImage', this.catalogImageSchema);


        // 视频库
        this.videoSchema = new mongoose.Schema({
            group: {type: String},                                          // 将来视频是分布式存储的，这个Group代表在哪
            name: {type: String},                                           // 视频名称
            fps: {type: Number},                                            // FPS
            length: {type: Number},                                         // 视频长度
            desc: String,                                                   // 描述信息
            updatetime: {type: Date, index: true}                           // 更新时间
        });
        this.Video = conn.model('Video', this.videoSchema);

        // 视频帧
        this.videoSourceFrameSchema = new mongoose.Schema({
            videoid: {type: String, index: true},                           // videoid
            frameno: {type: Number},                                        // 帧号
            time: {type: Number},                                           // 这一帧所在的时间：秒
            source: Buffer,                                                 // 原始大图
            faces: Array                                                    // [{trackid 轨迹，source 脸图，location 位置，feature 特征}]
        });

        this.videoSourceFrameSchema.index({videoid: 1, frameno: 1});
        this.VideoSourceFrame = conn.model('VideoSourceFrame', this.videoSourceFrameSchema);

        // 查询任务
        this.jobSchema = new mongoose.Schema({
            videoid: {type: String, index: true},                           // 视频ID
            name: {type: String},                                           // 视频名称
            status:{type:Number},                                           // 查询任务状态 0：新任务，1：计算中 2：完成 -1：失败
            cids:Array,                                                     // 犯罪分子头像ID
            desc: String,                                                   // 描述信息
            updatetime: {type: Date, index: true}                           // 更新时间
        });
        this.Job = conn.model('Job', this.jobSchema);

        // 关键帧
        this.videoKeyFrameSchema = new mongoose.Schema({
            jobid: {type: String, index: true},                             // JobID
            frameno: {type: Number},                                        // 帧号
            score:{type:Number},                                            // 相似度
            time: {type: Number},                                           // 这一帧所在的时间：秒
            res : Array                                                     // [frameid, trackid, cid 人物图像ID]
        });
        this.VideoKeyFrame = conn.model('VideoKeyFrame', this.videoKeyFrameSchema);
    }
};

