'use strict';

const SUPABASE_URL_PREFIX = 'supabase://';

function normalizeUrl(url) {
  if (!url) return '';
  return String(url).trim().replace(/[\r\n\t]/g, '');
}

function parseSupabaseObjectPath(url, bucket) {
  const cleanUrl = normalizeUrl(url);
  if (!cleanUrl) return '';

  if (cleanUrl.startsWith(SUPABASE_URL_PREFIX)) {
    return cleanUrl.slice(SUPABASE_URL_PREFIX.length).replace(/^\/+/, '');
  }

  try {
    const parsed = new URL(cleanUrl);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const objectIndex = parts.indexOf('object');
    if (objectIndex === -1) return '';

    const mode = parts[objectIndex + 1];
    const urlBucket = parts[objectIndex + 2];
    if (!['sign', 'public'].includes(mode) || urlBucket !== bucket) return '';

    return parts.slice(objectIndex + 3).map(decodeURIComponent).join('/');
  } catch {
    return '';
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const bucket = process.env.SUPABASE_BUCKET || 'PI3Pescadores';
    const [rows] = await queryInterface.sequelize.query('SELECT id, url FROM produto_imagens ORDER BY id');

    for (const row of rows) {
      const objectPath = parseSupabaseObjectPath(row.url, bucket);
      if (!objectPath) continue;

      const normalizedUrl = `${SUPABASE_URL_PREFIX}${objectPath}`;
      if (normalizedUrl === row.url) continue;

      await queryInterface.sequelize.query('UPDATE produto_imagens SET url = :url WHERE id = :id', {
        replacements: {
          id: row.id,
          url: normalizedUrl,
        },
      });
    }
  },

  async down() {
    // Normalização segura e sem perda; não reconstruímos signed URLs expiradas.
  },
};
