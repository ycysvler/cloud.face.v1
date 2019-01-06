const moment = require('moment');
const getMongoPool = require('../pool.js');

module.exports = class CatalogLogic {
    /**
     * 创建
     * @param  {object} data     信息
     * @return {object}          ？？
     */
    create(data) {
        return new Promise(async(resolve, reject) => {
            try {
                let Doc = getMongoPool().Catalog;
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

    list(){
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().Catalog;
            doc.find().sort({parentid:1}).exec(function (err, Item) {
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