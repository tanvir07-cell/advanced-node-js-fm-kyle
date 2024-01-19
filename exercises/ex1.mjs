#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import fs from "fs/promises"
import { get } from 'http';
import getStdin from 'get-stdin';

yargs(hideBin(process.argv))
.command('print', 'read the content of the file', () => {}, async (argv) => {
  console.log(argv)

  if(argv.file){
  
    try{
      const pathToFile = new URL(argv.file,import.meta.url).pathname;

       const fileContent = await fs.readFile(pathToFile);
       processFile(fileContent.toString())

    }
    catch(err){
      console.error(err)

    }
  }

   if(argv.in==="" || argv._.includes('-')){
    //  try{
    //   const fileContent = await getStdin();
    //   processFile(fileContent.toString())
    //  }
    //  catch(err){
    //    console.error(err)
    //  }

    // another way to do it and not using the getStdin userland module:

    process.stdin
    .on('data', data => processFile(data.toString()))

   }
})
  .option('file',{
    alias: 'f',
    type: 'string',
    description: 'file to read'
  
  })
  .option('in',{
    alias: 'i',
    type: 'string',
    description: "read from stdin"
  
  })
  .demandCommand(1, 'You need at least one command before moving on')
  
  
  .parse()




   function processFile(contents){
    process.stdout.write(contents.toUpperCase())
    
  }


