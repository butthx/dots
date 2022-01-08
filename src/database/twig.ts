// dots - Telegram bot
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of dots
//
// dots is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { Schema, model, Document } from 'mongoose';
export interface TwigInterface extends Document {
  chatId: string;
  twig: string;
}
export const TwigSchema = new Schema({
  chatId: {
    type: String,
    required: true,
  },
  twig: {
    type: String,
    default: '',
  },
});
TwigSchema.set('strict', false);
TwigSchema.set('timestamps', true);

const TwigModel = model<TwigInterface>('twig', TwigSchema);
export default TwigModel;
