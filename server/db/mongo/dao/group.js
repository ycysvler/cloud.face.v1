const moment = require('moment');
const getMongoPool = require('../pool.js');

module.exports = class GroupLogic {
    create(data) {
        return new Promise(async(resolve, reject) => {
            try {
                let Doc = getMongoPool().Group;
                let item = new Doc(data);
                item.updatetime = new moment();
                item.save(async(err, item) => {
                    if (!err) {
                        resolve(item);
                    } else {
                        reject(err);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    list(){
        return new Promise((resolve, reject) => {
            let faces = getMongoPool().Face;
            // 按group分组，计算没建索引的图片数量
            faces.aggregate([{ $match : { group_index : null, status:1 } },{$group:{_id:"$group_id", unindex:{$sum:1}}}]).exec((err, faces)=>{

                let doc = getMongoPool().Group;
                let results = [];
                doc.find({},{_id:0,group_id:1,name:1,desc:1,updatetime:1}).sort({_id:1}).exec(function (err, groups) {
                    if (err) {
                        reject(err);
                    } else {
                        for(let group of groups){
                            let result = {group_id:group.group_id, name:group.name, desc:group.desc, updatetime:group.updatetime, unindex:0};
                            results.push(result);
                            for(let face of faces){
                                if(result.group_id === face._id)
                                    result.unindex = face.unindex;
                            }
                        }
                        resolve(results);
                    }
                });

            });


        });
    }

    remove(data) {
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().Group;
            doc.deleteMany({group_id: data.group_id}, function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }

    removeByIds(ids) {
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().Group;
            doc.deleteMany({group_id: {$in: ids}}, function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }
};