var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs'); //引入可以加密密码的 称为加盐
var SALT_WORK_FACTOR = 10;
var UserSchema = new mongoose.Schema({
	name:{
		unique:true,
		type:String
	},
	trueName: String,
	password:String,
	roles: Array,
	phone: String,
	email: String,
	createTime:{
		type:Date,
		default:Date.now()
	}
});
UserSchema.pre('save',function(next) {// pre('save 的意思是 每次存储数据之前都调用这个方法
	var user = this;
	//bcrypt-nodejs 使用方法 可以https://www.npmjs.com/package/bcrypt-nodejs 查询
	//首先通过 bcryp.gentSalt 生成随机盐 这个方法 接收两个参数  第一个参数SALT_WORK_FACTOR为计算强度
	bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
		//salt拿到生成的盐
		if(err) return next(err); //如果有错误用next带到下一个流程去
		//如果拿到了盐用hash  三个参数,默认密码、加盐、回调方法
		bcrypt.hash(user.password,salt,null,function(err,hash){ //bcrypt-nodejs这一层多加个null 是表示进度的加调
			if(err) return next(err);
			user.password = hash;//将生成的密码保存
			next(); //进行下一步
		});
	});
	// next();//需要调用next 才会将存储流程走下去
});
//这个是方法
UserSchema.methods = {
	comparePassword:function(_password,cb){
		bcrypt.compare(_password,this.password,function(err,isMatch){
			if(err) return cb(err);
			cb(null,isMatch);
		});
	}
}
//只有model实例化之后 才会具有这个方法  statics是静态方法
UserSchema.statics = {
	fetch:function(cb) {
		return this
			.find({})
			.sort('createTime')//按照时间排序 
			.exec(cb)//执行回调方法 
	},
	findById:function(id,cb) {//查询单条数据
		return this
			.findOne({_id:id})
			.exec(cb)
	}
}
module.exports = UserSchema;//模式导出  模式创建完后要创建模型 model

