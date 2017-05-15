// var copy = require('./config/copy');
// copy({
//         //读目录
//         from:[
//             'D:/imooc/nodeweb/config/routes.js',
//             'D:/HUATA/trunk/zlcftajax'
//         ],
//         //写目录
//         to:'D:/tcj/',
//         //完成回调
//         callback:function(){  
//             console.log("end");
//         },
//         //相同几次算完成
//         eqCount:5 
// });
var fs = require("fs");
var path = require("path");
var eqCount = 0;
var a = 0; //读
var b = 0; //写
var c = 0; //相同
var t = null;
var completeCallback = null;
var errList = [];
var fileObj = [];
var file = function(fileArray) {
	fileObj = [];
	errList = [];
    this.from = fileArray.from;
    this.to = fileArray.to;
    this.callback = fileArray.callback;
    eqCount = fileArray.eqCount || 10;
    completeCallback = this.callback;
    _listFile(this.from, this.to);    
}
var _listFile = function(listArray, To) {	
    if (listArray.length > 0) {
        for (var e of listArray) {
            _findAllFile(e, To);
        }
    }	
	_setInterVal();       
}

function _findAllFile(dirPath, To) {
    fs.stat(dirPath, function(err, stats) {
        if (!stats) {
            errList.push(dirPath);
        }
        if (stats && stats.isFile()) {
            _mkdirs(dirPath, To, function(path) {
                _write(dirPath, path);
            });
        } else if (stats && stats.isDirectory()) {
            fs.readdir(dirPath, function(err, entires) {
                for (var idx in entires) {
                    var fullPath = path.join(dirPath, entires[idx]);
                    (function(fullPath) {
                        fs.stat(fullPath, function(err, stats) {
                            if (stats && stats.isFile()) {
                                // _file(fullPath);
                                _mkdirs(fullPath, To, function(path) {
                                    _write(fullPath, path);
                                });
                            } else if (stats && stats.isDirectory()) {
                                _findAllFile(fullPath, To);
                            }
                        })
                    })(fullPath);

                }
            });
        }
    })
}

function _write(dir, dis) {
    var obj = { dir: dir, dis: dis };
    fileObj.push(obj);
    a = fileObj.length;
}

function _wirteFile(arrayFile) {    
    var i = 0;
    if (arrayFile.length) {
        function callFile(val) {
            var readable, writable;
            readable = fs.createReadStream(arrayFile[i].dir);
            // 创建写入流
            writable = fs.createWriteStream(arrayFile[i].dis);
            // 通过管道来传输流
            readable.pipe(writable);
            readable.on("end", function() {
                if (i < arrayFile.length) {
                    callFile(arrayFile[i]);
                } else {
                    completeCallback && completeCallback({list:errList,count:arrayFile.length});
                    console.log("write end");
                }

            });
            i++;
        }
        callFile(arrayFile[0]);
    }else{
        completeCallback && completeCallback({list:errList,count:arrayFile.length});
    }
}

function _setInterVal() {
    if (t) {
        clearInterval(t);
    }
    t = setInterval(function() {
        b = fileObj.length;        
        if (a == b) {
            c++;
            console.log("第" + c + "次相等:文件总数"+b);
            if (c > 5) {
                clearInterval(t);
                _wirteFile(fileObj);
            }
        } else {
            console.log("没完成");
            c = 0;
        }
    }, 1000);
}

function _mkdir(pos, dirArray, _callback) {
    var len = dirArray.length;
    if (pos >= len) {
        _callback();
        return;
    }
    var currentDir = '';
    for (var i = 0; i <= pos; i++) {
        if (i != 0) currentDir += '/';
        currentDir += dirArray[i];
    }

    if (fs.existsSync(currentDir)) {
        // console.log(currentDir + '文件夹-已存在！');
        _mkdir(pos + 1, dirArray, _callback);
    } else {

        if (fs.mkdirSync(currentDir)) {
            // console.log(currentDir + '创建文件夹出错！');
        } else {
            // console.log(currentDir + '文件夹-创建成功！');
            _mkdir(pos + 1, dirArray, _callback);
        }
    }
}


function _mkdirs(dirpathFile, To, _callback) {

    var _path = path.parse(dirpathFile);
    var _m = _path.root;
    var dir = _path.dir.replace(_m, '');
   // dir = path.normalize(dir).replace(path.normalize("web/zlcft_web/"),"");
    var dispath = To + dir;
    var dispath = dispath.replace(/\\/gi, "/");
    var dispathFile = dispath + "/" + _path.base;
    var dirArray = dispath.split('/');

    fs.exists(dispath, function(exists) {
        if (!exists) {
            _mkdir(0, dirArray, function() {
                // console.log('文件夹创建完毕!准备写入文件!');
                _callback(dispathFile);
            });
        } else {
            // console.log('文件夹已经存在!准备写入文件!');
            _callback(dispathFile);
        }
    });
}
module.exports = file;
