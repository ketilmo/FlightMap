// Force the the test environment
process.env.NODE_ENV = 'test';

// Generate payload object that can be customized later.
function generateInReachPayload(numberOfEvents)
{
 var inReachPayload = { 
	Version :"1.0",
	Events : []
		};


	if (!numberOfEvents || numberOfEvents < 1) 
	{
		numberOfEvents = 1;
	}

	for (var i=0; i < numberOfEvents; i++)
	{
		inReachPayload.Events.push(

			{ 
				addresses : [],
				imei : "300234010961140",
				messageCode : "14",
				freeText : "Hello world!",
				timeStamp : (new Date).getTime(), // Set a fresh date here in Epoch format.
				point:
					{
						latitude : "60.3729736804962",
						longitude : "5.37759304046631",
						altitude : "310",
						gpsFix : "2",
						course : "180",
						speed : "12"
					},
				status :
					{
						autonomous : "0",
						lowBattery : "0",
						intervalChange : "0"
					}
				}
		);
	}	

	return inReachPayload;

}

var restify = require('restify');
var assert = require('assert');

before(function(done) {
	var app = require('../app.js');
    done();
});

var client = restify.createJsonClient({
    version: '*',
    url: 'http://127.0.0.1:3000'
});

describe('\r\nWhen using the inReach Inbound API', function()
{

	describe('accessing the POST URI via HTTP GET', function()
	{

		it('should return status code 405 Not Allowed', function(done) {
			client.get('/api/v1/post/inreach', function(err, req, res, data) {
                assert(res.statusCode === 405, 'Invalid response code from /api/v1/post/inreach. Expected 405 got ' + err.statusCode + '.');
                done();
            });
		});

		it('should return the message {\"error\":\"Not allowed\"}', function(done) {
			client.get('/api/v1/post/inreach', function(err, req, res, data) {
				assert(err.body.error === 'Not allowed', 'Invalid response message from /api/v1/post/inreach. Expected \'Not allowed\' got \'' + err.body.error + '\'.');
                done();
            });
		});
	});

	describe('posting a paylod', function()
	{
		it('should return code 200 if everything went fine', function(done) {
			var validInReachPayload = generateInReachPayload();
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				assert(res.statusCode == 200, 'Invalid response code from /api/v1/post/inreach. Expected 200 got ' + res.statusCode + '.');
  				done();
			});

		});

		it('should return a receipt of the submitted data as json, matching the sent data', function(done) {
			var validInReachPayload = generateInReachPayload();
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				for (var i=0; i < inReachResponse.length; i++){
  					assert(inReachResponse[i].trackerId == validInReachPayload.Events[i].imei, 
  						'Returned trackerId doesn\'t match posted imei. Expected ' + validInReachPayload.Events[i].imei + ' got ' + inReachResponse[i].trackerId + '.');
  					assert(inReachResponse[i].messageCode == validInReachPayload.Events[i].messageCode, 
  						'Returned messageCode doesn\'t match posted messageCode. Expected ' + validInReachPayload.Events[i].messageCode + ' got ' + inReachResponse[i].messageCode + '.');
  					assert(inReachResponse[i].message == validInReachPayload.Events[i].freeText, 
  						'Returned message doesn\'t match posted freeText. Expected ' + validInReachPayload.Events[i].freeText + ' got ' + inReachResponse[i].message + '.');
  					assert(new Date(inReachResponse[i].timeStamp).toString() == new Date(parseInt(validInReachPayload.Events[i].timeStamp)).toString(), 
  						'Returned timeStamp doesn\'t match posted timeStamp. Expected ' + new Date(parseInt(validInReachPayload.Events[i].timeStamp)) + ' got ' + new Date(inReachResponse[i].timeStamp) + '.');
  					assert(inReachResponse[i].location.longitude == validInReachPayload.Events[i].point.longitude, 
  						'Returned longitude doesn\'t match posted longitude. Expected ' + validInReachPayload.Events[i].point.longitude + ' got ' + inReachResponse[i].location.longitude + '.');
  					assert(inReachResponse[i].location.latitude == validInReachPayload.Events[i].point.latitude, 
  						'Returned latitude doesn\'t match posted latitude. Expected ' + validInReachPayload.Events[i].point.latitude + ' got ' + inReachResponse[i].location.latitude + '.');
  					assert(inReachResponse[i].altitude == validInReachPayload.Events[i].point.altitude, 
  						'Returned altitude doesn\'t match posted altitude. Expected ' + validInReachPayload.Events[i].point.altitude + ' got ' + inReachResponse[i].location.altitude + '.');
  					assert(inReachResponse[i].course == validInReachPayload.Events[i].point.course, 
  						'Returned course doesn\'t match posted course. Expected ' + validInReachPayload.Events[i].point.course + ' got ' + inReachResponse[i].location.course + '.');
  					 assert(inReachResponse[i].speed == validInReachPayload.Events[i].point.speed, 
  						'Returned speed doesn\'t match posted speed. Expected ' + validInReachPayload.Events[i].point.speed + ' got ' + inReachResponse[i].location.speed + '.');
  				}
  				done();
			});

		});

		it('should accept payloads with a single Event', function(done) {
			var validInReachPayload = generateInReachPayload();
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 200, 'Invalid response code from /api/v1/post/inreach. Expected 200 got ' + res.statusCode + '.');
  				done();
			});

		});

		it('should accept payloads with a multiple Events', function(done) {
			var validInReachPayload = generateInReachPayload(3);
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 200, 'Invalid response code from /api/v1/post/inreach. Expected 200 got ' + res.statusCode + '.');
  				done();
			});

		});

		it('should return response code 400 if the imei number is not numeric', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].imei = "abcdefghijklmno";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});

		});

		it('should return response code 400 if the imei number is not exactly 15 characters long', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].imei = "123456789";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});
		});

		it('should return response code 400 if the latitude is not numeric', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].point.latitude = "abc";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});
		});

		it('should return response code 400 if the longitude is not numeric', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].point.longitude = "def";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});
		});

		it('should return response code 400 if the longitude is not numeric', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].point.longitude = "def";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});
		});

		it('should return response code 400 if the altitude is not numeric', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].point.altitude = "ghi";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});
		});

		it('should return response code 400 if the course is not numeric', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].point.course = "jkl";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});
		});

		it('should return response code 400 if the speed is not numeric', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].point.speed = "mno";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});
		});

		it('should return response code 400 if the messageCode is not numeric', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].messageCode = "pqr";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});
		});

		it('should return response code 400 if the timeStamp is not a valid date', function(done) {
			var validInReachPayload = generateInReachPayload();
			validInReachPayload.Events[0].timeStamp = "13/14/15";
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				var inReachResponse = JSON.parse(res.body);
  				assert(res.statusCode == 400, 'Invalid response code from /api/v1/post/inreach. Expected 400 got ' + res.statusCode + '.');
  				done();
			});
		});

	});
});