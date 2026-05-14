const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const loadEnv = require('../src/config/loadEnv');
const asyncHandler = require('../src/utils/asyncHandler');
const AppError = require('../src/middlewares/appError');
const errorHandler = require('../src/middlewares/errorHandler');
const notFound = require('../src/middlewares/notFound');
const uploadService = require('../src/services/uploadService');
const auditoriaMigration = require('../src/database/migrations/20260421000400-create-auditoria-produto');
const db = require('../src/database/models');
const produtoService = require('../src/services/produtoService');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function createResponse() {
  return {
    statusCode: null,
    body: null,
    headersSent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('loadEnv reads values from a file without overriding existing env vars', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pi3pescadores-env-'));
  const envFile = path.join(tmpDir, '.env.test');

  const previous = {
    TEST_ALPHA: process.env.TEST_ALPHA,
    TEST_BETA: process.env.TEST_BETA,
    TEST_EXISTING: process.env.TEST_EXISTING,
  };

  try {
    fs.writeFileSync(
      envFile,
      [
        '# sample env file',
        'TEST_ALPHA=alpha',
        'TEST_BETA="beta value"',
        'TEST_EXISTING=should-not-replace',
        'INVALID_LINE',
        '',
      ].join('\n'),
      'utf8'
    );

    delete process.env.TEST_ALPHA;
    delete process.env.TEST_BETA;
    process.env.TEST_EXISTING = 'keep-this';

    loadEnv(envFile);

    assert.equal(process.env.TEST_ALPHA, 'alpha');
    assert.equal(process.env.TEST_BETA, 'beta value');
    assert.equal(process.env.TEST_EXISTING, 'keep-this');
  } finally {
    if (previous.TEST_ALPHA === undefined) {
      delete process.env.TEST_ALPHA;
    } else {
      process.env.TEST_ALPHA = previous.TEST_ALPHA;
    }

    if (previous.TEST_BETA === undefined) {
      delete process.env.TEST_BETA;
    } else {
      process.env.TEST_BETA = previous.TEST_BETA;
    }

    if (previous.TEST_EXISTING === undefined) {
      delete process.env.TEST_EXISTING;
    } else {
      process.env.TEST_EXISTING = previous.TEST_EXISTING;
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('asyncHandler forwards rejected promises to next', async () => {
  const expectedError = new Error('boom');
  const wrapped = asyncHandler(async () => {
    throw expectedError;
  });

  let receivedError = null;

  await new Promise((resolve) => {
    wrapped({}, {}, (error) => {
      receivedError = error;
      resolve();
    });
  });

  assert.equal(receivedError, expectedError);
});

test('AppError stores status and message', () => {
  const error = new AppError(404, 'Route not found');

  assert.equal(error.name, 'AppError');
  assert.equal(error.statusCode, 404);
  assert.equal(error.message, 'Route not found');
});

test('notFound creates a 404 AppError', () => {
  let receivedError = null;

  notFound({}, {}, (error) => {
    receivedError = error;
  });

  assert.ok(receivedError instanceof AppError);
  assert.equal(receivedError.statusCode, 404);
  assert.equal(receivedError.message, 'Route not found');
});

test('errorHandler returns AppError details without logging', () => {
  const originalConsoleError = console.error;
  let logged = false;
  console.error = () => {
    logged = true;
  };

  try {
    const res = createResponse();

    errorHandler(new AppError(400, 'Invalid payload'), {}, res, () => {});

    assert.equal(logged, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, {
      error: {
        message: 'Invalid payload',
      },
    });
  } finally {
    console.error = originalConsoleError;
  }
});

test('errorHandler maps unexpected errors to 500', () => {
  const originalConsoleError = console.error;
  let loggedError = null;
  console.error = (error) => {
    loggedError = error;
  };

  try {
    const res = createResponse();
    const unexpectedError = new Error('unexpected');

    errorHandler(unexpectedError, {}, res, () => {});

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, {
      error: {
        message: 'Unexpected server error',
      },
    });
    assert.equal(loggedError, unexpectedError);
  } finally {
    console.error = originalConsoleError;
  }
});

test('errorHandler delegates to next when headers are already sent', () => {
  const expectedError = new Error('already sent');
  let nextError = null;

  const result = errorHandler(expectedError, {}, { headersSent: true }, (error) => {
    nextError = error;
    return 'next-result';
  });

  assert.equal(result, 'next-result');
  assert.equal(nextError, expectedError);
});

test('upload filename sanitizer removes unsafe characters and keeps image extension', () => {
  const { sanitizeFilename, createStoredFilename, isAllowedFile } = uploadService._private;

  assert.equal(sanitizeFilename('../São José imagem (1).JPG'), 'Sao-Jose-imagem-1.jpg');
  assert.match(createStoredFilename('Nossa Senhora Aparecida.webp'), /^\d+-[a-f0-9]{16}-Nossa-Senhora-Aparecida\.webp$/);
  assert.equal(isAllowedFile({ originalname: 'foto.png', mimetype: 'image/png' }), true);
  assert.equal(isAllowedFile({ originalname: 'script.png', mimetype: 'application/javascript' }), false);
  assert.equal(isAllowedFile({ originalname: 'foto.exe', mimetype: 'image/png' }), false);
});

test('auditoria migration creates table with product and user integrity fields', async () => {
  const calls = [];
  const queryInterface = {
    async createTable(tableName, definition) {
      calls.push(['createTable', tableName, definition]);
    },
    async addIndex(tableName, fields, options) {
      calls.push(['addIndex', tableName, fields, options]);
    },
    async addConstraint(tableName, options) {
      calls.push(['addConstraint', tableName, options]);
    },
  };
  const Sequelize = {
    BIGINT: 'BIGINT',
    INTEGER: 'INTEGER',
    DECIMAL: () => 'DECIMAL',
    UUID: 'UUID',
    DATE: 'DATE',
    literal: (value) => value,
    Op: {
      gte: Symbol.for('gte'),
      between: Symbol.for('between'),
    },
  };

  await auditoriaMigration.up(queryInterface, Sequelize);

  const createCall = calls.find((call) => call[0] === 'createTable');
  assert.equal(createCall[1], 'auditoria_produto');
  assert.equal(createCall[2].product_id.references.model, 'produto');
  assert.equal(createCall[2].usuario_id.references.model, 'usuarios');
  assert.equal(createCall[2].created_at.allowNull, false);
  assert.ok(calls.some((call) => call[0] === 'addIndex' && call[3].name === 'idx_auditoria_produto_product_id'));
  assert.ok(calls.some((call) => call[0] === 'addConstraint' && call[2].name === 'chk_auditoria_produto_acuracidade_range'));
});

test('registrarMovimentacao locks product row before checking and writing stock', async () => {
  const original = {
    transaction: db.sequelize.transaction,
    findByPk: db.Produto.findByPk,
    findAll: db.EstoqueMovimentacao.findAll,
    create: db.EstoqueMovimentacao.create,
  };
  const calls = [];
  const transaction = { LOCK: { UPDATE: 'UPDATE' } };

  try {
    db.sequelize.transaction = async (callback) => callback(transaction);
    db.Produto.findByPk = async (id, options) => {
      calls.push(['findByPk', id, options]);
      return { id };
    };
    db.EstoqueMovimentacao.findAll = async (options) => {
      calls.push(['findAll', options]);
      return [{ tipo: 'entrada', quantidade: 2 }];
    };
    db.EstoqueMovimentacao.create = async (payload, options) => {
      calls.push(['create', payload, options]);
      return { id: 10, ...payload };
    };

    const result = await produtoService.registrarMovimentacao(7, {
      tipo: 'saida',
      motivo: 'venda',
      quantidade: 1,
    });

    assert.equal(result.estoque_atual, 1);
    assert.equal(calls[0][0], 'findByPk');
    assert.equal(calls[0][2].transaction, transaction);
    assert.equal(calls[0][2].lock, 'UPDATE');
    assert.equal(calls[1][1].transaction, transaction);
    assert.equal(calls[2][2].transaction, transaction);
  } finally {
    db.sequelize.transaction = original.transaction;
    db.Produto.findByPk = original.findByPk;
    db.EstoqueMovimentacao.findAll = original.findAll;
    db.EstoqueMovimentacao.create = original.create;
  }
});

test('registrarMovimentacao rolls back logically before write when stock would go negative', async () => {
  const original = {
    transaction: db.sequelize.transaction,
    findByPk: db.Produto.findByPk,
    findAll: db.EstoqueMovimentacao.findAll,
    create: db.EstoqueMovimentacao.create,
  };
  const transaction = { LOCK: { UPDATE: 'UPDATE' } };
  let created = false;

  try {
    db.sequelize.transaction = async (callback) => callback(transaction);
    db.Produto.findByPk = async (id) => ({ id });
    db.EstoqueMovimentacao.findAll = async () => [{ tipo: 'entrada', quantidade: 1 }];
    db.EstoqueMovimentacao.create = async () => {
      created = true;
    };

    await assert.rejects(
      () => produtoService.registrarMovimentacao(7, {
        tipo: 'saida',
        motivo: 'venda',
        quantidade: 2,
      }),
      /insufficient stock/
    );
    assert.equal(created, false);
  } finally {
    db.sequelize.transaction = original.transaction;
    db.Produto.findByPk = original.findByPk;
    db.EstoqueMovimentacao.findAll = original.findAll;
    db.EstoqueMovimentacao.create = original.create;
  }
});

async function run() {
  let passed = 0;
  let failed = 0;

  for (const currentTest of tests) {
    try {
      await currentTest.fn();
      passed += 1;
      console.log(`\u2713 ${currentTest.name}`);
    } catch (error) {
      failed += 1;
      console.error(`\u2717 ${currentTest.name}`);
      console.error(error);
    }
  }

  console.log('');
  console.log(`${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('Test runner failed');
  console.error(error);
  process.exitCode = 1;
});
