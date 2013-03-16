// Force the the test environment
process.env.NODE_ENV = 'test';

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
	describe('when receiving a valid paylod', function()
	{
		it('should return code 200 if everything went fine')
	
		it('should return a receipt of the processed data as json');
	});
	it('should receive POST submissions');
	it('should parse the data from the submissions');
	it('should write the parsed data to the database');
	it('should return code 200 if everything went fine')
	it('should return code 500 i something went wrong');
});