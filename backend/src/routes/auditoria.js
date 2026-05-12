const { Router } = require('express');
const auditoriaController = require('../controllers/auditoriaController');

const router = Router();

// Get 5 random products for audit
router.get('/aleatorios', auditoriaController.getProdutosAleatorios);

// Save audit records
router.post('/salvar', auditoriaController.salvarAuditoria);

// Get audit history
router.get('/historico', auditoriaController.getHistoricoAuditoria);

module.exports = router;
