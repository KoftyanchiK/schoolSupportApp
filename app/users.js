var config = require("nconf");
var SQLZ = require("sequelize");
var crypto = require("crypto");

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
}, {
	timestamps: false,
});

users.sync().then(function() {
	console.log('Users sync is OK!\n');
}).catch(function(err) {
	console.log("Users sync error: \n");
	throw new Error(err);
});

var user = {
	findOne: function(username, callback) {
		console.log("Trying to get user from DB");
		users.findOne({
			where: {
				login: username
			}
		}).then(function(info) {
			console.log("User " + username + " was found");
			//забираем только информацию о юзере
			callback(info.dataValues);
		}).catch(function(err) {
			console.log("Can't get USER!");
			throw new Error(err);
		})
	},

	encryptPassword: function(pswd) {
		var salt = "Hfjs72fJ36IoFjl66w3r9033w0rjJ0";
		return crypto.createHmac('sha1', salt).
            update(pswd).
            digest('hex');
	}
}


module.exports = user;