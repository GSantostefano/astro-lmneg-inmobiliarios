const Joi = require('joi');

const googleAuthSchema = Joi.object({
  credential: Joi.string().min(20).required(),
});

module.exports = {
  googleAuthSchema,
};
