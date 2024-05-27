"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventWithId = exports.deleteEventWithId = exports.createEvent = exports.fetchEventWithId = exports.fetchAllEvents = void 0;
const eventModel_1 = require("../model/eventModel");
const fetchAllEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield eventModel_1.eventModel.find();
        return res.status(200).send({
            message: "All Events Fetched Successfully",
            data: events,
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.fetchAllEvents = fetchAllEvents;
const fetchEventWithId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const event = yield eventModel_1.eventModel.findById({ _id: eventId });
        if (!event) {
            return res.status(400).send({
                message: "Event Does Not Exist",
            });
        }
        return res.status(200).send({
            message: "Event Fetched Successfully",
            data: event,
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.fetchEventWithId = fetchEventWithId;
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newEvent = yield new eventModel_1.eventModel(req.body).save();
        return res.status(200).send({
            message: "Event Created Successfully",
            data: newEvent,
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.createEvent = createEvent;
const deleteEventWithId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const event = yield eventModel_1.eventModel.findByIdAndDelete({ _id: eventId });
        if (!event) {
            return res.status(400).send({
                message: "Event Does Not Exist",
            });
        }
        return res.status(200).send({
            message: "Event Deleted Successfully",
            data: event,
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.deleteEventWithId = deleteEventWithId;
const updateEventWithId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const body = req.body;
        const updatedEvent = yield eventModel_1.eventModel.findOneAndUpdate({ _id: eventId }, body, { new: true });
        return res.status(200).send({
            message: "Event Updated Successfully",
            data: updatedEvent,
        });
    }
    catch (error) {
        return res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.updateEventWithId = updateEventWithId;
