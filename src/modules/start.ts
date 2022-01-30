// dots - Telegram bot
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of dots
//
// dots is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { Composer } from 'tgsnake';
import { MessageContext } from 'tgsnake/lib/Context/MessageContext';
import { getPing } from '../utils/getPing';
import path from 'path';
import fs from 'fs';
export const modules = ['start', 'help'];
export const startComposer = new Composer();
startComposer.command('start', (ctx) => {
  let now = getPing(ctx);
  let text = `Hi [${
    ctx.from.lastName ? ctx.from.firstName + ' ' + ctx.from.lastName : ctx.from.firstName
  }](tg://user?id=${ctx.from.id})\ntype \`dots \\--help\` to see the help.`;
  return ctx.replyWithMarkdown(
    `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
  );
});
export const helpComposer = new Composer();
helpComposer.hears(new RegExp('dots (--help|-h)'), (ctx) => {
  let now = getPing(ctx);
  let moduleList: Array<string> = [];
  let fileList: Array<string> = fs.readdirSync(__dirname);
  fileList.filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
  for (let fileName of fileList) {
    let file = path.join(__dirname, fileName);
    const plugins = require(file);
    if (plugins.modules) {
      for (let moduleName of plugins.modules) {
        moduleList.push(`\`${moduleName}\``);
      }
    }
  }
  let text = `**Dots v1.2.2**\n[tgsnake](https://tgsnake.js.org) v${
    ctx.SnakeClient.version
  }\n\nhelper format : \`dots [\\--help | -h] [command name]\`\nExample : \`dots \\--help start\`\n**Available Command**\n${moduleList
    .sort((a, b) => a.localeCompare(b))
    .join(' | ')}`;
  return ctx.replyWithMarkdown(
    `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`,{
      noWebpage : true
    }
  );
});
helpComposer.hears([new RegExp('dots (--help|-h) start'), new RegExp('dots start (--help|-h)')], (ctx) => {
  let now = getPing(ctx);
  let text = `This is just a start message, why are you asking for help? lol.`;
  return ctx.replyWithMarkdown(
    `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
  );
});
helpComposer.hears(new RegExp('dots start'), (ctx) => {
  let now = getPing(ctx);
  let text = `Hi [${
    ctx.senderChat ? ctx.senderChat.title : ctx.from.lastName ? ctx.from.firstName + ' ' + ctx.from.lastName : ctx.from.firstName
  }](tg://user?id=${ctx.from.id})\ntype \`dots \\--help\` to see the help.`;
  return ctx.replyWithMarkdown(
    `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
  );
});
