var mongoose = require('mongoose');
var VersionListSchema = require('../schemas/version-List'); //引入模式文件 拿到导出模块，可加后缀可不加
var VersionList = mongoose.model('VersionList',VersionListSchema,"VersionList"); //编译生成 User模型 “User" 模型名字
module.exports = VersionList  //导出构造函数