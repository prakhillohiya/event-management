"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventModel = void 0;
const mongoose_1 = require("mongoose");
const eventSchema_1 = require("../schema/eventSchema");
exports.eventModel = (0, mongoose_1.model)('Event', eventSchema_1.eventSchema);
