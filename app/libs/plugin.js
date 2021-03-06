/*
    Project Name: Discord Modular Bot
    Link:https://github.com/Lightnet/discord-modular-bot
    Created By: Lightnet
    License: cc (creative commons)

    Information: Please read the readme.md file for more information.
*/
"use strict";
//console.log(manage);
//var instance_manage = manage();
//declare var modules;
//declare var addModule;
//declare var removeModule;
//declare var getModules;
//declare var addView;
var Globals;
(function (Globals) {
    Globals.m_Name = "Game Manage";
})(Globals = exports.Globals || (exports.Globals = {}));
var managePlugin = (function () {
    //console.log("init manage");
    function managePlugin() {
        //public static MyInstance:any;
        this.self = this;
        //database
        this.databasetype = "";
        this.database = [];
        //plugin list
        this.pluginlist = [];
        this.modulelist = [];
        this.initlist = [];
        this.messagelist = [];
        this.socketconnectList = [];
        this.socketdisconnectList = [];
        this.routeList = [];
        this.appBeforeSession = [];
        this.appSession = [];
        this.appAfterSession = [];
        if (Globals.m_Instance == null) {
            Globals.m_Instance = this.self;
            this.id = Math.random();
        }
        else if (Globals.m_Instance != this.self) {
            this.self = Globals.m_Instance;
        }
        //console.log("init manage plugin:"+this.id);
        //console.log(module);
        //console.log(Globals);
    }
    managePlugin.prototype.setdiscordclient = function (_obj) {
        this.discordbot = _obj;
    };
    managePlugin.prototype.getdiscordclient = function () {
        return this.discordbot;
    };
    managePlugin.prototype.setConfig = function (_config) {
        this.config = _config;
    };
    managePlugin.prototype.getConfig = function () {
        return this.config;
    };
    managePlugin.prototype.getChanelID = function () {
        return this.config.current.channelid;
    };
    //type, database class
    managePlugin.prototype.addDatabase = function (_data) {
        if (_data === void 0) { _data = {}; }
        if (_data.type != null) {
            if (_data.database != null) {
                this.databasetype = _data.type;
                this.database[_data.type] = _data.database;
            }
        }
    };
    //get current database type
    managePlugin.prototype.getDatabase = function (_type) {
        if (_type === void 0) { _type = null; }
        if (_type != null) {
            if (this.database[_type] != null) {
                return this.database[_type];
            }
            else {
                throw new Error('Database type not setup!');
            }
        }
        else {
            return this.database[this.databasetype];
        }
    };
    managePlugin.prototype.addplugin = function (_config, _path) {
        this.pluginlist.push({ config: _config, path: _path });
    };
    managePlugin.prototype.getpluginlist = function () {
        return this.pluginlist;
    };
    managePlugin.prototype.addModule = function (_module) {
        //console.log("Added Module...");
        //console.log(_module);
        //console.log(this.modulelist);
        this.modulelist.push(_module);
        if (typeof _module.init === 'function') {
            //console.log("function found!");
            this.initlist.push(_module);
        }
        else {
        }
        if (typeof _module.message === 'function') {
            //console.log("function found!");
            this.messagelist.push(_module);
        }
        else {
        }
        //route page url
        if (typeof _module.setroute === 'function') {
            //console.log("function found!");
            this.routeList.push(_module);
        }
        else {
        }
        //socket connection
        if (typeof _module.socket_connect === "function") {
            this.socketconnectList.push(_module);
        }
        else {
        }
        if (typeof _module.socket_disconnect === "function") {
            this.socketdisconnectList.push(_module);
        }
        else {
        }
        if (typeof _module.setBeforeSession === "function") {
            this.appBeforeSession.push(_module);
        }
        if (typeof _module.setSession === "function") {
            this.appSession.push(_module);
        }
        if (typeof _module.setAfterSession === "function") {
            this.appAfterSession.push(_module);
        }
    };
    managePlugin.prototype.AssignBeforeSession = function (_app, _session, _config) {
        for (var i = 0; i < this.appBeforeSession.length; i++) {
            this.appBeforeSession[i].setBeforeSession(_app, _session, _config);
        }
    };
    managePlugin.prototype.AssignSession = function (_app, _session, _config) {
        for (var i = 0; i < this.appSession.length; i++) {
            this.appSession[i].setSession(_app, _session, _config);
        }
    };
    managePlugin.prototype.AssignAfterSession = function (_app, _session, _config) {
        for (var i = 0; i < this.appAfterSession.length; i++) {
            this.appAfterSession[i].setAfterSession(_app, _session, _config);
        }
    };
    //add plugin
    managePlugin.prototype.removeModule = function (_module) {
        for (var i = 0; i < this.modulelist.length; i++) {
            if (this.modulelist[i] == _module) {
            }
        }
    };
    //get list plugin module
    managePlugin.prototype.getModuleList = function () {
        return this.modulelist;
    };
    //set message
    managePlugin.prototype.AssignInit = function () {
        for (var i = 0; i < this.initlist.length; i++) {
            this.initlist[i].init();
        }
    };
    //set message
    managePlugin.prototype.AssignMessage = function (message, _callback) {
        //console.log("added message?");
        //console.log(this.messagelist.length);
        for (var i = 0; i < this.messagelist.length; i++) {
            //console.log(this.messagelist[i]);
            this.messagelist[i].message(message, _callback);
        }
    };
    //set route
    managePlugin.prototype.AssignRoute = function (_routes, _app) {
        //console.log("routes");
        for (var i = 0; i < this.routeList.length; i++) {
            this.routeList[i].setroute(_routes, _app);
        }
    };
    //set connection
    managePlugin.prototype.AssignConnect = function (_io, _socket) {
        for (var i = 0; i < this.socketconnectList.length; i++) {
            this.socketconnectList[i].socket_connect(_io, _socket);
        }
    };
    //set disconnection
    managePlugin.prototype.AssignDisconect = function (_io, _socket) {
        for (var i = 0; i < this.socketdisconnectList.length; i++) {
            this.socketdisconnectList[i].socket_disconnect(_io, _socket);
        }
    };
    //add views
    managePlugin.prototype.addAppView = function (_app, _view) {
        //console.log("Adding app view...");
        var views = _app.get('views');
        //console.log(views);
        views.push(_view); // need to set array string first and not a string var
        _app.set('views', views);
    };
    //set socket.io set
    managePlugin.prototype.setSocketIO = function (_io) {
        this.io = _io;
    };
    //get socket.io
    managePlugin.prototype.getSocketIO = function () {
        return this.io;
    };
    return managePlugin;
}());
exports = (module).exports = new managePlugin();
