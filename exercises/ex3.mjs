#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import fs from "fs"
import { get } from 'http';
import getStdin from 'get-stdin';
import through2 from 'through2';
import zlib from "node:zlib"
import { abort } from 'process';
import { clear } from 'console';
const controller = new AbortController()
const signal = controller.signal
let BASE_PATH = new URL("./out.txt",import.meta.url).pathname

yargs(hideBin(process.argv))
.command('print', 'read the content of the file', () => {},  (argv) => {
  console.log(argv)

  if(argv.file){
  
    
      const pathToFile = new URL(argv.file,import.meta.url).pathname;
      
      const readStream = fs.createReadStream(pathToFile,{signal});
      
      processFile(readStream)  
  

  }

   if(argv.in || argv._.includes('-') ){
      
     processFile(process.stdin)
   

    

   }
})
  .option('file',{
    alias: 'f',
    type: 'string',
    description: 'file to read'
  
  })
  .option('in',{
    alias: 'i',
    type: 'boolean',
    description: "read from stdin"
  
  })
    .option("out",{
    alias: 'o',
    type: 'boolean',
    description: "write to stdout"
  
  })
      .option("compress",{
    alias: 'c',
    type: 'boolean',
    description: "compress output"
  
  })
        .option("uncompress",{
    alias: 'u',
    type: 'boolean',
    description: "uncomress output"
  
  })
  .demandCommand(1, 'You need at least one command before moving on')
  
  
  .parse()




   async function processFile(inStream){

    let outStream = inStream;

       if(yargs(hideBin(process.argv)).argv.uncompress){
      const gunzipStream = zlib.createGunzip()
      outStream = outStream.pipe(gunzipStream)
      BASE_PATH = BASE_PATH.slice(0)

    }
    


    outStream = outStream.pipe(through2(function(buf,enc,next){
         next(null,buf.toString().toUpperCase())    
    }))

 
    

    if(yargs(hideBin(process.argv)).argv.compress){
      const gzipStream = zlib.createGzip()
      outStream = outStream.pipe(gzipStream)
      BASE_PATH = `${BASE_PATH}.gz`


    }

    let targetStream;

    if(yargs(hideBin(process.argv)).argv.out){
      targetStream = process.stdout
    }

    else{
      targetStream = fs.createWriteStream(BASE_PATH)
    }

    outStream.pipe(targetStream)

     try {
    await new Promise((resolve, reject) => {

      let res = setTimeout(() => {
        controller.abort();
      }, 13);
     
      signal.addEventListener('abort', () => {
      

        reject(new Error('\nFile reading timed out after 13ms'));

        clearTimeout(res)
      });

      outStream.on('end', () => {
        resolve();
        if (targetStream !== process.stdout) {
          console.log(`File written to ${BASE_PATH}`);
        }
        if (targetStream === process.stdout) {
          console.log(`File written to stdout`);
        }
      });
    });
  } 
  
  catch (err) {
    console.error(err.message);
  }

     


   



    
  }


