function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function buildPropertySlug({ title, type, neighborhood, tokkoId, idSuffix }) {
  if (tokkoId) {
    const base = `${tokkoId}-${type}-${neighborhood || 'parana'}`;
    return slugify(base);
  }
  const base = [title, type, neighborhood].filter(Boolean).join('-');
  const slug = slugify(base);
  return idSuffix ? `${slug}-${idSuffix}` : slug;
}

async function allocateRefCode(models, id, tokkoId = null) {
  if (tokkoId) {
    const fromTokko = String(tokkoId).replace(/\D/g, '');
    if (fromTokko) {
      const preferred = `LMN-${fromTokko}`;
      const clash = await models.Property.findOne({ where: { refCode: preferred } });
      if (!clash || Number(clash.id) === Number(id)) {
        return preferred;
      }
    }
  }
  const preferred = `LMN-${String(id).padStart(4, '0')}`;
  const clash = await models.Property.findOne({ where: { refCode: preferred } });
  if (!clash || Number(clash.id) === Number(id)) {
    return preferred;
  }
  return `LMN-${id}`;
}

module.exports = {
  slugify,
  buildPropertySlug,
  allocateRefCode,
};
