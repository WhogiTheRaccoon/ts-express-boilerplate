import joi, { CustomHelpers } from 'joi';

// Custom validation to check if at least one field is required
export const atLeastOneFieldRequired = (value: any, helpers: CustomHelpers) => {
    const { email, password, name, role } = value;
    if (!email && !password && !name && !role) {
        return helpers.error('any.required');
    }
    return value;
};

export const createUser = joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
});

export const updateUser = joi.object({
    username: joi.string(),
    email: joi.string().email(),
    password: joi.string().min(8),
}).custom(atLeastOneFieldRequired);

export const loginUser = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
});

export const getOne = joi.object({
    id: joi.number().required(),
});

export const verifyEmail = joi.object({
    token: joi.string().required(),
})

export const resetPassword = joi.object({
    token: joi.string().required(),
    password: joi.string().required(),
})