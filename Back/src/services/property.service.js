const boom = require('@hapi/boom');
const { Op } = require('sequelize');
const { models } = require('../libs/sequelize');
const { buildPropertySlug, allocateRefCode } = require('../utils/properties');

class PropertyService {
  async find(query = {}) {
    const where = {};

    if (query.operation) where.operation = query.operation;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.city) where.city = query.city;
    if (query.neighborhood) where.neighborhood = query.neighborhood;
    if (query.currency) where.currency = query.currency;
    if (query.userId) where.userId = query.userId;

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      where.price = {};
      if (query.priceMin !== undefined) where.price[Op.gte] = query.priceMin;
      if (query.priceMax !== undefined) where.price[Op.lte] = query.priceMax;
    }

    if (query.rooms !== undefined) {
      where.rooms = { [Op.gte]: query.rooms };
    }

    if (query.q) {
      const like = `%${query.q}%`;
      where[Op.or] = [
        { title: { [Op.like]: like } },
        { description: { [Op.like]: like } },
        { neighborhood: { [Op.like]: like } },
        { city: { [Op.like]: like } },
        { refCode: { [Op.like]: like } },
        { tokkoId: { [Op.like]: like } },
      ];
    }

    const order =
      query.sort === 'price_asc'
        ? [['price', 'ASC'], ['id', 'ASC']]
        : query.sort === 'price_desc'
          ? [['price', 'DESC'], ['id', 'DESC']]
          : [['id', 'DESC']];

    const properties = await models.Property.findAll({
      where,
      order,
      include: [
        {
          association: 'owner',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });

    return properties;
  }

  async findMine(userId, query = {}) {
    return this.find({ ...query, userId: String(userId) });
  }

  async findOne(id) {
    const property = await models.Property.findByPk(id, {
      include: [
        {
          association: 'owner',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });
    if (!property) {
      throw boom.notFound('Propiedad no encontrada');
    }
    return property;
  }

  async findBySlug(slug) {
    const property = await models.Property.findOne({
      where: { slug },
      include: [
        {
          association: 'owner',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });
    if (!property) {
      throw boom.notFound('Propiedad no encontrada');
    }
    return property;
  }

  async create(data, userId = null) {
    const tempSuffix = Date.now().toString(36);
    const slug =
      data.slug ||
      buildPropertySlug({
        title: data.title,
        type: data.type,
        neighborhood: data.neighborhood,
        tokkoId: data.tokkoId,
        idSuffix: tempSuffix,
      });

    const existingSlug = await models.Property.findOne({ where: { slug } });
    if (existingSlug) {
      throw boom.conflict('Ya existe una propiedad con ese slug');
    }

    const payload = {
      ...data,
      slug,
      refCode: data.refCode || `TMP-${tempSuffix}`,
      userId: userId ?? data.userId ?? null,
      features: data.features || [],
      galleryImages: data.galleryImages || [],
      heroImage: data.heroImage || '/assets/property-placeholder.png',
      tokkoId: data.tokkoId || null,
    };

    const property = await models.Property.create(payload);

    if (!data.refCode) {
      const refCode = await allocateRefCode(models, property.id, property.tokkoId);
      await property.update({ refCode });
    }

    return this.findOne(property.id);
  }

  async update(id, changes, actor = null) {
    const property = await this.findOne(id);
    this.assertCanManage(property, actor);

    const payload = { ...changes };
    if (payload.features && !Array.isArray(payload.features)) {
      delete payload.features;
    }
    if (payload.galleryImages && !Array.isArray(payload.galleryImages)) {
      delete payload.galleryImages;
    }

    await property.update(payload);
    return this.findOne(id);
  }

  async delete(id, actor = null) {
    const property = await this.findOne(id);
    this.assertCanManage(property, actor);
    await property.destroy();
    return { id: Number(id) };
  }

  assertCanManage(property, actor) {
    if (!actor) return;
    if (actor.role === 'admin') return;
    if (property.userId && Number(property.userId) === Number(actor.id)) return;
    throw boom.forbidden('No podés modificar esta propiedad');
  }
}

module.exports = PropertyService;
