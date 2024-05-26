import { Model, model } from "mongoose";
import { IEvent, eventSchema } from "../schema/eventSchema";

export const eventModel:Model<IEvent>=model<IEvent>('Event',eventSchema)