var io = require('socket.io');
io = io.listen(8900,{store:new io.RedisStore()})
var crypto = require('crypto');

//store rooms
var rooms = {};
var roomsPerSession = 3;

io.sockets.on('connection', function (socket){
  socket.emit('rooms',rooms); 

  socket.on('createRoom', function (room_id) {
    createRoom(socket,room_id);
  });

  socket.on('getRoom', function (room_id) {
    socket.emit('getRoom',rooms[room_id]);
  });

  socket.on('joinRoom', function (room_id,user,password) {
    joinRoom(socket,room_id,user,password);
  });

  socket.on('newMessage', function (message) {
    newMessage(socket,message);
  });

  socket.on('disconnect', function (){});
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

function joinRoom(socket,room_id,user,signature){
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
          console.log(socket.id +" join room:"+room_id);
          socket.emit('joinRoom',{status:1});
      }else{
        socket.emit('joinRoom',{status:0,msg:'password is not correct!'});
      }
  }
}

function newMessage(socket,message){
     message.date = new Date().format("yyyy-MM-dd HH:mm:ss");
     io.sockets.in(message.room_id).emit('newMessage',message);
}

Date.prototype.format=function(fmt) {      
    var o = {      
    "M+" : this.getMonth()+1, //月份      
    "d+" : this.getDate(), //日      
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时      
    "H+" : this.getHours(), //小时      
    "m+" : this.getMinutes(), //分      
    "s+" : this.getSeconds(), //秒      
    "q+" : Math.floor((this.getMonth()+3)/3), //季度      
    "S" : this.getMilliseconds() //毫秒      
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