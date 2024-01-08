#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'


import c from 'ansi-colors';

// const c = require('ansi-colors');
// const path = require("path");
import fs from "node:fs"
// const fs = require('fs')

import getStdin from 'get-stdin';
import { Transform } from 'node:stream';

import zlib from 'node:zlib';



let BASE_PATH = new URL("./out.txt",import.meta.url).pathname;

yargs(hideBin(process.argv))
  .command('outStream <file>', 'fetch the contents of the URL', yargs => {
    return yargs.positional('file', {
      describe: 'The search term to filter notes by, will be applied to note.content',
      type: 'string'
    })
  }, (argv) => {
    const filePath = new URL(argv.file,import.meta.url).pathname;

    const stream = fs.createReadStream(filePath)   
    processFile(stream)

  })
    .option('out', {
    alias: 'o',
    type: 'string',
    description: 'tags to add to the note'
  })
   .option('compress', {
    alias: 'c',
    type: 'string',
    description: 'tags to add to the note'
  })
  // .command('writeStream <file>', 'fetch the contents of the URL', () => {}, (argv) => {
  //   const filePath = new URL(argv.file,import.meta.url).pathname;

  //   const stream = fs.createWriteStream(filePath)   
  //   processFile(stream)
  // })


  // .command('in', 'fetch the contents of the URL', () => {}, (argv) => {
  //   console.log(argv)
  //      getStdin().then(processFile).catch(err=>console.error(err))

  // })
  // .demandCommand(1,c.red.bold.underline('You need at least one command before moving on'))
  // .strictCommands(true)
 
  .help()
  .parse()
  





function processFile(inStream){
  // inStream is the readble stream
  let outStream = inStream;

  // here upperStream is the writable transform stream
  var upperStream = new Transform({
    transform(chunk,encoding,cb){
      this.push(chunk.toString().toUpperCase())
      cb()
    }

  })

  outStream = outStream.pipe(upperStream)

  //if there is --compress flag:
  if(yargs(hideBin(process.argv)).argv.compress){
    // here gzipStream is the writable transform stream
    var gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream)
    // change the file extension from .txt to .txt.gz:
    BASE_PATH = `${BASE_PATH}.gz`
  }



  var targetStream;

  // if there is --out flag:
  if(yargs(hideBin(process.argv)).argv.out){
       targetStream = process.stdout;

  }



  else{
    targetStream = fs.createWriteStream(BASE_PATH)
  }



  outStream.pipe(targetStream) // looks like : readableStrea.pipe(writableStream)


}


  
console.log(yargs(hideBin(process.argv)).argv)





