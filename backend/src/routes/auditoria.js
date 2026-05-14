const { Router } = require('express');
const auditoriaController = require('../controllers/auditoriaController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();
const canAudit = [authenticate, authorize('administrador', 'vendedor')];

// Get 5 random products for audit
router.get('/aleatorios', canAudit, auditoriaController.getProdutosAleatorios);

// Save audit records
router.post('/salvar', canAudit, auditoriaController.salvarAuditoria);

// Get audit history
router.get('/historico', canAudit, auditoriaController.getHistoricoAuditoria);

module.exports = router;
