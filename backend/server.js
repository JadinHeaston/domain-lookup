const compression = require('compression')
const express = require('express');
const session = require('express-session');
const actions = require('./actions.js');
const cheerio = require('cheerio');
const { exit } = require('process');

//Setting session secret.
try {
	var environmentHandle = {
		port: process.env.PORT,
		session_secret: process.env.SESSION_SECRET,
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

const fs = require('fs');
const path = require('path')
const {
	parse,
	stringify,
	assign
} = require('comment-json')
const API_PATH = './backend/api/';

const jsonsInDir = fs.readdirSync(API_PATH).filter(file => path.extname(file) === '.jsonc');
const APIinformation = [];
jsonsInDir.forEach(file => {
	let fileData = fs.readFileSync(path.join(API_PATH, file));
	let json = parse(fileData.toString());
	APIinformation.push(json);
});


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
	let finalOutput = implantHTML(await actions.readIndexHTML());

	//Show UI.
	return res.status(200).send(await finalOutput);
});

app.get('/retrieve-data', async function (req, res) {
	if (req.session.functionLock === true)
		return res.status(500).send('Action Failed');
	else
		req.session.functionLock = true;

	try {
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


app.get('/api-list/', async function (req, res) {
	if (req.session.functionLock === true)
		return res.status(500).send('Action Failed');
	else
		req.session.functionLock = true;

	try {
		var result = await actions.listAPIs(APIinformation, environmentHandle);
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


app.get('/query/', async function (req, res) {
	if (req.session.functionLock === true)
		return res.status(500).send('Action Failed');
	else if (!req.params)
		return res.status(200).send("No parameters.");
	else if (!req.params.type || req.params.type === "")
		return res.status(200).send("No query type.");
	else
		req.session.functionLock = true;



	req.session.functionLock = false;
	return res.status(200).send();
});

async function implantHTML(html) {
	let APIInfo = await actions.listAPIs(APIinformation, environmentHandle);

	console.log(APIInfo);
	let HTMLHandle = cheerio.load(html);
	APIInfo.forEach((api, index, array) => {
		HTMLHandle(`
		<li>
			<h3>
				<a href="` + api[[Object.keys(api)[0]]].url + `">` + [Object.keys(api)[0]] + `</a>
			</h3>
			<ul>
				<li>
					<form>
						<label>
							<a href="` + api[[Object.keys(api)[0]]].dns.gui + `">Domain</a><div><input href="` + api[[Object.keys(api)[0]]].dns.endpoint + `" type="text" name="domain-query" placeholder="example.com" title="Input a domain."><input type="submit" value="GO"></div>
						</label>
					</form>
				</li>
				<li>
					<form>
						<label>
							<a href="">IP</a><div><input href="" type="text" name="domain-query" placeholder="127.0.0.1" title="Input an IP address (v4 or v6)."><input type="submit" value="GO"></div>
						</label>
					</form>
				</li>
			</ul>
		</li>`).appendTo('#api-list');
	});

	return HTMLHandle.html();
}

var server = app.listen(listening_port, function () {
	const server_information = server.address();

	console.log("App listening at http://%s:%s", server_information.address, server_information.port);
});

app.on('uncaughtException', function (err) {
	console.log('Caught exception: ' + err);
});