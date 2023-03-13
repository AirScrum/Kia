const Joi = require("joi");

const userValidSchemaRegister = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  password: Joi.string().min(12).max(15).required(),
  email: Joi.string().email().trim().lowercase().required(),
  birthDate: Joi.string().isoDate().trim(),
});

const userValidSchemaLogin = Joi.object({
  password: Joi.string().min(12).max(15).required(),
  email: Joi.string().email().trim().lowercase().required(),  
});

module.exports = { userValidSchemaRegister,userValidSchemaLogin };
