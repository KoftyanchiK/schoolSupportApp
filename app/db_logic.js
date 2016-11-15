var config = require("nconf");
var SQLZ = require("sequelize");

config.argv()
	.env()
	.file({file: '../config.json'});

var host = config.get("db").host;
var db = config.get("db").name;
var user = config.get("db").db_user;
var password = config.get("db").db_passwd;

//Logging function
var db_log = function(msg) {
	console.log("Sequelize message for logging! You can change this in db_logic.js file! " + msg + "\n");
}

var sequelize = new SQLZ(db, user, password, {
	host: host,
	dialect: 'mysql',
	logging: db_log
});

//Check connection to DB
// sequelize.authenticate().then(function() {
// 	console.log("All right");
// }).catch(function(err) {
// 	console.log("Connection err: " + err);
// });

//users model
var users = sequelize.define('users', {
	id: {
		type: SQLZ.INTEGER.UNSIGNED,
		primaryKey: true,
		autoIncrement: true
	},
	name: SQLZ.CHAR,
	last_name: SQLZ.CHAR,
	patronymic: SQLZ.CHAR,
	phone: SQLZ.CHAR,
	login: SQLZ.CHAR,
	position: SQLZ.CHAR,
	birthday: SQLZ.CHAR,
	admin: SQLZ.BOOLEAN,
	pswd: SQLZ.CHAR
	//timestamps: false
});

var requests = sequelize.define('requests', {
	request_id: {
		type: SQLZ.INTEGER.UNSIGNED,
		primaryKey: true,
		autoIncrement: true
	},
	fio: SQLZ.CHAR,
	department: SQLZ.INTEGER,
	room: SQLZ.INTEGER,
	description: SQLZ.TEXT
	// createdAt: SQLZ.DATE,
	// updatedAt: SQLZ.DATE
});

users.sync().then(function() {
	console.log('Users sync is OK!');
}).catch(function(err) {
	console.log("Users sync error: " + err);
});

requests.sync().then(function() {
	console.log("Requests sync is ok!");
}).catch(function(err) {
	console.log("Requests sync error: " + err);
});

function addRequest (id, fio, department, room, description) {
	console.log("Adding request in DB...");
	requests.create({
		request_id: id,
		fio: fio,
		department: department,
		room: room,
		description: description
	}).then(function() {
		console.log("Request add successful!");
	}).catch(function(err) {
		console.log("Request was not added: " + err);
	});
}

addRequest("", "Тестов Тест Тестович", "7", "322", "Все не работает");