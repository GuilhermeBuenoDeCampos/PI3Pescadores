const asyncHandler = require('../utils/asyncHandler');
const produtoService = require('../services/produtoService');

function parseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

exports.listar = asyncHandler(async (req, res) => {
  const produtos = await produtoService.listarProdutos(req.query);

  res.json({
    data: produtos,
  });
});

exports.detalhar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: { message: 'Invalid produto id' },
    });
  }

  const produto = await produtoService.buscarProdutoPorId(id);

  res.json({
    data: produto,
  });
});

exports.detalharPorNome = asyncHandler(async (req, res) => {
  const nome = req.params.nome;

  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({
      error: { message: 'Invalid product name' },
    });
  }

  const produto = await produtoService.buscarProdutoPorNome(nome);

  res.json({
    data: produto,
  });
});

const fs = require('fs');
const path = require('path');
const supabase = require('../utils/supabaseClient');

async function uploadFilesToSupabase(files) {
  const bucket = process.env.SUPABASE_BUCKET || 'PI3Pescadores';
  const uploadedUrls = [];

  // quick check: verify bucket exists and is accessible
  let bucketAvailable = true;
  if (supabase) {
    try {
      const { data: listData, error: listError } = await supabase.storage.from(bucket).list('', { limit: 1 });
      if (listError) {
        console.error('Supabase bucket check failed for', bucket, listError);
        bucketAvailable = false;
      }
    } catch (e) {
      console.error('Error checking Supabase bucket availability for', bucket, e && e.message ? e.message : e);
      bucketAvailable = false;
    }
  } else {
    bucketAvailable = false;
  }

  for (const file of files) {
    const filePath = file.path; // local path
    const destFilename = path.basename(filePath);

    // If supabase is not configured or bucket is not available, fallback to local storage
    if (!supabase || !bucketAvailable) {
      uploadedUrls.push(`/uploads/${destFilename}`);
      continue;
    }

    // Put files under a folder in the bucket to avoid collisions
  // sanitize filename: keep extension, replace unsafe chars with '-'
  const ext = path.extname(destFilename);
  const nameOnly = path.basename(destFilename, ext);
  const safeName = nameOnly.replace(/[^a-zA-Z0-9-_\.]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
  const finalFilename = `${safeName}${ext}`;
  const destPath = `uploads/${finalFilename}`;

  console.log('Uploading file', destFilename, '->', destPath);

    try {
      const fileStream = fs.createReadStream(filePath);

      const { data, error } = await supabase.storage.from(bucket).upload(destPath, fileStream, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype || undefined,
      });

      if (error) {
        console.error('Supabase upload error for', destPath, error);
        uploadedUrls.push(`/uploads/${destFilename}`);
        continue;
      }

      // generate signed URL (preferred) or fallback to public URL
      const expiresIn = Number(process.env.SUPABASE_SIGNED_URL_EXPIRES) || 3600; // seconds
      let finalUrl = null;

      try {
        const { data: signedData, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(destPath, expiresIn);
        if (signedError) {
          console.warn('Failed to create signed URL for', destPath, signedError);
        } else {
          // SDK may return signedURL or signedUrl depending on version
          finalUrl = signedData?.signedURL || signedData?.signedUrl || null;
        }
      } catch (e) {
        console.warn('Error creating signed URL for', destPath, e && e.message ? e.message : e);
      }

      if (!finalUrl) {
        // try public URL as fallback
        const { data: publicData, error: publicError } = supabase.storage.from(bucket).getPublicUrl(destPath);
        if (publicError) {
          console.warn('Failed to get public URL for', destPath, publicError);
        }
        finalUrl = publicData?.publicUrl || null;
      }

      uploadedUrls.push(finalUrl || `/uploads/${destFilename}`);

      // remove local file
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Failed to remove local file', filePath, e.message);
      }
    } catch (ex) {
      console.error('Unexpected error uploading to Supabase for', destFilename, ex && ex.message ? ex.message : ex);
      uploadedUrls.push(`/uploads/${destFilename}`);
    }
  }

  return uploadedUrls;
}

exports.criar = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const fileUrls = await uploadFilesToSupabase(files);

  const payload = {
    ...req.body,
    imagens: fileUrls
  };

  const produto = await produtoService.criarProduto(payload);

  res.status(201).json({
    data: produto,
  });
});

exports.adicionarImagem = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: { message: 'Invalid produto id' },
    });
  }

  const imagem = await produtoService.adicionarImagem(id, req.body);

  res.status(201).json({
    data: imagem,
  });
});

exports.registrarMovimentacao = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: { message: 'Invalid produto id' },
    });
  }

  const movimentacao = await produtoService.registrarMovimentacao(id, req.body);

  res.status(201).json({
    data: movimentacao,
  });
});

function parseMovimentacoesPayload(payload) {
  let parsed = payload;

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      // leave as-is; service will validate
    }
  }

  if (parsed && typeof parsed.movimentacoes === 'string') {
    try {
      parsed.movimentacoes = JSON.parse(parsed.movimentacoes);
    } catch (e) {
      // leave as-is; service will validate
    }
  }

  return parsed;
}

exports.registrarMovimentacoesEmMassa = asyncHandler(async (req, res) => {
  const payload = parseMovimentacoesPayload(req.body);

  if (process.env.NODE_ENV !== 'production') {
    try {
      console.warn('registrarMovimentacoesEmMassa headers content-type:', req.headers['content-type']);
      console.warn('registrarMovimentacoesEmMassa payload sample:', JSON.stringify(Array.isArray(payload) ? { movimentacoesLength: payload.length } : { hasMovimentacoes: !!(payload && payload.movimentacoes) }));
    } catch (e) {
      // ignore
    }
  }

  const result = await produtoService.registrarMovimentacoesEmMassa(payload);

  res.status(201).json({
    data: result,
  });
});

exports.atualizar = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: { message: 'Invalid produto id' } });
  }

  // files handled by multer are already saved; upload them to Supabase and collect URLs
  const files = req.files || [];
  const fileUrls = await uploadFilesToSupabase(files);
  const payload = { ...req.body, imagens: fileUrls };

  const updated = await produtoService.atualizarProduto(id, payload);

  res.json({ data: updated });
});
