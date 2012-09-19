var check = require('validator').check;
var sanitize = require('validator').sanitize;

//start server
var redisConfig = require('./redis');
var io = require('socket.io');
io = io.listen(8900,{store:new io.RedisStore(redisConfig)})

//store rooms
var rooms = {};
var roomsPerSession = 3;
var crypto = require('crypto');

io.sockets.on('connection', function (socket){
  socket.emit('rooms',rooms); 

  socket.on('createRoom', function (room_id) {
    createRoom(socket,room_id);
  });

  socket.on('getRoom', function (room_id) {
    socket.emit('getRoom',rooms[room_id]);
  });

  socket.on('getUsers', function (room_id) {
    var users = getUsers(room_id);
    io.sockets.in(room_id).emit('users',users);
  });

  socket.on('joinRoom', function (session,room_id,user,password) {
    joinRoom(socket,session,room_id,user,password);
  });

  socket.on('newMessage', function (message) {
    newMessage(socket,message);
  });

  socket.on('disconnect', function (){

        for(var i in rooms){
            for(var j in rooms[i].users){
              if(rooms[i].users[j][2] == socket.id){
                var room_id = rooms[i].users[j][3];
                rooms[i].users.splice(j,1);
                var users = getUsers(room_id);
                io.sockets.in(room_id).emit('users',users);
              }
            }
        }
  });
});


//callbacks
function createRoom(socket,room){
  if(room != undefined){
      room.created = new Date().format("yyyy-MM-dd HH:mm:ss");
      var md5 = crypto.createHash('md5');
      md5.update(room.name+new Date().getTime(),'utf8');
      var roomKey = md5.digest('hex');
      rooms[roomKey] = room;
      socket.join(roomKey);
      socket.emit('rooms',rooms);
      socket.broadcast.emit('rooms',rooms);
    }
}

function joinRoom(socket,session,room_id,user,signature){
  user = sanitize(user).xss();
  if(room_id!=undefined){
      if(rooms[room_id] == undefined){
          socket.emit('joinRoom',{status:0,msg:'room is not exist!'});
          return;
      }

      var md5 = crypto.createHash('md5');
      md5.update(user+rooms[room_id].password+room_id);
      var key = md5.digest('hex');

      if(key == signature){
          socket.join(room_id);
          if(!existUser(room_id,session,user)){
            addUser(room_id,session,user,socket.id);
            socket.emit('joinRoom',{status:1});
          }else{
            socket.emit('joinRoom',{status:0,msg:'the session already contains a user!'});
          }
          var users = getUsers(room_id);
          io.sockets.in(room_id).emit('users',users);
      }else{
        socket.emit('joinRoom',{status:0,msg:'password is not correct!'});
      }
  }
}

function newMessage(socket,message){
    message.message = sanitize(message.message).xss();

    message.date = new Date().format("yyyy-MM-dd HH:mm:ss");
    io.sockets.in(message.room_id).emit('newMessage',message);
}


//functions
function getUsers(room_id){
    var users = [];
    if(rooms[room_id]!=undefined){
        for(var i in rooms[room_id].users){
          users.push({name:rooms[room_id].users[i][1]});
        }
    }

    return users;
}

function addUser(room_id,session,user,socket_id){
    if(rooms[room_id]!=undefined){
        if(rooms[room_id].users==undefined){
            rooms[room_id].users = [];
        }
        rooms[room_id].users.push([session,user,socket_id,room_id]);
    }
}

function existUser(room_id,session,user){
    if(rooms[room_id]!=undefined){
        if(rooms[room_id].users!=undefined){
            for(var i in rooms[room_id].users){
                if(rooms[room_id].users[i][0] == session){
                    return true;
                }
            }
        }
    }

    return false;
}

Date.prototype.format=function(fmt) {      
    var o = {      
    "M+" : this.getMonth()+1,    
    "d+" : this.getDate(), 
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12,   
    "H+" : this.getHours(),    
    "m+" : this.getMinutes(),    
    "s+" : this.getSeconds(), 
    "q+" : Math.floor((this.getMonth()+3)/3),   
    "S" : this.getMilliseconds()     
    };      
    var week = {      
    "0" : "\u65e5",      
    "1" : "\u4e00",      
    "2" : "\u4e8c",      
    "3" : "\u4e09",      
    "4" : "\u56db",      
    "5" : "\u4e94",      
    "6" : "\u516d"     
    };      
    if(/(y+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));      
    }      
    if(/(E+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);      
    }      
    for(var k in o){      
        if(new RegExp("("+ k +")").test(fmt)){      
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));      
        }      
    }      
    return fmt;      
}   

exports = io