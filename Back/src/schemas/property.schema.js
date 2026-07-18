const Joi = require('joi');

const operation = Joi.string().valid('venta', 'alquiler', 'alquiler_temporal');
const type = Joi.string().valid('departamento', 'casa', 'ph', 'duplex', 'cochera', 'terreno', 'local');
const status = Joi.string().valid('disponible', 'reservada', 'alquilada', 'vendida');
const currency = Joi.string().valid('USD', 'ARS');

const createPropertySchema = Joi.object({
  title: Joi.string().min(3).max(180).required(),
  slug: Joi.string().max(160),
  operation: operation.required(),
  type: type.required(),
  status: status.default('disponible'),
  price: Joi.number().min(0).required(),
  currency: currency.default('USD'),
  neighborhood: Joi.string().min(2).max(80).required(),
  city: Joi.string().min(2).max(80).required(),
  address: Joi.string().max(200).allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  mapUrl: Joi.string().max(1000).allow('', null),
  coveredM2: Joi.number().integer().min(0).default(0),
  semiCoveredM2: Joi.number().integer().min(0).default(0),
  rooms: Joi.number().integer().min(0).default(0),
  bathrooms: Joi.number().integer().min(0).default(0),
  description: Joi.string().min(10).max(8000).required(),
  features: Joi.array().items(Joi.string().max(120)).default([]),
  heroImage: Joi.string().max(1000).allow('', null),
  galleryImages: Joi.array().items(Joi.string().max(1000)).default([]),
  refCode: Joi.string().max(40),
  tokkoId: Joi.string().max(40).allow('', null),
});

const updatePropertySchema = createPropertySchema.fork(
  ['title', 'operation', 'type', 'price', 'neighborhood', 'city', 'description'],
  (schema) => schema.optional(),
).min(1);

const getPropertySchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const getPropertyBySlugSchema = Joi.object({
  slug: Joi.string().min(2).max(160).required(),
});

const listPropertiesQuerySchema = Joi.object({
  operation,
  type,
  status,
  city: Joi.string().max(80),
  neighborhood: Joi.string().max(80),
  currency,
  q: Joi.string().max(120),
  sort: Joi.string().valid('relevance', 'price_asc', 'price_desc'),
  priceMin: Joi.number().min(0),
  priceMax: Joi.number().min(0),
  rooms: Joi.number().integer().min(0),
  userId: Joi.number().integer().positive(),
});

module.exports = {
  createPropertySchema,
  updatePropertySchema,
  getPropertySchema,
  getPropertyBySlugSchema,
  listPropertiesQuerySchema,
};
