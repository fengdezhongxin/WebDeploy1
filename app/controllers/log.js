const mongoose = require('mongoose'); //引入mongoose数据库模块 来连接数据库
const logModel = require('../models/log'); //把模型加载进来\
const fs = require('fs');
class log {
    constructor(info) {
        this.file = info.fileName;
        this.item = info.item;
    }
    save() {
        fs.appendFile(this.file, ';' + JSON.stringify(this.item), (err) => {
            if (err) throw err;
        });

        let _log = new logModel(this.item);
        _log.save(function(err, movie) {
            if (err) {
                console.log(err);
            }
        });
    }

    ready() {
        fs.readFile(this.file, 'utf8', (err, data) => {
            if (err) throw err;
            console.log(data.split(";")[1]);
        });
    }
}
module.exports = log;