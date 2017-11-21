var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var crypto = require("crypto");
var mime = require("mime");

var PORT = 8000;
var SENSOR_URL = '/sensor';
var ACTUATOR_URL = '/actuator';
var EVENT_URL = '/trigger';


// Sensors measurements simulation
function rand(low, high) {
    return Math.random() * (high - low) + low;
}
var ttemp = 0;
// Temperature
var t_avg = 20;
const SLOPE_ITERATIONS = 3;
var th = t_avg;
var slope = 0;
function temperature() {
	var value = t_avg + rand(-1,1);
	if (slope != 0) value += thermostat(null);
	return value;
}

// Get/Set thermostat changing or static temperature
function thermostat(newValue) {
	if (newValue) {
		ttemp = 0;
		slope = (newValue - th)/SLOPE_ITERATIONS; //wait 3 iterations to reach new value
		th = newValue;
	} else {
		var value = ttemp*slope;
		ttemp++;
		if (ttemp > SLOPE_ITERATIONS) {
			slope = 0;
			ttemp = 0;
			t_avg = th;
		}
		return value;
	}
}

// Humidity 
function humidity() {
	return 47 + rand(-3,3);
}

// Noise level
//https://www.webmd.com/brain/tc/harmful-noise-levels-topic-overview
const DOORBELL_DECIBELS = 80;
const BABYCRY_DECIBELS = 110;
const TYPICAL_INDOOR_DECIBELS = 12;
var n_avg = TYPICAL_INDOOR_DECIBELS;
var tnoise = 0;
var eventActive;
const NOISE_EVENT_ITERATIONS = 2;
function noiseLevel() {
	if (eventActive) {
		tnoise++;
		if (tnoise > NOISE_EVENT_ITERATIONS) {
			tnoise = 0;
			eventActive = false;
			n_avg = TYPICAL_INDOOR_DECIBELS;
		}
	}
	return n_avg + rand(-2,2);
}

function noiseEvent(event) {
	n_avg = event;
	eventActive = true;
}

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

app.get(SENSOR_URL + '/fullData', function(req, res) {
	console.log("GET");
	var messageJSON = {
		temperature: temperature(), // F
		humidity: humidity(), // %
		noiseLevel: noiseLevel(), // dB
	};
	console.log(messageJSON);
    res.send(JSON.stringify(messageJSON));
});

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

app.get(SENSOR_URL + '/humidity', function(req, res) {
	console.log("GET");
	var messageJSON = {
		deviceType: "sensor",
		status: "OK",
		deviceRole: "humidity",
		data: "80 %"
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
		data: "error"
	};
	*/
	console.log(messageJSON);
    res.send(JSON.stringify(messageJSON));
});

app.get(ACTUATOR_URL + '/thermostat/:value(\\d+)', function(req, res) {
	console.log("GET");
    var messageJSON = {
		deviceType: "actuator",
		status: "OK",
		deviceRole: "thermostat",
		data: "Thermostat set to " + req.params.value
	};
	thermostat(parseInt(req.params.value)); //set thermostat to requested temperature
	console.log(messageJSON);
    res.send(JSON.stringify(messageJSON));
});

// Events simulation

//http://chchearing.org/noise/common-environmental-noise-levels/
app.get(EVENT_URL + '/doorbell', function(req, res) {
	console.log("GET");
	var messageJSON = {
		event: "doorbell",
		message: "Noise level increase to "+DOORBELL_DECIBELS+" dB"
	};
	noiseEvent(DOORBELL_DECIBELS);
	console.log(messageJSON);
    res.send(JSON.stringify(messageJSON));
});
app.get(EVENT_URL + '/babycry', function(req, res) {
	console.log("GET");
	var messageJSON = {
		event: "babycry",
		message: "Noise level increase to "+BABYCRY_DECIBELS+" dB"
	};
	noiseEvent(BABYCRY_DECIBELS);
	console.log(messageJSON);
    res.send(JSON.stringify(messageJSON));
});


// Start server

var server = app.listen(PORT, function() {
    console.log("Listening on port %s...", server.address().port);
});