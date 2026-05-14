const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const AppError = require('../middlewares/appError');
const supabase = require('../utils/supabaseClient');

const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads');
const MAX_FILE_SIZE = Number(process.env.UPLOAD_MAX_FILE_SIZE) || 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.jfif']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);

// Uploads sempre entram primeiro no disco local. Depois o serviço tenta Supabase
// e mantém o arquivo local como fallback se storage remoto falhar.
function ensureUploadRoot() {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

function removeDiacritics(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function sanitizeFilename(filename) {
  const parsed = path.parse(filename || 'upload');
  const ext = parsed.ext.toLowerCase();
  const basename = parsed.name;
  const safeBase = removeDiacritics(basename)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^[.-]+|[.-]+$)/g, '')
    .slice(0, 80);

  return `${safeBase || 'upload'}${ext}`;
}

function isAllowedFile(file) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext) && ALLOWED_MIME_TYPES.has(file.mimetype);
}

function createStoredFilename(originalname) {
  const sanitized = sanitizeFilename(originalname);
  const ext = path.extname(sanitized).toLowerCase();
  const basename = path.basename(sanitized, ext);
  const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  return `${unique}-${basename}${ext}`;
}

function assertInsideUploadRoot(filePath) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(`${UPLOAD_ROOT}${path.sep}`)) {
    throw new AppError(400, 'Invalid upload path');
  }
  return resolved;
}

class UploadService {
  constructor() {
    this.bucket = process.env.SUPABASE_BUCKET || 'PI3Pescadores';
    this.bucketIsPublic = null;
  }

  createMulterMiddleware() {
    ensureUploadRoot();

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, UPLOAD_ROOT);
      },
      filename: (req, file, cb) => {
        cb(null, createStoredFilename(file.originalname));
      },
    });

    return multer({
      storage,
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 10,
      },
      fileFilter: (req, file, cb) => {
        if (!isAllowedFile(file)) {
          return cb(new AppError(400, 'Only image uploads are allowed'));
        }
        return cb(null, true);
      },
    });
  }

  async checkBucketAvailability() {
    if (!supabase) return false;

    try {
      const { error } = await supabase.storage.from(this.bucket).list('', { limit: 1 });
      return !error;
    } catch (e) {
      console.error('Error checking Supabase bucket availability:', e.message);
      return false;
    }
  }

  async detectPublicBucket() {
    if (!supabase) return false;
    if (this.bucketIsPublic !== null) return this.bucketIsPublic;

    try {
      const { data, error } = await supabase.storage.getBucket(this.bucket);
      if (error) {
        this.bucketIsPublic = false;
        return false;
      }

      this.bucketIsPublic = Boolean(data?.public);
      return this.bucketIsPublic;
    } catch (e) {
      console.warn('Error checking Supabase bucket privacy:', e.message);
      this.bucketIsPublic = false;
      return false;
    }
  }

  localUrlForStoredFile(filePath) {
    const resolved = assertInsideUploadRoot(filePath);
    const relativePath = path.relative(UPLOAD_ROOT, resolved).split(path.sep).join('/');
    return `/uploads/${relativePath}`;
  }

  async uploadFileToSupabase(filePath, originalFilename, mimetype) {
    const resolvedFilePath = assertInsideUploadRoot(filePath);
    const localUrl = this.localUrlForStoredFile(resolvedFilePath);
    const bucketAvailable = await this.checkBucketAvailability();
    const destFilename = sanitizeFilename(originalFilename || path.basename(resolvedFilePath));
    const destPath = `uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${destFilename}`;

    if (!bucketAvailable) {
      console.warn('Supabase not available, using local storage');
      return localUrl;
    }

    try {
      const fileStream = fs.createReadStream(resolvedFilePath);
      const { error } = await supabase.storage.from(this.bucket).upload(destPath, fileStream, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimetype || undefined,
      });

      if (error) {
        console.error('Supabase upload error:', error);
        return localUrl;
      }

      // Bucket público pode devolver URL permanente; bucket privado precisa de signed URL.
      if (await this.detectPublicBucket()) {
        const { data: publicData } = supabase.storage.from(this.bucket).getPublicUrl(destPath);
        if (publicData?.publicUrl) {
          this.cleanupLocalFile(resolvedFilePath);
          return publicData.publicUrl;
        }
      }

      const expiresIn = Number(process.env.SUPABASE_SIGNED_URL_EXPIRES) || 60 * 60 * 24 * 7;
      const { data: signedData, error: signedError } = await supabase.storage
        .from(this.bucket)
        .createSignedUrl(destPath, expiresIn);

      if (!signedError) {
        const signedUrl = signedData?.signedURL || signedData?.signedUrl;
        if (signedUrl) {
          this.cleanupLocalFile(resolvedFilePath);
          return signedUrl;
        }
      }

      return localUrl;
    } catch (ex) {
      console.error('Unexpected upload error:', ex.message);
      return localUrl;
    }
  }

  cleanupLocalFile(filePath) {
    try {
      fs.unlinkSync(assertInsideUploadRoot(filePath));
    } catch (e) {
      console.warn('Failed to remove local file:', e.message);
    }
  }

  async uploadMultipleFiles(files) {
    const uploadedUrls = [];
    for (const file of files) {
      if (!isAllowedFile(file)) {
        throw new AppError(400, 'Only image uploads are allowed');
      }

      const url = await this.uploadFileToSupabase(file.path, file.filename, file.mimetype);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  }
}

module.exports = new UploadService();
module.exports._private = {
  UPLOAD_ROOT,
  sanitizeFilename,
  createStoredFilename,
  isAllowedFile,
};
