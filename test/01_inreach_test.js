// Force the the test environment
process.env.NODE_ENV = 'test';

// Test data below!
// var newEntry = JSON.parse('{"Version":"1.0","Events":[{"addresses":[],"imei":"300234010961140","messageCode":0,"freeText":null,"timeStamp":1363447981537,"point":{"latitude":43,"longitude":-72,"altitude":30,"gpsFix":0,"course":0,"speed":0},"status":{"autonomous":0,"lowBattery":0,"intervalChange":0}}]}');
function generateInReachPayload()
{
 return { 
	Version :"1.0",
	Events : [
		{ 
			addresses : [],
			imei : "300234010961140",
			messageCode : "14",
			freeText : "Hello world!",
			timeStamp : "1363447981537",
			point:
				{
					latitude : "43",
					longitude : "-72",
					altitude : "30",
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
			]
		};
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
                if (err.statusCode === 405) {
                    done();
                }
                else {
					throw new Error('Invalid response code from /api/v1/post/inreach. Expected 405 got ' + err.statusCode + '.');
                }
            });
		});
		it('should return the message {\"error\":\"Not allowed\"}', function(done) {
			client.get('/api/v1/post/inreach', function(err, req, res, data) {
				if (err.body.error === 'Not allowed') {
                    done();
                }
                else {
					throw new Error('Invalid response message from /api/v1/post/inreach. Expected \'Not allowed\' got \'' + err.body.error + '\'.');
                }
            });
		});
	});
	describe('posting a valid paylod', function()
	{
		it('should return code 200 if everything went fine', function(done) {
			var validInReachPayload = generateInReachPayload();
			client.post('/api/v1/post/inreach', validInReachPayload, function(err, req, res, obj) {
  				if (res.statusCode == 200 )
  				{
  					done();
  				}
  				else
  				{
  					throw new Error('Invalid response code from /api/v1/post/inreach. Expected 200 got ' + res.statusCode + '.');
  				}
			});

		});

		it('should return a receipt of the submitted data as json', function(done) {
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
	
	});
	it('should receive POST submissions');
	it('should parse the data from the submissions');
	it('should write the parsed data to the database');
	it('should return code 200 if everything went fine')
	it('should return code 500 i something went wrong');
});