// Force the the test environment
process.env.NODE_ENV = 'test';

describe('inReach Importer', function()
{
	it('should receive POST submissions');
	it('should parse the data from the submissions');
	it('should write the parsed data to the database');
	it('should return code 200 if everything whent fine');
	it('should return code 500 i something went wrong');
});