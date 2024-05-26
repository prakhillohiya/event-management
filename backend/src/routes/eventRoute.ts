import { Router } from "express";
import { createEvent, deleteEventWithId, fetchAllEvents, fetchEventWithId, updateEventWithId } from "../controller/eventController";
import { validateSchema } from "../middleware/validator";
import { ZEvent } from "../schema/eventSchema";


const router = Router()

router.post('/create', validateSchema(ZEvent), createEvent)
router.get('/fetchAll', fetchAllEvents)
router.get('/fetch/:eventId', fetchEventWithId)
router.post('/update/:eventId', validateSchema(ZEvent), updateEventWithId)
router.delete('/delete/:eventId', deleteEventWithId)

export default router