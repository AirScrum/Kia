const Joi = require("joi");

const userValidSchemaRegister = Joi.object({
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  password: Joi.string().min(12).max(15).required(),
  email: Joi.string().email().trim().lowercase().required(),
  birthDate: Joi.string().isoDate().trim(),
});
module.exports = { userValidSchemaRegister };
