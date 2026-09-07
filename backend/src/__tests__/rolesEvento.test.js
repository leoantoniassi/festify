// ============================================================
// Testes: Controle de Acesso por Papel (role) — Eventos
// ============================================================
// Cobre os cenários de autorização: operador pode criar, editar
// e alterar status, mas NÃO pode excluir.
// ============================================================
const request = require('supertest');
const express = require('express');
const { Evento, Cliente, Local, Orcamento } = require('../models');

// ── Mock do usuário autenticado (alterável por teste) ──────
let mockUser = { id: 'user-2', role: 'operador' };

jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = mockUser;
  return next();
});

// ── Mock do middleware de roles (verifica role real) ──────
jest.mock('../middleware/roles', () => (...allowedRoles) => (req, res, next) => {
  if (req.user && allowedRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: `Acesso negado. Apenas ${allowedRoles.join(', ')} podem realizar esta ação.`,
  });
});

// ── Mock dos models ────────────────────────────────────────
jest.mock('../models', () => ({
  Evento: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
  },
  Cliente: { findOne: jest.fn() },
  Local: { findOne: jest.fn() },
  Orcamento: { findOne: jest.fn() },
}));

describe('Roles — Eventos (operador)', () => {
  let app;

  const CLI_ID = '550e8400-e29b-41d4-a716-446655440010';
  const EVT_ID = '550e8400-e29b-41d4-a716-446655440001';

  const mockCliente = { id: CLI_ID, nome: 'Cliente Teste' };
  const mockEvento = {
    id: EVT_ID,
    clienteId: CLI_ID,
    localId: null,
    nome: 'Evento Teste',
    dataEvento: '2026-12-31',
    horarioTermino: '2026-12-31T23:59:59.000Z',
    qtdPessoas: 80,
    qtdAdultos: 60,
    qtdCriancas: 15,
    qtdBebes: 5,
    status: 'pendente',
    orcamentoId: null,
    update: jest.fn().mockResolvedValue(true),
  };

  const eventoPayload = {
    clienteId: CLI_ID,
    nome: 'Evento Teste',
    dataEvento: '2026-12-31',
    horarioTermino: '2026-12-31T23:59:59.000Z',
    qtdPessoas: 80,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 'user-2', role: 'operador' };

    app = express();
    app.use(express.json());
    app.use('/api/eventos', require('../routes/eventos.routes'));
    app.use((err, _req, res, _next) => {
      res.status(500).json({ success: false, message: err.message });
    });
  });

  // ==========================================================
  // 1. OPERADOR PODE CRIAR — POST /api/eventos
  // ==========================================================
  describe('POST /api/eventos (operador)', () => {
    test('deve permitir que operador crie evento → 201', async () => {
      Cliente.findOne.mockResolvedValue(mockCliente);
      Evento.create.mockResolvedValue(mockEvento);

      const res = await request(app)
        .post('/api/eventos')
        .send(eventoPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('deve retornar 400 se status for inválido', async () => {
      Cliente.findOne.mockResolvedValue(mockCliente);

      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, status: 'status_invalido' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/status inválido/i);
    });

    test('deve aceitar status válido: pendente', async () => {
      Cliente.findOne.mockResolvedValue(mockCliente);
      Evento.create.mockResolvedValue(mockEvento);

      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, status: 'pendente' });

      expect(res.status).toBe(201);
    });
  });

  // ==========================================================
  // 2. OPERADOR PODE EDITAR — PUT /api/eventos/:id
  // ==========================================================
  describe('PUT /api/eventos/:id (operador)', () => {
    test('deve permitir que operador edite evento → 200', async () => {
      Evento.findOne.mockResolvedValue({ ...mockEvento, update: jest.fn().mockResolvedValue(true) });

      const res = await request(app)
        .put('/api/eventos/' + EVT_ID)
        .send({ nome: 'Evento Editado' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================
  // 3. OPERADOR PODE ALTERAR STATUS — PATCH /api/eventos/:id/status
  // ==========================================================
  describe('PATCH /api/eventos/:id/status (operador)', () => {
    test('deve permitir que operador mude status → 200', async () => {
      Evento.findOne.mockResolvedValue({ ...mockEvento, update: jest.fn().mockResolvedValue(true) });

      const res = await request(app)
        .patch('/api/eventos/' + EVT_ID + '/status')
        .send({ status: 'cancelado' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('deve retornar 400 para status inválido', async () => {
      const res = await request(app)
        .patch('/api/eventos/' + EVT_ID + '/status')
        .send({ status: 'status_invalido' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/status inválido/i);
    });
  });

  // ==========================================================
  // 4. OPERADOR NÃO PODE EXCLUIR — DELETE /api/eventos/:id
  // ==========================================================
  describe('DELETE /api/eventos/:id (operador)', () => {
    test('deve NEGAR exclusão para operador → 403', async () => {
      const res = await request(app)
        .delete('/api/eventos/' + EVT_ID);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/acesso negado|apenas gerente/i);
    });

    test('deve permitir exclusão para gerente → 200', async () => {
      mockUser = { id: 'user-1', role: 'gerente' };

      // Evento com data no passado (para não disparar warning)
      Evento.findOne.mockResolvedValue({
        ...mockEvento,
        dataEvento: '2025-01-01',
        update: jest.fn().mockResolvedValue(true),
      });

      const res = await request(app)
        .delete('/api/eventos/' + EVT_ID);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================================
  // 5. VALIDAÇÃO DE STATUS NO CRIAR EVENTO (whitelist)
  // ==========================================================
  describe('Validação de status no criar evento', () => {
    test('deve rejeitar status "aprovado" (não permitido para eventos)', async () => {
      Cliente.findOne.mockResolvedValue(mockCliente);

      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, status: 'aprovado' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/status inválido/i);
    });

    test('deve rejeitar status numérico', async () => {
      Cliente.findOne.mockResolvedValue(mockCliente);

      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, status: 123 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/status inválido/i);
    });
  });

  // ==========================================================
  // 6. GERENTE TAMBÉM TEM ACESSO (REGRESSÃO)
  // ==========================================================
  describe('Gerente ainda tem acesso a todas as rotas (regressão)', () => {
    beforeEach(() => {
      mockUser = { id: 'user-1', role: 'gerente' };
    });

    test('POST /api/eventos → 201', async () => {
      Cliente.findOne.mockResolvedValue(mockCliente);
      Evento.create.mockResolvedValue(mockEvento);

      const res = await request(app)
        .post('/api/eventos')
        .send(eventoPayload);

      expect(res.status).toBe(201);
    });

    test('PUT /api/eventos/:id → 200', async () => {
      Evento.findOne.mockResolvedValue({ ...mockEvento, update: jest.fn().mockResolvedValue(true) });

      const res = await request(app)
        .put('/api/eventos/' + EVT_ID)
        .send({ nome: 'Editado' });

      expect(res.status).toBe(200);
    });

    test('PATCH /api/eventos/:id/status → 200', async () => {
      Evento.findOne.mockResolvedValue({ ...mockEvento, update: jest.fn().mockResolvedValue(true) });

      const res = await request(app)
        .patch('/api/eventos/' + EVT_ID + '/status')
        .send({ status: 'cancelado' });

      expect(res.status).toBe(200);
    });

    test('DELETE /api/eventos/:id → 200', async () => {
      Evento.findOne.mockResolvedValue({
        ...mockEvento,
        dataEvento: '2025-01-01',
        update: jest.fn().mockResolvedValue(true),
      });

      const res = await request(app)
        .delete('/api/eventos/' + EVT_ID);

      expect(res.status).toBe(200);
    });
  });
});
