const db = require('../database/models');
const AppError = require('../middlewares/appError');

const ALLOWED_MOVEMENT_TYPES = new Set(['entrada', 'saida']);
const ALLOWED_MOVEMENT_REASONS = new Set(['compra', 'venda', 'ajuste']);

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function toBooleanOrDefault(value, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'sim'].includes(value.toLowerCase());
  }

  return Boolean(value);
}

function toProdutoPayload(produto) {
  const plain = produto.toJSON ? produto.toJSON() : produto;
  const imagens = Array.isArray(plain.imagens)
    ? [...plain.imagens].sort((a, b) => Number(a.id) - Number(b.id))
    : [];
  const movimentacoes = Array.isArray(plain.movimentacoesEstoque)
    ? [...plain.movimentacoesEstoque].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    : [];

  const estoqueAtual = movimentacoes.reduce((total, movimentacao) => {
    const quantidade = Number(movimentacao.quantidade) || 0;
    return movimentacao.tipo === 'entrada' ? total + quantidade : total - quantidade;
  }, 0);

  return {
    id: plain.id,
    nome: plain.nome,
    descricao: plain.descricao,
    preco_custo: Number(plain.preco_custo),
    preco_venda: Number(plain.preco_venda),
    peso: plain.peso === null ? null : Number(plain.peso),
    altura: plain.altura === null ? null : Number(plain.altura),
    largura: plain.largura === null ? null : Number(plain.largura),
    profundidade: plain.profundidade === null ? null : Number(plain.profundidade),
    id_categoria: plain.id_categoria,
    ativo: plain.ativo,
    categoria: plain.categoria
      ? {
          id: plain.categoria.id,
          nome: plain.categoria.nome,
        }
      : null,
    imagens: imagens.map((imagem) => ({
      id: imagem.id,
      url: imagem.url,
      criado_em: imagem.criado_em,
    })),
    movimentacoes_estoque: movimentacoes.map((movimentacao) => ({
      id: movimentacao.id,
      tipo: movimentacao.tipo,
      quantidade: movimentacao.quantidade,
      motivo: movimentacao.motivo,
      created_at: movimentacao.created_at,
    })),
    estoque_atual: estoqueAtual,
    criado_em: plain.criado_em,
    atualizado_em: plain.atualizado_em,
  };
}

async function buscarProdutoModelPorId(id) {
  const produto = await db.Produto.findByPk(id, {
    include: [
      {
        model: db.Categoria,
        as: 'categoria',
        attributes: ['id', 'nome'],
      },
      {
        model: db.ProdutoImagem,
        as: 'imagens',
        attributes: ['id', 'url', 'criado_em'],
      },
      {
        model: db.EstoqueMovimentacao,
        as: 'movimentacoesEstoque',
        attributes: ['id', 'tipo', 'quantidade', 'motivo', 'created_at'],
      },
    ],
  });

  if (!produto) {
    throw new AppError(404, 'Produto not found');
  }

  return produto;
}

async function calcularEstoqueProduto(idProduto, transaction) {
  const movimentacoes = await db.EstoqueMovimentacao.findAll({
    where: {
      id_produto: idProduto,
    },
    attributes: ['tipo', 'quantidade'],
    transaction,
  });

  return movimentacoes.reduce((total, movimentacao) => {
    const quantidade = Number(movimentacao.quantidade) || 0;
    return movimentacao.tipo === 'entrada' ? total + quantidade : total - quantidade;
  }, 0);
}

exports.listarProdutos = async (query) => {
  const where = {};

  if (query.ativo !== undefined && query.ativo !== '') {
    where.ativo = toBooleanOrDefault(query.ativo, true);
  }

  if (query.id_categoria !== undefined && query.id_categoria !== '') {
    const idCategoria = Number(query.id_categoria);

    if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
      throw new AppError(400, 'id_categoria must be a valid integer');
    }

    where.id_categoria = idCategoria;
  }

  const produtos = await db.Produto.findAll({
    where,
    include: [
      {
        model: db.Categoria,
        as: 'categoria',
        attributes: ['id', 'nome'],
      },
      {
        model: db.ProdutoImagem,
        as: 'imagens',
        attributes: ['id', 'url', 'criado_em'],
      },
      {
        model: db.EstoqueMovimentacao,
        as: 'movimentacoesEstoque',
        attributes: ['id', 'tipo', 'quantidade', 'motivo', 'created_at'],
      },
    ],
    order: [['id', 'DESC']],
  });

  return produtos.map(toProdutoPayload);
};

