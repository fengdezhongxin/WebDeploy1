var path = require("path");
var svnPath = path.join('D:/workSpace/web'); //自填目录
module.exports = {
    cookieSecret: 'webDeployid',
    db: 'webDeploy', //数据库名称
    host: 'localhost', //数据库地址
    port: 28018, //数据库端口号
    DOWN_PATH: path.join(__dirname, '../upload/').replace(/\\/g, "/") + 'zlcft_ajax_upgrade_', //压缩包所在目录
    SELECT_PATH: path.join(__dirname, '../upload/').replace(/\\/g, "/") + 'tcj_', //代码所在目录
    INFO_O_PATH: svnPath.replace(/\\/g, "/").replace(/[a-zA-Z]:/, ""), //svn部分目录
    SVN_PATH: svnPath.replace(/\\/g, "/"), //svn完整目录
    PACKAGE_CONF: path.join(__dirname, '../python/').replace(/\\/g, "/") + 'package.conf', //筛选压缩文件列表
    APP_CONF: path.join(__dirname, '../python/').replace(/\\/g, "/") + 'app.conf', //打包相关配置
    WINRAR_BAT: path.join(__dirname, '../python/').replace(/\\/g, "/") + 'winrar.bat', //打包命令
    PACKAGE_BAT: path.join(__dirname, '../python/').replace(/\\/g, "/") + "package.bat", //启动程序
    WEBDEPLOY: path.join(__dirname, '../python/').replace(/\\/g, "/"), //python目录
    TCJ_BAT: path.join(__dirname, '../python/').replace(/\\/g, "/") + 'tcj.bat', //压缩源文件的命令 
    uploadPath: path.join(__dirname, '../upload/'),
    COMPRESS: "C:\\Program Files (x86)\\WinRAR\\WinRAR.exe", //压缩工具放置目录
    email: {
        service: 'QQ',
        user: '752044172@qq.com',
        pass: 'ymyfhsvprrjnbecb',
    },
    log: path.join(__dirname, '../logs/') + 'log.txt',
    // 分支目录配置  获取方式 path.join(svnPath, branches[i].name)
    branches: {
        0: {
            name: 'trunk/trunk-zlcft'
        },
        1: {
            name: 'trunk/trunk-zlcft-aws'
        },
        2: {
            name: 'trunk/trunk-wxmina'
        },
        3: {
            name: 'trunk/trunk-sjkh'
        },
        4: {
            name: 'trunk/trunk-activity'
        },
        5: {
            name: 'trunk/trunk-3g'
        },
        6: {
            name: 'branches/zlcft-main'
        }
    },
    // 用户权限配置
    user: {
        // 用户等级
        level: {
            developer: 1,
            commiter: 2,
            releaser: 3,
            admin: 4
        },
        //用户含有数据里面一种即有权限
        roles: {
            //打包自测
            pack: [1],
            //版本提交
            versionCommit: [2],
            //版本管理
            versionManagement: [2, 3, 4],
            //版本发布      
            release: [3, 4],
            //新增版本
            addVersion: [3, 4],
            //当前版本
            currentVersion: [2, 3, 4],
            //历史版本
            historyVersion: [2, 3, 4],
            //未发布编辑
            editNotReleased: [3, 4],
            //已发布编辑
            editRelease: [4],
            //生成版本发布包
            versionPackage: [3, 4],
            //封版
            sealedVersion: [3, 4],
            //版本发布
            release: [3, 4],
            //不发布
            Notrelease: [3, 4]
        }
        //1、开发自测打包：developer权限
        //2、版本提交：commiter权限
        //3、版本管理：commiter权限，admin和releaser权限看到的有区别
        //4、版本发布：releaser权限
        //5、版本管理：commiter权限仅可以看,releaser可以编辑未发布的，admin可以编辑已发布的      
    },
    // 打包方案
    plan: {
        /**
         * 0 排队机制
         * 1 更新svn
         * 2 帅选文件
         * 3 加密
         * 4 打包（rar)
         */
        process: {
            normal: [0, 1, 2, 3, 4], //默认方案
            mobile: [], //3g 方案
            wxmina: []
        }
    }


};