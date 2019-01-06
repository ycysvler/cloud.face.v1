const moment = require('moment');
const mongoose = require('mongoose');
const getMongoPool = require('../pool.js');

module.exports = class Logic {
    /**
     * 创建
     * @param  {object} data     信息
     * @return {object}          ？？
     */
    create(data) {
        return new Promise(async(resolve, reject) => {
            try {
                let Doc = getMongoPool().VideoSourceFrame;
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
                reject(err)
            }
        });
    }

    single(id){
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().VideoSourceFrame;
            doc.findOne({"_id":mongoose.Types.ObjectId(id)}).exec(function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }

    list(videoid){
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().VideoSourceFrame;
            doc.find({"videoid":videoid},{time:1}).sort({frameno:1}).exec(function (err, Item) {
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
            let doc = getMongoPool().VideoSourceFrame;
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
