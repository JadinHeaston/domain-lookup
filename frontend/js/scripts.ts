console.log(toIsoString(new Date()));

interface FunctionLock {
	[key: string]: boolean;
}

var forceLoginMenuState: boolean | null = null; //Allows you to forcibly set the login menu state before calling to change the state.
var logIDCounter = 0; //Tracks log entries to better follow what is the call/response.

//Contains keys for each function that should not have more than one instance running at a time.
//False indicates that the function is NOT in use, and is okay to continue.
var functionLock: FunctionLock =
{
	authenticate: false,
	changeStatus: false,
	getStatus: false,
	logout: false,
	refreshData: false,
	mainSearchSubmission: false,
}

document.addEventListener('DOMContentLoaded', async function (event) {
	initializeListeners();
	detectSetColorScheme(); //Finding users theme (dark or light).
});

async function initializeListeners(): Promise<void> {
	document.getElementById('change-status')?.addEventListener('click', changeStatus, { passive: true });
	document.getElementById('get-status')?.addEventListener('click', refreshData, { passive: true });
	document.getElementById('main-menu-button').addEventListener('click', changeMainMenuState, { passive: true });
	document.getElementById('theme-toggle').addEventListener('click', flipColorScheme, { passive: true });
	document.getElementById('main-form').addEventListener('submit', mainSearchSubmission, { passive: false });
}

async function refreshData(): Promise<void> {
	if (functionLock.refreshData === true) //Function lock to prevent running the same function multiple times. 
		return;
	functionLock.refreshData = true;
	let startTimer = window.performance.now();

	//Incrementing logID.
	let logID = logIDCounter;
	++logIDCounter;

	updateUIStatic('Refresh');
	logMessage('Refreshing data...', logID);

	let response = await fetch('/retrieve-data', {
		method: 'get'
	});
	functionLock.refreshData = false; //Unlocking function.

	if (response.status === 401) {
		updateUIStatic('Unauthorized');
		logMessage('Unauthorized.', logID);
		return;
	}
	else if (response.status !== 200) {
		logMessage('Failed to initialize. Please try again.', logID);
		return;
	}

	updateUI(JSON.parse(await response.text())); //Saving json response.
	updateUIStatic();

	let time = window.performance.now() - startTimer;

	logMessage('Data refreshed! (' + time + 'ms)', logID);
}

async function mainSearchSubmission(event: Event): Promise<boolean> {
	event.preventDefault();
	event.stopImmediatePropagation();
	if (functionLock.mainSearchSubmission === true) //Function lock to prevent running the same function multiple times. 
		return;
	functionLock.mainSearchSubmission = true;
	let startTimer = window.performance.now();

	//Incrementing logID.
	let logID = logIDCounter;
	++logIDCounter;

	updateUIStatic('mainSearchSubmission');
	logMessage('Main query initiated...', logID);


	let response = await fetch('/query?' + new URLSearchParams({
		// type: event.target
	}), {
		method: 'get'
	});
	functionLock.changeStatus = false; //Unlocking function.

	if (response.status !== 200) {
		document.getElementById('clock-status')!.innerText = 'Server Failure';
		document.getElementById('clock-status')!.setAttribute('data-status', 'Failure')
		document.getElementById("current-time")!.innerHTML = 'Failure';
		logMessage('Server failure. Please try again.', logID);

		return;
	}

	let responseData = JSON.parse(await response.text());

	document.getElementById('clock-status')!.innerText = responseData.status;
	document.getElementById('clock-status')!.setAttribute('data-status', responseData.status)
	document.getElementById("current-time")!.innerHTML = responseData.time;


	functionLock.mainSearchSubmission = false; //Unlocking function.

	let time = window.performance.now() - startTimer;
	logMessage('Data refreshed! (' + time + 'ms)', logID);
	return false;
}

