// Setup database schemas
var mongooseModels = require('../lib/mongooseModels'),
	app = require('../app')
	clienGeoDataEmitter = require('../lib/clientGeoDataEmitter'),
	GeoJSON = require('geojson');


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
						clientGeoDataEmitter.updateClients(app.io);

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


