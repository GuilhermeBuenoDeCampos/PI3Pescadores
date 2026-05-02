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
router.get('/:id', produtoController.detalhar);
router.post('/', upload.array('imagens', 10), produtoController.criar);
router.post('/:id/imagens', produtoController.adicionarImagem);
router.post('/:id/movimentacoes', produtoController.registrarMovimentacao);

module.exports = router;
