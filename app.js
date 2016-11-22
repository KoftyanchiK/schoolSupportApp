var config = require("nconf");
var express = require("express");
var hbs = require('hbs');

var passport = require("passport"); 
var LocalStrategy = require('passport-local');

var cookieParser = require('cookie-parser');
var session = require('cookie-session');

var bodyParser = require('body-parser');
var db = require("./app/db_logic.js");
var app = express();

app.set('view engine', 'hbs');//устанавливаем handlebars как шаблонизатор
app.set('views', __dirname + '/views');

//подключение путей со статикой: стили, скрипты, шрифты
app.use(express.static(__dirname + '/static/css'));
app.use(express.static(__dirname + '/static/js'));
app.use('/fonts/', express.static(__dirname + '/static/fonts'));
//подключение partials для handlebars
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

// Разбираем application/x-www-form-urlencoded
app.use( bodyParser.urlencoded({extended: false}) );
// Разбираем application/json
app.use( bodyParser.json() );

//Configuration file ON
config.argv()
	.env()
	.file({file: 'config.json'});

//app.use(expressSession({secret: config.get("app").secret}));
app.use(cookieParser()); // req.cookies
app.use(session({keys: [config.get("app").secret]})); // req.session
app.use(passport.initialize());
app.use(passport.session());

app.set('port', config.get("app").port);

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



app.get('/allreqs', function(req, res) {
	db.getRequests(function(d) {
		res.render("allReqs", {vals: d});
	});
});

app.get('/', mustBeAuthentificated, function(req, res) {
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
  successRedirect: '/',
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