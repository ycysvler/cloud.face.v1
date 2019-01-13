const config = require('../../config/config');
const mongoose = require('mongoose');

module.exports = class Schemas {
    constructor() {
        let uri = config.mongodb.uri + 'cloud_facedb';
        let conn = mongoose.createConnection(uri, config.mongodb.options);

        conn.then(function (db) {
            console.log("facedb mongodb connected!");
        });

        // 用户组
        this.groupSchema = new mongoose.Schema({
            group_id: {type: String, index: {unique: true, dropDups: true}},    // 分组ID
            name: String,                                                       // 名称
            desc: String,                                                       // 描述信息
            updatetime: Date                                                    // 更新时间
        });
        this.Group = conn.model('Group', this.groupSchema);

        // 用户
        this.userSchema = new mongoose.Schema({
            group_id: {type: String, index: true},                              // 分组ID
            user_id: {type: String, index: {unique: true, dropDups: true}},     // 用户ID
            desc: String,                                                       // 描述信息
            updatetime: {type: Date, index: true}                               // 更新时间
        });
        this.userSchema.index({group_id: 1, user_id: 1, updatetime: 1});
        this.User = conn.model('User', this.userSchema);

        // 人脸
        this.faceSchema = new mongoose.Schema({
            group_id: {type: String, index: true},                              // 分组ID
            user_id: {type: String, index: true},                               // 用户ID
            group_index: {type: Number, index: true},                           // 在分组内的排序，与生成索引有关系
            status: {type: Number, index: true},                                // 0:新图象，1：有特征，-1：已删除 , -2：计算特征失败
            source: Buffer,                                                     // 原始图像
            feature: Buffer,                                                    // 人脸特征
            updatetime: {type: Date, index: true}                               // 更新时间
        });
        this.faceSchema.index({group_id: 1, user_id: 1, status: 1, updatetime: 1});
        this.Face = conn.model('Face', this.faceSchema);
    }
};

