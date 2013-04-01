// Setup database schemas
var mongooseModels = require('../lib/mongooseModels'),
	globalEvents = require('../lib/globalEvents'),
	GeoJSON = require('geojson'),
	u = require('underscore');

var cachedTrackPointData = [];


exports.points = function(req, res){
	getPoints(function(points){
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.send(points);
		res.end;
	});
};

exports.lines = function(req, res){
	getLines(function(lines){
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

exports.cacheTrackPointData = function(){


	mongooseModels.TrackPoint.find().sort('-timeStamp').exec(function (err, trackpoints) {
	if (trackpoints.length < 1)
	{
		// No entries returned
	}
	else
	{
		cachedTrackPointData = trackpoints;
		globalEvents.ee.emit('trackPointsUpdated');
	}

	});
};

function getLines(callback){

	if (cachedTrackPointData.length > 0)
	{
		var geoArray = [];
		var trackpoints = cachedTrackPointData;
		for (var i=0; i < trackpoints.length; i++){
			if (trackpoints[i].location.longitude != 0 && trackpoints[i].location.latitude != 0)
			{
					geoArray.push([trackpoints[i].location.longitude, trackpoints[i].location.latitude]);
			}
		}
		geoArray = [{ line: geoArray }];
		

		GeoJSON.parse(geoArray, {'LineString': 'line' }, function(geojson){
			callback(geojson);
		});
	}	
};

function getPoints(callback){
			
	if (cachedTrackPointData.length > 0)
	{
		var geoArray = [];
		var trackpoints = cachedTrackPointData;
		for (var i=0; i < trackpoints.length; i++){
			if (trackpoints[i].location.longitude != 0 && trackpoints[i].location.latitude != 0)
			{
				var myDate = new Date(trackpoints[i].timeStamp);
				var geoObj = {
					latitude: trackpoints[i].location.latitude,
					longitude: trackpoints[i].location.longitude,
					popupContent: '<img src="https://secure.gravatar.com/avatar/e617400988756832376ef7b73a6527ba?=70" style="float:right"><h2>Ketil Moland Olsen</h2><b>Glider:</b> Team5 Green<br><b>Time:</b> ' + myDate + '<br><b>Altitude:</b> ' + trackpoints[i].altitude + '<br><b>Speed:</b> ' + trackpoints[i].speed + '<br><b>Course:</b> ' + trackpoints[i].course
					};
					geoArray.push(geoObj);
			}
		}

		var trimmedGeoArray = [];
		trimmedGeoArray.push(u.first(geoArray));
		trimmedGeoArray.push(u.last(geoArray));
		console.log(trimmedGeoArray);
		geoArray = trimmedGeoArray;

		GeoJSON.parse(geoArray, {Point: ['latitude', 'longitude']}, function(geojson){
			callback(geojson);
		});
	}
};