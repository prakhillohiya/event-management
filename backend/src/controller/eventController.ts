import { Request, RequestHandler, Response } from "express";
import { eventModel } from "../model/eventModel";
import { IEvent, eventSchema } from "../schema/eventSchema";
import { ObjectId } from "mongodb";



export const fetchAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventModel.find<IEvent>();

    return res.status(200).send({
      message: "All Events Fetched Successfully",
      data: events,
    });
  } catch (error: any) {

    return res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const fetchEventWithId = async (req: Request, res: Response) => {
  try {

    const { eventId } = req.params as any;

    const event = await eventModel.findById<IEvent>({ _id: eventId });

    if (!event) {
      return res.status(400).send({
        message: "Event Does Not Exist",
      });
    }

    return res.status(200).send({
      message: "Event Fetched Successfully",
      data: event,
    });
  } catch (error: any) {

    return res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {

    const newEvent = await new eventModel<IEvent>(req.body).save();

    return res.status(200).send({
      message: "Event Created Successfully",
      data: newEvent,
    });
  } catch (error: any) {

    return res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteEventWithId = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params as any;

    const event = await eventModel.findByIdAndDelete<IEvent>({ _id: eventId });

    if (!event) {
      return res.status(400).send({
        message: "Event Does Not Exist",
      });
    }

    return res.status(200).send({
      message: "Event Deleted Successfully",
      data: event,
    });
  } catch (error: any) {
    return res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateEventWithId = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params as any

    const body = req.body

    const updatedEvent = await eventModel.findOneAndUpdate<IEvent>(
      { _id: eventId },
      body,
      { new: true }
    );

    return res.status(200).send({
      message: "Event Updated Successfully",
      data: updatedEvent,
    });
  } catch (error: any) {
    return res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};