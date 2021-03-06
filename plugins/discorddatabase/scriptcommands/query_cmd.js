/*
    Project Name: Discord Modular Bot
    Link:https://github.com/Lightnet/discord-modular-bot
    Created By: Lightnet
    License: cc (creative commons)

    Information: Please read the readme.md file for more information.
*/
var fs = require('fs');
var configpath = __dirname + '/../config.json';
//console.log(configpath);
var config = require('../config.json');
var plugin = require("../../../app/libs/plugin.js");

//client, message from listen, channel seearch from client
function findall(discordbot, message, channel, args){
	channel.fetchMessages().then(messages =>{
		//console.log(messages.size);
		//console.log(messages);
		//need to convert to json some how?
		messages.forEach(function(mg){
			console.log(mg);
		});
	});
};
//delete is part of the nodejs so it name is used
function remove(discordbot, message, channel, args){
	channel.fetchMessages().then(messages =>{
		//console.log(messages.size);
		//console.log(messages);
		//db query delete {"test":"testme"}
		var index = message.content.search('delete');
		var _message = message.content.substr(index+7,message.content.length);
		var _objm = JSON.parse(_message);
		//console.log(_message);
		console.log(_objm);
		var objvalue;
		var objvar;
		for(value in _objm){
			console.log("value:"+value + ":" + _objm[value]);
			objvalue = value;
			objvar = _objm[value];
		}
		//console.log(Object);
		//need to convert to json some how?
		messages.forEach(function(mg){
			//console.log(mg.content);
			console.log(mg);
			var _obj = JSON.parse(mg.content);
			//console.log(_obj);
			try{
				if(_obj[objvalue] !=null){
					if(_obj[objvalue] == objvar){
						//console.log("found!");
						mg.delete();
					}
				}
			}catch(e){
				console.log('ERROR object Value');
			}
		});
		objvalue = null;
		objvar = null;
		index = null;
		_message = null;
		_objm = null;
		_obj = null;
	});
};

//need to fixed filter and args
function insert(discordbot, message, channel, args){
	//db query insert {"test": "testme"}
	console.log(message);
	console.log(channel);
	var index = message.content.search('insert');
	console.log(index);
	var _string = message.content.substr(index+7,message.content.length);
	console.log("|"+_string);
	channel.sendMessage(_string);
	message.sendMessage("string added to database!");
};
//working on it
function update(discordbot, message, channel, args){
	//db query update {"test": "testme","last":"one"}
	var index = message.content.search('update');
	var _string = message.content.substr(index+7,message.content.length);
	var _objm = JSON.parse(_string);
	//console.log("|"+_string);
	channel.fetchMessages().then(messages =>{
		console.log(messages);
		messages.forEach(function(mg){
			var _obj2 = JSON.parse(mg.content);
			var bfound = false;
			//need to work on the fixed here just tmp
			for(value in _objm){
				for(value2 in _obj2){
					if((value == value2)&&(_obj2[value2] == _objm[value])){
						bfound = true;
						break;
					}
				}
				if(bfound){
					_obj2[value] = _objm[value];
				}
			}
			if(bfound){
				var _objstr = JSON.stringify(_obj2);
				mg.edit(_objstr); //update the edit message
				//console.log(_objstr);
			}
			_obj2 =null;
			bfound =null;
			_objstr= null;
			_objm =null;
		});
	});
}


module.exports.commandline = "query";

module.exports.scriptparams = "query findall \nquery insert {}\nquery delete {}\nquery update {}";

module.exports.executescript = function(message,args){
	//console.log("data?");
	//console.log(message);
	var discordbot = plugin.getdiscordclient();
	//console.log(discordbot);
	if(discordbot != null){
		//if id key is not assign serach for guild and channel text name
		if((config.databaseguildid == "")|| (config.databasechannelid == "")){
			discordbot.guilds.forEach(function (guild) {
		    	//console.log("id:"+guild.id);
				//console.log("name:"+guild.name);
				if(config.databaseguildname == guild.name){
					guild.channels.forEach(function (channel) {
						//console.log("id:"+channel.id);
						//console.log("username:"+channel.name);
						//console.log("status:"+channel.type);
						if(config.databasechannelname == channel.name){
							config.databaseguildid = guild.id;
							config.databasechannelid = channel.id;
							//set guild and channel id to be save in config.json
							fs.writeFile(configpath, JSON.stringify(config, null, 4), function(err) {
								if(err) {
									console.log(err);
								} else {
									console.log("JSON saved to " + configpath);
								}
							});
						}
					});
				}
			});
		}else{//console.log('other?');
			//channel check
			//console.log(args);
			if(config.databasechannelid != ""){
				var channel = discordbot.channels.get(config.databasechannelid);
				//need to check if channel id is valid?
				if(channel !=null){
					//console.log("found!");
					//console.log(channel);
					if(args[2] != null){
						if(args[2] == "findall"){
							findall(discordbot,message,channel,args);
						}
						if(args[2] == "insert"){
							insert(discordbot,message,channel,args);
						}
						if(args[2] == "delete"){
							remove(discordbot,message,channel,args);
						}
						if(args[2] == "update"){
							update(discordbot,message,channel,args);
						}
					}
				}
			}
		}
	}
	discordbot = null;
};
