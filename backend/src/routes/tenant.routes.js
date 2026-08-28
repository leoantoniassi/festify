// ============================================================
// Rotas: Configuração do Tenant (identidade visual white label)
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const controller = require('../controllers/tenantConfigController');

// Público: a tela de login e o app mobile precisam da marca antes de
// existir um token. Identificação da empresa vem do header X-Tenant-Slug,
// do subdomínio ou do parâmetro ?slug=.
router.get('/config', controller.obterConfig);

// Edição exige gerente do próprio buffet.
router.put('/config', auth, authorize('gerente'), controller.atualizarConfig);

module.exports = router;
