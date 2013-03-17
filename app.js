/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , inreach = require('./routes/inreach')
  , statusCodes = require('./routes/statusCodes')
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

// Error handling
var error = require('./lib/errorHandler');

app.configure('development', function(){
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(error({ showMessage: true, dumpExceptions: true, showStack: true, logErrors: false }));
});

app.configure('test', function(){
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(error({ showMessage: true, dumpExceptions: true, showStack: true, logErrors: false }));
});

app.configure('production', function(){
  app.set('port', process.env.PORT || 80);
  app.use(error());
});

// Begin routes
app.get('/', routes.index);
app.post('/api/v1/post/inreach', inreach.postNewEntry);
app.get('/api/v1/post/inreach', inreach.postNewEntry);
// app.get('/api/v1/post/inreach', statusCodes.notAllowed);
//End routes

// Not Found
app.use(statusCodes.notFound);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
