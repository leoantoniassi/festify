// ============================================================
// Rotas: Autenticação
// ============================================================
const router = require('express').Router();
const { login, solicitarRecuperacaoSenha, redefinirSenha } = require('../controllers/authController');

// POST /register foi removido: era público, aceitava `role` no body e não
// era usado por nada. Criação de usuário passa por POST /api/usuarios/convidar,
// que exige autenticação e papel de gerente.
router.post('/login', login);
router.post('/recuperar-senha', solicitarRecuperacaoSenha);
router.post('/redefinir-senha', redefinirSenha);

module.exports = router;
