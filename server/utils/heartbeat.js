const moment = require('moment');
const request = require('request');
const config = require('../config/config');
const CurrentLogic = require('../db/mongo/dao/current');

module.exports = class HeartBeat {
    constructor(interval, type) {
        let logic = new CurrentLogic();
        let current = logic.single();
        this.orgid = current.orgid;
        this.host = current.parentip;
        this.port = config.server.hamaster.port;
        this.interval = interval;
        this.type = type;
    }

    async run() {
        let self = this;

        let body = {"type": self.type, "orgid": self.orgid, "updatetime": moment()};

        let options = {
            method: 'post',
            url: `http://${self.host}:${self.port}/nsop/hamaster/api/heartbeat`,
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: body
        };

        request(options, function (err, res, body) {
            if (err) {
                console.log(err);
            } else {
                setTimeout(self.run.bind(self), self.interval);
            }
        });
    }
};