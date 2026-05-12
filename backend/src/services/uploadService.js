const fs = require('fs');
const path = require('path');
const supabase = require('../utils/supabaseClient');

class UploadService {
  constructor() {
    this.bucket = process.env.SUPABASE_BUCKET || 'PI3Pescadores';
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

  sanitizeFilename(filename) {
    const ext = path.extname(filename);
    const nameOnly = path.basename(filename, ext);
    const safeName = nameOnly.replace(/[^a-zA-Z0-9-_\.]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
    return `${safeName}${ext}`;
  }

  async uploadFileToSupabase(filePath, originalFilename, mimetype) {
    const bucketAvailable = await this.checkBucketAvailability();
    const destFilename = this.sanitizeFilename(originalFilename);
    const destPath = `uploads/${destFilename}`;

    if (!bucketAvailable) {
      console.warn('Supabase not available, using local storage');
      return `/uploads/${destFilename}`;
    }

    try {
      const fileStream = fs.createReadStream(filePath);
      const { error } = await supabase.storage.from(this.bucket).upload(destPath, fileStream, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimetype || undefined,
      });

      if (error) {
        console.error('Supabase upload error:', error);
        return `/uploads/${destFilename}`;
      }

      // Generate signed URL
      const expiresIn = Number(process.env.SUPABASE_SIGNED_URL_EXPIRES) || 3600;
      try {
        const { data: signedData, error: signedError } = await supabase.storage.from(this.bucket).createSignedUrl(destPath, expiresIn);
        if (!signedError) {
          const finalUrl = signedData?.signedURL || signedData?.signedUrl;
          if (finalUrl) {
            this.cleanupLocalFile(filePath);
            return finalUrl;
          }
        }
      } catch (e) {
        console.warn('Error creating signed URL:', e.message);
      }

      // Fallback to public URL
      try {
        const { data: publicData } = supabase.storage.from(this.bucket).getPublicUrl(destPath);
        if (publicData?.publicUrl) {
          this.cleanupLocalFile(filePath);
          return publicData.publicUrl;
        }
      } catch (e) {
        console.warn('Error getting public URL:', e.message);
      }

      return `/uploads/${destFilename}`;
    } catch (ex) {
      console.error('Unexpected upload error:', ex.message);
      return `/uploads/${destFilename}`;
    }
  }

  cleanupLocalFile(filePath) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Failed to remove local file:', e.message);
    }
  }

  async uploadMultipleFiles(files) {
    const uploadedUrls = [];
    for (const file of files) {
      const url = await this.uploadFileToSupabase(file.path, path.basename(file.path), file.mimetype);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  }
}

module.exports = new UploadService();