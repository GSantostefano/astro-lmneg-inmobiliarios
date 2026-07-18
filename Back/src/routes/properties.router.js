const express = require('express');
const PropertyService = require('../services/property.service');
const validatorHandler = require('../middlewares/validator.handler');
const { authHandler } = require('../middlewares/auth.handler');
const {
  optionalPropertyPhotos,
  normalizePropertyBody,
  placePropertyPhotos,
  cleanupIncomingFiles,
} = require('../middlewares/upload.handler');
const {
  createPropertySchema,
  updatePropertySchema,
  getPropertySchema,
  getPropertyBySlugSchema,
  listPropertiesQuerySchema,
} = require('../schemas/property.schema');

const router = express.Router();
const service = new PropertyService();

router.get('/', validatorHandler(listPropertiesQuerySchema, 'query'), async (req, res, next) => {
  try {
    const properties = await service.find(req.query);
    res.json({ ok: true, data: properties, count: properties.length });
  } catch (error) {
    next(error);
  }
});

router.get('/mine', authHandler, async (req, res, next) => {
  try {
    const properties = await service.findMine(req.user.id, req.query);
    res.json({ ok: true, data: properties, count: properties.length });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/slug/:slug',
  validatorHandler(getPropertyBySlugSchema, 'params'),
  async (req, res, next) => {
    try {
      const property = await service.findBySlug(req.params.slug);
      res.json({ ok: true, data: property });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/:id', validatorHandler(getPropertySchema, 'params'), async (req, res, next) => {
  try {
    const property = await service.findOne(req.params.id);
    res.json({ ok: true, data: property });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  authHandler,
  optionalPropertyPhotos,
  normalizePropertyBody,
  validatorHandler(createPropertySchema, 'body'),
  async (req, res, next) => {
    const files = Array.isArray(req.files) ? req.files : [];
    try {
      const userId = req.user?.id || null;
      const body = { ...req.body };

      const created = await service.create(
        {
          ...body,
          heroImage: body.heroImage || undefined,
          galleryImages: body.galleryImages || [],
        },
        userId,
      );

      if (files.length) {
        const images = placePropertyPhotos(req, created.id, files);
        const property = await service.update(
          created.id,
          {
            heroImage: images.heroImage || created.heroImage,
            galleryImages: images.galleryImages,
          },
          req.user || null,
        );
        res.status(201).json({ ok: true, data: property });
        return;
      }

      res.status(201).json({ ok: true, data: created });
    } catch (error) {
      cleanupIncomingFiles(files);
      next(error);
    }
  },
);

router.patch(
  '/:id',
  authHandler,
  validatorHandler(getPropertySchema, 'params'),
  optionalPropertyPhotos,
  normalizePropertyBody,
  validatorHandler(updatePropertySchema, 'body'),
  async (req, res, next) => {
    const files = Array.isArray(req.files) ? req.files : [];
    try {
      const payload = { ...req.body };

      if (files.length) {
        const images = placePropertyPhotos(req, req.params.id, files);
        if (images.heroImage) payload.heroImage = images.heroImage;
        if (images.galleryImages.length) payload.galleryImages = images.galleryImages;
      }

      const property = await service.update(req.params.id, payload, req.user);
      res.json({ ok: true, data: property });
    } catch (error) {
      cleanupIncomingFiles(files);
      next(error);
    }
  },
);

router.delete(
  '/:id',
  authHandler,
  validatorHandler(getPropertySchema, 'params'),
  async (req, res, next) => {
    try {
      const result = await service.delete(req.params.id, req.user);
      res.json({ ok: true, ...result });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
