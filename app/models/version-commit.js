var mongoose = require('mongoose');
var VersionCommitSchema = require('../schemas/version-commit'); //引入模式文件 拿到导出模块，可加后缀可不加
var VersionCommit = mongoose.model('VersionCommit',VersionCommitSchema,'VersionCommit'); //编译生成 VersionCommit" 模型名字
module.exports = VersionCommit  //导出构造函数