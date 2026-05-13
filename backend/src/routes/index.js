const { Router } = require('express');
const categoriasRoutes = require('./categorias');
const produtosRoutes = require('./produtos');
const bannersRoutes = require('./banners');

const router = Router();

router.use('/categorias', categoriasRoutes);
router.use('/produtos', produtosRoutes);
router.use('/banners', bannersRoutes);

module.exports = router;
