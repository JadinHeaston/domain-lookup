import { readFileSync } from 'fs';

export async function readIndexHTML(): Promise<string> {
	return readFileSync('./frontend/index.html').toString();
}

export async function listAPIs(APIInfo: APIinformation, environment: environmentHandle): Promise<object> {
	//Remove APIs with no keys.
	for (const key in APIInfo) {
		if (APIInfo[key].key.length === 0)
			delete APIInfo[key];
	}
	return APIInfo;
}

//Accepts a promise, a timeout, and a failure value.
//If the promise doesn't finish within that time, return the failure value. 
function promiseWithTimeout<T>(
	promise: Promise<T>,
	ms: number = 100,
	timeoutError: any = new Error('Promise timed out')
): Promise<T> {
	//Create a promise that rejects in milliseconds
	const timeout = new Promise<never>((reject) => {
		setTimeout(() => {
			reject(timeoutError);
		}, ms);
	});

	//Returns a race between timeout and the passed promise
	return Promise.race<T>([promise, timeout]);
}