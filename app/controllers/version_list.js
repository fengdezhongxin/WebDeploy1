var mongoose = require('mongoose'); //引入mongoose数据库模块 来连接数据库
const config = require('../../config/config');
mongoose.Promise = require('bluebird'); //mongoose 默认用的是promise 加上它不报错误
const dbUrl = 'mongodb://' + config.host + ':' + config.port + '/' + config.db; //连接的数据库
var db = mongoose.createConnection(dbUrl); //mongoose connect调用数据库 数据库名为imooc
var versionListSchema = new mongoose.Schema({
    versionNumber:String,
    explain: String,
    predictDate: Date,
    publishDate: Date,
    released: Number,
    promulgator: String,
    branches: Array,
    createDate:{
        type:Date,
        default:Date.now()
    }
});
var versionListModel = db.model('VersionList', versionListSchema, 'VersionList');
class versionList {
    constructor(info) {
        this.info = info;
    }
    save(fn) {
        let _versionList = new versionListModel(this.info);
        _versionList.save(function(error) {
            if(error) {
                console.log(error);
            } else {
                fn&&fn("success")
                console.log('saved OK!');
            }
        });
    }
    update(fn) {
        var options = {upsert : true};
        versionListModel.update(this.info.conditions, this.info.update, options, function(error){
            if(error) {
                console.log(error);
            } else {
                fn&&fn("success")
                console.log('update ok!');
            }
        });
    }
    find(fn) {
        versionListModel.find(this.info.options, function(error, result){
            if(error) {
                console.log(error);
            } else {
                fn&&fn(result)
                console.log('find ok!');
            }
        });
    }
    remove(fn) {
        versionListModel.remove(this.info.conditions, function(error){
            if(error) {
                console.log(error);
            } else {
                fn&&fn("success")
                console.log('delete ok!');
            }
        });
    }
}
module.exports = versionList;
 