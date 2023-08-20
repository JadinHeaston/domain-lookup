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


const APIinformation = {
	"WHOIS-RWS (ARIN)": {
		"dns": {
			"gui": "",
			"endpoint": "https://rdap.verisign.com/com/v1/domain/" //{DOMAIN}
		},
		"ip": {
			"gui": "https://whois.arin.net/ui/",
			"v4": "https://rdap.arin.net/registry/ip/", //{IPv4}
			"v6": ""
		},
		"key": "N/A",
		"url": "https://whois.arin.net/ui/"
	},
	"urlscan.io": {
		"dns": {
			"gui": "https://www.virustotal.com/gui/home/search",
			"endpoint": "https://www.virustotal.com/api/v3/domains/" //{DOMAIN}
		},
		"ip": {
			"gui": "https://www.virustotal.com/gui/home/search",
			"v4": "https://www.virustotal.com/api/v3/ip_addresses/", //{IP}
			"v6": ""
		},
		"key": "",
		"url": "https://urlscan.io/"
	},
	"VirusTotal": {
		"dns": {
			"gui": "https://www.virustotal.com/gui/home/search",
			"endpoint": "https://www.virustotal.com/api/v3/domains/" //{DOMAIN}
		},
		"ip": {
			"gui": "https://www.virustotal.com/gui/home/search",
			"v4": "https://www.virustotal.com/api/v3/ip_addresses/", //{IP}
			"v6": ""
		},
		"key": "N/A",
		"url": "https://www.virustotal.com/gui/home/search"
	}
}

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


app.get('/api-list/', async function (req, res) {
	try {
		req.session.functionLock = true;
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

async function implantHTML(html) {
	let APIInfo = await actions.listAPIs(APIinformation, environmentHandle);

	let HTMLHandle = cheerio.load(html);
	for (const key in APIInfo) {
		HTMLHandle(`
		<li>
			<h3>
				<a href="` + APIInfo[key].url + `">` + key + `</a>
			</h3>
			<ul>
				<li>
					<form>
						<label>
							<a href="` + APIInfo[key].dns.gui + `">Domain:</a>
							<input href="` + APIInfo[key].dns.endpoint + `" type="text" name="domain-query" placeholder="example.com" title="Input a domain."><input type="submit" value="GO">
						<label>
					</form>
				</li>
				<li>
					<form>
						<label>
							<a href="">IP:</a>
							<input href="" type="text" name="domain-query" placeholder="127.0.0.1" title="Input an IP address (v4 or v6)."><input type="submit" value="GO">
						<label>
					</form>
				</li>
			</ul>
		</li>`).appendTo('#api-list');
	}

	return HTMLHandle.html();
}

var server = app.listen(listening_port, function () {
	const server_information = server.address();

	console.log("App listening at http://%s:%s", server_information.address, server_information.port);
});

app.on('uncaughtException', function (err) {
	console.log('Caught exception: ' + err);
});