import joi, { CustomHelpers } from 'joi';

// Custom validation to check if at least one field is required
const atLeastOneFieldRequired = (value: any, helpers: CustomHelpers) => {
    const { email, password, name, role } = value;
    if (!email && !password && !name && !role) {
        return helpers.error('any.required');
    }
    return value;
};

const createUser = joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
});

const updateUser = joi.object({
    username: joi.string(),
    email: joi.string().email(),
    password: joi.string().min(8),
}).custom(atLeastOneFieldRequired);

const loginUser = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
});

const getOne = joi.object({
    id: joi.number().required(),
});

// Exporting userSchema
const userSchema = {
    createUser,
    updateUser,
    loginUser,
    getOne,
};

export default userSchema;