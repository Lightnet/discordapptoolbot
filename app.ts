/*
    Project Name: Discord Modular Bot
    Link:https://github.com/Lightnet/discord-modular-bot
    Created By: Lightnet
    License: cc (creative commons)

    Information: Please read the readme.md file for more information.
*/

/// <reference path="./DefinitelyTyped/node/node.d.ts" />
/// <reference path="./app/libs/plugin.ts" />
//console.log("discord.js bot app modular");
if(typeof __dirname == 'undefined'){
  __dirname = ".";
}

//var message = "/! item add build";
//var reg = /(\W)+\s/;
//var args = message.match(reg);
//console.log(args);

//console.log(process.versions);
var path = require('path');
var fs = require('fs');
var config = require('./app/config.json');

var express = require('express');
var app = express();

var http = require('http').Server(app);
var favicon = require('serve-favicon');
var io = require('socket.io')(http);
var methodOverride = require('method-override');
var compression = require('compression');
var session = require('express-session');
var flash = require('connect-flash');
var connect = require('connect');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var discordclient = require('discord.io');
var discordjs = require('discord.js');
var discordbot; //

function timeConverter(){
  var a = new Date();
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

//===============================================
// Plugin setup
//===============================================
var plugin = require('./app/libs/plugin.js');
plugin.setConfig(config);

//===============================================
// Models
//===============================================
var model_files = fs.readdirSync(__dirname + "/app/models");
model_files.forEach(function (modelFile) {
    if (path.extname(modelFile) == '.js') {
        console.log('loading model: ' + modelFile);
        require(__dirname + "/app/models/" + modelFile);
    }
});

//===============================================
// Plugin load models
//===============================================
//console.log("sync plugins");
var plugin_files = fs.readdirSync(__dirname + "/plugins");
console.log("// =====");
console.log("Plugins init...");
console.log("List:");
plugin_files.forEach(function (modelFile) {
    //console.log("plugin:"+modelFile);
    var package_filepath = __dirname + "/plugins/" + modelFile + "/"; //file path
    var package_filename = package_filepath + "package.json"; //pacakge congfig
	try {
		//fs.accessSync(package_filename, fs.F_OK);
      	fs.accessSync(package_filename, fs.F_OK);
      	var package_config = require(package_filename);//config script
		console.log( "Plugin" + "[" + package_config.enable +"]: "  + package_config.name);
		//add plugin list
		plugin.addplugin(package_config, package_filename);
		if(package_config.enable == true){
	      	var package_main = package_filepath + package_config.main;//main script
	      	try {
	        	fs.accessSync(package_main, fs.F_OK);
	        	var packagescript  = require(package_main);
	        	//add plugin list
	        	plugin.addModule(packagescript);
	      	} catch (e) {
	        	// It isn't accessible
	        	console.log(package_main);
	        	console.log("Plugin no main file js!" + modelFile);
	        	console.log(e);
	      	}
		}
	} catch (e) {
		// It isn't accessible
      	console.log(package_filename);
      	console.log("Plugin no file package!" + modelFile);
      	console.log(e);
    }
    //plugins.push(packagescript);
    //console.log(plugins.length);
    //console.log(package_config);
});
console.log("// Plugin End");
console.log("// =====");


var routes = express.Router(); //Router is for page access
var configweb  = true; //place holder

if(configweb){

    app.set('view engine', 'ejs'); // set up ejs for templating
    app.set('views', [__dirname + '/app/views']);
    app.use("/", express.static('./public')); //redirect folder path
    app.use(favicon(__dirname + '/public/favicon.ico', { maxAge: 1000 }));
    //app.use(favicon('./public/favicon.ico',{ maxAge: 1000 }));
    app.use(compression());
    // parse application/json
    app.use(bodyParser.json());
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true })); // get information from html forms
    // parse application/vnd.api+json as json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    // required for passport
    app.use(cookieParser()); // required before session.
    //app.use(session({secret: SECRET,key: KEY,proxy: true // if you do SSL outside of node.}));
    plugin.AssignBeforeSession(app, session, config);
    plugin.AssignSession(app, session, config);

    app.use(methodOverride());
    plugin.AssignAfterSession(app, session, config);
    //app.use(passport.initialize());//working with the express 4
    //app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session
    app.use(routes);
    routes.get('/', function (req, res) {
        res.render('index', {user: req.user});
    });

	routes.get('/plugins', function (req, res) {
        res.render('plugins', {user: req.user});
    });
    /*
    routes.get('/', function (req, res) {
       res.contentType('text/html');
       res.send('Hello World!');
       //res.send('<iframe src="https://discordapp.com/widget?id=&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0"></iframe>');
   });
   */
   // ==============================================
   // Route Pages/URL
   // ==============================================
    plugin.AssignRoute(routes, app);
    app.use('/', routes);

    // ==============================================
    // socket.io
    // ==============================================
    plugin.setSocketIO(io);//assign socket.io global access
    require('./app/libs/socketio_module.js')(io); //setup io list of modules
}

