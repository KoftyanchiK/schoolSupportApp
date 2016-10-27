var config = require("nconf");
var express = require("express");
var expressSession = require('express-session');
var passport = require("passport"), LocalStrategy = require('passport-local').Strategy;
var app = express();

config.argv()
	.env()
	.file({file: 'config.json'});

app.use(expressSession({secret: config.get("app").secret}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	// User.findById(id, function(err, user) {
	// 	done(err, user);
	// });
	var user = {username: "admin", password: "admin"};
	done("error in deserialize", user);
});

passport.use('login', new LocalStrategy({
	function(username, password, done) {
		if(username != "admin") {

		}
	}
}));

app.set('port', config.get("app").port);

app.get('/', function(req, res) {
	res.send('hello world');
});

app.get('/secret', function(req, res) {
	passport.authenticate('local', {successRedirect: '/secret', failtureRedirect: '/login'});
	res.send("secret part");
});

app.get('login', function(req, res) {
	res.send("You need to login");
});

app.listen(app.get('port'), function() {
	console.log('app was started on ' + app.get('port') + ' port!');
});