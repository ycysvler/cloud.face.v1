const moment = require('moment');
const mongoose = require('mongoose');
const getMongoPool = require('../pool.js');

module.exports = class FaceLogic {
    create(data) {
        return new Promise(async(resolve, reject) => {
            try {
                let Doc = getMongoPool().Face;
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

    list(group_id, user_id) {
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().Face;
            doc.find({group_id: group_id, user_id: user_id, status: {$gt: -1}}, {_id: 1, status:1}).exec(function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    let data = [];
                    for (let i of Item) {
                        data.push({face_token: i._id, status:i.status});
                    }
                    resolve(data);
                }
            });
        });
    }

    single(id){
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().Face;
            doc.findOne({"_id":mongoose.Types.ObjectId(id)}).exec(function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }

    remove(data) {
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().Face;
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
            let doc = getMongoPool().Catalog;
            doc.deleteMany({id: {$in: ids}}, function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }
};