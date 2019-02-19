/**
 * Created by VLER on 2018/10/25.
 */
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const unzip = require("unzip");
const moment = require('moment');
const request = require('request');
const requestEx = require('../../utils/request');
const tools = require('../../utils/tools');
const Config = require('../../config/config');
const uploadFile = require('../../utils/upload');
const FaceLogic = require('../../db/mongo/dao/face');
const UserLogic = require('../../db/mongo/dao/user');

const logic = new FaceLogic();
const userLogic = new UserLogic();

module.exports = function (router) {

    router.post('/faceset/face/search64', async (ctx) => {
        let ok = tools.required(ctx, ["group_id"]);
        if (ok) {
            let group_id = ctx.request.query['group_id'];
            let base64 = ctx.request.body['base64'];

            console.log(`path :\t\x1B[33m/search \t \x1B[0m \x1B[36m { group_id : ${group_id} } \x1B[0m`);

            let serverFilePath = path.join(__dirname, '../../public/images/' + Date.now() +'.png');

            var dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象，
            fs.writeFile(serverFilePath,dataBuffer,async function(err){//用fs写入文件
                if(err){
                    console.log(err);
                }else{
                    console.log('写入成功！', serverFilePath);
                    // 计算图片特征, python 那边计算特征
                    let options = {
                        method: 'get',
                        url: `${Config.server.service.uri}/query?group_id=${group_id}&image_path=${serverFilePath}`,
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        },
                        body: {}
                    };

                    let r = await requestEx(options);
                    fs.unlink(serverFilePath,()=>{});

                    ctx.body = {error_code: 0, data: r};
                }
            });


        }
    });
