const moment = require('moment');
const getMongoPool = require('../pool.js');

module.exports = class UserLogic {
    create(data) {
        return new Promise(async(resolve, reject) => {
            try {
                let Doc = getMongoPool().User;
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

    list(group_id, start, length){
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().User;
            doc.count().exec(function (err, total) {
                doc.find({group_id:group_id},{_id:0,group_id:1,user_id:1,desc:1,updatetime:1}).sort({updatetime:-1}).limit(length).skip(start).exec(function (err, items) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({total, items});
                    }
                });
            });
        });
    }

    exist(group_id, user_id){
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().User;
            doc.count({group_id:group_id, user_id:user_id}).exec(function (err, total) {
                resolve({total});
            });
        });
    }

    remove(data) {
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().User;
            doc.deleteMany({group_id: data.group_id,user_id:data.user_id}, function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }

    removeByIds(group_id, ids) {
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().User;
            doc.deleteMany({group_id:group_id,user_id: {$in: ids}}, function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }
};