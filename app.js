'use strict';
var config = require('config');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var SlackStrategy = require('passport-slack').Strategy;
var mongoose = require('mongoose');
var User = require('./model/User.js');

var routes = require('./routes/index');
var api = require('./routes/api');
var jobs = require('./routes/jobs');
var sfdc = require('./routes/sfdc');

var app = express();

mongoose.connect(config.db);

mongoose.connection.on('connected', function() {
        console.log('connected to mongo db: ' + config.db);
    })
    .on('disconnected', function(err) {
        console.log('disconnected');
    })
    .on('error', function(err) {
        console.log('could not connect to mongo db: ', err);
        console.error.bind(console, 'connection error:');
    })
    .once('open', function(callback) {
        console.log('db opened: ', mongoose.connection.host + ':' + mongoose.connection.port);
    });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('express-session')({
    secret: 'lazy baer',
    resave: false,
    saveUninitialized: false
}));

app.use('/', routes);
app.use('/api', api);
app.use('/jobs', jobs);
app.use('/sfdc', sfdc);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new SlackStrategy({
        clientID: config.SLACK_KEY,
        clientSecret: config.SLACK_SECRET,
        scope: ['channels:read', 'chat:write:bot', 'users:read']
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({
            'slack.id': profile.id
        }, {
            name: profile.displayName,
            slack: {
                id: profile.id,
                name: profile.displayName,
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            updatedDate: new Date()
        }, {
            upsert: true
        }, function(err, user) {
            return done(err, user);
        });
    }
));

app.get('/slack/oauth', passport.authorize('slack'));

app.get('/slack/oauth_callback',
    passport.authorize('slack', {
        failureRedirect: '/fail'
    }),
    function(req, res) {
        // Successful authentication, redirect time.
        var account = req.account;
        req.session.userId = account._id;
        res.redirect('/whoami');
    });

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


module.exports = app;
