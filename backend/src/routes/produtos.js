const { Router } = require('express');
const produtoController = require('../controllers/produtoController');
const uploadService = require('../services/uploadService');

const router = Router();
const upload = uploadService.createMulterMiddleware();

router.get('/', produtoController.listar);
router.get('/nome/:nome', produtoController.detalharPorNome);
router.post('/', upload.array('imagens', 10), produtoController.criar);
// lançamento em massa: aceita { movimentacoes: [{ id_produto, tipo, quantidade, motivo }] }
router.post('/movimentacoes/massa', produtoController.registrarMovimentacoesEmMassa);
router.get('/:id', produtoController.detalhar);
router.post('/:id/imagens', produtoController.adicionarImagem);
router.post('/:id/movimentacoes', produtoController.registrarMovimentacao);
// edit product
router.put('/:id', upload.array('imagens', 10), produtoController.atualizar);
// also accept POST for updates (multipart forms are more reliably sent via POST from browsers)
router.post('/:id', upload.array('imagens', 10), produtoController.atualizar);

module.exports = router;
