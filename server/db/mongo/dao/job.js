const moment = require('moment');
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
                let Doc = getMongoPool().Job;
                let item = new Doc(data);
                item.updatetime = new moment();
                item.status = 0;
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

    list(videoid){
        return new Promise((resolve, reject) => {
            let doc = getMongoPool().Job;
            doc.find({"videoid":videoid}).sort({time:1}).exec(function (err, Item) {
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
            let doc = getMongoPool().Job;
            getMongoPool().VideoKeyFrame.deleteMany({jobid: {$in: ids}},()=>{});

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