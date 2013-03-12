
/*
 * GET home page.
 */

exports.postNewEntry = function(req, res){
	var newEntry = req.body;
	console.log(JSON.stringify(newEntry));
	res.send('{ "Success": "True"}');
	res.end;
};