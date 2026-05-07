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

exports.criar = asyncHandler(async (req, res) => {
  const fileUrls = (req.files || []).map(file => `/uploads/${file.filename}`);
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

exports.registrarMovimentacoesEmMassa = asyncHandler(async (req, res) => {
  let payload = req.body;

  // Defensive parsing: sometimes clients send movimentacoes as a JSON string or send the array directly
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      // leave as-is; service will validate and report
    }
  }

  if (payload && typeof payload.movimentacoes === 'string') {
    try {
      payload.movimentacoes = JSON.parse(payload.movimentacoes);
    } catch (e) {
      // leave as-is; service will validate and report
    }
  }

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

  // files handled by multer are already saved; collect their paths
  const fileUrls = (req.files || []).map(file => `/uploads/${file.filename}`);
  const payload = { ...req.body, imagens: fileUrls };

  const updated = await produtoService.atualizarProduto(id, payload);

  res.json({ data: updated });
});
