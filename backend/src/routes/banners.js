const { Router } = require('express');
const supabase = require('../utils/supabaseClient');

const router = Router();

// GET /api/banners
// Returns list of banner image URLs (public) using Supabase storage when available,
// otherwise falls back to building URLs served from the backend /uploads/Banner folder.
router.get('/', async (req, res) => {
  const bucket = process.env.SUPABASE_BUCKET || 'PI3Pescadores';
  try {
    if (supabase) {
      // list files in 'Banner/' prefix
      const { data, error } = await supabase.storage.from(bucket).list('Banner', { limit: 100, offset: 0 });
      if (error) {
        console.error('Supabase list error:', error);
        return res.status(500).json({ error: 'Failed to list banner files' });
      }

      const files = data || [];
      const items = files.map(f => {
        const publicUrl = supabase.storage.from(bucket).getPublicUrl(`Banner/${f.name}`).data.publicUrl;
        return { filename: f.name, url: publicUrl };
      });

      return res.json({ data: items });
    }

    // fallback: assume files are served statically under /uploads/Banner
    const host = `${req.protocol}://${req.get('host')}`;
    // This assumes filenames are known; try to read from disk is avoided here.
    // We'll return common banner filenames — clients should handle 404s.
    const common = ['Aparecida.jpg','crucifixo.jpg','barco.jpg','oratoria.jpg','rosario.jpg','kitoracao.jpg'];
    const items = common.map(name => ({ filename: name, url: `${host}/uploads/Banner/${name}` }));
    return res.json({ data: items });
  } catch (err) {
    console.error('Error in /api/banners:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
