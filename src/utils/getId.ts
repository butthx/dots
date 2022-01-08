// dots - Telegram bot
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of dots
//
// dots is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { Updates } from 'tgsnake';
import { ResultGetEntity } from 'tgsnake/lib/Telegram/Users/GetEntity';
import { MessageContext } from 'tgsnake/lib/Context/MessageContext';
interface parse {
  chatId: bigint;
  userId: bigint;
}
export default function getId(update: Updates.TypeUpdate) {
  if (update instanceof ResultGetEntity) {
    update as ResultGetEntity;
    return {
      chatId: update.id,
      userId: update.id,
    } as parse;
  }
  if (update instanceof MessageContext) {
    update as MessageContext;
    return {
      chatId: update.chat.id,
      userId: update.from.id,
    } as parse;
  }
  if (update instanceof Updates.UpdateBotCallbackQuery) {
    update as Updates.UpdateBotCallbackQuery;
    return {
      chatId: update.message ? update.message.chat.id : update.from.id,
      userId: update.from.id,
    } as parse;
  }
  if (update instanceof Updates.UpdateBotInlineQuery) {
    update as Updates.UpdateBotInlineQuery;
    return {
      chatId: update.from.id,
      userId: update.from.id,
    } as parse;
  }
  if (update instanceof Updates.UpdateChatUserTyping) {
    update as Updates.UpdateChatUserTyping;
    return {
      chatId: update.chat.id,
      userId: update.user.id,
    } as parse;
  }
  if (update instanceof Updates.UpdateInlineBotCallbackQuery) {
    update as Updates.UpdateInlineBotCallbackQuery;
    return {
      chatId: update.message ? update.message.chat.id : update.from.id,
      userId: update.from.id,
    } as parse;
  }
  if (update instanceof Updates.UpdateNewChannelMessage) {
    update as Updates.UpdateNewChannelMessage;
    return {
      chatId: update.message.chat.id,
      userId: update.message.from.id,
    } as parse;
  }
  if (update instanceof Updates.UpdateNewMessage) {
    update as Updates.UpdateNewMessage;
    return {
      chatId: update.message.chat.id,
      userId: update.message.from.id,
    } as parse;
  }
  if (update instanceof Updates.UpdateShortChatMessage) {
    update as Updates.UpdateShortChatMessage;
    return {
      chatId: update.message.chat.id,
      userId: update.message.from.id,
    } as parse;
  }
  if (update instanceof Updates.UpdateShortMessage) {
    update as Updates.UpdateShortMessage;
    return {
      chatId: update.message.chat.id,
      userId: update.message.from.id,
    } as parse;
  }
  if (update instanceof Updates.UpdateShortSentMessage) {
    update as Updates.UpdateShortSentMessage;
    return {
      chatId: update.message.chat.id,
      userId: update.message.from.id,
    } as parse;
  }
  return false;
}
