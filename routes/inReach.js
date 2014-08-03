var mongooseModels = require('../lib/mongooseModels'),
	globalEvents = require('../lib/globalEvents'),
	GeoJSON = require('geojson'),
	moment = require('moment'),
	check = require('validator').check;

exports.postInReachEntries = function(req, res){
	
	// Validate posted data. If it is ok, commit it to the database.
	validateInReachData(req.body, commitInReachData);

	function validateInReachData(inReachEntries, commitInReachData)
	{
		try {
		
			// Check that payload contains at least one event.
			check((typeof inReachEntries.Events === "undefined"), 'No Events found in payload.').equals(false);
		}
		
		catch (e) {
			
			// If payload is missing events, return error response.
			sendResponse('{ "Error": "' + e.message + '"}', 400);
			return;
		}

		// Create an empty array to hold the trackPoints.
		var trackPoints = [];

		for (var i=0; i < inReachEntries.Events.length; i++){
		
			// Create shorthand variable for inReachEntries.Events[i].
			var inReachEntry = inReachEntries.Events[i];

			try {		

				// Verify that the submitted data is valid.
				check(parseInt(inReachEntry.imei), 'Missing or invalid imei.').notNull().isNumeric().len(15,15);
				check(parseInt(inReachEntry.point.latitude), 'Missing or invalid latitude.').isNumeric();
				check(parseInt(inReachEntry.point.longitude), 'Missing or invalid longitude.').isNumeric();
				check(parseInt(inReachEntry.point.altitude), 'Missing or invalid altitude.').isNumeric();
				check(parseInt(inReachEntry.point.course), 'Missing or invalid course.').isNumeric();
				check(parseInt(inReachEntry.point.speed), 'Missing or invalid speed.').isNumeric();
				check(parseInt(inReachEntry.messageCode), 'Missing or invalid messageCode.').isNumeric();
				check(moment(inReachEntry.timeStamp).isValid(), 'Missing or invalid timeStamp.').equals(true); 

				// Create a new trackPoint.
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
			} 

			catch (e) {

				// Invalid data submitted. Return error response.
				sendResponse('{ "Error": "' + e.message + '"}', 400);
				return;
			}

			// If everything went fine - push trackPoint to trackPoints array.
			trackPoints.push(trackPoint);
	}
		commitInReachData(trackPoints);

	}

	function commitInReachData(trackPoints)
	{
		
		// Create counting array.
		var processedTrackPoints = [];

		// Save entries to database
		trackPoints.forEach(function (trackPoint) {
    		trackPoint.save(function (err) {

     			processedTrackPoints.push(err);

        		if (err)
        		{
					// If any errors occur during save, return error response.
					sendResponse('{ "Error": "' + err.message + '"}', 400);
				}

        		else if (processedTrackPoints.length === trackPoints.length)
        		{
        			// Save successful - return a receipt to the poster.
           			sendResponse(JSON.stringify(trackPoints), 200);
					
					// Fire the update event to update end users.
					globalEvents.ee.emit('inReachTracksSaved');
        		}	
    		});	
		});

	}

	function sendResponse(message, statusCode)
	{
		// Return a status message to the client.
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.send(message, statusCode);
		res.end;
	}
}
