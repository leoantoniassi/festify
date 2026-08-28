// ============================================================
// Middleware: Escopo de Tenant
// ============================================================
// Abre o contexto de empresa para o resto da requisição. A partir daqui
// os hooks em config/database.js filtram toda query automaticamente.
//
// É chamado pelo middleware `auth`, logo após o JWT ser validado — e não
// montado avulso nos arquivos de rota. Assim não existe rota autenticada
// que possa esquecer de aplicar o escopo.
// ============================================================
const { run } = require('../utils/tenantContext');

function comEscopoDeTenant(req, res, next) {
  const { role, empresaId } = req.user;

  // super_admin é o dono da plataforma: não pertence a nenhum buffet.
  // Qualquer outro papel sem empresa é token inválido — provavelmente
  // emitido antes da migração para multilocação.
  if (role !== 'super_admin' && !empresaId) {
    return res.status(401).json({
      success: false,
      message: 'Token sem vínculo de empresa. Faça login novamente.',
    });
  }

  return run({ empresaId: empresaId || null, role }, () => next());
}

module.exports = comEscopoDeTenant;
