var mongoose = require('mongoose'); //引入mongoose数据库模块 来连接数据库
const config = require('../../config/config');
mongoose.Promise = require('bluebird'); //mongoose 默认用的是promise 加上它不报错误
const dbUrl = 'mongodb://' + config.host + ':' + config.port + '/' + config.db; //连接的数据库
var db = mongoose.createConnection(dbUrl); //mongoose connect调用数据库 数据库名为imooc
var versionCommitSchema = new mongoose.Schema({
    versionId:String,
    author: String,
    explain: String,
    branches: String,
    listFile: Array,
    createDate: {
        type: Date,
        default: Date.now()
    }
});
var versionCommitModel = db.model('VersionCommit', versionCommitSchema, 'VersionCommit');
class versionCommit {
    constructor(info) {
        this.info = info;
    }
    save() {
        let _versionCommit = new versionCommitModel(this.info);
        _versionCommit.save(function(error) {
            if (error) {
                console.log(error);
            } else {
                console.log('saved OK!');
            }
        });
    }
    update() {
        var options = {
            upsert: true
        };
        versionCommitModel.update(this.info.conditions, this.info.update, options, function(error) {
            if (error) {
                console.log(error);
            } else {
                console.log('update ok!');
            }
        });
    }
    find(fn) {
        console.log(this.info.options);
        versionCommitModel.find(this.info.options, function(error, result) {
            if (error) {
                console.log(error);
            } else {
                console.log('find ok!');
                console.log(result);
                fn&&fn(result)
            }
        });
    }
    remove(fn) {
        versionCommitModel.remove(this.info.conditions, function(error,result) {
            if (error) {
                console.log(error);
            } else {
                console.log('delete ok!');
                fn&&fn(result)
            }
        });
    }

}
module.exports = versionCommit;