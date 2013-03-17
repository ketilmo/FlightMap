// Setup database schemas
var mongooseModels = require('../lib/mongooseModels');

exports.postNewEntry = function(req, res){
	
	var newEntry;
	
	try {
		newEntry = JSON.parse(req.body);
	} catch (err) {
		newEntry = null;
		console.log(err);
		res.send('{ "Error": "JSON data contains errors."}', 500);
		res.end;
	}

	if (newEntry)
	{
		for (var i=0; i < newEntry.Events.length; i++){
				
				var trackPoint = new mongooseModels.TrackPoint({ 
					imei: newEntry.Events[i].imei,
					messageCode: newEntry.Events[i].messageCode,
					freeText: newEntry.Events[i].freeText,
					timeStamp: newEntry.Events[i].timeStamp,
					latitude: newEntry.Events[i].point.latitude,
					longitude: newEntry.Events[i].point.longitude,
					altitude: newEntry.Events[i].point.altitude,
					gpsFix: newEntry.Events[i].point.gpsFix,
					course: newEntry.Events[i].point.course,
					speed: newEntry.Events[i].point.speed
				});
				
				// Save to database
				trackPoint.save(function (err, trackPoint){
					if (err) {
						console.log(err);
						res.send('{ "Error": "Unable to save entry."}', 500);
						res.end;
					}
					else
					{
						console.log(JSON.stringify(trackPoint));
						res.send(JSON.stringify(trackPoint));
						res.end;
					}
				});
			}
	}
};