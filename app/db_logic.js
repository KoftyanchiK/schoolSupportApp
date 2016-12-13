var config = require("nconf");
var SQLZ = require("sequelize");

config.argv()
	.env()
	.file({file: './config.json'});

var host = config.get("db").host;
var db = config.get("db").name;
var user = config.get("db").db_user;
var password = config.get("db").db_passwd;

/*
Change log message here
*/
var db_log = function(msg) {
	console.log("Sequelize message for logging! You can change this in db_logic.js file!\n" + msg + "\n");
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
