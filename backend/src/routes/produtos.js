const { Router } = require('express');
const produtoController = require('../controllers/produtoController');
const uploadService = require('../services/uploadService');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();
const upload = uploadService.createMulterMiddleware();
const canManageStock = [authenticate, authorize('administrador', 'vendedor')];

router.get('/', produtoController.listar);
router.get('/nome/:nome', produtoController.detalharPorNome);
router.post('/', canManageStock, upload.array('imagens', 10), produtoController.criar);
// lançamento em massa: aceita { movimentacoes: [{ id_produto, tipo, quantidade, motivo }] }
router.post('/movimentacoes/massa', canManageStock, produtoController.registrarMovimentacoesEmMassa);
router.get('/:id', produtoController.detalhar);
router.post('/:id/imagens', canManageStock, produtoController.adicionarImagem);
router.post('/:id/movimentacoes', canManageStock, produtoController.registrarMovimentacao);
// edit product
router.put('/:id', canManageStock, upload.array('imagens', 10), produtoController.atualizar);
// also accept POST for updates (multipart forms are more reliably sent via POST from browsers)
router.post('/:id', canManageStock, upload.array('imagens', 10), produtoController.atualizar);

module.exports = router;
