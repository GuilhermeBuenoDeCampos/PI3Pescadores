const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const produtoController = require('../controllers/produtoController');

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/', produtoController.listar);
router.get('/nome/:nome', produtoController.detalharPorNome);
router.get('/:id', produtoController.detalhar);
router.post('/', upload.array('imagens', 10), produtoController.criar);
router.post('/:id/imagens', produtoController.adicionarImagem);
router.post('/:id/movimentacoes', produtoController.registrarMovimentacao);
// edit product
router.put('/:id', upload.array('imagens', 10), produtoController.atualizar);
// also accept POST for updates (multipart forms are more reliably sent via POST from browsers)
router.post('/:id', upload.array('imagens', 10), produtoController.atualizar);
// lançamento em massa: aceita { movimentacoes: [{ id_produto, tipo, quantidade, motivo }] }
router.post('/movimentacoes/massa', produtoController.registrarMovimentacoesEmMassa);

module.exports = router;
