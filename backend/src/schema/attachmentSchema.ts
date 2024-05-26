import { Schema, Types } from "mongoose";
import { z } from "zod";

export const ZAttachment = z.object({
  asset_id: z.string(),
  public_id: z.string(),
  version: z.number(),
  version_id: z.string(),
  signature: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
  resource_type: z.string(),
  created_at: z.string(),
  tags: z.array(z.string()),
  bytes: z.number(),
  type: z.string(),
  etag: z.string(),
  placeholder: z.boolean(),
  url: z.string(),
  secure_url: z.string(),
  folder: z.string(),
  access_mode: z.string(),
  existing: z.boolean(),
  original_filename: z.string(),
})

type AttachmentType = z.infer<typeof ZAttachment>;

export interface IAttachment extends AttachmentType { }

export const attachmentSchema = new Schema<IAttachment>({
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
