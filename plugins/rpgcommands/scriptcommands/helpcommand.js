/*
    Project Name: Discord Modular Bot
    Link:https://github.com/Lightnet/discord-modular-bot
    Created By: Lightnet
    License: cc (creative commons)

    Information: Please read the readme.md file for more information.
*/

var plugin = require("../../../app/libs/plugin.js");

module.exports.commandline = "help";

module.exports.executescript = function(message,args){
	message.channel.sendMessage("Help found! \n Test");
	//message.reply('help found!');
	console.log(message.channel);
};