
/**
 * Module dependencies.
 */

var express = require('express');
//var routes = require('./routes/index');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html',ejs.__express) ; 
app.set('view engine', 'html');	// 替换：app.set('view engine', 'ejs')

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  //res.send('nihao');
  res.render('chat');
  
  
});


var server=http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var io = require('socket.io').listen(server);
var count = 0;
var array=new Array();
var i=0;
var msg; 
//监听所有到服务器上的连接.
io.sockets.on('connection', function (socket) {
          //有新的连接,count加1,将现在的总连接数,广播给所有用户.
          count++;console.log(count);
          socket.emit('usernum',{number:count});
          socket.emit('shuju',{table:array});
          socket.broadcast.emit('usernum',{number:count});
          //一旦有请求,连接到服务器,则监听message事件,读取信息,然后将这个信息广播给所有的连接,包括新的连接和老的连接.
          socket.on('message', function (data) {
            socket.emit('push message', data);
            socket.broadcast.emit('push message', data);
            i%=10;
            array[i++]=data;
            msg =data.text;
           // lib(msg);
          });
          //监听断开连接,count减1,然后将总连接数发送给其他全部客户端
          socket.on('disconnect',function(){
            count--;
            socket.broadcast.emit('usernum',{number:count});
          });
});

