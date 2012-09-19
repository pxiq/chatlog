/*
 Start Chat Server
 */
require('./chat_server');


/*
 Start Web Server
 */
var redisConfig = require('./redis');
var icecream  = require('icecream');
var port = 8000;
icecream.createServer();
icecream.set('appRoot',  __dirname +'/app');
icecream.set('debug', true);
icecream.set('defaultEngine', 'ejs');

//set redis for session storage 
var connect    = require('connect');
var RedisStore = require('connect-redis')(connect);
var redis      = require("redis");
var client     = redis.createClient(redisConfig.port,redisConfig.host);
icecream.use(connect.session({ store: new RedisStore({client:client}), secret: '123' }));

//not support IE
icecream.use(function(req,res,next){
        if(req.headers['user-agent']!=undefined && req.headers['user-agent'].toUpperCase().indexOf("MSIE")!=-1){
             res.write("Sorry, Not Support IE!<br/><br/>Click to download <a href='http://chrome.google.com'>Chrome</a> or <a href='http://www.mozilla.com'>Firefox</a>");
             res.end();
        }else next();
});
icecream.listen(port);
console.log('Web Server started, listening on : ' + port);