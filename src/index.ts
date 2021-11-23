// dots - Telegram bot 
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of dots 
//
// dots is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published. 

import {Snake,Composer} from "tgsnake" 
import fs from "fs"
import path from "path"
const bot = new Snake() 
async function loadPlugins(){
  let dirname:string = path.join(__dirname,"modules")
  let fileList:Array<string> = fs.readdirSync(dirname)
  fileList.filter(file => file.endsWith(".js") || file.endsWith(".ts"))
  for(let fileName of fileList){
    let file = path.join(dirname,fileName) 
    const plugins = require(file) 
    for(let [key,value] of Object.entries(plugins)){
      if(value instanceof Composer){ 
        //@ts-ignore
        value as Composer 
        //@ts-ignore
        bot.use(value.middleware())
      }
    }
  }
}
loadPlugins()
bot.run()