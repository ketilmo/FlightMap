// Setup database schemas
var mongooseModels = require('../lib/mongooseModels'),
	GeoJSON = require('geojson');

exports.points = function(req, res){
	getPoints(function(points){
		res.setHeader('Content-Type', 'application/json');
		res.send(points);
		res.end;
	});
};

exports.lines = function(req, res){
	getLines(function(lines){
		res.setHeader('Content-Type', 'application/json');
		res.send(lines);
		res.end;
	});
};

exports.onConnection = function(mySocket){
	getPoints(function(points){
		mySocket.emit('trackData', points);
	});
	getLines(function(lines){
		mySocket.emit('trackData', lines);
	});
};

exports.updateClients = function(myIo){
	getPoints(function(points){
		myIo.sockets.emit('trackData', points);
	});
	getLines(function(lines){
		myIo.sockets.emit('trackData', lines);
	});
};

function getLines(callback){
	mongooseModels.TrackPoint.find().sort('-timeStamp').exec(function (err, trackpoints) {
	var geoArray = [];
	
	for (var i=0; i < trackpoints.length; i++){
		console.log(trackpoints[i].location)
		if (trackpoints[i].location.longitude != 0 && trackpoints[i].location.latitude != 0)
		{
				geoArray.push([trackpoints[i].location.longitude, trackpoints[i].location.latitude]);
		}
	}

	geoArray = [{ line: geoArray }];
	GeoJSON.parse(geoArray, {'LineString': 'line' }, function(geojson){
		callback(geojson);
	});
})
};

function getPoints(callback){
	
	mongooseModels.TrackPoint.find(function (err, trackpoints) {
	var geoArray = [];
	
	for (var i=0; i < trackpoints.length; i++){
		console.log(trackpoints[i].location)
		if (trackpoints[i].location.longitude != 0 && trackpoints[i].location.latitude != 0)
		{
			var geoObj = {
				latitude: trackpoints[i].location.latitude,
				longitude: trackpoints[i].location.longitude,
				popupContent: '<b>Time:</b> ' + trackpoints[i].timeStamp + '<br><b>Altitude:</b> ' + trackpoints[i].altitude + '<br><b>Speed:</b> ' + trackpoints[i].speed + '<br><b>Course:</b> ' + trackpoints[i].course
				};
				geoArray.push(geoObj);
		}
	}
	GeoJSON.parse(geoArray, {Point: ['latitude', 'longitude']}, function(geojson){
		callback(geojson);
	});
})
};