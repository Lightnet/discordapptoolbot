/*
 *
*/
declare var ko: any;

var MemberDataModel:any = function (_id, _name, _data) {
    this.name = ko.observable(_name);
    this.id = ko.observable(_id);
    this.data = _data;
}
//server model
var ServerDataModel:any = function (_id, _name,_obj) {
    this.name = ko.observable(_name);
    this.id = ko.observable(_id);
    this.channels = ko.observableArray();
    this.members = ko.observableArray();
    this.data = _obj;
}
//Channel model
var ChannelDataModel:any = function (_id, _name, _obj) {
    this.name = ko.observable(_name);
    this.id = ko.observable(_id);
    this.type = ko.observable(_obj.type);
    if(_obj.type == 'text'){
    this.icon = 'glyphicon glyphicon-comment';
    }else{
    //<span class="glyphicon glyphicon-headphones"></span>
    //icon-headset
    this.icon = 'glyphicon glyphicon-headphones';
    }
    this.data = _obj;
}

var ServerListModel:any = function () {
    this.serverid = ko.observable();
    this.servername = ko.observable();
    this.items = ko.observableArray([]); //server list data
    this.members = ko.observableArray([]);//set member to display
    this.channels = ko.observableArray([]);//set channel to display
    this.servers = ko.observableArray([]);//set server list to display

    var self = this;
    this.additem = function(_object){
        this.items.push(_object);
    }

    this.serverid.subscribe(function(newValue) {
        // Handle a change here, e.g. update something on the server with Ajax.
        //alert('myfield changed to ' + newValue);
        //console.log(newValue);
        //console.log(self.items());
        for (i in self.items()){
          //console.log(server);
          //console.log(self.items()[i]);
          if(self.items()[i].id() == newValue){
            //console.log(self.items()[i]);
            //console.log("found!");
            //console.log(self.items()[i].members());
            self.members(self.items()[i].members());
            self.channels(self.items()[i].channels());
          }
        }
    });

    this.selectserverid = function(_id){
        for (i in self.items()){
            //console.log(server);
            //console.log(self.items()[i]);
            if(self.items()[i].id() == _id){
                //console.log(self.items()[i]);
                //console.log(self.items()[i].name());
                //this.servername(self.items()[i].name());
                //console.log("found!");
                //console.log(self.items()[i].members());
                this.servername(self.items()[i].name());
                this.serverid(self.items()[i].id());
                self.members(self.items()[i].members()); //set current member server
                self.channels(self.items()[i].channels()); //set current channel server
                self.servers(self.items()); //server list
            }
        }
    }

    this.getserverlist = function(){
        self.servers(self.items()); //server list
    }

    this.clearserver = function(){
        this.items = ko.observableArray([]);
    }

    this.clearitem = function(){
        this.items = ko.observableArray([]);
    }
}

//===============================================
// #socket.io
//===============================================
var socket = io();
//console.log("SOCKET");
socket.on('connect', function () {
    console.log('server connected');
    //socket.emit('getdiscordclient');
});
socket.on('event', function(data){
    console.log('event');
    console.log(data);
});
socket.on('disconnect', function () {
    console.log('server disconnected');
});
socket.on('chat message', function (data) {
    //$('#messages').append($('<li>').text(msg));
    if(data.msg !=null){
        AddChatMessage(data.msg);
    }
    console.log('chat message');
});
socket.on('discordready', function (data) {
    //$('#messages').append($('<li>').text(msg));
    //console.log(data);
    //if(data.msg !=null){
        //AddChatMessage(data.msg);
    //}
    //console.log('discordready');
    socket.emit('getdiscordclient');
});

socket.on('server', function (data) {
    //$('#messages').append($('<li>').text(msg));
    //console.log("server");
    //console.log(data);
    if(data != null){
        if(data['action'] == "clearserver"){
            //console.log("server clearserver");
            serverlist.clearserver();
        }
        if(data['action'] == "add"){
            console.log("server add");

            var cserver = data['data'];
            var _serverdata  = new ServerDataModel(data['data'].id,data['data'].name, data['data']);
            //console.log(__server.name());

            for (var i = 0;i < cserver.members.length;i++){
                //console.log(cserver.members[i].name);
                var member = new MemberDataModel(cserver.members[i].id,cserver.members[i].name, cserver.members[i]);
                _serverdata.members.push(member);
            }

            for (var i = 0;i < cserver.channels.length;i++){
                //console.log(cserver.channels[i].name);
                var channel = new ChannelDataModel(cserver.channels[i].id,cserver.channels[i].name, cserver.channels[i]);
                _serverdata.channels.push(channel);
            }
            serverlist.additem(_serverdata);
            serverlist.getserverlist();
            //serverlist.selectserverid("134426547137413121");
        }
    }
});




//===============================================
// @functions
//===============================================

//Input key press
function ChatInputHandle(event) {
    if (event.which == 13 || event.keyCode == 13) {
        //code to execute here
        var tb:any = document.getElementById("chatinputtext");
        InputChatText(tb.value);
        return false;
    }
    return true;
};

//button press
function ButtonChatMessage(){
  var tb:any = document.getElementById("chatinputtext");
  InputChatText(tb.value);
}

//add text to the message div id
function AddChatMessage(_text){
  var cbm = document.getElementById("chatboxmessage");
  var elemDiv = document.createElement('div');
  elemDiv.innerHTML = _text;
  cbm.appendChild(elemDiv);
  cbm.scrollTop = cbm.scrollHeight;
}

//send message to server
function InputChatText(_text){
  //send to server with channel id
  if(socket !=null){
      console.log("text:"+_text);
    socket.emit('chat message',{msg:_text});
  }

  /*
  bot.sendMessage({
      to: config.current.channelid,
      message: _text
  });
  */
}

//create variable div to add to chat message
var serverlist = new ServerListModel();
//Event
function addEvent(element, eventName, fn) {
    if (element.addEventListener)
        element.addEventListener(eventName, fn, false);
    else if (element.attachEvent)
        element.attachEvent('on' + eventName, fn);
}

//key bind to models on on load event
addEvent(window, 'load', function(){
    console.log("BIND KO");
  ko.applyBindings(serverlist,document.getElementById("serverlist"));
  ko.applyBindings(serverlist,document.getElementById("memberslist"));
});
//===============================================
//
//===============================================
