const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const boom = require('@hapi/boom');
const { toPublicUrl } = require('../utils/publicUrl');

const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');
const INCOMING_DIR = path.join(UPLOAD_ROOT, 'properties', 'incoming');
const MAX_FILES = 20;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

fs.mkdirSync(INCOMING_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, INCOMING_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { files: MAX_FILES, fileSize: MAX_FILE_BYTES },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(boom.badRequest('Solo se permiten imágenes JPG, PNG, WEBP o GIF'));
      return;
    }
    cb(null, true);
  },
});

function optionalPropertyPhotos(req, res, next) {
  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.includes('multipart/form-data')) {
    next();
    return;
  }

  upload.array('photos', MAX_FILES)(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_COUNT') {
        next(boom.badRequest(`Máximo ${MAX_FILES} fotos por propiedad`));
        return;
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(boom.badRequest('Cada foto puede pesar hasta 5 MB'));
        return;
      }
      next(boom.badRequest(err.message));
      return;
    }
    next(err.isBoom ? err : boom.badRequest(err.message || 'Error al subir imágenes'));
  });
}

function normalizePropertyBody(req, _res, next) {
  const body = { ...(req.body || {}) };

  if (typeof body.features === 'string') {
    const raw = body.features.trim();
    if (!raw) {
      body.features = [];
    } else if (raw.startsWith('[')) {
      try {
        body.features = JSON.parse(raw);
      } catch {
        body.features = raw.split(',').map((item) => item.trim()).filter(Boolean);
      }
    } else {
      body.features = raw.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  if (typeof body.galleryImages === 'string') {
    try {
      body.galleryImages = JSON.parse(body.galleryImages);
    } catch {
      body.galleryImages = [];
    }
  }

  const numericFields = ['price', 'coveredM2', 'semiCoveredM2', 'rooms', 'bathrooms', 'latitude', 'longitude'];
  for (const field of numericFields) {
    if (body[field] === '' || body[field] === undefined) {
      if (field === 'latitude' || field === 'longitude') body[field] = null;
      continue;
    }
    if (body[field] !== null && body[field] !== '') {
      body[field] = Number(body[field]);
    }
  }

  if (body.address === '') body.address = null;
  if (body.mapUrl === '') body.mapUrl = null;

  if (body.tokkoId === '') body.tokkoId = null;
  if (body.heroImage === '') body.heroImage = null;

  req.body = body;
  next();
}

function placePropertyPhotos(req, propertyId, files = []) {
  if (!files.length) {
    return { heroImage: null, galleryImages: [] };
  }

  const destDir = path.join(UPLOAD_ROOT, 'properties', String(propertyId));
  fs.mkdirSync(destDir, { recursive: true });

  const urls = [];
  for (const file of files) {
    const destPath = path.join(destDir, file.filename);
    fs.renameSync(file.path, destPath);
    urls.push(toPublicUrl(req, `/uploads/properties/${propertyId}/${file.filename}`));
  }

  return {
    heroImage: urls[0] || null,
    galleryImages: urls,
  };
}

function cleanupIncomingFiles(files = []) {
  for (const file of files) {
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        // ignore cleanup errors
      }
    }
  }
}

module.exports = {
  optionalPropertyPhotos,
  normalizePropertyBody,
  placePropertyPhotos,
  cleanupIncomingFiles,
  UPLOAD_ROOT,
  MAX_FILES,
};
