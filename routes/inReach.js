// Setup database schemas
var mongooseModels = require('../lib/mongooseModels'),
	globalEvents = require('../lib/globalEvents'),
	GeoJSON = require('geojson'),
	moment = require('moment'),
	check = require('validator').check;

exports.postInReachEntries = function(req, res){
	
	saveInReachEntries(req.body, function(message, statusCode){
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.send(message, statusCode);
		res.end;
	});
	
};

function saveInReachEntries(inReachEntries, callback){

	try {
		
		// Validate payload
		check(typeof inReachEntries.Events === "undefined").equals(false);
	}
	catch (e) {
			
		// Paylod is missing Events.
		callback('{ "Error": "Invalid payload."}', 400);
		return;
	}

	var trackPoints = [];
	for (var i=0; i < inReachEntries.Events.length; i++){
		
		var inReachEntry = inReachEntries.Events[i];

		// Is the transmitted data valid?
		try {		
			check(parseInt(inReachEntry.imei)).notNull().isNumeric().len(15,15);
			check(parseInt(inReachEntry.point.latitude)).isNumeric();
			check(parseInt(inReachEntry.point.longitude)).isNumeric();
			check(parseInt(inReachEntry.point.altitude)).isNumeric();
			check(parseInt(inReachEntry.point.course)).isNumeric();
			check(parseInt(inReachEntry.point.speed)).isNumeric();
			check(parseInt(inReachEntry.messageCode)).isNumeric();
			check(moment(inReachEntry.timeStamp).isValid()).equals(true);    
		} 

		catch (e) {
			// Invalid data submitted.
			callback('{ "Error": "Invalid payload."}', 400);
			return;
		}

		// Data is valid.
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
				globalEvents.ee.emit('inReachTracksSaved');
        	}	

    	});	
	});
}