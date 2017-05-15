let VersionCommit = require('../models/version-commit'); //把模型加载进来
let VersionList = require('../models/version-list'); //把模型加载进来
let UserRights = require('./user-rights'); //用户权限
let Config = require('../../config/config'); //全局配置
// let Promise = require('bluebird');
// let packProcess = require('./pack-process');


//版本提交页面
exports.versionCommitPage = function(req, res) {
    console.log(Config.branches);
    VersionList.fetch(function(err, list) {
        if (err) {
            console.log(err);
        }
        //生成可版本号和可选分支对象
        let versionList = {};
        list.map(function(i) {
            versionList[i.versionNumber] = { name: i.branches, id: i._id };
        });
        //渲染页面
        res.render('version-commit', {
            title: '版本提交',
            user: req.session.user,
            css: "version-commit.css",
            js: "version-commit.js",
            versionList: versionList
        });
    });
};
//判断是否登录
exports.isLogin = function(req, res, next) {
    var user = req.session.user;
    if (!user) {
        return res.redirect('/login');
    }
    //判断是否有权限访问该功能
    new UserRights({
        userRoles: req.session.user.roles,
        needRoles: Config.user.roles.versionCommit,
        fn: function(x) {
            if (!x) {
                return res.redirect('/login');
            }
        }
    });
    next();
};
//版本提交代码 
exports.versionCommit = function(req, res) {
    let body = req.body;
    body.code = body.code.split('\n');
    body.user = req.session.user.name;
    switch (body.type) {
        case "test":
            //打包测试
            console.log("打包测试");
            // eval(packProcess.packProgress(Config.plan.process.default,"packProcess",body));
            break;
        case "apply":
            //提交申请
            let _versionCommit = new VersionCommit({
                versionId: body.versionId, // 版本对应id
                author: req.session.user.name, // 提交人
                branches: body.branch, // 提交分支
                explain: body.content, // 提交说明
                listFile: body.code, // 提交文件数组
            });
            _versionCommit.save(function(err, suc) {
                if (err) {
                    console.log(err);
                    return res.json({ success: 0, msg: '保存失败' });
                }
                return res.json({ success: 1, msg: '提交成功' });
            });
            break;
    };
    return;
};
