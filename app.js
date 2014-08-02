/**
 * Module dependencies.
 */
var express = require('express'),
	mongoose = require('mongoose'),
	http = require('http'),
	path = require('path'),
	routes = require('./routes'),
	inreach = require('./routes/inReach'),
	statusCodes = require('./routes/statusCodes'),
	clientGeoDataEmitter = require('./lib/clientGeoDataEmitter');

var app = express();

app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// Error handling
var error = require('./lib/errorHandler');

var env = process.env.NODE_ENV || 'development';

if ('development' == env) {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(error({ showMessage: true, dumpExceptions: true, showStack: true, logErrors: false }));
	mongoose.connect(
		'mongodb://'+ process.env.gliderlog_db_prod_username + ':' + process.env.gliderlog_db_prod_password + 
		"@" + process.env.gliderlog_db_prod_server + "/" + process.env.gliderlog_db_prod_database
	);
};

if ('test' == env) {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(error({ showMessage: true, dumpExceptions: true, showStack: true, logErrors: false }));
	mongoose.connect(
		'mongodb://'+ process.env.gliderlog_db_prod_username + ':' + process.env.gliderlog_db_prod_password + 
		"@" + process.env.gliderlog_db_prod_server + "/" + process.env.gliderlog_db_prod_database
	);
};

if ('production' == env) {
	app.set('port', process.env.PORT || 80);
	app.use(error());
	mongoose.connect(
		'mongodb://'+ process.env.gliderlog_db_prod_username + ':' + process.env.gliderlog_db_prod_password + 
		"@" + process.env.gliderlog_db_prod_server + "/" + process.env.gliderlog_db_prod_database
	);
};

// Initiate database connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("Successfully connected to database.");
});

// Begin routes
//app.get('/', routes.index); // When disabled, use static index.html
app.post('/api/v1/post/inreach', inreach.postInReachEntries);
app.get('/api/v1/post/inreach', statusCodes.notAllowed);
app.get('/points', clientGeoDataEmitter.points);
app.get('/lines', clientGeoDataEmitter.lines);
//End routes

// Not Found
app.use(statusCodes.notFound);

var server = http.createServer(app);
var io = require('socket.io').listen(server);
module.exports.io = io; 

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Socket.io

io.sockets.on('connection', function(socket) {
	clientGeoDataEmitter.onConnection(socket);
});

// Load track data from database
clientGeoDataEmitter.cacheTrackPointData();
