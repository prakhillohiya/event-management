"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = void 0;
const zod_1 = require("zod");
function validateSchema(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).send({ message: "Validation error", errors: error.errors });
            }
            else {
                res.status(500).send({ message: "Internal server error" });
            }
        }
    };
}
exports.validateSchema = validateSchema;
