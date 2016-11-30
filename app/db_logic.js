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
	room: SQLZ.CHAR,
	description: SQLZ.TEXT,
	done: SQLZ.BOOLEAN
});

users.sync().then(function() {
	console.log('Users sync is OK!\n');
}).catch(function(err) {
	console.log("Users sync error: \n");
	throw new Error(err);
});

requests.sync().then(function() {
	console.log("Requests sync is ok!\n");
}).catch(function(err) {
	console.log("Requests sync error: \n");
	throw new Error(err);
});

var db = {
	/*
	Add new request in DB, returns request_id from DB and data about request over callback
	*/
	addRequest: function(fio, department, room, description, callback, done='false') {
		console.log("Adding request in DB...\n");
		requests.create({
			fio: fio,
			department: department,
			room: room,
			description: description,
			done: done
		}).then(function(info) {
			console.log("Request add successful!\n");
			callback(info);
		}).catch(function(err) {
			console.log("Request was not added: \n");
			throw new Error(err);
		});
	},

	/*
	Returns information about all requests over callback
	*/
	getRequests: function(callback) {
		console.log("Getting all requests...\n");
		requests.findAll({
			//empty obj for all items
		}).then(function(requests) {
			var reqs = [];
			console.log("Requests were fetched.\n");
			requests.forEach(function(item, i, arr) {
				var t = item.dataValues;
				t.createdAt = new Date(t.createdAt).toDateString();
				t.updatedAt = new Date(t.createdAt).toDateString();
				reqs.push(t);
			});
			callback(reqs);
		}).catch(function(err) {
			console.log("can't get requests: \n");
			throw new Error(err);
		});
	},

	/*
	Reutrns info about one request with any ID
	*/
	getRequestById: function(id, callback) {
		console.log("Getting request by ID...\n");
		requests.findOne({
			where: {
				request_id: id
			}
		}).then(function(request) {
			console.log("Request was fetched\n");
			request.dataValues.createdAt = new Date(request.dataValues.createdAt).toDateString();
			request.dataValues.updatedAt = new Date(request.dataValues.updatedAt).toDateString();
			callback(request.dataValues);
		}).catch(function(err) {
			console.log("Can't get request by id: \n");
			throw new Error(err);
		});
	},

	/*
	Return 1 if success and 0 otherwise
	*/
	updateRequestById: function(id, fio, department, room, description, callback) {
		console.log("Updating request by id...\n");
		requests.update({
			fio: fio,
			department: department,
			room: room,
			description: description,
			done: done
		},{
			where: {
				request_id: id
			}
		}).then(function(info) {
			console.log("Updating was successful!\n");
			callback(info);
		}).catch(function(err) {
			console.log("Can't update request: \n");
			throw new Error(err);
		});
	},

	/*
	Return 1 if success and 0 otherwise
	*/
	deleteRequest: function(id, callback) {
		console.log("deleting request from DB...\n");
		requests.destroy({
			where: {
				request_id: id
			}
		}).then(function(info) {
			console.log("Request deleted successufy\n");
			callback(info);
		}).catch(function(err) {
			console.log("Can't delete request: \n");
			throw new Error(err);
		});
	},

	closeRequest: function(id, callback) {
		console.log("Request with id " + id + " is DONE...");
		requests.update({
			done: 1
		}, {
			where: {
				request_id: id
			}
		}).then(function(info) {
			console.log("Request marked as DONE");
			callback(info);
		}).catch(function(err) {
			console.log("Can't mark this task as DONE!");
			throw new Error(err);
		});
	},

	undoneRequest: function(id, callback) {
		console.log("Request with id " + id + " is UNDONE...");
		requests.update({
			done: 0
		}, {
			where: {
				request_id: id
			}
		}).then(function(info) {
			console.log("Request marked as UNDONE");
			callback(info);
		}).catch(function(err) {
			console.log("Can't mark this task as UNDONE!");
			throw new Error(err);
		});
	}
}

module.exports = db;