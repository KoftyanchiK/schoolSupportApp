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
	console.log("Sequelize message for logging! " + msg + "!");
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
});

users.sync().then(function() {
	console.log('Users sync is OK!');
}).catch(function(err) {
	console.log("Users sync error: " + err);
});