exports.buscarProdutoPorId = async (id) => {
  const produto = await buscarProdutoModelPorId(id);
  return toProdutoPayload(produto);
};

exports.criarProduto = async (payload) => {
  const nome = String(payload.nome || '').trim();
  const descricao = payload.descricao ? String(payload.descricao).trim() : null;
  const precoCusto = toNumberOrNull(payload.preco_custo);
  const precoVenda = toNumberOrNull(payload.preco_venda);
  const peso = toNumberOrNull(payload.peso);
  const altura = toNumberOrNull(payload.altura);
  const largura = toNumberOrNull(payload.largura);
  const profundidade = toNumberOrNull(payload.profundidade);
  
  // se for array de categorias (ex: multi-select no front), pega a primeira
  let idCategoria = payload.id_categoria;
  if (Array.isArray(idCategoria)) {
    idCategoria = parseInt(idCategoria[0], 10);
  } else if (typeof idCategoria === 'string' && idCategoria.includes(',')) {
    idCategoria = parseInt(idCategoria.split(',')[0], 10);
  } else {
    idCategoria = Number(idCategoria);
  }

  const ativo = toBooleanOrDefault(payload.ativo, true);
  const imagens = Array.isArray(payload.imagens) ? payload.imagens : [];

  if (!nome) {
    throw new AppError(400, 'nome is required');
  }

  if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
    throw new AppError(400, 'id_categoria must be a valid integer');
  }

  if (precoCusto === null || precoVenda === null) {
    throw new AppError(400, 'preco_custo and preco_venda are required');
  }

  const categoria = await db.Categoria.findByPk(idCategoria);

  if (!categoria) {
    throw new AppError(404, 'Categoria not found');
  }

  const now = new Date();

  const produto = await db.sequelize.transaction(async (transaction) => {
    const createdProduto = await db.Produto.create(
      {
        nome,
        descricao,
        preco_custo: precoCusto,
        preco_venda: precoVenda,
        peso,
        altura,
        largura,
        profundidade,
        id_categoria: idCategoria,
        ativo,
        criado_em: now,
        atualizado_em: now,
      },
      { transaction }
    );

    const imagensValidadas = imagens
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }

        if (item && typeof item.url === 'string') {
          return item.url.trim();
        }

        return '';
      })
      .filter(Boolean);

    if (imagensValidadas.length > 0) {
      await db.ProdutoImagem.bulkCreate(
        imagensValidadas.map((url) => ({
          id_produto: createdProduto.id,
          url,
          criado_em: now,
        })),
        { transaction }
      );
    }

    return createdProduto;
  });

  return exports.buscarProdutoPorId(produto.id);
};

exports.adicionarImagem = async (idProduto, payload) => {
  const url = String(payload.url || '').trim();

  if (!url) {
    throw new AppError(400, 'url is required');
  }

  await buscarProdutoModelPorId(idProduto);

  const imagem = await db.ProdutoImagem.create({
    id_produto: idProduto,
    url,
    criado_em: new Date(),
  });

  return {
    id: imagem.id,
    id_produto: imagem.id_produto,
    url: imagem.url,
    criado_em: imagem.criado_em,
  };
};

exports.registrarMovimentacao = async (idProduto, payload) => {
  const tipo = String(payload.tipo || '').trim().toLowerCase();
  const motivo = String(payload.motivo || '').trim().toLowerCase();
  const quantidade = Number(payload.quantidade);

  if (!ALLOWED_MOVEMENT_TYPES.has(tipo)) {
    throw new AppError(400, 'tipo must be "entrada" or "saida"');
  }

  if (!ALLOWED_MOVEMENT_REASONS.has(motivo)) {
    throw new AppError(400, 'motivo must be "compra", "venda" or "ajuste"');
  }

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new AppError(400, 'quantidade must be a positive integer');
  }

  const produto = await buscarProdutoModelPorId(idProduto);
  const estoqueAtual = await calcularEstoqueProduto(produto.id);

  if (tipo === 'saida' && quantidade > estoqueAtual) {
    throw new AppError(400, 'insufficient stock for this movement');
  }

  const movimentacao = await db.EstoqueMovimentacao.create({
    id_produto: produto.id,
    tipo,
    quantidade,
    motivo,
    created_at: new Date(),
  });

  return {
    id: movimentacao.id,
    id_produto: movimentacao.id_produto,
    tipo: movimentacao.tipo,
    quantidade: movimentacao.quantidade,
    motivo: movimentacao.motivo,
    created_at: movimentacao.created_at,
    estoque_atual: tipo === 'entrada' ? estoqueAtual + quantidade : estoqueAtual - quantidade,
  };
};
