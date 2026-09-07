// ============================================================
// Testes: Controle de Acesso por Papel (role) — Tenant Config (Identidade Visual)
// ============================================================
const request = require('supertest');
const express = require('express');

let mockUser = { id: 'user-1', role: 'gerente' };

jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = mockUser;
  return next();
});

jest.mock('../middleware/roles', () => (...allowedRoles) => (req, res, next) => {
  if (req.user && allowedRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: `Acesso negado. Apenas ${allowedRoles.join(', ')} podem realizar esta ação.`,
  });
});

jest.mock('../controllers/tenantConfigController', () => ({
  obterConfig: jest.fn((req, res) => res.status(200).json({ success: true, data: {} })),
  atualizarConfig: jest.fn((req, res) => res.status(200).json({ success: true, message: 'Configuração atualizada com sucesso.' })),
}));

describe('Roles — Tenant Config (Identidade Visual)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tenant', require('../routes/tenant.routes'));
  });

  test('Operador NÃO pode alterar identidade visual (retorna 403)', async () => {
    mockUser = { id: 'user-2', role: 'operador' };

    const res = await request(app)
      .put('/api/tenant/config')
      .send({ nomeFantasia: 'Tentativa Hacker' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Acesso negado/);
  });

  test('Gerente PODE alterar identidade visual (retorna 200)', async () => {
    mockUser = { id: 'user-1', role: 'gerente' };

    const res = await request(app)
      .put('/api/tenant/config')
      .send({ nomeFantasia: 'Novo Buffet' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Consulta pública de config é permitida sem restrição de role', async () => {
    const res = await request(app).get('/api/tenant/config');
    expect(res.status).toBe(200);
  });
});
