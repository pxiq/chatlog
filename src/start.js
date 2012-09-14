require('./chat_server');

var icecream  = require('icecream');
var port = 8000;
icecream.createServer();
icecream.set('appRoot',  __dirname +'/app');
icecream.set('debug', true);
icecream.set('defaultEngine', 'ejs');

var connect    = require('connect');
var RedisStore = require('connect-redis')(connect);
var redis      = require("redis");
var client     = redis.createClient('6379','localhost');
icecream.use(connect.session({ store: new RedisStore({client:client}), secret: '123' }));
icecream.listen(port);
console.log('Listen on: ' + port);