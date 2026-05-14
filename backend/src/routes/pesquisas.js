const { Router } = require('express');
const pesquisaController = require('../controllers/pesquisaController');

const router = Router();

router.post('/', pesquisaController.registrar);
router.get('/mais-pesquisadas', pesquisaController.maisPesquisadas);

module.exports = router;
