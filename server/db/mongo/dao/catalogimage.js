const moment = require('moment');
const mongoose = require('mongoose');
const getMongoPool = require('../pool.js');

module.exports = class CatalogImageLogic {
    /**
     * 创建
     * @param  {object} data     信息
     * @return {object}          ？？
     */
    create(data) {
        return new Promise(async(resolve, reject) => {
            try {
                let Doc = getMongoPool().CatalogImage;
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
            let doc = getMongoPool().CatalogImage;
            doc.findOne({"_id":mongoose.Types.ObjectId(id)}).exec(function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }

    list(cid){
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().CatalogImage;
            doc.find({cid:cid}).sort({updatetime:1}).exec(function (err, Items) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Items);
                }
            });
        });
    }

    removeByIds(ids) {
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().CatalogImage;
            doc.deleteMany({_id: {$in: ids}}, function (err, Item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Item);
                }
            });
        });
    }
};