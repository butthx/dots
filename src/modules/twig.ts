// dots - Telegram bot
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of dots
//
// dots is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { Composer, GramJs, Updates } from 'tgsnake';
import { MessageContext } from 'tgsnake/lib/Context/MessageContext';
import { ResultGetEntity } from 'tgsnake/lib/Telegram/Users/GetEntity';
import { getPing } from '../utils/getPing';
import { Scene, Stage } from '@tgsnake/wizard-scenes';
import bigInt from 'big-integer';
import Twig from 'twig';
import TwigModel from '../database/twig';
import fs from 'fs';
import getId from '../utils/getId';
import path from 'path';

const Api = GramJs.Api;
export const twigComposer = new Composer();
export const modules = ['twig'];
function toArray(e) {
  return Array.isArray(e) ? e : [e];
}
function props(obj) {
  let _proto = Object.getPrototypeOf(obj);
  let _props = Object.getOwnPropertyNames(_proto);
  let props: Array<string> = [];
  for (let prop of _props) {
    if (prop !== 'constructor' && prop !== null) {
      props.push(prop);
    }
  }
  return props;
}
function filterEvent(filter, ctx) {
  let filters = toArray(filter);
  let h: Array<string> = [];
  h.push('*');
  if (ctx instanceof ResultGetEntity) h.push('connected');
  if (ctx instanceof MessageContext) {
    ctx as MessageContext;
    h.push('message');
    if (ctx.action) {
      h.push(ctx.action['_']);
    }
  }
  if (ctx['_']) {
    switch (ctx['_']) {
      case 'updateNewMessage':
      case 'updateShortMessage':
      case 'updateShortChatMessage':
      case 'updateNewChannelMessage':
        h.push('message');
        if (ctx.message) {
          ctx.message as MessageContext;
          if (ctx.message.action) {
            h.push(ctx.message.action['_']);
          }
        }
        break;
      case 'updateInlineBotCallbackQuery':
      case 'updateBotCallbackQuery':
        h.push('callbackQuery');
        break;
      case 'updateBotInlineQuery':
        h.push('inlineQuery');
        break;
      default:
    }
    h.push(ctx['_']);
  }
  for (let f of filters) {
    return h.includes(f);
  }
}
function formatUpdate(context) {
  let ctx = context;
  if (context['_']) {
    switch (context['_']) {
      case 'updateNewMessage':
      case 'updateShortMessage':
      case 'updateShortChatMessage':
      case 'updateNewChannelMessage':
        //@ts-ignore
        ctx = context.message as MessageContext;
        break;
      default:
    }
  }
  return ctx;
}
function objstr(obj) {
  let result: any = {};
  for (let [key, value] of Object.entries(obj)) {
    switch (typeof value) {
      case 'bigint':
        result[key] = String(value);
        break;
      case 'object':
        if (value == null) {
          result[key] = value;
        } else {
          result[key] = objstr(value);
        }
        break;
      case 'symbol':
        result[key] = `[Symbol ${key}]`;
        break;
      case 'function':
        result[key] = `[Function ${key}]`;
        break;
      default:
        result[key] = value;
    }
  }
  return result;
}
export function twigTm(ctx) {
  let update = formatUpdate(ctx);
  let result = {
    update: {},
    on: (filter: string) => {
      return filterEvent(filter, ctx);
    },
    telegram: {
      reply: (...args) => {
        if (filterEvent('message', ctx)) {
          return ctx.telegram.sendMessage(update.chat.id, ...args);
        }
        if (filterEvent('callbackQuery', ctx)) {
          return ctx.telegram.sendMessage(update.message.chat.id, ...args);
        }
        return false;
      },
      replyWithMarkdown: (text, more) => {
        if (filterEvent('message', ctx)) {
          return ctx.telegram.sendMessage(update.chat.id, text, {
            parseMode: 'Markdown',
            ...more,
          });
        }
        if (filterEvent('callbackQuery', ctx)) {
          return ctx.telegram.sendMessage(update.message.chat.id, text, {
            parseMode: 'Markdown',
            ...more,
          });
        }
        return false;
      },
      replyWithHTML: (text, more) => {
        if (filterEvent('message', ctx)) {
          return ctx.telegram.sendMessage(update.chat.id, text, {
            parseMode: 'HTML',
            ...more,
          });
        }
        if (filterEvent('callbackQuery', ctx)) {
          return ctx.telegram.sendMessage(update.message.chat.id, text, {
            parseMode: 'HTML',
            ...more,
          });
        }
        return false;
      },
      uptime: () => {
        if (ctx.SnakeClient) {
          return ctx.SnakeClient.connectTime;
        }
        if (ctx.snakeClient) {
          return ctx.snakeClient.connectTime;
        }
        return 'unknown';
      },
    },
    stringify: (_json, ...args) => {
      let json = objstr(_json);
      return JSON.stringify(json, ...args);
    },
  };
  let _props = props(ctx.telegram);
  let _props_ignore = ['snakeClient', 'SnakeClient'];
  for (let [key, value] of Object.entries(update)) {
    //@ts-ignore
    result.update[key] = value;
  }
  for (let _prop of _props) {
    if (!_props_ignore.includes(_prop)) {
      result.telegram[_prop] = (...args) => {
        return ctx.telegram[_prop](...args);
      };
    }
  }
  return result;
}
const twig_set = new Scene(
  'twig_set',
  async (ctx, data) => {
    if (ctx instanceof MessageContext) {
      ctx as MessageContext;
      //@ts-ignore
      try {
        await ctx.telegram.editMessage(
          ctx.chat.id,
          ctx.id,
          `Please send twig template (message text)`,
          {
            replyMarkup: {
              inlineKeyboard: [
                [
                  {
                    text: 'Cancel',
                    callbackData: 'dots twig cancel',
                  },
                ],
              ],
            },
          }
        );
      } catch (error) {
        await ctx.reply(`Please send twig template (message text)`, {
          replyMarkup: {
            inlineKeyboard: [
              [
                {
                  text: 'Cancel',
                  callbackData: 'dots twig cancel',
                },
              ],
            ],
          },
        });
      }
      return twig_set.next(ctx, data);
    }
    if (ctx instanceof Updates.UpdateBotCallbackQuery) {
      ctx as Updates.UpdateBotCallbackQuery;
      if (!ctx.message?.replyToMessage?.from) {
        twig_set.leave(ctx, data);
        return ctx.telegram.editMessage(
          //@ts-ignore
          ctx.message?.chat.id,
          //@ts-ignore
          ctx.message?.id,
          `Error: Message was deleted by user.`
        );
      }
      //@ts-ignore
      await ctx.telegram.editMessage(
        ctx.message?.chat.id,
        ctx.message?.id,
        `Please send twig template (message text)`,
        {
          replyMarkup: {
            inlineKeyboard: [
              [
                {
                  text: 'Cancel',
                  callbackData: 'dots twig cancel',
                },
              ],
            ],
          },
        }
      );
      return twig_set.next(ctx, data);
    }
  },
  async (ctx, data) => {
    if (ctx instanceof MessageContext) {
      let now = await getPing(ctx);
      try {
        ctx as MessageContext;
        try {
          let template = Twig.twig({
            data: ctx.text,
          });
          await template.renderAsync(twigTm(ctx));
        } catch (error: any) {
          let text = `🌱 Twig Error : ${error.message}`;
          return ctx.replyWithMarkdown(
            `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
          );
        }
        let text = `🌱 Done.`;
        let buffer = Buffer.from(ctx.text || '');
        let data = await TwigModel.findOne({
          chatId: String(ctx.chat.id),
        });
        if (data == null) {
          data = new TwigModel();
          data.chatId = String(ctx.chat.id);
        }
        //@ts-ignore
        data.twig = buffer.toString('hex');
        //@ts-ignore
        data = await data.save();
        if (!fs.existsSync('./twigs')) {
          fs.mkdirSync('./twigs');
        }
        fs.writeFileSync(`./twigs/${ctx.chat.id}.twig`, String(ctx.text));
        ctx.telegram.sendDocument(ctx.chat.id, buffer, {
          fileName: `${ctx.chat.id}.twig`,
          mimeType: `application/twig`,
          parseMode: 'Markdown',
          replyToMsgId: ctx.id,
          caption: `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${
            ctx.SnakeClient.connectTime
          }\` s`,
        });
        return twig_set.leave(ctx, data);
      } catch (error: any) {
        let text = `🌱 Twig Error : ${error.message}`;
        return ctx.replyWithMarkdown(
          `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
        );
      }
    }
  }
);
const stage = new Stage(twig_set);
twig_set.action('dots twig cancel', twigCancel);
async function twigSet(ctx) {
  if (ctx.message?.replyToMessage) {
    let member = await ctx.telegram.getChatMember(ctx.message.chat.id, ctx.from.id);
    let allowed = ['creator', 'admin'];
    if (!allowed.includes(member.status)) {
      return ctx.SnakeClient.client.invoke(
        new Api.messages.SetBotCallbackAnswer({
          queryId: bigInt(ctx.id),
          alert: false,
          message: 'Are You Admin??',
        })
      );
    }
    if (
      //@ts-ignore
      !ctx.message?.replyToMessage?.senderChat &&
      //@ts-ignore
      !ctx.message?.replyToMessage?.isAutomaticForward &&
      //@ts-ignore
      ctx.from.id !== ctx.message?.replyToMessage?.from.id
    ) {
      return ctx.SnakeClient.client.invoke(
        new Api.messages.SetBotCallbackAnswer({
          queryId: bigInt(ctx.id),
          alert: false,
          message: 'IDs are not the same.',
        })
      );
    }
    return stage.enter('twig_set')(ctx);
  }
  return ctx.telegram.editMessage(
    //@ts-ignore
    ctx.message?.chat.id,
    //@ts-ignore
    ctx.message?.id,
    `Error: Message was deleted by user.`
  );
}
async function twigCancel(ctx) {
  let client = ctx.SnakeClient.client;
  //@ts-ignore
  let member = await ctx.telegram.getChatMember(ctx.message.chat.id, ctx.from.id);
  let allowed = ['creator', 'admin'];
  if (allowed.includes(member.status)) {
    if (!ctx.message?.replyToMessage) {
      return ctx.telegram.editMessage(
        //@ts-ignore
        ctx.message?.chat.id,
        //@ts-ignore
        ctx.message?.id,
        `Error: Message was deleted by user.`
      );
    }
    if (twig_set.isRunning(ctx)) {
      //@ts-ignore
      await ctx.telegram.editMessage(ctx.message?.chat.id, ctx.message?.id, `Action canceled.`);
      return twig_set.leave(ctx, {});
    }
    return client.invoke(
      new Api.messages.SetBotCallbackAnswer({
        queryId: bigInt(ctx.id),
        alert: false,
        message: 'no scenes running!',
      })
    );
  }
  return client.invoke(
    new Api.messages.SetBotCallbackAnswer({
      queryId: bigInt(ctx.id),
      alert: false,
      message: 'Are You Admin??',
    })
  );
}

twigComposer.use(stage.middleware());
twigComposer.use(async (ctx, next) => {
  try {
    if (filterEvent('message', ctx)) {
      let update = await formatUpdate(ctx);
      let ignore = ['dots'];
      let moduleList: Array<string> = [];
      let fileList: Array<string> = fs.readdirSync(__dirname);
      fileList.filter((file) => file.endsWith('.js') || file.endsWith('.ts'));
      for (let fileName of fileList) {
        let file = path.join(__dirname, fileName);
        const plugins = require(file);
        if (plugins.modules) {
          for (let moduleName of plugins.modules) {
            moduleList.push(moduleName);
          }
        }
      }
      let re = new RegExp(`dots (--help|-h)?(\s+)?${moduleList.join('|')}`, 'g');
      //@ts-ignore
      if (re.test(update.text)) {
        return next();
      }
    }
    let info = await getId(ctx);
    if (info) {
      if (fs.existsSync(`./twigs/${info.chatId}.twig`)) {
        let twig = fs.readFileSync(`./twigs/${info.chatId}.twig`, 'utf8');
        let template = Twig.twig({
          data: twig,
        });
        await template.renderAsync(twigTm(ctx));
      } else {
        let data = await TwigModel.findOne({
          chatId: String(info.chatId),
        });
        if (data !== null) {
          let dtwig = Buffer.from(data.twig, 'hex').toString('utf8');
          if (!fs.existsSync('./twigs')) {
            fs.mkdirSync('./twigs');
          }
          fs.writeFileSync(`./twigs/${info.chatId}.twig`, dtwig);
          let template = Twig.twig({
            data: dtwig,
          });
          await template.renderAsync(twigTm(ctx));
        }
      }
    }
    return next();
  } catch (error) {
    return next();
  }
});
twigComposer.hears(
  [
    new RegExp(`^${process.env.PREFIX || 'dots'} twig (--help|-h)$`),
    new RegExp(`^${process.env.PREFIX || 'dots'} (--help|-h) twig$`),
  ],
  async (ctx) => {
    let now = await getPing(ctx);
    let text = `🌱 **Twig**\nUsing twig template to manage group.\n**Usage : **\`dots twig [options]\`\n**Options :**\n\`[\\--set | -s] - setup twig templates\`\n\`[\\--remove | -r] - remove twig templates\`\n**TypeUpdates :** All TypeUpdates should be same with [tgsnake](https://tgsnake.js.org/getting-started/update#using-on)\n\n**Example Template :**\n\`\`\`{% if on("message") %}\n  {{ telegram.reply("Hi, this is twig 🌱") }}\n{% endif %}\`\`\`\n\n**Notes** : **Dont delete your message before the process is complete.**`;
    return ctx.replyWithMarkdown(
      `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`,
      {
        noWebpage: true,
      }
    );
  }
);
twigComposer.hears(
  [new RegExp(`^${process.env.PREFIX || 'dots'} twig (--set|-s)$`)],
  async (ctx) => {
    let now = await getPing(ctx);
    if (ctx.chat.private) {
      let text = `🌱 This command only work in **group/supergroup!**`;
      return ctx.replyWithMarkdown(
        `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
      );
    }
    if (ctx.senderChat && !ctx.isAutomaticForward) {
      let text = `It looks like you are an anonymous admin or admin using the channel to sending message. Click the button below to prove that you are really admin.`;
      return ctx.replyWithMarkdown(
        `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`,
        {
          replyMarkup: {
            inlineKeyboard: [
              [
                {
                  text: 'I am admin',
                  callbackData: 'dots twig set',
                },
              ],
            ],
          },
        }
      );
    } else {
      //@ts-ignore
      let member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
      let allowed = ['creator', 'admin'];
      if (allowed.includes(member.status)) {
        return stage.enter('twig_set')(ctx);
      }
      let text = `Are you admin??`;
      return ctx.replyWithMarkdown(
        `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
      );
    }
  }
);
twigComposer.hears(
  [new RegExp(`^${process.env.PREFIX || 'dots'} twig (--remove|-r)$`)],
  async (ctx) => {
    let now = await getPing(ctx);
    try {
      if (ctx.chat.private) {
        let text = `🌱 This command only work in **group/supergroup!**`;
        return ctx.replyWithMarkdown(
          `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
        );
      }
      if (ctx.senderChat && !ctx.isAutomaticForward) {
        let text = `It looks like you are an anonymous admin or admin using the channel to sending message. Click the button below to prove that you are really admin.`;
        return ctx.replyWithMarkdown(
          `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`,
          {
            replyMarkup: {
              inlineKeyboard: [
                [
                  {
                    text: 'I am admin',
                    callbackData: 'dots twig remove',
                  },
                ],
              ],
            },
          }
        );
      } else {
        //@ts-ignore
        let member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
        let allowed = ['creator', 'admin'];
        if (allowed.includes(member.status)) {
          if (fs.existsSync(`./twigs/${ctx.chat.id}.twig`)) {
            fs.unlinkSync(`./twigs/${ctx.chat.id}.twig`);
          }
          await TwigModel.findOneAndDelete({
            chatId: String(ctx.chat.id),
          });
          let text = `🌱 Twig was removed.`;
          return ctx.replyWithMarkdown(
            `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
          );
        }
        let text = `Are you admin??`;
        return ctx.replyWithMarkdown(
          `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
        );
      }
    } catch (error: any) {
      let text = `🌱 Twig Error : ${error.message}`;
      return ctx.replyWithMarkdown(
        `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
      );
    }
  }
);

twigComposer.action('dots twig set', twigSet);
twigComposer.action('dots twig cancel', twigCancel);
twigComposer.action('dots twig remove', async (ctx) => {
  try {
    if (ctx.message?.replyToMessage) {
      //@ts-ignore
      let member = await ctx.telegram.getChatMember(ctx.message?.chat.id, ctx.from.id);
      let allowed = ['creator', 'admin'];
      if (!allowed.includes(member.status)) {
        return ctx.SnakeClient.client.invoke(
          new Api.messages.SetBotCallbackAnswer({
            queryId: bigInt(ctx.id),
            alert: false,
            message: 'Are You Admin??',
          })
        );
      }
      if (
        //@ts-ignore
        !ctx.message?.replyToMessage?.senderChat &&
        //@ts-ignore
        !ctx.message?.replyToMessage?.isAutomaticForward &&
        //@ts-ignore
        ctx.from.id !== ctx.message?.replyToMessage?.from.id
      ) {
        return ctx.SnakeClient.client.invoke(
          new Api.messages.SetBotCallbackAnswer({
            queryId: bigInt(ctx.id),
            alert: false,
            message: 'IDs are not the same.',
          })
        );
      }
      if (fs.existsSync(`./twigs/${ctx.message?.chat.id}.twig`)) {
        fs.unlinkSync(`./twigs/${ctx.message?.chat.id}.twig`);
      }
      await TwigModel.findOneAndDelete({
        chatId: String(ctx.message?.chat.id),
      });
      return ctx.telegram.editMessage(
        //@ts-ignore
        ctx.message?.chat.id,
        //@ts-ignore
        ctx.message?.id,
        `🌱 Twig was removed.`
      );
    }
    return ctx.telegram.editMessage(
      //@ts-ignore
      ctx.message?.chat.id,
      //@ts-ignore
      ctx.message?.id,
      `Error: Message was deleted by user.`
    );
  } catch (error: any) {
    return ctx.telegram.editMessage(
      //@ts-ignore
      ctx.message?.chat.id,
      //@ts-ignore
      ctx.message?.id,
      `🌱 Twig Error : ${error.message}`
    );
  }
});
