// Return status messages
function returnStatus (req, res, next, statusCode, longStatusMessage, shortStatusMessage)
{
  // Set response status code.
  res.status(statusCode);
  
  // Respond with HTML page
  if (req.accepts('html')) {
    res.render('statusCode.jade', {title: longStatusMessage, url: req.url });
    return;
  }

  // Respond with json
  if (req.accepts('json')) {
    res.send({ error: shortStatusMessage });
    return;
  }

  // Default to plain-text. send()
  res.type('txt').send(shortStatusMessage);
}


// 404 Not Found
exports.notFound = function(req, res, next){
		returnStatus(req, res, next, 404, "404 - Not Found", "Not found");
};

// 405 Not Allowed
exports.notAllowed = function(req, res, next){
		returnStatus(req, res, next, 405, "405 - Not Allowed", "Not allowed");
};
