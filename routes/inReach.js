// Setup database schemas
var mongooseModels = require('../lib/mongooseModels');
var GeoJSON = require('geojson');


exports.postNewEntry = function(req, res){
	
	var newEntry = req.body;
		
	if (newEntry)
	{
		for (var i=0; i < newEntry.Events.length; i++){
				
				var trackPoint = new mongooseModels.TrackPoint({ 
					trackerId: newEntry.Events[i].imei,
					messageCode: newEntry.Events[i].messageCode,
					message: newEntry.Events[i].freeText,
					timeStamp: newEntry.Events[i].timeStamp,
					location: { longitude: newEntry.Events[i].point.longitude, latitude: newEntry.Events[i].point.latitude },
					altitude: newEntry.Events[i].point.altitude,
					course: newEntry.Events[i].point.course,
					speed: newEntry.Events[i].point.speed
				}); 

				// Save to database
				trackPoint.save(function (err, trackPoint){
					if (err) {
						console.log(err);
						res.setHeader('Content-Type', 'application/json');
						res.send('{ "Error": "Unable to save entry."}', 400);
						res.end;
					}
					else
					{
						console.log(JSON.stringify(trackPoint));
						res.setHeader('Content-Type', 'application/json');
						res.send(JSON.stringify(trackPoint));
						res.end;
					}
				});
			}
	}
	else
	{
		console.log("Error: Invalid payload.");
		res.setHeader('Content-Type', 'application/json');
		res.send('{ "Error": "Invalid payload."}', 400);
		res.end;
	}
};

exports.points = function(req, res){
	
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
		res.setHeader('Content-Type', 'application/json');
		res.send(geojson);
		res.end;
		io = require('../app').io;
		io.sockets.emit('point', geojson);
	});
})
};

exports.lines = function(req, res){
	
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
		res.setHeader('Content-Type', 'application/json');
		res.send(geojson);
		res.end;
		io = require('../app').io;
		io.sockets.emit('line', geojson);
	});
})
};