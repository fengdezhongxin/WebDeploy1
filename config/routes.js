var crypto = require('crypto');
var log4js = require('log4js');
var url = require('url');
var copy = require('../app/controllers/copy');
var path = require('./config');
var Pack = require("../app/controllers/pack");
var Version = require("../app/controllers/version");
//模板
var User = require('../app/controllers/user.js');
var versionList = require("../app/controllers/version_list");
var UserRights = require('../app/controllers/user-rights');
var versionModel = require("../app/models/version-list");
var versionCommit = require('../app/controllers/version_commit.js');
var sendMail = require('../app/controllers/email.js');

module.exports = function(app) {
    //公用逻辑
    //日志功能
    log4js.configure({
        appenders: [{
            type: 'console'
        }, {
            type: 'file',
            filename: 'logs/access.log',
            maxLogSize: 1024,
            backups: 4,
            category: 'normal'
        }],
        replaceConsole: true
    });

    var logger = log4js.getLogger('normal');
    logger.setLevel('INFO');
    //日志
    logger.info("This is an index page! -- log4js");
    app.use(log4js.connectLogger(logger, {
        level: log4js.levels.INFO
    }));
    app.use(function(req, res, next) {
        console.log(res.locals); //undined
        var err = req.flash("error");
        var success = req.flash("success");
        var power = req.flash("power");
        var sess = req.session;
        res.locals.success = success.length ? success : "";
        res.locals.error = err.length ? err : "";
        res.locals.power = power.length ? power : "";
        res.locals.user = req.session ? req.session.user : "";
        next();
    });
    app.get('/', function(req, res) {
        res.render('index', {
            title: '首页',
            user: req.session.user,
            css: "style.css",
            js: "index.js"
        });

    });
    app.get('/indexData', function(req, res) {
        res.json({
            user: req.session.user,
            roles: path.user.roles
        })
    });
    //修改密码
    app.get('/updataPassword', function(req, res) {
        res.render('updataPassword', {
            title: '修改密码',
            user: req.session.user,
            css: "updataPassword.css",
            js: "updataPassword.js"
        });

    });
    app.get('/updataPasswordData', function(req, res) {
        var password = req.query.password;
        new User({
            options: {
                name: req.query.name
            }
        }).find(function(user) {
            console.log(user);
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '用户口令错误');
                return res.redirect('/login');
            }
            new User({
                conditions: {
                    name: req.query.name
                },
                update: {
                    $set: {
                        password: req.query.new2
                    }
                }
            }).update(function() {
                console.log(111111111111111111111);
                res.json({
                    flag: 0
                })
            });
        });

    });
    //打包输入框页面
    app.get('/developer', function(req, res) {
        res.render('developer', {
            title: '打包',
            css: 'developer.css',
            js: "developer.js"
        });
    });
    //打包输入框页面数据
    app.get('/developerData', function(req, res) {
        res.json(path.branches);
    });
    //---------选择版本提交代码模块开始--------------------------------------------
    //版本提交路由
    app.get('/version/commit', Version.isLogin, Version.versionCommitPage);
    //版本提交打包测试代码    
    app.post('/version/commit', Version.isLogin, Version.versionCommit);
    //---------选择版本提交代码模块结束--------------------------------------------    
    //登录
    app.get('/login', checkNotLogin);
    app.get('/login', function(req, res) {
        res.render('login', {
            title: '用户登入',
            css: 'style.css',
            js: ""
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function(req, res) {
        var password = req.body.password;
        new User({
            options: {
                name: req.body.username
            }
        }).find(function(user) {
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '用户口令错误');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', '登入成功');
            res.redirect('/');
        });
    });
    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');
    });
    //打包输入框页面
    app.get('/inputFile', function(req, res) {
        res.render('inputFile', {
            title: '打包',
            css: 'style.css',
            js: "index.js"
        });
    });

    //版本管理页面
    app.get('/versionList', function(req, res) {
        res.render('version_list', {
            title: '版本管理',
            css: 'version_list.css',
            js: "version_list.js"
        });
    });
    app.get('/getVersionList', function(req, res) {
        new versionList({
            options: {
                released: req.query.released
            }
        }).find(function(data) {
            res.json(data)
        });

    });

    //新增版本页面
    app.get('/addVersion', function(req, res) {
        res.render('add_version', {
            title: '新增版本',
            css: 'add_version.css',
            js: "add_version.js",
            branchs: path.branches
        });
    });
    app.get('/addNewVersion', function(req, res) {
        new versionList({
            versionNumber: req.query.versionNumber,
            branches: req.query.branches,
            released: 1,
            explain: req.query.explain,
            predictDate: new Date(req.query.predictDate)
        }).save(function(data) {
            res.json(data)
        });
    });

    //版本修改页面
    app.get('/modifyVersion/:id', function(req, res) {
        new versionList({
            options: {
                _id: req.params.id
            }
        }).find(function(data) {
            console.log(data);
            res.render('modify_version', {
                id: req.params.id,
                title: '版本修改',
                css: 'modify_version.css',
                js: "modify_version.js",
                data: data,
                branchs: path.branches,
                predictDate: FormatDate(data[0].predictDate)
            });
        });
    });

    app.get('/modifyVersionInfo', function(req, res) {
        new versionList({
            conditions: {
                _id: req.query.id
            },
            update: {
                $set: {
                    versionNumber: req.query.versionNumber,
                    branches: req.query.branches,
                    explain: req.query.explain,
                    predictDate: req.query.predictDate
                }
            }
        }).update(function(data) {
            res.json(data)
        });
    });

    app.get('/removeVersion', function(req, res) {
        new versionList({
            conditions: {
                _id: req.query.id
            }
        }).remove(function(data) {
            res.json(data)
        });
    });
    //判断是否有权限访问版本发布页面
    app.get('/getPulishRoles', function(req, res) {
            new UserRights({
                userRoles: req.session.user.roles,
                needRoles: Config.user.roles.release,
                fn: function(x) {
                    if (!x) {
                        return res.redirect('/login');
                    }
                }
            });
        })
        //版本发布or不发布成功页面
    app.get('/sucess', function(req, res) {
        res.render('sucess', {
            title: '成功页面',
            css: '',
            js: ""
        });
    });
    //版本发布页面
    app.get('/versionDownload', function(req, res) {
        res.render('versionDownload', {
            title: '版本发布',
            css: 'version_download.css',
            js: "version_download.js"
        });
    });
    //版本详情页面
    app.get('/versionDetail', function(req, res) {
        res.render('versionDetail', {
            title: '版本详情',
            css: 'version_download.css',
            js: "version_detail.js"
        });
    });
    //发送邮件
    app.get('/sendMail', function(req, res) {
        console.log(path.email.user + '===打包工具');
        sendMail(path.email.user, '打包工具', '成功发送邮件'); //成功发送邮件
    });
    //查询 所有待发布 以及 封版的 版本列表 released=1 or 2
    app.get('/getVersionModel', function(req, res) {
        console.log('========list===');
        versionModel.find({
            released: {
                "$gt": 0,
                "$lte": 2
            }
        }, function(err, suc) {
            res.json(suc)
        });
    });
    //获取版本详情页数据
    app.get('/publishDetailFind', function(req, res) {
        console.log('---版本详情页查找==' + req.query.versionId)
        new versionCommit({
            options: {
                versionId: req.query.versionId
            }
        }).find(function(data) {
            res.json(data)
        });
    });
    //修改版本列表
    app.get('/modifyVersionStatus', function(req, res) {
        new versionList({
            conditions: {
                _id: req.query.id
            },
            update: {
                $set: {
                    released: req.query.released
                }
            }
        }).update(function(data) {
            res.json(data)
        });
    });
    //删除数据
    app.get('/publishDetailDelete', function(req, res) {
        console.log('---版本详情页删除==' + req.query._id)
        new versionCommit({
            conditions: {
                _id: req.query._id
            }
        }).remove(function(data) {
            res.json(data)
        });

    });
    //触发python
    app.get('/pack', function(req, res, next) {
        if (true) {
            console.log("开始打包");
            var pack = new Pack({
                req: req,
                res: res,
                next: next,
                plan: path.plan.process[req.query.plan]
            }).packageProcess();
        }
    });
    //打包进程
    app.get('/progress', function(req, res) {
        res.json({
            flag: 0,
            progress: packageState,
            count: req.session.starts
        });
    });
    //权限
    app.get('/power', function(req, res) {
        res.json({
            flag: 0,
            power: req.session.user.power
        });
    });
    //下载
    app.get('/attachment/:download.rar', function(req, res, next) {
        //..db get file realpath
        res.download(path.DOWN_PATH + "" + req.session.user.name + "/download.rar", "download.rar");
    });
    app.get('/tcj/:web.rar', function(req, res, next) {
        //..db get file realpath
        res.download(path.SELECT_PATH + "" + req.session.user.name + "" + path.INFO_PATH + "/web.rar", "web.rar");
    });
}

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登入');
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登入');
        return res.redirect('/');
    }
    next();
}

function fail() {
    packageState = 0;
}

function FormatDate(strTime) {
    var date = new Date(strTime);
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}