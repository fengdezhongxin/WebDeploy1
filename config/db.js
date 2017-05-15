/*
 * 数据库连接配置模块 
 */
var config = require("./config");
var mongodb = require('mongodb');
var server = new mongodb.Server(config.host, config.port, {
	auto_reconnect: true
});
var db = new mongodb.Db(config.db, server, {
	safe: true
});

module.exports = db;