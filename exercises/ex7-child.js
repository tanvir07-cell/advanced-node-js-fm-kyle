"use strict";

// var fetch = require("node-fetch");


// ************************************

const util = require("util");

const wait = util.promisify(setTimeout);

const HTTP_PORT = 8039;


main().catch(() => 1);


// ************************************

async function main() {
	try{
		await wait(5000)
		const data = await fetch(`http://localhost:${HTTP_PORT}/get-records`);
		const res = await data.json();
		if(res && res.length > 0){

			// successfull terminal output is 0 otherwise unsuccessful
			process.exitCode = 0;
			return
		}
	}
	catch(err){
		process.exitCode = 1;

	}



}
