var express = require('express');
var path = require('path');
var ejs = require('ejs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var log4js = require('log4js');
//支持flash()会话
var flash = require('connect-flash');

var routes = require('./routes');

var app = express();

var MongoStore = require('connect-mongodb');
var settings = require('./config');

const mongoose = require('mongoose'); //引入mongoose数据库模块 来连接数据库
mongoose.Promise = require('bluebird'); //mongoose 默认用的是promise 加上它不报错误
const dbUrl = 'mongodb://' + settings.host + ':' + settings.port + '/' + settings.db; //连接的数据库
mongoose.connect(dbUrl); //mongoose connect调用数据库 数据库名为imooc


// view engine setup
app.engine('.html', ejs.__express);
app.set('views','./app/views/');//设置视图默认目录
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));
 
 


//支持flash()会话
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));
/*app.use(function(req, res, next) {
    req.session._garbage = Date();
    req.session.touch();
    next();
});*/

app.use(session({
    secret: '12345',
    name: 'testapp', //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {
        maxAge: 1000 * 60 * 60000
    }, //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true,
}));
//链接写入路由
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.use(function(req, res, next) {
    res.locals.user = req.session.user;

    var err = req.flash('error');
    var success = req.flash('success');

    res.locals.error = err.length ? err : null;
    res.locals.success = success.length ? success : null;

    next();
});
if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port %d in %s mode", app.address().port,
        app.settings.env);
}
module.exports = app;
