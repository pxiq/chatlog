//var RedisStore = require('./lib/stores/redis')
//var io = require('./lib/socket.io').listen(8900,{store:new RedisStore()});
var io = require('socket.io').listen(8900);
var crypto = require('crypto');

//store rooms
var rooms = {};
var roomsPerSession = 3;

io.sockets.on('connection', function (socket){
  socket.emit('rooms',rooms); 

  socket.on('createRoom', function (room_id) {
    createRoom(socket,room_id);
  });

  socket.on('joinRoom', function (room_id) {
    joinRoom(socket,room_id);
  });

  socket.on('newMessage', function (message) {
    newMessage(socket,message);
  });

  socket.on('disconnect', function (){});
});

//callbacks
function createRoom(socket,room){
  if(room!=undefined){
      var md5 = crypto.createHash('md5');
      md5.update(room.name+new Date().getTime(),'utf8');
      var roomKey = md5.digest('hex');
      rooms[roomKey] = room;
      socket.join(roomKey);
      socket.emit('rooms',rooms);
      socket.broadcast.emit('rooms',rooms);
    }
}

function joinRoom(socket,room_id,user,password){
  if(room_id!=undefined){
      socket.join(room_id);
      console.log(socket.id +" join room:"+room_id);
      socket.emit('joinRoom',1);
  }

  console.dir(io.sockets.manager.rooms);
}

function newMessage(socket,message){
     io.sockets.in(message.room_id).emit('newMessage',message);
}

exports = io