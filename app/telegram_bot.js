var config = require("nconf");
var request = require("request");

config.argv()
	.env()
	.file({file: './config.json'});

// var TelegramBot = require('node-telegram-bot-api');

// // replace the value below with the Telegram token you receive from @BotFather
var token = config.get("telegram_bot").token;
var chatId = config.get("telegram_bot").chatId;
var apiUrl = config.get("telegram_bot").apiUrl;

// // Create a bot that uses 'polling' to fetch new updates
// var bot = new TelegramBot(token, { polling: true });

// //bot.sendMessage(chatId, "Hi ALL! I'm support BOT!");



var tg = {
	sendMsg: function(msg) {
		var url = apiUrl + token + "/sendMessage?chat_id=" + chatId + "&text=" + encodeURIComponent(msg) + "&parse_mode=Markdown";
		//console.log(url);
		var requestOptions  = { encoding: 'utf8', 
								method: "POST", 
								uri: url,
								charset: "utf8"
		};
		request(url, function(err, res, body) {
			if(!err && res.statusCode == 200) {
				console.log(body)
			} else {
				console.log(err);
				console.log(res.statusCode);
			}
		});
	}
}

module.exports = tg;