var config = require("nconf");
var SQLZ = require("sequelize");

config.argv()
	.env()
	.file({file: '../config.json'});

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
});

users.sync().then(function() {
	console.log('Users sync is OK!\n');
}).catch(function(err) {
	console.log("Users sync error: \n" + err);
});

requests.sync().then(function() {
	console.log("Requests sync is ok!\n");
}).catch(function(err) {
	console.log("Requests sync error: \n" + err);
});

function addRequest(fio, department, room, description) {
	console.log("Adding request in DB...\n");
	requests.create({
		fio: fio,
		department: department,
		room: room,
		description: description
	}).then(function() {
		console.log("Request add successful!\n");
	}).catch(function(err) {
		console.log("Request was not added: \n" + err);
	});
}

function getRequests(callback) {
	console.log("Getting all requests...\n");
	requests.findAll({
		//empty obj for all items
	}).then(function(requests) {
		var reqs = [];
		console.log("All right!");
		requests.forEach(function(item, i, arr) {
			reqs.push(item.dataValues);
		});
		callback(reqs);
	}).catch(function(err) {
		console.log("can't get requests: " + err);
	});
}

var t = getRequests(console.log);
//console.log("t is: ", t);