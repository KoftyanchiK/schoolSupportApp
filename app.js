var config = require("nconf");
var express = require("express");

var passport = require("passport"); 
var LocalStrategy = require('passport-local');
//var logout = require('express-passport-logout');

var cookieParser = require('cookie-parser');
var session = require('cookie-session');

var bodyParser = require('body-parser');
var db = require("./app/requests.js");
var user = require("./app/users.js");
var tg = require("./app/telegram_bot.js");
var handlebars = require("./app/handlebars.js");
var app = express();

app.set('view engine', 'hbs');//устанавливаем handlebars как шаблонизатор
app.set('views', __dirname + '/views');

//подключение путей со статикой: стили, скрипты, шрифты
app.use(express.static(__dirname + '/static/css'));
app.use(express.static(__dirname + '/static/js'));
app.use('/fonts/', express.static(__dirname + '/static/fonts'));

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

//берем порт для приложения из конфига
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
	//Неплохо бы сделать отдельную проверку на правильность логина и отдельно пароль
	user.findOne(username, function(usr) {
		//если юзер пришел из БД и логин совпадает (лишняя проверка?) и хеш пароля совпадает с тем, что пришло из БД
		//то пропускаем его дальше
		if((usr) && (username === usr.login) && (user.encryptPassword(pass) === usr.pswd)) {
			// console.log(user.encryptPassword(pass));
			// console.log(user.encryptPassword(usr.pswd))
			return done(null, {username: usr});
		}
		done(null, false);
	});
}));

//Роуты для приложения
app.get('/', function(req, res) {
	tg.sendMsg("Access!!!");
	db.getRequests(function(d) {
		res.render("checkreq", {vals: d, user: req.user ? req.user.username : ''});
	});
});

app.get('/allreqs', mustBeAuthentificated, function(req, res, next) {
	if (req.user && req.user.username.admin === true) {
		db.getRequests(function(d) {
			res.render("allReqs", {vals: d, user: req.user ? req.user.username : ''});
		});
	} else {
		res
			.status(401)
			.send('Unauthorized');
	}
});

app.get('/createreq', mustBeAuthentificated, function(req, res) {
	res.render('create', {user: req.user ? req.user.username : ''});
});

app.post('/createreq', mustBeAuthentificated, function(req, res) {
	var request = {
		fio: req.body.fio,
		department: req.body.department,
		room: req.body.room,
		description: req.body.description.substring(0, 254)
	}
	var dep;
	switch(request.department) {
		case "1":
			dep = "ШО1";
			break;
		case "2":
			dep = "ШО2";
			break;
		case "3":
			dep = "ШО3";
			break;
		case "4":
			dep = "ДО1";
			break;
		case "5":
			dep = "ДО2";
			break;
		case "6":
			dep = "ДО3";
			break;
		case "7":
			dep = "ДО4";
			break;
	}
	var tgMsg = "У пользователя: *" + request.fio + "*\n"
		+ "из " + request.room + " в " + dep +
		" случилось следующее: \n*" + request.description + "*";
	db.addRequest(request.fio, request.department, request.room, request.description, function(info) {

		tg.sendMsg(tgMsg);
		res.render("requestinfo", {vals: info.dataValues, user: req.user ? req.user.username : ''});
	});
});

app.get('/closereq/:id', mustBeAuthentificated, function(req, res) {
	//если админ, то дать выполнить запрос на закрытие заявки
	if (req.user && req.user.username.admin === true) {
		db.closeRequest(req.params.id, function(info) {
			//если вернулась единичка, значит заявка закрыта
			if (info[0] == 1) {
				res.redirect('/allreqs');
			} else {
				res.send("По какой-то причине не удалось закрыть заявку.");
			}
		});
	} else {
		res
			.status(401)
			.send('Unauthorized');
	}
});

app.get('/deletereq/:id', mustBeAuthentificated, function(req, res) {
	//если админ, то дать выполнить запрос на удаление заявки
	if (req.user && req.user.username.admin === true) {
		db.deleteRequest(req.params.id, function(info) {
			//если вернулась единичка, значит заявка удалена
			if (info == 1) {
				res.redirect('/allreqs');
			} else {
				res.send("По какой-то причине не удалось удалить заявку.");
			}
		});
	} else {
		res
			.status(401)
			.send('Unauthorized');
	}
});

app.get('/login', function(req, res) {
	res.render('login');
});

// Обработчик запроса на авторизацию
app.post('/login', bodyParser.urlencoded({ extended: false }), passport.authenticate('local', {
  	//successRedirect: '/',
  	failureRedirect: '/login'
}),
	function(req, res) {
		//если админ, переадресовать в админку, если нет - в корень
		if (req.user && req.user.username.admin === true) {
			res.redirect('/allreqs');
		} else {
			res.redirect('/');
		}
	}
);

app.get('/logout', function(req, res) {
    req.session = null;
	req.logout();
	res.redirect('/');
});

//Если пытаются попасть на несуществующий урл
app.use(function(req, res) {
	console.log("someone trying access bad url");
	res.send("Page not found!");
})

// Метод для проверки пользователя
function mustBeAuthentificated (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/login'); // переход на страницу логина
}

//Стартуем приложение
app.listen(app.get('port'), function() {
	console.log('app was started on ' + app.get('port') + ' port!');
});