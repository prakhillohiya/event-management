"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentSchema = exports.ZAttachment = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.ZAttachment = zod_1.z.object({
    asset_id: zod_1.z.string(),
    public_id: zod_1.z.string(),
    version: zod_1.z.number(),
    version_id: zod_1.z.string(),
    signature: zod_1.z.string(),
    width: zod_1.z.number(),
    height: zod_1.z.number(),
    format: zod_1.z.string(),
    resource_type: zod_1.z.string(),
    created_at: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()),
    bytes: zod_1.z.number(),
    type: zod_1.z.string(),
    etag: zod_1.z.string(),
    placeholder: zod_1.z.boolean(),
    url: zod_1.z.string(),
    secure_url: zod_1.z.string(),
    folder: zod_1.z.string(),
    access_mode: zod_1.z.string(),
    existing: zod_1.z.boolean(),
    original_filename: zod_1.z.string(),
});
exports.attachmentSchema = new mongoose_1.Schema({
    asset_id: { type: String, required: false },
    public_id: { type: String, required: false },
    version: { type: Number, required: false },
    version_id: { type: String, required: false },
    signature: { type: String, required: false },
    width: { type: Number, required: false },
    height: { type: Number, required: false },
    format: { type: String, required: false },
    resource_type: { type: String, required: false },
    created_at: { type: String, required: false },
    tags: { type: [String], required: false },
    bytes: { type: Number, required: false },
    type: { type: String, required: false },
    etag: { type: String, required: false },
    placeholder: { type: Boolean, required: false },
    url: { type: String, required: false },
    secure_url: { type: String, required: false },
    folder: { type: String, required: false },
    access_mode: { type: String, required: false },
    existing: { type: Boolean, required: false },
    original_filename: { type: String, required: false },
});