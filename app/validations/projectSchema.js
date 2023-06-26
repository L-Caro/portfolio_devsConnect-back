/* const Joi = require('joi');

const projectCreate = Joi.object({
  title: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  description: Joi.string()
    .alphanum()
    .min(3)
    .max(500)
    .required(),
  availability: Joi.boolean(),
  tags: Joi.array()
    .items(Joi.number().integer()),
});

const projectUpdate = Joi.object({
  title: Joi.string()
    .alphanum()
    .min(3)
    .max(30),
  description: Joi.string()
    .alphanum()
    .min(3)
    .max(500),
  availability: Joi.boolean(),
  tags: Joi.array()
    .items(Joi.number().integer()),
});

module.exports = { projectCreate, projectUpdate }; */
