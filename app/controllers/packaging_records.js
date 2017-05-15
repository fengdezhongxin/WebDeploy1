var mongoose = require('mongoose'); //引入mongoose数据库模块 来连接数据库
const config = require('../../config/config');
mongoose.Promise = require('bluebird'); //mongoose 默认用的是promise 加上它不报错误
const dbUrl = 'mongodb://' + config.host + ':' + config.port + '/' + config.db; //连接的数据库
var db = mongoose.createConnection(dbUrl); //mongoose connect调用数据库 数据库名为imooc
var packagingRecordsSchema = new mongoose.Schema({
    author: String,
    branches: Array,
    startDate: Date,
    endDate: {
        type:Date,
        default:Date.now()
    },
    result : Number,
    listFile: Array
});
var packagingRecordsModel = db.model('PackagingRecords', packagingRecordsSchema, 'PackagingRecords');
class packagingRecords {
    constructor(info) {
        this.info = info;
    }
    save() {
        let _packagingRecords = new packagingRecordsModel(this.info);
        _packagingRecords.save(function(error) {
            if(error) {
                console.log(error);
            } else {
                console.log('saved OK!');
            }
            // 关闭数据库链接
            db.close();
        });
    }
    update() {
        var options = {upsert : true};
        packagingRecordsModel.update(this.info.conditions, this.info.update, options, function(error){
            if(error) {
                console.log(error);
            } else {
                console.log('update ok!');
            }
            //关闭数据库链接
            db.close();
        });
    }
    find() {
        packagingRecordsModel.find(this.info.options, function(error, result){
            if(error) {
                console.log(error);
            } else {
                console.log('find ok!');
            }
            //关闭数据库链接
            db.close();
        });
    }
    remove() {
        packagingRecordsModel.remove(this.info.conditions, function(error){
            if(error) {
                console.log(error);
            } else {
                console.log('delete ok!');
            }
            //关闭数据库链接
            db.close();
        });
    }
}
module.exports = packagingRecords;
 