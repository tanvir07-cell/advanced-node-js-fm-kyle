#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'


import c from 'ansi-colors';

// const c = require('ansi-colors');
// const path = require("path");
import fs from "node:fs"
// const fs = require('fs')

import getStdin from 'get-stdin';




yargs(hideBin(process.argv))
  .command('out <file>', 'fetch the contents of the URL', () => {}, (argv) => {
    console.info(argv)

    const location = new URL(argv.file, import.meta.url).pathname

    fs.readFile(location, (err,data)=>{
    if(err){
      console.error(err);
      return
    }

    processFile(data)


    
  
  
  })
    


  })

  .command('in', 'fetch the contents of the URL', () => {}, (argv) => {
    console.log(argv)
       getStdin().then(processFile).catch(err=>console.error(err))

  })
  .demandCommand(1,c.red.bold.underline('You need at least one command before moving on'))
  .strictCommands(true)
 
  .help()
  .parse()





function processFile(content){
  content = content.toString().toUpperCase()
  process.stdout.write(content)

}


  

   





