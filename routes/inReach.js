// Setup database schemas
var mongooseModels = require('../lib/mongooseModels'),
	app = require('../app'),
	clientGeoDataEmitter = require('../lib/clientGeoDataEmitter'),
	GeoJSON = require('geojson'),
	moment = require('moment');

exports.postInReachEntries = function(req, res){

	var inReachEntries = req.body;

	if (inReachEntries.Events.length > 0)
	{
		
		res.setHeader('Content-Type', 'application/json; charset=utf-8');

		saveInReachEntries(inReachEntries, function(message, statusCode){
			res.send(message, statusCode);
			res.end;
		});
	}
	else
	{
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.send('{ "Error": "Invalid payload."}', 400);
		res.end;
	}
};

function saveInReachEntries(inReachEntries, callback){
	var trackPoints = [];

	for (var i=0; i < inReachEntries.Events.length; i++){
		
		var inReachEntry = inReachEntries.Events[i];

		
		// Is the transmitted data valid?
		if (!(isNaN(inReachEntry.imei)) && 
			(inReachEntry.imei.toString().length === 15) && 
			!(isNaN(inReachEntry.point.latitude)) && 
			!(isNaN(inReachEntry.point.longitude)) &&
			!(isNaN(inReachEntry.point.altitude)) &&
			!(isNaN(inReachEntry.point.course)) &&
			!(isNaN(inReachEntry.point.speed)) &&
			!(isNaN(inReachEntry.messageCode)) &&
			(moment(inReachEntry.timeStamp).isValid())
			)
		{
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

			trackPoints.push(trackPoint);
			
		} 
		else
		{
			// Invalid data submitted.
			callback('{ "Error": "Invalid payload."}', 400);
			return;
		}
	}

	// Save entries to database
	
	var processedTrackPoints = [];

	trackPoints.forEach(function (trackPoint) {
    	trackPoint.save(function (err) {
     		processedTrackPoints.push(err);

        	if (err)
        	{
				callback('{ "Error": "Unable to save entry."}', 400);
			}

        	else if (processedTrackPoints.length === trackPoints.length)
        	{
           		callback(JSON.stringify(trackPoints), 200);
				clientGeoDataEmitter.updateClients(app.io);	
        	}	

    	});	
	});

}