var mongoose = require('mongoose');

// Define database schema for position track points
var trackPointSchema = mongoose.Schema({
    trackerId: Number,
	messageCode: Number,
	message: String,
	timeStamp: Date,
	location: { longitude: Number, latitude: Number },
	altitude: Number,
	course: Number,
	speed: Number
});

// Set model name based on running status
var trackPointModelName;

switch (process.env.NODE_ENV)
{
case 'development':
  trackPointModelName = "development_trackpoint";
  break;
case 'test':
  trackPointModelName = "test_trackpoint";
  break;
default:
  trackPointModelName = "trackpoint";
  break;
}

// Initiate TrackPoint model
exports.TrackPoint = mongoose.model(trackPointModelName, trackPointSchema);