// 人脸搜索
    router.post('/faceset/face/search', async (ctx) => {
        let ok = tools.required(ctx, ["group_id"]);
        if (ok) {
            let error_code = 0;
            let data = null;
            let error_msg = null;

            let group_id = ctx.request.query['group_id'];

            console.log(`path :\t\x1B[33m/search \t \x1B[0m \x1B[36m { group_id : ${group_id} } \x1B[0m`);

            let serverFilePath = path.join(__dirname, '../../public');

            // 上传文件事件
            let f = await uploadFile(ctx, {
                fileType: 'images',          // 上传之后的目录
                path: serverFilePath
            });

            // 计算图片特征, python 那边计算特征
            let options = {
                method: 'get',
                url: `${Config.server.service.uri}/query?group_id=${group_id}&image_path=${f.path}`,
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: {}
            };

            let r = await requestEx(options);
            fs.unlink(f.path,()=>{});

            ctx.body = {error_code: 0, data: r};
        }
    });

    // 添加人脸
    router.post('/faceset/face/batch', async (ctx) => {
        let ok = tools.required(ctx, ["group_id"]);
        if (ok) {
            let error_code = 0;
            let data = null;
            let error_msg = null;

            let group_id = ctx.request.query['group_id'];

            console.log(`path :\t\x1B[33m/faceset/face/add \t \x1B[0m \x1B[36m { group_id : ${group_id}  \x1B[0m`);

            let serverFilePath = path.join(__dirname, '../../public');

            // 上传文件事件
            let f = await uploadFile(ctx, {
                fileType: 'zip',          // 上传之后的目录
                path: serverFilePath
            });

            // 文件名
            let filename = path.basename(f.path);
            // 文件内容
            let chunk = fs.readFileSync(f.path);

            let zipath = path.join(__dirname, '../../public/unarchive')+"";
            fs.createReadStream(f.path).pipe(unzip.Extract({ path:zipath})).on('close',()=>{
                let pa = fs.readdirSync(zipath);

                pa.forEach(async function(dir){
                    let userCount = await userLogic.exist(group_id, dir);


                    if(userCount.total === 0){
                        await userLogic.create({group_id:group_id, user_id:dir, desc:""});
                    }

                    let info = fs.statSync(zipath+"/"+dir);
                    if(info.isDirectory()){
                        let files = fs.readdirSync(zipath+"/"+dir);
                        files.forEach( async (file)=>{
                            let image = zipath+"/"+dir + "/" + file;

                            if( path.extname(file) === ".jpg" || path.extname(file) === ".png"){
                                // 文件内容
                                let chunk = fs.readFileSync(image);
                                // 消息体
                                let body = {"user_id":dir, "group_id":group_id, "source":chunk, "status":0 };

                                // 添加数据
                                let data = await logic.create(body).catch(function (err) {
                                    error_code = err.code;
                                    error_msg = err.errmsg;
                                });
                                // 计算图片特征, python 那边计算特征
                                let options = {
                                    method: 'get',
                                    url: `${Config.server.service.uri}/singlefeature?face_id=${data['_id']}`,
                                    json: true,
                                    headers: {
                                        "content-type": "application/json",
                                    },
                                    body: {}
                                };
                                console.log('single feature', await requestEx(options));
                            }
                            // 删掉上传的临时文件
                            fs.unlink(image,()=>{});
                        });
                    }else{
                        //console.log("file: "+ele)
                    }
                });
            });

            fs.unlink(f.path,()=>{});


            // 消息体
            /*
            let body = {"user_id":user_id, "group_id":group_id, "source":chunk, "status":0 };
            // 添加数据
            data = await logic.create(body).catch(function (err) {
                error_code = err.code;
                error_msg = err.errmsg;
            });

            // 删掉上传的临时文件
            fs.unlink(f.path,()=>{});

            // 计算图片特征, python 那边计算特征
            let options = {
                method: 'get',
                url: `${Config.server.service.uri}/singlefeature?face_id=${data['_id']}`,
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: {}
            };



            request(options, function (err, res, body) {
                if (err) {
                    console.log(err);
                }else{
                    console.log(body);
                }
            });
             */
            ctx.body = error_code ?
                {error_code: error_code, error_msg} :
                {error_code: error_code, data: {face_token:data}};
        }
    });

    // 添加人脸
    router.post('/faceset/face/add', async (ctx) => {
        let ok = tools.required(ctx, ["group_id", "user_id"]);
        if (ok) {
            let error_code = 0;
            let data = null;
            let error_msg = null;

            let group_id = ctx.request.query['group_id'];
            let user_id = ctx.request.query['user_id'];

            console.log(`path :\t\x1B[33m/faceset/face/add \t \x1B[0m \x1B[36m { group_id : ${group_id} , user_id : ${user_id} \x1B[0m`);

            let serverFilePath = path.join(__dirname, '../../public');

            // 上传文件事件
            let f = await uploadFile(ctx, {
                fileType: 'images',          // 上传之后的目录
                path: serverFilePath
            });

            // 文件名
            let filename = path.basename(f.path);
            // 文件内容
            let chunk = fs.readFileSync(f.path);
            // 消息体
            let body = {"user_id":user_id, "group_id":group_id, "source":chunk, "status":0 };
            // 添加数据
            data = await logic.create(body).catch(function (err) {
                error_code = err.code;
                error_msg = err.errmsg;
            });

            // 删掉上传的临时文件
            fs.unlink(f.path,()=>{});

            // 计算图片特征, python 那边计算特征
            let options = {
                method: 'get',
                url: `${Config.server.service.uri}/singlefeature?face_id=${data['_id']}`,
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: {}
            };



            request(options, function (err, res, body) {
                if (err) {
                    console.log(err);
                }else{
                    console.log(body);
                }
            });

            ctx.body = error_code ?
                {error_code: error_code, error_msg} :
                {error_code: error_code, data: {face_token:data._id}};
        }
    });

    // 获取人脸列表
    router.get('/faceset/face/getlist', async(ctx) => {
        let ok = tools.required(ctx, ["group_id", "user_id"]);
        if (ok) {
            let error_code = 0;
            let data = null;
            let error_msg = null;

            let group_id = ctx.request.query['group_id'];
            let user_id = ctx.request.query['user_id'];

            data = await logic.list(group_id,user_id).catch(function (err) {
                error_code = err.code;
                error_msg = err.errmsg;
            });

            ctx.body = error_code ?
                {error_code: error_code, error_msg} :
                {error_code: error_code, face_list: data};
        }
    });

    // 获取人脸图像
    router.get('/faceset/face/source/:id', async (ctx) => {
        let ok = tools.required(ctx, ['id']);
        if (ok) {
            let id = ctx.params.id;
            console.log(`path :\t\x1B[33m/catalog/source/:id \t \x1B[0m \x1B[36m { id : ${id} }\x1B[0m`);

            let item = await logic.single(id);
            ctx.body = item.source;
        }
    });

    router.get('/faceset/face/gsource/:group_id/:index', async (ctx) => {
        let ok = tools.required(ctx, ['group_id','index']);
        if (ok) {
            let group_id = ctx.params.group_id;
            let index = ctx.params.index;
            console.log(`path :\t\x1B[33m/catalog/source/:id \t \x1B[0m \x1B[36m { group_id : ${group_id} }\x1B[0m`);

            let item = await logic.index(group_id, index);
            ctx.body = item.source;
        }
    });

    /*
    * 删除分组
    * { "group_id":"1" }
    * */
    router.delete('/faceset/face/delete', async(ctx) => {
        let ok = tools.required(ctx, ["face_token"]);
        if (ok) {
            let error_code = 0;
            let data = null;
            let error_msg = null;

            let face_token = ctx.request.query['face_token'];

            data = await logic.remove(face_token).catch(function (err) {
                error_code = err.code;
                error_msg = err.errmsg;
            });

            ctx.body = error_code ?
                {error_code: error_code, error_msg} :
                {error_code: error_code};
        }
    });
};
