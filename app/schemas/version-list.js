var mongoose = require('mongoose');
var VersionListSchema = new mongoose.Schema({
    versionNumber: String,
    explain: String,
    publishDate:{
        type: Date,
        default: Date.now()
    },
    released:Number,
    promulgator:String,
    branches:Array,
    createDate:{
        type:Date,
        default:Date.now()
    }
});
VersionListSchema.pre('save', function(next) { // pre('save 的意思是 每次存储数据之前都调用这个方法
    next(); //需要调用next 才会将存储流程走下去
});
//只有model实例化之后 才会具有这个方法 
VersionListSchema.statics = {
    fetch: function(cb) {
        return this
            .find({})
            .sort('createDate') //按照更新时间排序 
            .exec(cb) //执行回调方法 
    },
    findById: function(id, cb) { //查询单条数据
        return this
            .findOne({ _id: id })
            .exec(cb)
    }
}
module.exports = VersionListSchema; //模式导出  模式创建完后要创建模型 model
