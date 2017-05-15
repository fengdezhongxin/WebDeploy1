var mongoose = require('mongoose'); //引入mongoose数据库模块 来连接数据库
const config = require('../../config/config');
mongoose.Promise = require('bluebird'); //mongoose 默认用的是promise 加上它不报错误
const dbUrl = 'mongodb://' + config.host + ':' + config.port + '/' + config.db; //连接的数据库
var db = mongoose.createConnection(dbUrl); //mongoose connect调用数据库 数据库名为imooc
var userSchema = new mongoose.Schema({
    name: {
        unique: true,
        type: String
    },
    trueName: String,
    password: String,
    roles: Array,
    phone: String,
    email: String,
    createTime: {
        type: Date,
        default: Date.now()
    }
});
var userModel = db.model('users', userSchema, 'users');
class User {
    constructor(info) {
        this.info = info;
    }
    save() {
        let _user = new userModel(this.info);
        _user.save(function(error) {
            if (error) {
                console.log(error);
            } else {
                console.log('saved OK!');
            }
        });
    }
    update(fn) {
        var options = {
            upsert: true
        };
        console.log(this.info);
        userModel.update(this.info.conditions, this.info.update, options, function(error) {
            if (error) {
                console.log(error);
            } else {
                console.log('update ok!');
                fn && fn();
            }
        });
    }
    find(fn) {
        userModel.find(this.info.options, function(error, result) {
            if (error) {
                console.log(error);
            } else {
                fn && fn(result[0]);
            }
        });
    }
    remove() {
        userModel.remove(this.info.conditions, function(error) {
            if (error) {
                console.log(error);
            } else {
                console.log('delete ok!');
            }
        });
    }

}
module.exports = User;