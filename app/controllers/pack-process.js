let Config = require('../../config/config'); //引用全局配置
let exec = require('child_process').exec;  //命令行所需
let copyFile = require('./copy'); //复制文件
let path = require("path");
let packData = {}; //需要打包的数据
/**
 * [updateSvn 更新SVN]
 * @param  {[type]} resolve [description]
 * @param  {[type]} reject  [description]
 * @return {[type]}         [description]
 */
exports.updateSvn = function(resolve, reject) {
    console.log("正在更新SVN");
    exec('TortoiseProc.exe /command:update /path:"' + Config.SVN_PATH + '" /closeonend:1', function(err, out) {
        if (!err) {
            console.log("SVN更新完成");
            resolve();
        } else {
            console.log("SVN更新失败");
            reject();
        }
    });
}
/**
 * [findFiles 查找文件]
 * @param  {[type]} resolve [description]
 * @param  {[type]} reject  [description]
 * @return {[type]}         [description]
 */
exports.findFiles = function(resolve, reject) {
    console.log("正在查找文件");
    packData.code.forEach(function(e,i){
        packData.code[i] = path.join(Config.SVN_PATH,"/branches/zlcft-main" + e);
    });
    let from = packData.code; //文件列详细地址
    let to = path.join(Config.uploadPath,packData.user+"/code/"); //查找的目录地址    
    copyFile({
            //读目录
            from:from,
            //写目录
            to:to,
            //完成回调
            callback:function(){  
                resolve();
                console.log("文件查找完成");
            },
            //相同几次算完成
            eqCount:5 
    });    
}

/**
 * [encrypt 加密文件]
 * @param  {[type]} resolve [description]
 * @param  {[type]} reject  [description]
 * @return {[type]}         [description]
 */
exports.encrypt = function(resolve, reject) {
    console.log('步骤三：执行');
    resolve();
}

/**
 * [pack 打包]
 * @param  {[type]} resolve [description]
 * @param  {[type]} reject  [description]
 * @return {[type]}         [description]
 */
exports.pack = function(resolve, reject) {
    console.log('步骤四：执行');
    resolve();
}

exports.sendEmail = function(resolve, reject){
    console.log('步骤五：执行');
    resolve();
}
/**
 * [packProgress 打包流程]
 * @return {[type]} [description]
 */
exports.packProgress = function(packMethod,funName,obj){
    packData = obj;
    var str = 'new Promise(function(resolve,reject){resolve()})';	 		
	for(var i=0;i<packMethod.length;i++){
		 if(i==packMethod.length){
			str += '.then(function(val) {';
            str += '    return val;';
            str += '});';
		 }else{
            str += '.then(function(val) {';
            str += '    return new Promise('+ funName + '.'+ Config.plan.type[packMethod[i]].name +');';
            str += '})';
		 }
	}
	return str	
}