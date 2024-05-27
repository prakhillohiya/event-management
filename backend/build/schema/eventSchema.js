"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventSchema = exports.ZEvent = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const attachmentSchema_1 = require("./attachmentSchema");
const ZDuration = zod_1.z.object({ hr: zod_1.z.string(), m: zod_1.z.string() });
const ZGuest = zod_1.z.array(zod_1.z.string());
exports.ZEvent = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    date: zod_1.z.string(),
    time: zod_1.z.string(),
    duration: ZDuration,
    location: zod_1.z.union([zod_1.z.null(), zod_1.z.string()]),
    meetingRoom: zod_1.z.string().optional(),
    guest: ZGuest,
    attachment: zod_1.z.array(attachmentSchema_1.ZAttachment),
    notification: zod_1.z.union([
        zod_1.z.literal('email'),
        zod_1.z.literal('slack'),
    ]),
    reminder: zod_1.z.string(),
});
const durationSchema = new mongoose_1.Schema({
    hr: { type: String, required: false },
    m: { type: String, required: false }
});
exports.eventSchema = new mongoose_1.Schema({
    name: { type: String, required: false },
    description: { type: String, required: false },
    date: { type: String, required: false },
    time: { type: String, required: false },
    duration: durationSchema,
    location: { type: String, required: false },
    meetingRoom: { type: String, required: false },
    attachment: { type: [attachmentSchema_1.attachmentSchema], required: false },
    reminder: { type: String, required: false },
    guest: { type: [String], required: false },
    notification: { type: String, required: false },
});
