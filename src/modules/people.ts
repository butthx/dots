// dots - Telegram bot
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of dots
//
// dots is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { Composer, GramJs, Updates } from 'tgsnake';
import { getPing } from '../utils/getPing';
import { MessageContext } from 'tgsnake/lib/Context/MessageContext';
import bigInt from 'big-integer';
import fs from 'fs';
const Api = GramJs.Api;
export const peopleComposer = new Composer();
export const modules = ['people'];
peopleComposer.hears(
  [new RegExp('dots (help|-h) people'), new RegExp('dots people (help|-h)')],
  (ctx) => {
    let now = getPing(ctx);
    let text = `👨🏻‍💻 **People**\nChecking the members status of groups/channel.\n**Usage : **\`dots people [options]\`\n**Options :**\n\`[\\--kick | -k] [longTimeAgo|restricted|bot|deletedAccount] - checking members with kicking specific filters\`\n**Notes**:\n• **You can only fetch new data once every 30 minutes.**\n• **Don't delete your message before process completed.**`;
    return ctx.replyWithMarkdown(
      `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
    );
  }
);
peopleComposer.command([new RegExp('dots people( (kick|-k))?')], async (ctx) => {
  let now = await getPing(ctx);
  if (ctx.chat.private) {
    let text = `👨🏻‍💻 This command only work in **group/supergroup**`;
    return ctx.replyWithMarkdown(
      `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
    );
  }
  if (ctx.text) {
    let spl = ctx.text.split(' ');
    if (spl.length > 3) {
      spl.splice(0, 3);
    } else {
      spl = [];
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
                  callbackData: 'dots people',
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
        return getPeople(ctx, spl);
      }
      let text = `Are you admin??`;
      return ctx.replyWithMarkdown(
        `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
      );
    }
  }
});
function getLoop(member: number, limit: number = 200) {
  let a = member / 200;
  return a % 1 === 0 ? Math.floor(a) : Math.floor(a) + 1;
}
async function getPeople(ctx: MessageContext, args: Array<string> = []) {
  let now = await getPing(ctx);
  let text = `Please Wait...`;
  let msg = await ctx.replyWithMarkdown(
    `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`
  );
  let count = await ctx.telegram.getChatMembersCount(ctx.chat.id);
  //@ts-ignore
  let loop = await getLoop(count, 200);
  let people_online: Array<bigint | string> = [];
  let people_offline: Array<bigint | string> = [];
  let people_recently: Array<bigint | string> = [];
  let people_within_week: Array<bigint | string> = [];
  let people_within_month: Array<bigint | string> = [];
  let people_long_time_ago: Array<bigint | string> = [];
  let people_deleted: Array<bigint | string> = [];
  let people_fake: Array<bigint | string> = [];
  let people_scam: Array<bigint | string> = [];
  let people_bot: Array<bigint | string> = [];
  let people_verified: Array<bigint | string> = [];
  let people_restricted: Array<bigint | string> = [];
  let people_admin: Array<bigint | string> = [];
  let run = async (offset: number) => {
    let members = await ctx.telegram.getChatMembers(ctx.chat.id, {
      limit: 200,
      offset: offset,
    });
    if (!members) return false;
    let i = 0;
    while (true) {
      //@ts-ignore
      if (i >= members.participants.length) {
        break;
      }
      //@ts-ignore
      let member = members.participants[i];
      switch (member.user.status) {
        case 'online':
          people_online.push(member.user.id);
          break;
        case 'offline':
          people_offline.push(member.user.id);
          break;
        case 'recently':
          people_recently.push(member.user.id);
          break;
        case 'withinWeek':
          people_within_week.push(member.user.id);
          break;
        case 'withinMonth':
          people_within_month.push(member.user.id);
          break;
        case 'longTimeAgo':
          people_long_time_ago.push(member.user.id);
          break;
        default:
      }
      if (member.user.deleted) people_deleted.push(member.user.id);
      if (member.user.fake) people_fake.push(member.user.id);
      if (member.user.scam) people_scam.push(member.user.id);
      if (member.user.bot) people_bot.push(member.user.id);
      if (member.user.verified) people_verified.push(member.user.id);
      if (member.user.restricted) people_restricted.push(member.user.id);
      let admin = ['admin', 'creator'];
      if (admin.includes(member.status)) people_admin.push(member.user.id);
      i++;
    }
    return true;
  };
  if (fs.existsSync(`./people/${ctx.chat.id}.json`)) {
    let stat = fs.statSync(`./people/${ctx.chat.id}.json`);
    let seconds = (new Date().getTime() - new Date(stat.mtime).getTime()) / 1000;
    // 30 minutes
    if (seconds < 30 * 60) {
      let file = JSON.parse(fs.readFileSync(`./people/${ctx.chat.id}.json`, 'utf8'));
      people_online = file.people_online;
      people_offline = file.people_offline;
      people_recently = file.people_recently;
      people_within_week = file.people_within_week;
      people_within_month = file.people_within_month;
      people_long_time_ago = file.people_long_time_ago;
      people_deleted = file.people_deleted;
      people_fake = file.people_fake;
      people_scam = file.people_scam;
      people_bot = file.people_bot;
      people_verified = file.people_verified;
      people_restricted = file.people_restricted;
      people_admin = file.people_admin;
    }else {
      if (loop > 1) {
        let offset = 0;
        for (let i = 0; i < loop; i++) {
          if (i > 0) {
            offset = offset + 200;
          }
          await run(offset);
        }
      } else {
        await run(0);
      }
    }
  } else {
    if (loop > 1) {
      let offset = 0;
      for (let i = 0; i < loop; i++) {
        if (i > 0) {
          offset = offset + 200;
        }
        await run(offset);
      }
    } else {
      await run(0);
    }
  }
  if (!fs.existsSync('./people')) {
    fs.mkdirSync('./people');
  }
  fs.writeFileSync(
    `./people/${ctx.chat.id}.json`,
    JSON.stringify(
      {
        people_online: people_online,
        people_offline: people_offline,
        people_recently: people_recently,
        people_within_week: people_within_week,
        people_within_month: people_within_month,
        people_long_time_ago: people_long_time_ago,
        people_deleted: people_deleted,
        people_fake: people_fake,
        people_scam: people_scam,
        people_bot: people_bot,
        people_verified: people_verified,
        people_restricted: people_restricted,
        people_admin: people_admin,
      },
      (_, v) => (typeof v === 'bigint' ? String(v) : v)
    )
  );
  text =
    `👨🏻‍💻 **People**\n` +
    `• **online** : \`${people_online.length}\`\n` +
    `• **offline** : \`${people_offline.length}\`\n` +
    `• **recently** : \`${people_recently.length}\`\n` +
    `• **within_week** : \`${people_within_week.length}\`\n` +
    `• **within_month** : \`${people_within_month.length}\`\n` +
    `• **long_time_ago** : \`${people_long_time_ago.length}\`\n` +
    `• **deleted** : \`${people_deleted.length}\`\n` +
    `• **fake** : \`${people_fake.length}\`\n` +
    `• **scam** : \`${people_scam.length}\`\n` +
    `• **bot** : \`${people_bot.length}\`\n` +
    `• **verified** : \`${people_verified.length}\`\n` +
    `• **restricted** : \`${people_restricted.length}\`\n` +
    `• **admins** : \`${people_admin.length}\`\n` +
    `${args.length >= 1 ? `• **kicking** : \`${JSON.stringify(args)}\`\n` : ''}`;
  ctx.telegram.editMessage(
    //@ts-ignore
    msg.message.chat.id,
    //@ts-ignore
    msg.message.id,
    `${text}\n\n⏱️ ${now} | ⌛ ${getPing(ctx)} | ⏰ \`${ctx.SnakeClient.connectTime}\` s`,
    {
      parseMode: 'markdown',
    }
  );
  if (args.length > 0) {
    for (let arg of args) {
      switch (arg) {
        case 'online':
          if (people_online.length > 0) {
            for (let id of people_online) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'offline':
          if (people_offline.length > 0) {
            for (let id of people_offline) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'recently':
          if (people_recently.length > 0) {
            for (let id of people_recently) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'within_week':
        case 'withinWeek':
          if (people_within_week.length > 0) {
            for (let id of people_within_week) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'within_month':
        case 'withinMonth':
          if (people_within_month.length > 0) {
            for (let id of people_within_month) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'long_time_ago':
        case 'longTimeAgo':
          if (people_long_time_ago.length > 0) {
            for (let id of people_long_time_ago) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'deleted':
        case 'deletedAccount':
        case 'deleted_account':
          if (people_deleted.length > 0) {
            for (let id of people_deleted) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'fake':
          if (people_fake.length > 0) {
            for (let id of people_fake) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'scam':
          if (people_scam.length > 0) {
            for (let id of people_scam) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'bot':
          if (people_bot.length > 0) {
            for (let id of people_bot) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'verified':
          if (people_verified.length > 0) {
            for (let id of people_verified) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        case 'restricted':
          if (people_restricted.length > 0) {
            for (let id of people_restricted) {
              setTimeout(() => {
                try {
                  ctx.telegram.editBanned(ctx.chat.id, id);
                  return true;
                } catch (error) {
                  return false;
                }
              }, 2000);
            }
          }
          break;
        default:
      }
    }
  }
  return true;
}
peopleComposer.action('dots people', async (ctx) => {
  try {
    if (ctx.message?.replyToMessage) {
      //@ts-ignore
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
      if (ctx.message?.replyToMessage.text) {
        let spl = String(ctx.message.replyToMessage.text).split(' ');
        if (spl.length > 3) {
          spl.splice(0, 3);
        } else {
          spl = [];
        }
        //@ts-ignore
        ctx.telegram.deleteMessages(ctx.message?.chat.id, [ctx.message?.id]);
        //@ts-ignore
        return getPeople(ctx.message?.replyToMessage!, spl);
      }
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
      error.message
    );
  }
});
