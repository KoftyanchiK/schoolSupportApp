This application is made for school IT department and helps requesting and processing  maintenance tickets from the users.

Used: Express.js, passport.js, sequelize.js + mysql, nconf

1). Add config.json in the root of app with fields:

	{
		"db": {
			"host": DB_Address,
			"name": DB_Name,
			"db_user": DB_User,
			"db_passwd": DB_User_Password
		},

		"app": {
			"port": App_Port_Which_Express_will_listen,
			"secret": Secret_Word_For_Cookie
		},

		"telegram_bot": {
			"token": Telegram bot token,
			"chatId": groupChat ID,
			"apiUrl": "https://api.telegram.org/bot" - Telegram API URL
		}
	}