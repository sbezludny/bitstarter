var express = require("express");
var fs = require("fs");

var app = express.createServer(express.logger());

app.get("/", function(request, response) {

	var indexBytes = fs.readFileSync("index.html");

	var buf = new Buffer(indexBytes);

	response.send(buf.toString("utf-8"));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});