function init_web_server(){
	var HOSTIP = process.env.IP || "0.0.0.0";
    var HOSTPORT = process.env.PORT || 3000;
    //start listen server for web host
    http.listen(HOSTPORT, HOSTIP, function () {
        console.log('http://' + HOSTIP + ':' + HOSTPORT + '/');
        //console.log('listening on:' + HOSTIP + ':' + HOSTPORT);
        //console.log(new Date());
    });
}
//===============================================
// Discorad bot setup
//===============================================
var keyid = {};
if(config.btoken){
    keyid = {
        autorun: config.autorun,
        token: config.token
    };
    console.log("Access Type: Token key Set");
}else{
    keyid = {
        autorun: config.autorun,
        email: config.email,
        password: config.password
    };
    console.log("Access Type: Login Set");
}
//init setup connection
//discordbot = new discordclient.Client(keyid);//discordio
discordbot = new discordjs.Client();

//set up ready variable
console.log("init bot!");
discordbot.on('ready', function() {
	console.log("bot ready!");
	console.log(discordbot.user.username + " - [" + discordbot.user.id + "]");
    plugin.AssignInit(); //init plugin module function.
	//set discord.js bot
    plugin.setdiscordclient(discordbot); //set discord app bot
    //console.log(discordbot);
	//console.log("inviteURL:" + discordbot.inviteURL );
	console.log("inviteURL:" + "https://discordapp.com/oauth2/authorize?client_id=" + discordbot.user.id + "&scope=bot");
	//io.emit('discordready');
	//console.log(discordbot.guilds);
	//console.log(discordbot.guilds.size);
	//console.log(discordbot.guilds.Map);
	discordbot.guilds.forEach(function (guild) {
    	//console.log("id:"+guild.id);
		//console.log("name:"+guild.name);
		guild.members.forEach(function (member) {
			//console.log("id:"+member.user.id);
			//console.log("username:"+member.user.username);
			//console.log("status:"+member.user.status);
			//console.log("bot:"+member.user.bot);
		});
		guild.channels.forEach(function (channel) {
			if(channel.name == config.current.channelname && guild.name == config.current.servername){
				//console.log(channel);
				config.current.serverid = guild.id;
				config.current.channelid = channel.id;
			}
			//console.log("id:"+channel.id);
			//console.log("username:"+channel.name);
			//console.log("status:"+channel.type);
		});
	});

	//init web server
	init_web_server();
});

//listen to the message from all channels that is link to the account
discordbot.on('message', message => {
	//console.log("channelID:"+channelID + " userID:" + userID + " user:" + user);
	//console.log("message:"+message);
	plugin.AssignMessage(message, function(text){
		if(text !=null){ //make sure the string text
			//AddChatMessage(text);
		}
	});
});

//initialize discord
//discordbot.login(config.token,output);
console.log(discordjs);
console.log(discordbot);
//console.log(discordbot.message);
discordbot.login(config.token);







/*
 * END Script
 */
