#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import through2 from 'through2';
import zlib from 'node:zlib';
import { AbortController } from 'abort-controller';

let BASE_PATH = new URL('./out.txt', import.meta.url).pathname;

yargs(hideBin(process.argv))
  .command('print', 'read the content of the file', () => {},  (argv) => {
    console.log(argv);

    if (argv.file) {
      try {
        const pathToFile = new URL(argv.file, import.meta.url).pathname;
        const readStream = fs.createReadStream(pathToFile);

        // Wrap the processFile operation with a timeout and abort controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('Timeout reached. Stopping the stream.');
          controller.abort();
        }, argv.timeout || 5000); // Set a default timeout of 5 seconds

        // Attach the timeoutId and controller to argv for later cleanup
        argv.timeoutId = timeoutId;
        argv.controller = controller;

         processFile(readStream, argv);
      } catch (err) {
        console.error(err);
      }
    }

    if (argv.in || argv._.includes('-')) {
      // Wrap the processFile operation with a timeout and abort controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Timeout reached. Stopping the stream.');
        controller.abort();
      }, argv.timeout || 5000); // Set a default timeout of 5 seconds

      // Attach the timeoutId and controller to argv for later cleanup
      argv.timeoutId = timeoutId;
      argv.controller = controller;

       processFile(process.stdin, argv);
    }
  })
  .option('file', {
    alias: 'f',
    type: 'string',
    description: 'file to read',
  })
  .option('in', {
    alias: 'i',
    type: 'boolean',
    description: 'read from stdin',
  })
  .option('out', {
    alias: 'o',
    type: 'boolean',
    description: 'write to stdout',
  })
  .option('compress', {
    alias: 'c',
    type: 'boolean',
    description: 'compress output',
  })
  .option('uncompress', {
    alias: 'u',
    type: 'boolean',
    description: 'uncompress output',
  })
  .option('timeout', {
    alias: 't',
    type: 'number',
    description: 'timeout in milliseconds',
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .parse();

function processFile(inStream, argv) {
  let outStream = inStream;

  if (yargs(hideBin(process.argv)).argv.uncompress) {
    const gunzipStream = zlib.createGunzip();
    outStream = outStream.pipe(gunzipStream);
    BASE_PATH = BASE_PATH.slice(0);
  }

  outStream = outStream.pipe(
    through2(function (buf, enc, next) {
      if (argv.controller.signal.aborted) {
        // Stream is aborted, stop processing
        console.log('Stream aborted. Stopping the stream.');
        return;
      }
      next(null, buf.toString().toUpperCase());
    })
  );

  if (yargs(hideBin(process.argv)).argv.compress) {
    const gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    BASE_PATH = `${BASE_PATH}.gz`;
  }

  let targetStream;

  if (yargs(hideBin(process.argv)).argv.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(BASE_PATH);
  }

  outStream.pipe(targetStream);

  return new Promise((resolve, reject) => {
    outStream.on('end', () => {
      if (targetStream !== process.stdout) {
        console.log(`File written to ${BASE_PATH}`);
      }
      if (targetStream === process.stdout) {
        console.log(`File written to stdout`);
      }
      resolve();
    });

    // Handle 'error' event
    outStream.on('error', (err) => {
      if (argv.controller.signal.aborted) {
        // Stream is aborted, don't log error
        resolve();
      } else {
        reject(err);
      }
    });

    // Cleanup timeout and controller on stream end
    outStream.on('end', () => {
      clearTimeout(argv.timeoutId);
    });
  });
}
