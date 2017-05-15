var mongoose = require('mongoose');
var UserSchema = require('../schemas/user'); //引入模式文件 拿到导出模块，可加后缀可不加
var User = mongoose.model('User',UserSchema); //编译生成 User模型 “User" 模型名字
module.exports = User  //导出构造函数