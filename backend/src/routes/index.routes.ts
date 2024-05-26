import { Express, Request, Response } from "express";
import eventRoute from "./eventRoute";


const routes = (app: Express) => {
   app.use('/event', eventRoute)
   app.use('/check', async (req: Request, res: Response) => {
      try {
         res.status(200).send({ "message": "Server Running" })
      } catch (error) {
         res.status(500).send({ "message": "Internal Server Error" })
      }
   })
}

export default routes