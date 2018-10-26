const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const crypto = require("crypto");
const mime = require("mime");


const PORT = 8000;


/////////////////////////////
// Database initialization //
/////////////////////////////
const sqlite3 = require('sqlite3').verbose(); //more detailed stack traces

function openDB() {
	return new sqlite3.Database('./sqlite3.db', (err) => {
	  if (err) {
	    return console.error(err.message);
	  }
	  console.log('Connected to the in-memory SQlite database.');
	}); 
}

function closeDB(db) {
	db.close((err) => {
	  if (err) {
	    return console.error(err.message);
	  }
	});
}

// Create DB, table, populate it and close connection
let db = openDB();
db.serialize(() => { // Create table and populate it
	db.run("CREATE TABLE IF NOT EXISTS persons (name TEXT)")
	  .run(`INSERT OR REPLACE INTO persons(name)
	  		VALUES('Nour'),
	  			  ('Paco'),
	  			  ('Paul'),
	  			  ('Vincent')
	  	  `);
});
closeDB(db);


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

app.get('/persons', function(req, res) {
	console.log("GET /persons");
	let db = openDB();

	db.all("SELECT * FROM persons", (err, rows) => {
		if (err) {
			return console.log(err.message);
		} else {
			res.send(JSON.stringify(rows));
		}
		
	});
    closeDB(db)
});

// Start server
var server = app.listen(PORT, function() {
    console.log("Listening on port %s...", server.address().port);
});