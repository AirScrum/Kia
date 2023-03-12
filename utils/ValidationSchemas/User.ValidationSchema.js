const Joi = require("joi");

const userValidSchemaRegister = Joi.object({
  fullName: Joi.string().lowercase().trim().required(),
  password: Joi.string().min(12).max(15).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .trim()
    .lowercase()
    .required(),
  birthDate: Joi.string().isoDate().trim(),
});
module.exports = { userValidSchemaRegister };