async function updateUIStatic(condition: string = '') {
	if (condition === 'Authenticated') {
		//Forcefully closing login menu.
		forceLoginMenuState = false;
	}
	else if (condition === 'Failure') {
		document.getElementById('clock-status')!.textContent = 'Server Failure';
		document.getElementById('clock-status')!.setAttribute('data-status', 'Failure')
		document.getElementById("current-time")!.textContent = 'Failure';

		//Updating hour cards.
		document.querySelectorAll('#time-card-container .time-card-amount, #time-card-container .time-card-earned').forEach(element => {
			element.textContent = 'N/A';
		});
	}
	else if (condition === 'Unauthorized') {
		document.getElementById('clock-status')!.textContent = 'Unauthorized.';
		document.getElementById('clock-status')!.setAttribute('data-status', 'Unauthorized');
		document.getElementById("current-time")!.textContent = 'Unauthorized.';

		//Updating hour cards.
		document.querySelectorAll('#time-card-container .time-card-amount, #time-card-container .time-card-earned').forEach(element => {
			element.textContent = 'N/A';
		});

		//Forcefully opening login menu.
		forceLoginMenuState = true;
		forceLoginMenuState = false; //Resetting login menu state.
	}
	else if (condition === 'Refresh') {
		document.getElementById('clock-status')!.setAttribute('data-status', 'Updating');

		//Setting cursor to spin...
		document.body.style.cursor = 'progress';
	}
	else {
		//Setting cursor to spin...
		document.body.style.cursor = 'auto';
	}


}

async function updateUI(response: response): Promise<void> {
	//Setting the clock status.
	document.getElementById('clock-status')!.textContent = response.status;
	document.getElementById('clock-status')!.setAttribute('data-status', response.status);
	//Setting the time checked.
	document.getElementById("current-time")!.textContent = response.time;
}

async function changeStatus(): Promise<void> {
	if (functionLock.changeStatus === true) //Function lock to prevent running the same function multiple times. 
		return;
	functionLock.changeStatus = true;

	//Incrementing logID.
	let logID = logIDCounter;
	++logIDCounter;

	logMessage('Changing status...', logID);
	document.getElementById('clock-status')!.innerText = 'Updating...';
	document.getElementById('clock-status')!.setAttribute('data-status', 'Updating');
	document.getElementById("current-time")!.innerHTML = 'Updating...';

	let response = await fetch('/change-status', {
		method: 'get'
	});
	functionLock.changeStatus = false; //Unlocking function.

	if (response.status !== 200) {
		document.getElementById('clock-status')!.innerText = 'Server Failure';
		document.getElementById('clock-status')!.setAttribute('data-status', 'Failure')
		document.getElementById("current-time")!.innerHTML = 'Failure';
		logMessage('Server failure. Please try again.', logID);

		return;
	}

	let responseData = JSON.parse(await response.text());

	document.getElementById('clock-status')!.innerText = responseData.status;
	document.getElementById('clock-status')!.setAttribute('data-status', responseData.status)
	document.getElementById("current-time")!.innerHTML = responseData.time;

	logMessage('Status set to ' + responseData.status.bold() + ' at ' + responseData.time.bold(), logID);
}

//Appends a message to the log console.
async function logMessage(message: string, logID: number): Promise<void> {
	document.getElementById('log-content')!.innerHTML = document.getElementById('log-content')!.innerHTML + '<p><span>' + toIsoString(new Date()) + ' (#' + logID + '): </span>' + message + '</p>'; //Appending the message.
}

async function changeMainMenuState(): Promise<void> {
	//Get the main menu 
	let mainMenu = document.getElementById('main-menu');

	//Verify the element was found. - It should be.
	if (mainMenu === null)
		return;

	//Check what state the main menu is and update it.
	if (mainMenu.classList.contains('visible') === false) {
		mainMenu.classList.add('visible'); //Showing the menu.

		//Changing color of main-menu-icon.
		let mainMenuButton = document.getElementById('main-menu-button');
		if (mainMenuButton === null)
			return;

		if (mainMenuButton.classList.contains('activated') === false)
			mainMenuButton.classList.add('activated');
	}
	else {
		mainMenu.classList.remove('visible');

		//Changing color of main-menu-icon.
		let mainMenuButton = document.getElementById('main-menu-button');
		if (mainMenuButton === null)
			return;

		if (mainMenuButton.classList.contains('activated') === true)
			mainMenuButton.classList.remove('activated');
	}
}

