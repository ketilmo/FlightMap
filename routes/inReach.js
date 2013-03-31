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
		check((typeof inReachEntries.Events === "undefined"), 'No Events found in payload.').equals(false);
	}
	catch (e) {
			
		// Paylod is missing Events.
		callback('{ "Error": "' + e.message + '"}', 400);
		return;
	}

	var trackPoints = [];
	for (var i=0; i < inReachEntries.Events.length; i++){
		
		var inReachEntry = inReachEntries.Events[i];

		// Is the transmitted data valid?
		try {		
			check(parseInt(inReachEntry.imei), 'Missing or invalid imei.').notNull().isNumeric().len(15,15);
			check(parseInt(inReachEntry.point.latitude), 'Missing or invalid latitude.').isNumeric();
			check(parseInt(inReachEntry.point.longitude), 'Missing or invalid longitude.').isNumeric();
			check(parseInt(inReachEntry.point.altitude), 'Missing or invalid altitude.').isNumeric();
			check(parseInt(inReachEntry.point.course), 'Missing or invalid course.').isNumeric();
			check(parseInt(inReachEntry.point.speed), 'Missing or invalid speed.').isNumeric();
			check(parseInt(inReachEntry.messageCode), 'Missing or invalid messageCode.').isNumeric();
			check(moment(inReachEntry.timeStamp).isValid(), 'Missing or invalid timeStamp.').equals(true);    
		} 

		catch (e) {
			// Invalid data submitted.
			callback('{ "Error": "' + e.message + '"}', 400);
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
				callback('{ "Error": "' + err.message + '"}', 400);
			}

        	else if (processedTrackPoints.length === trackPoints.length)
        	{
           		callback(JSON.stringify(trackPoints), 200);
				globalEvents.ee.emit('inReachTracksSaved');
        	}	
    	});	
	});
}