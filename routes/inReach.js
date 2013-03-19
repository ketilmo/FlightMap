// Setup database schemas
var mongooseModels = require('../lib/mongooseModels');

exports.postNewEntry = function(req, res){
	
	var newEntry = req.body;
		
	if (newEntry)
	{
		for (var i=0; i < newEntry.Events.length; i++){
				
				var trackPoint = new mongooseModels.TrackPoint({ 
					gliderId: newEntry.Events[i].imei,
					messageCode: newEntry.Events[i].messageCode,
					freeText: newEntry.Events[i].freeText,
					timeStamp: newEntry.Events[i].timeStamp,
					location: [newEntry.Events[i].point.longitude, newEntry.Events[i].point.latitude],
					altitude: newEntry.Events[i].point.altitude,
					course: newEntry.Events[i].point.course,
					speed: newEntry.Events[i].point.speed
				}); 

				// Save to database
				trackPoint.save(function (err, trackPoint){
					if (err) {
						console.log(err);
						res.send('{ "Error": "Unable to save entry."}', 400);
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
	else
	{
		console.log("Error: Invalid payload.");
		res.send('{ "Error": "Invalid payload."}', 400);
		res.end;
	}
};

exports.test = function(req, res){
	
	mongooseModels.TrackPoint.find(function (err, trackpoints) {
	geoJson = '{ "type": "FeatureCollection", "features": [ { "type": "Feature", "properties": { "name": "KMOTEST" }, "geometry": { "type": "MultiLineString", "coordinates": [ [ ';
	for (var i=0; i < trackpoints.length; i++){
		console.log(trackpoints[i].location)
		if (i==0)
		{
			geoJson += '[' + trackpoints[i].location + ']';
		}
		else
		{
			geoJson += ', [' + trackpoints[i].location + ']';
		}
	}
	geoJson += ' ] ] } },]}';
	res.send(geoJson);
	res.end(geoJson);
})
};