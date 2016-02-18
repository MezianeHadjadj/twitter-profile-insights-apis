/* global require:false */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var exports = module.exports = {};
var posts = require('./routes/posts');
var linkedin_details= require('./routes/linkedin_details');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', posts);
app.use('/', linkedin_details);

console.log("working on get_last_tweets feature from develo branch");

var server = app.listen(5000, function(){
    console.log('Launching Twitter insights server on port 3000');
});

var swig         = require('swig');

// view engine setup
// utilisation du moteur de swig pour les .html
app.engine('html', swig.renderFile);
// utiliser le moteur de template pour les .html
app.set('view engine', 'html');
// dossier des vues
app.set('views', path.join(__dirname, 'views'));

// view cache
app.set('view cache', false); // désactivation du cache express
swig.setDefaults({ cache: false }); // désactivation du cache swig

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


exports.closeServer = function () {
    server.close();
};

//module.exports = app;