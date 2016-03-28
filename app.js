var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/Api');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

//Some global use configuration
app.use((req, res, next)=> {
    var google = require('googleapis');
    req.google = google;
    req.success = data => {
        return {success: 1, data}
    };
    req.error = data => {
        return {success: 0, data}
    };
    return next();
});
clientLists =  new Array();
//Secure api protection
app.use('/api', (req, res, next)=> {
    if (!req.cookies.token) {
        return res.json(req.error("No Token key found please authenticate"))
    }
    var Drive = require('./handlers/platforms/Drive');
    var drive = new Drive();
    drive.init();
    var oauth = drive.connect();
    oauth.credentials = JSON.parse(JSON.stringify(req.cookies.access_token));
    req.oauth = oauth;
    req.service = req.google.drive({version: 'v3', auth: req.oauth});
    return next();
});
x = 101;
var server = app.listen(3000);
var io = require('socket.io')(server);
require('./handlers/Socket')(app,io);
app.use('/', routes);
app.use('/api', api);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
//Socket Implemention

module.exports = app;
