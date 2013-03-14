/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , inreach = require('./routes/inreach')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('test', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/api/v1/post/inreach', inreach.postNewEntry);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
