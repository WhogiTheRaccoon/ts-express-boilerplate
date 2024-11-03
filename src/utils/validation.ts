/*
    Utility: Validation
    Description: Utility to validate request data
    Methods:
        - validate(schema: ObjectSchema, data: any, res: Response): boolean
    Usage:
        - Use validate method to validate request data against a Joi schema
        - Returns true if validation is successful
        - Returns false if validation fails and sends a 400 response
*/
import { Response } from 'express';
import { ObjectSchema } from 'joi';

export const validate = (schema: ObjectSchema, data: any, res: Response): boolean => {
    const { error } = schema.validate(data);
    if (error) {
        const messages = error.details.map((err: any) => err.message);
        res.status(400).json({ status: 400, message: messages });
        return false;
    }
    return true;
};