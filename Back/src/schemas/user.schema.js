const Joi = require('joi');

const email = Joi.string().email({ tlds: { allow: false } }).max(160);
const password = Joi.string().min(6).max(72);

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: email.required(),
  password: password.required(),
  phone: Joi.string().max(40).allow('', null),
});

const loginSchema = Joi.object({
  email: email.required(),
  password: Joi.string().required(),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: email.required(),
  password: password.required(),
  phone: Joi.string().max(40).allow('', null),
  role: Joi.string().valid('user', 'admin'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  email,
  password,
  phone: Joi.string().max(40).allow('', null),
  role: Joi.string().valid('user', 'admin'),
}).min(1);

const getUserSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  getUserSchema,
};