//USAGE: waitForElm('<SELECTOR>').then((elm) => {<FUNCTION>});
function waitForElm(selector: string) {
	return new Promise<Element | null>(resolve => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver(mutations => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				observer.disconnect();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	});
}

async function flipColorScheme() {
	var theme = ""; //Init.

	//local storage is used to override OS theme settings
	if (localStorage.getItem("theme")) {
		if (localStorage.getItem("theme") == "dark")
			theme = "light";
		else if (localStorage.getItem("theme") == "light")
			theme = "dark";
	}
	else if (!window.matchMedia) {
		//matchMedia method not supported
		console.log('matchMedia not supported.');
		return false;
	}
	else if (window.matchMedia("(prefers-color-scheme: dark)").matches === true)
		theme = "light"; //OS theme setting detected as dark, setting at light.
	else if (window.matchMedia("(prefers-color-scheme: light)").matches === true)
		theme = "dark"; //OS theme setting detected as light, setting as dark.


	//Set theme preference with a `data-theme` attribute.
	if (theme === "dark")
		document.documentElement.setAttribute("data-theme", "dark");
	else if (theme === "light")
		document.documentElement.setAttribute("data-theme", "light");

	//Setting icon.
	for (let iterator = 0; iterator < document.getElementsByClassName("theme-icon").length; ++iterator) {
		document.getElementsByClassName("theme-icon")[iterator].classList.remove('active-element');
	}
	document.getElementById("theme-button-" + theme)?.classList.add('active-element');

	//Store preference.
	localStorage.setItem("theme", theme);
}

//Determines if the user has a set theme
async function detectSetColorScheme() {
	var theme = "dark"; //Default theme.

	//local storage is used to override OS theme settings
	if (localStorage.getItem("theme")) {
		if (localStorage.getItem("theme") == "dark")
			var theme = "dark";
		else if (localStorage.getItem("theme") == "light")
			var theme = "light";
	}
	else if (!window.matchMedia) {
		//matchMedia method not supported
		console.log('matchMedia not supported.');
		return false;
	}
	else if (window.matchMedia("(prefers-color-scheme: dark)").matches === true)
		var theme = "dark"; //OS theme setting detected as dark
	else if (window.matchMedia("(prefers-color-scheme: light)").matches === true)
		var theme = "light"; //OS theme setting detected as light


	//Set theme preference with a `data-theme` attribute.
	if (theme === "dark")
		document.documentElement.setAttribute("data-theme", "dark");
	else if (theme === "light")
		document.documentElement.setAttribute("data-theme", "light");

	//Setting icon.
	for (let iterator = 0; iterator < document.getElementsByClassName("theme-icon").length; ++iterator) {
		document.getElementsByClassName("theme-icon")[iterator].classList.remove('active-element');
	}
	document.getElementById("theme-button-" + theme)?.classList.add('active-element');

	//Store preference.
	localStorage.setItem("theme", theme);
}

//Formats date to standard logging format, including a timezone offset.
function toIsoString(date: Date) {
	//Getting timezone offset and adding padding.
	let tzo = -date.getTimezoneOffset(),
		dif = tzo >= 0 ? '+' : '-',
		pad = function (num: number) {
			return (num < 10 ? '0' : '') + num;
		};

	//Formatting date and returning it.
	return date.getFullYear() +
		'-' + pad(date.getMonth() + 1) +
		'-' + pad(date.getDate()) +
		'T' + pad(date.getHours()) +
		':' + pad(date.getMinutes()) +
		':' + pad(date.getSeconds()) +
		dif + pad(Math.floor(Math.abs(tzo) / 60)) +
		':' + pad(Math.abs(tzo) % 60);
}