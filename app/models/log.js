const mongoose = require('mongoose');
const logSchemas = require('../schemas/log'); //引入模式文件 拿到导出模块，可加后缀可不加
const log = mongoose.model('log', logSchemas); //编译生成 log模型 log 模型名字
module.exports = log //导出构造函数