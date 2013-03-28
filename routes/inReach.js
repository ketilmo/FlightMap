// Setup database schemas
var mongooseModels = require('../lib/mongooseModels'),
	app = require('../app'),
	clientGeoDataEmitter = require('../lib/clientGeoDataEmitter'),
	GeoJSON = require('geojson');


exports.postInReachEntries = function(req, res){

	var inReachEntries = req.body;

	if (inReachEntries.Events.length > 0)
	{
		
		res.setHeader('Content-Type', 'application/json');

		saveInReachEntries(inReachEntries, function(message, statusCode){
			res.send(message, statusCode);
			res.end;
		});
	}
	else
	{
		res.setHeader('Content-Type', 'application/json');
		res.send('{ "Error": "Invalid payload."}', 400);
		res.end;
	}
};

function saveInReachEntries(inReachEntries, callback){
	var trackPoints = [];

	for (var i=0; i < inReachEntries.Events.length; i++){
		
		var inReachEntry = inReachEntries.Events[i];

		var trackPoint = new mongooseModels.TrackPoint({ 
			trackerId: inReachEntry.imei,
			messageCode: inReachEntry.messageCode,
			message: inReachEntry.freeText,
			timeStamp: inReachEntry.timeStamp,
			location: { longitude: inReachEntry.point.longitude, latitude: inReachEntry.point.latitude },
			altitude: inReachEntry.point.altitude,
			course: inReachEntry.point.course,
			speed: inReachEntry.point.speed
		}); 


		// Is the transmitted data valid?
		if (!(isNaN(trackPoint.trackerId)) && (trackPoint.trackerId.toString().length == 15) ) {
			console
			// Save entry to database
			trackPoint.save(function (err, trackPoint){
				// If there were errors during save, return an error message to the inReach server.

				if (err) {
					callback('{ "Error": "Unable to save entry."}', 400);
					return;
				}
			});
			trackPoints.push(trackPoint);
		} 
		// Invalid data submitted.
		else
		{
			callback('{ "Error": "Invalid payload."}', 400);
		}
	}
	
	// If save of all entries was successful, send a positive response to the inReach server.
	clientGeoDataEmitter.updateClients(app.io);
	callback(JSON.stringify(trackPoints), 200);
}