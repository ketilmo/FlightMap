var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();

var clientGeoDataEmitter = require('../lib/clientGeoDataEmitter'),
	app = require('../app');

module.exports.ee = ee;

// When inReach tracks have been saved, update all clients.
ee.on('inReachTracksSaved', function(){
	clientGeoDataEmitter.updateClients(app.io);
});