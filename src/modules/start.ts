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
  }](tg://user?id=${ctx.from.id})\ntype \`/help\` to see the help.\n\n[Give stars in original repo!](https://github.com/butthx/dots)`;
  return ctx.replyWithMarkdown(
    `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
  );
});
export const helpComposer = new Composer();
helpComposer.command(['help'], (ctx) => {
  let now = getPing(ctx);
  let moduleList: Array<string> = [];
  let fileList: Array<string> = fs.readdirSync(__dirname);
  fileList.filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
  for (let fileName of fileList) {
    let file = path.join(__dirname, fileName);
    const plugins = require(file);
    if (plugins.modules) {
      for (let moduleName of plugins.modules) {
        moduleList.push(`\`${moduleName.replace(moduleName[0], moduleName[0].toUpperCase())}\``);
      }
    }
  }
  let text = `**${
    ctx.SnakeClient.aboutMe.lastName
      ? ctx.SnakeClient.aboutMe.firstName + ' ' + ctx.SnakeClient.aboutMe.lastName
      : ctx.SnakeClient.aboutMe.firstName
  } v1.2.2**\n[tgsnake](https://tgsnake.js.org) v${
    ctx.SnakeClient.version
  }\n\nhelper format : \`/help[command name]\`\nExample : \`/helpStart\`\n**Available Command**\n${moduleList
    .sort((a, b) => a.localeCompare(b))
    .join(' | ')}`;
  return ctx.replyWithMarkdown(
    `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`,{
      noWebpage : true
    }
  );
});
helpComposer.command(['helpStart'], (ctx) => {
  let now = getPing(ctx);
  let text = `This is just a start message, why are you asking for help? lol.`;
  return ctx.replyWithMarkdown(
    `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
  );
});
