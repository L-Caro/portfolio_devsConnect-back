const Joi = require('joi');

const userCreate = Joi.object({
  name: Joi.string()
    .alphanum()
    .max(30)
    .required(),
  firstname: Joi.string()
    .alphanum()
    .max(30)
    .required(),
  pseudo: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  email: Joi.string()
    .email({minDomainSegments: 2})
    .required(),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required(),
  description: Joi.string(),
  availability: Joi.boolean(),
  tags: Joi.array()
    .items(Joi.number().integer()),
});

const userUpdate = Joi.object({
  name: Joi.string()
    .alphanum()
    .max(30),
  firstname: Joi.string()
    .alphanum()
    .max(30),
  pseudo: Joi.string()
    .alphanum()
    .min(3)
    .max(30),
  email: Joi.string()
    .pattern(new RegExp('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  description: Joi.string(),
  availability: Joi.boolean(),
  tags: Joi.array()
    .items(Joi.number().integer()),
});

module.exports = { userCreate, userUpdate };
