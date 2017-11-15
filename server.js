var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var crypto = require("crypto");
var mime = require("mime");

var PORT = 8000;
var SENSOR_URL = '/sensor';
var ACTUATOR_URL = '/actuator';

////////////////////////
// HTTP-REST handling //
////////////////////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// API implementation

app.get(SENSOR_URL + '/temperature', function(req, res) {
	console.log("GET");
	var messageJSON = {
		deviceType: "sensor",
		status: "OK",
		deviceRole: "temperature",
		data: "70 F"
	};
	console.log(messageJSON);
    res.send(JSON.stringify(messageJSON));
});
app.get(ACTUATOR_URL + '/toggleLight/kitchen', function(req, res) {
	console.log("GET");
    var messageJSON = {
		deviceType: "actuator",
		status: "OK",
		deviceRole: "light switch",
		data: "Kitchen lights off"
	};
	/* // Error message example
	var messageJSON = {
		deviceType: "actuator",
		status: "NOT OK",
		deviceRole: "light switch",
		data: "Kitchen lights off"
	};
	*/
	console.log(messageJSON);
    res.send(JSON.stringify(messageJSON));
});

// Start server

var server = app.listen(PORT, function() {
    console.log("Listening on port %s...", server.address().port);
});