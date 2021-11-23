// dots - Telegram bot 
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of dots 
//
// dots is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import {Composer} from "tgsnake" 
import {getPing} from "../utils/getPing"
export const peopleComposer = new Composer() 
export const modules = ["people"]
peopleComposer.prefix = "d"  
peopleComposer.command(["ots (--help|-h) people","ots people (--help|-h)"],(ctx)=>{
  let now = getPing(ctx)
  let text = `**People**\nChecking the members status of groups/channel.\n**Usage : **\`dots people [options]\`\n**Options :**\n\`[--kick | -k] [longTimeAgo|restricted|bot|deleteAccount] - checking members with kicking specific filters\``
  return ctx.replyWithMarkdown(`${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`)
})
peopleComposer.command(["ots people( (--kick|-k) (longTimeAgo|restricted|bot|deleteAccount))?"],async (ctx)=>{
  let now = await getPing(ctx) 
  if(ctx.chat.private){
    let text = `Error: \`This command is only available on supergroup or channel.\``
    return ctx.replyWithMarkdown(`${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`)
  }
  if(ctx.text){
    let spl = ctx.text.split(" ") 
    let count = await ctx.telegram.getChatMembersCount(ctx.chat.id) 
    if(count == undefined){
      let text = `Error: \`Can't getting the members count. Try again laters.\``
    return ctx.replyWithMarkdown(`${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`)
    }
    let text = `Please Wait..`
    let msg = await ctx.replyWithMarkdown(`${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`)
    let offset = 0 
    let limit = 200
    if(count < 200){
      let memberList = await ctx.telegram.getChatMembers(ctx.chat.id,{offset:offset,limit:limit}) 
      if(memberList == undefined){
        text = `Error: \`Can't get the members list. Try again laters.\``
        //@ts-ignore
        return ctx.telegram.editMessage(ctx.chat.id,msg.message.id,`${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`,{parseMode:"markdown"})
      }
      let deleted = 0 
      let restricted = 0 
      let recently = 0 
      let bot = 0
      let total = 0 
      let failed = 0 
      let longTimeAgo = 0
      while(true){
        let k = memberList.participants[total]
        if(k){
          let {user} = k
          if(user.deleted){
            deleted ++ 
            if(spl.length == 4 && spl[3] == "deleteAccount"){
              setTimeout(async ()=>{
                try{
                  await ctx.telegram.editBanned(ctx.chat.id,user.id)
                }catch(error){
                  failed ++
                }
              },1000)
            }
          } 
          if(user.bot){
            bot ++ 
            if(spl.length == 4 && spl[3] == "bot"){
              setTimeout(async ()=>{
                try{
                  await ctx.telegram.editBanned(ctx.chat.id,user.id)
                }catch(error){
                  failed ++
                }
              },1000)
            }
          } 
          if(user.restricted){
            restricted ++ 
            if(spl.length == 4 && spl[3] == "restricted"){
              setTimeout(async ()=>{
                try{
                  await ctx.telegram.editBanned(ctx.chat.id,user.id)
                }catch(error){
                  failed ++
                }
              },1000)
            }
          }
          if(user.status){
            if(user.status == "recently"){
              recently ++ 
            } 
            if(user.status == "longTimeAgo"){
              longTimeAgo ++
              if(spl.length == 4 && spl[3] == "longTimeAgo"){
                setTimeout(async ()=>{
                  try{
                    await ctx.telegram.editBanned(ctx.chat.id,user.id)
                  }catch(error){
                    failed ++
                  }
                },1000)
              }
            }
          }
        }
        if(total >= memberList.participants.length){
          break;
        } 
        total ++
      } 
       text = `Kicked : ${Boolean(spl.length >=3)}\nDeleted : ${deleted}\nRestricted : ${restricted}\nRecently : ${recently}\nBot : ${bot}\nLongTimeAgo : ${longTimeAgo}\nTotal : ${total}\nFailed to kick : ${failed}`
      //@ts-ignore
      return ctx.telegram.editMessage(ctx.chat.id,msg.message.id,`${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`,{parseMode:"markdown"})
    }
  }
})