var Q = require("q"),
    path = require("../../config/config");

var child_process = require('child_process');
var exec = require('child_process').exec,
    child;
var fs = require('fs');
var copy = require('./copy');
var log = require('./log');
var sendMail = require('./email');
var createTime = null;
var listFile = [];
var listSession = [];
var mes = "";
var socket = require("./socket");

//全局对象
global.packageState = 0;
class pack {
    constructor(pack) {
        this.req = pack.req;
        this.res = pack.res;
        this.next = pack.next;
        this.plan = pack.plan;
    }
    myPromise(req, res, next) {
        var df = Q.defer();
        //删除文件
        var str = path.SELECT_PATH + '' + req.session.user.name;
        str = str.replace(/\//g, "\\");
        exec('rd/s/q ' + str, function(err, out) {
            console.log(err);
            df.resolve({
                req: req,
                res: res,
                next: next
            });
        })
        return df.promise;
    }

    /**
     * 多线程（排队机制),
     * 返回 flag:2(标志位),mes:listSession.length - 1（排队人数）
     */
    ineUp(pack) {
        var isPk = false,
            df = Q.defer(),
            req = pack.req,
            res = pack.res,
            next = pack.next;
        for (var i = 0, len = listSession.length; i < len; i++) {
            if (listSession[i] === req.session.user.name) {
                isPk = true;
                break;
            }
        }
        if (!isPk) {
            listSession.push(req.session.user.name);
        }
        if (listSession.length > 1) {
            df.resolve(null);
            socket.sendMessage("ren" + listSession.length - 1);

        } else if (listSession[0] === req.session.user.name) {
            df.resolve({
                req: req,
                res: res,
                next: next
            });
        }
        return df.promise;
    }

    /**
     * 多线程（排队机制),
     * @params suc ,fail 函数
     * 返回 flag:1(标志位),mes:“svn更新失败”
     */
    svnUpdate(pack) {
        socket.sendMessage("svn更新");
        var df = Q.defer(),
            req = pack.req,
            res = pack.res,
            next = pack.next;
        exec('rd/s/q ' + path.SELECT_PATH + '' + req.session.user.name, function(err, out) {
            exec('TortoiseProc.exe /command:update /path:"' + path.SVN_PATH + '" /closeonend:1', function(err, out) {
                if (!err) {
                    socket.sendMessage("svn更新成功");
                    df.resolve(pack);
                } else {
                    listSession.shift();
                    df.resolve(null);
                    res.json({
                        flag: 1,
                        mes: "svn更新失败"
                    });
                }
            });
        });
        return df.promise;
    }

    /**
     * 筛选文件
     */
    packing(pack) {
        socket.sendMessage("筛选文件");
        var df = Q.defer(),
            req = pack.req,
            res = pack.res,
            next = pack.next;
        //请求参数
        var packagePath = req.query.packagePath,
            pagckageInfo = req.query.pagckageInfo,
            packageName = req.query.packageName;

        //合并完整路径
        for (var i = 0, len = packagePath.length; i < len; i++) {
            if (packagePath[i] !== "") {
                listFile[i] = path.SVN_PATH + "" + packagePath[i];
                listFile[i] = listFile[i].replace(/\\/g, "/")
            }
        }
        console.log(listFile);
        //帅选文件
        copy({
            //读目录
            from: listFile,
            //写目录
            to: path.SELECT_PATH + '' + req.session.user.name + "/",
            //完成回调
            callback: function(errArray) {
                if (errArray.list.length > 0) {
                    mes = "没有找到路径的文件" + errArray.list.toString();
                } else {
                    mes == '';
                }
                if (errArray.count == 0) {
                    listSession.shift();
                    res.json({
                        flag: 1,
                        mes: "打包失败"
                    });
                    df.resolve(null);
                } else {
                    socket.sendMessage("筛选文件成功");
                    df.resolve(pack);
                }

            },
            //相同几次算完成
            eqCount: 5
        });
        return df.promise;
    }

    /**
     * 加密
     */
    encrypt(pack) {
        socket.sendMessage("开始加密");
        var df = Q.defer();
        var df = Q.defer(),
            req = pack.req,
            res = pack.res,
            next = pack.next;
        //请求参数
        var packagePath = req.query.packagePath,
            pagckageInfo = req.query.pagckageInfo,
            packageName = req.query.packageName;
        updateConfig(pagckageInfo, packagePath, packageName, df, pack);
        return df.promise;
    }

    /**
     * 打包    
     */
    rarFn(pack) {
        var df = Q.defer(),
            req = pack.req,
            res = pack.res,
            next = pack.next;
        rarFn(req, res, next, df);
        return df.promise;
    }
    packageProcess() {
        console.log(this.plan);
        var process = this.plan,
            list = [this.ineUp, this.svnUpdate, this.packing, this.encrypt, this.rarFn],
            listFn = [],
            req = this.req,
            res = this.res,
            next = this.next,
            df = Q.defer();
        for (var i = 0, len = process.length; i < len; i++) {
            listFn.push(list[process[i]]);
        }
        var d = this.myPromise(req, res, next).then(listFn[1]);
        for (var j = 2, len = listFn.length; j < len; j++) {
            d = d.then(listFn[j])
        }
    }
}
module.exports = pack;

/**
 * 修改配置文件
 */
function updateConfig(pagckageInfo, packagePath, packageName, df, pack) {
    var req = pack.req,
        res = pack.res,
        next = pack.next;
    //修改 app.conf
    function appfn() {
        var deferred = Q.defer();
        fs.readFile(path.APP_CONF, 'utf8', function(err, data) {
            if (!err) {
                console.log(data);
                packageState = 3;
                var liststr = data.split("\r\n");
                console.log(liststr);
                for (var i = 0, len = liststr.length; i < len; i++) {
                    if (liststr[i].indexOf("g_hint") >= 0) {
                        liststr[i] = "g_hint          = " + pagckageInfo;
                    } else if (liststr[i].indexOf("enc_root") >= 0) {
                        liststr[i] = "enc_root        =  " + path.SELECT_PATH + "" + req.session.user.name + "" + path.INFO_O_PATH;
                        liststr[i] = liststr[i].replace(/\//g, "\\");
                    } else if (liststr[i].indexOf("dest_dir") >= 0) {
                        liststr[i] = "dest_dir        = " + path.DOWN_PATH + "" + req.session.user.name + "/download";
                    } else if (liststr[i].indexOf("mobile_svn_root") >= 0) {
                        liststr[i] = "mobile_svn_root        =  " + path.SELECT_PATH + "" + req.session.user.name + "" + path.INFO_O_PATH;
                        liststr[i] = liststr[i].replace(/\//g, "\\");
                    }

                }

                var _data = liststr.toString().replace(/\,/g, "\r\n");
                fs.writeFile(path.APP_CONF, _data, function(err) {
                    if (!err) {
                        deferred.resolve(0);
                    } else {
                        deferred.resolve(1);
                    }
                });

            } else {
                deferred.resolve(null);
            }
        });
        return deferred.promise;
    }
    //修改 package.conf
    function packageConf() {
        var deferred = Q.defer();
        packagePath = packagePath.toString().replace(/\,/g, "\r\n").replace(/[ ]/g, "").replace(/\//g, "\\");
        fs.writeFile(path.PACKAGE_CONF, packagePath, function(err) {
            if (err) {
                deferred.resolve(1);
            } else {
                deferred.resolve(0);
            }
        });
        return deferred.promise;
    }
    Q.all([appfn(), packageConf()]).spread(function() {
        console.log(arguments);
        var result = 0;
        for (var a in arguments) {
            if (arguments[a] == 1) {
                result = 1;
                break;
            }
        }
        if (result == 0) {
            encrypt(pack, df);
        } else {
            listSession.shift();
            df.resolve(null);
            res.json({
                flag: 1,
                mes: "打包失败"
            });
        }
    });
}
/**
 * 加密
 */
function encrypt(pack, df) {
    var req = pack.req,
        res = pack.res,
        next = pack.next;
    child_process.execFile(path.PACKAGE_BAT, null, {
        cwd: path.WEBDEPLOY
    }, function(error, stdout, stderr) {
        console.log(stdout);
        var date = new Date(+new Date);
        createTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        if (error !== null) {
            console.log('exec error: ' + JSON.stringify(error));
            listSession.shift();
            df.resolve(null);
            res.json({
                flag: 1,
                mes: "打包失败"
            });
            const info = {
                fileName: path.log,
                item: {
                    userId: '1',
                    userName: req.session.user.name,
                    createTime: createTime,
                    directory: 'branch',
                    files: listFile,
                    result: 'fail',
                }
            }
            new log(info).save(); //保存打包日志                                                                        
        } else {
            socket.sendMessage("加密成功");
            df.resolve(pack);
            const info = {
                fileName: path.log,
                item: {
                    userId: '1',
                    userName: req.session.user.name,
                    createTime: createTime,
                    directory: 'branch',
                    files: listFile,
                    result: 'suc',
                }
            }
            new log(info).save(); //保存打包日志                           
        };
    });
}
//压缩源文件
function rarFn(req, res, next, df) {
    socket.sendMessage("开始打包");
    var packageNameList = req.query.packageName,
        index = 0;
    var fnPromise = function() {
        var dd = Q.defer();
        dd.resolve({
            req: req,
            packageName: packageNameList[0]
        });
        return dd.promise;
    }
    var fn = function(pack) {
        var dd = Q.defer(),
            req = pack.req,
            packageName = pack.packageName;
        var compress = path.DOWN_PATH + "" + req.session.user.name + "/download/" + packageName + " " + path.DOWN_PATH + "" + req.session.user.name + "/download/" + packageName;
        exec('"' + path.COMPRESS + '" a -r  -ep1 ' + compress, {
            encoding: 'binary'
        }, function(err) {
            console.log("11");
            index++;
            if (packageNameList[index]) {
                dd.resolve({
                    req: pack.req,
                    packageName: packageNameList[index]
                });
            } else {
                var comp = path.SELECT_PATH + "" + req.session.user.name + "" + path.INFO_O_PATH + " " + path.SELECT_PATH + "" + req.session.user.name + "" + path.INFO_O_PATH;
                exec('"' + path.COMPRESS + '" a -r  -ep1 ' + comp, {
                    encoding: 'binary'
                }, function(err) {
                    var cp = path.DOWN_PATH + "" + req.session.user.name + "/download " + path.DOWN_PATH + "" + req.session.user.name + "/download";
                    exec('"' + path.COMPRESS + '" a -r  -ep1 ' + cp, {
                        encoding: 'binary'
                    }, function(err) {
                        console.log(err);
                        if (!err) {
                            res.json({
                                flag: 0,
                                mes: "打包成功"
                            });
                        }
                    });
                });

            }

        });
        return dd.promise;
    };
    var fp = fnPromise().then(fn);
    for (var i = 1, len = packageNameList.length; i < len; i++) {
        fp = fp.then(fn)
    }

}