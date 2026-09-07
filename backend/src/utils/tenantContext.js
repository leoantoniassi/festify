// ============================================================
// Contexto de Tenant — escopo por requisição via AsyncLocalStorage
// ============================================================
// Guarda a empresa do usuário logado durante toda a requisição, sem
// precisar passar `empresaId` de controller em controller. Os hooks
// registrados em config/database.js leem daqui para filtrar as queries.
//
// AsyncLocalStorage mantém o valor através de await/Promise, então o
// contexto sobrevive a toda a cadeia assíncrona da requisição.
// ============================================================
const { AsyncLocalStorage } = require('async_hooks');

const storage = new AsyncLocalStorage();

/**
 * Executa `fn` com o contexto de tenant ativo.
 * @param {{ empresaId: string|null, role: string }} contexto
 */
function run(contexto, fn) {
  return storage.run(contexto, fn);
}

/** Contexto atual, ou null fora de uma requisição (seed, migration, testes). */
function getContexto() {
  return storage.getStore() || null;
}

/**
 * Empresa a ser aplicada como filtro, ou null quando não há escopo.
 *
 * Devolve null em dois casos, e a diferença importa:
 *  - fora de requisição (scripts, seed) — nada a filtrar;
 *  - super_admin — dono da plataforma, enxerga todos os tenants.
 */
function getEmpresaId() {
  const contexto = getContexto();
  if (!contexto) return null;
  if (contexto.role === 'super_admin') return null;
  return contexto.empresaId || null;
}

/** Executa `fn` ignorando o escopo de tenant (uso restrito: login, config pública). */
function semEscopo(fn) {
  return storage.run({ empresaId: null, role: 'super_admin' }, fn);
}

module.exports = { run, getContexto, getEmpresaId, semEscopo };
