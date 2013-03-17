
/*
 * GET home page.
 */
 
 // Setup db connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://'+ process.env.gliderlog_db_prod_username + ':' + process.env.gliderlog_db_prod_password + "@" + process.env.gliderlog_db_prod_server + "/" + process.env.gliderlog_db_prod_database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});

// Create database schema
var trackPointSchema = mongoose.Schema({
    imei: Number,
	messageCode: Number,
	freeText: String,
	timeStamp: Date,
	latitude: Number,
	longitude: Number,
	gpsFix: Number,
	course: Number,
	Speed: Number
})

var TrackPoint = mongoose.model('TrackPoint', trackPointSchema);

exports.postNewEntry = function(req, res){
	// var newEntry = req.body;
	var newEntry = JSON.parse('{"Version":"1.0","Events":[{"addresses":[],"imei":"300234010961140","messageCode":0,"freeText":null,"timeStamp":1363447981537,"point":{"latitude":43,"longitude":-72,"altitude":30,"gpsFix":0,"course":0,"speed":0},"status":{"autonomous":0,"lowBattery":0,"intervalChange":0}}]}');
	
	for (var i=0; i < newEntry.Events.length; i++){
			
			var trackPoint = new TrackPoint({ 
				imei: newEntry.Events[i].imei,
				messageCode: newEntry.Events[i].messageCode,
				freeText: newEntry.Events[i].freeText,
				timeStamp: newEntry.Events[i].timeStamp,
				latitude: newEntry.Events[i].point.latitude,
				longitude: newEntry.Events[i].point.longitude,
				altitude: newAltitude = newEntry.Events[i].point.altitude,
				gpsFix: newEntry.Events[i].point.gpsFix,
				course: newEntry.Events[i].point.course,
				speed: newEntry.Events[i].point.speed
			});
			
			trackPoint.save(function (err, trackPoint){
				console.log(JSON.stringify(trackPoint));
			});
        }

	TrackPoint.find(function (err, trackPoints) {
		if (err)
		{
			res.send('{ "Success": "False"}');
		}
		else
		{
			console.log(JSON.stringify(trackPoints));
			// res.send('{ "Success": "True"}');
			res.send(JSON.stringify(trackPoints));
		}
		
		res.end;
	});
	
};