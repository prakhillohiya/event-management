import { Schema, Types } from "mongoose";
import { z } from "zod";
import { ZAttachment, attachmentSchema } from "./attachmentSchema";

const ZDuration = z.object({ hr: z.string(), m: z.string() })

const ZGuest = z.array(z.string())

export const ZEvent = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  date: z.string(),
  time: z.string(),
  duration: ZDuration,
  location: z.union([z.null(), z.string()]),
  meetingRoom: z.string().optional(),
  guest: ZGuest,
  attachment: z.array(ZAttachment),
  notification: z.union([
    z.literal('email'),
    z.literal('slack'),
  ]),
  reminder: z.string(),
});

type EventType = z.infer<typeof ZEvent>;

export interface IEvent extends EventType { }

const durationSchema = new Schema<IEvent["duration"]>({
  hr: { type: String, required: false },
  m: { type: String, required: false }
})

export const eventSchema = new Schema<IEvent>({
  name: { type: String, required: false },
  description: { type: String, required: false },
  date: { type: String, required: false },
  time: { type: String, required: false },
  duration: durationSchema,
  location: { type: String, required: false },
  meetingRoom: { type: String, required: false },
  attachment: { type: [attachmentSchema], required: false },
  reminder: { type: String, required: false },
  guest: { type: [String], required: false },
  notification: { type: String, required: false },
});
