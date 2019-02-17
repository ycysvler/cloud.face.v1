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
            doc.find({group_id: group_id, user_id: user_id, status: {$gt: -1}}, {_id: 1, status:1}).sort({updatetime:1}).exec(function (err, Item) {
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

    index(group_id, index){
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().Face;
            doc.findOne({"group_id":group_id, "group_index":index}).exec(function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }

    remove(face_token) {
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().Face;
            console.log(face_token);

            doc.update({"_id":mongoose.Types.ObjectId(face_token)},{$set:{status:-1}}, function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }

};