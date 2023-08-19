const compression = require('compression')
const express = require('express');
const session = require('express-session');
const actions = require('./actions.js');
const { exit } = require('process');

//Setting session secret.
try {
	var environmentHandle = {
		port: process.env.PORT,
		timezone: process.env.TIMEZONE,
		user_agent: process.env.USER_AGENT,
		mysql_port: process.env.mysql_port,
		mysql_host: process.env.mysql_host,
		mysql_username: process.env.mysql_username,
		mysql_password: process.env.mysql_password
	}
} catch (err) {
	console.log(err);
	exit(1); //Die!
}

const app = express(); //Creating an express application.
const listening_port = environmentHandle.port; // Port to listen on.
const sessionExpiration = 1000 * 60 * 60 * 24 * 7 * 4; //One month (in ms)

//Enabling compression
app.use(compression({ level: 9 }))

//Enabling sessions.
app.use(session({
	cookie: {
		maxAge: sessionExpiration,
		sameSite: 'strict',
		secure: false,
		httpOnly: false,
	},
	name: 'domain-query.sid',
	resave: false, //False helps prevent race conditions.
	saveUninitialized: true,
	rolling: true,
	unset: 'destroy',
	secret: environmentHandle.session_secret,
}));

//Setting POST data to be interpreted as JSON.
app.use(express.json());

app.get('/', async function (req, res) {
	app.use(express.static('frontend')); //Setting root directory for front-end work.
	let finalOutput = await actions.readIndexHTML();

	//Show UI.
	return res.status(200).send(finalOutput);
});

app.get('/retrieve-data', async function (req, res) {
	try {
		req.session.functionLock = true;
		var result = await actions.getAllData(req.session, environmentHandle);
	} catch (error) {
		console.log('Error: ' + error);
		req.session.functionLock = false;
		return res.status(500).send('Data Retrieval Failure.');
	}

	if (result === false) {
		//LOSER ALERT.
		console.log('Data Retrieval Failure.');
		req.session.functionLock = false;
		return res.status(500).send('Data Retrieval Failure.');
	}
	else {
		req.session.functionLock = false;
		return res.status(200).send(result);
	}

});

var server = app.listen(listening_port, function () {
	const server_information = server.address();

	console.log("App listening at http://%s:%s", server_information.address, server_information.port);
});

app.on('uncaughtException', function (err) {
	console.log('Caught exception: ' + err);
});