import { readFileSync } from 'fs';

export async function readIndexHTML(): Promise<string> {
	return readFileSync('./frontend/index.html').toString();
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