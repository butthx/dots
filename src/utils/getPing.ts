// dots - Telegram bot
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of dots
//
// dots is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { MessageContext } from 'tgsnake/lib/Context/MessageContext';
export function getPing(ctx: MessageContext) {
  let now = Number(Date.now() / 1000);
  let date = Number(ctx.date);
  let ping = Number(now - date).toFixed(3);
  return `\`${ping}\` s`;
}
