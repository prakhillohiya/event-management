import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateSchema(schema: z.ZodObject<any, any>): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).send({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).send({ message: "Internal server error" });
      }
    }
  };
}
