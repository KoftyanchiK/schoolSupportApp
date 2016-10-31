var config = require("nconf");
var express = require("express");
//var expressSession = require('express-session');
var passport = require("passport"); 
var LocalStrategy = require('passport-local');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var app = express();
var bodyParser = require('body-parser');

config.argv()
	.env()
	.file({file: 'config.json'});

//app.use(expressSession({secret: config.get("app").secret}));
app.use(cookieParser()); // req.cookies
app.use(session({keys: [config.get("app").secret]})); // req.session
app.use(passport.initialize());
app.use(passport.session());

// Метод сохранения данных пользователя в сессии
passport.serializeUser(function (user, done) {
  	done(null, user.username);
});

// Метод извлечения данных пользователя из сессии
passport.deserializeUser(function (username, done) {
  	done(null, {username: username});
});

// Настройка стратегии авторизации
passport.use(new LocalStrategy(function (username, pass, done) {
	// Проверяем авторизационные данные
	if (username === 'admin' && pass === 'admin')
		return done(null, {username: username});

	done(null, false);
}));

app.set('port', config.get("app").port);

app.get('/', function(req, res) {
	res.send('hello world');
});

app.get('/secret', mustBeAuthentificated, function(req, res) {
	//passport.authenticate('local', {successRedirect: '/secret', failtureRedirect: '/login'});
	res
		.status(200)
		.send("secret part");
});

app.get('/login', function(req, res) {
	res
		.status(200)
		.send(
			'<form action="/login" method="post">' +
		        'Login: ' +
		        '<input type="text" name="username" />' +
		        '<input type="password" name="password" />' +
		        '<input type="submit" />' +
      		'</form>');
});

// Обработчик запроса на авторизацию
app.post('/login', bodyParser.urlencoded({ extended: false }), passport.authenticate('local', {
  successRedirect: '/secret',
  failureRedirect: '/login'
}));

// Метод для проверки пользователя
function mustBeAuthentificated (req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/login'); // переход на страницу логина
}

app.listen(app.get('port'), function() {
	console.log('app was started on ' + app.get('port') + ' port!');
});