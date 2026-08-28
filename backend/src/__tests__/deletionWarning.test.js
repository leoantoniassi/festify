// ============================================================
// Testes: Sistema de Alerta ao Excluir Eventos Futuros
// ============================================================
const request = require('supertest');
const express = require('express');
const { Evento, Cliente, Funcionario, Escala } = require('../models');

// ── Middleware Mocks ─────────────────────────────────────────────

// Auth: injeta usuário a partir do header x-test-role (default: gerente)
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = {
    id: 'user-1',
    email: req.headers['x-test-email'] || 'gerente@test.com',
    role: req.headers['x-test-role'] || 'gerente',
  };
  return next();
});

// Roles: verifica se o role (do header) está entre os permitidos
jest.mock('../middleware/roles', () => (...allowedRoles) => (req, res, next) => {
  const role = req.headers['x-test-role'] || 'gerente';
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: `Acesso negado. Apenas ${allowedRoles.join(', ')} podem realizar esta ação.`,
    });
  }
  return next();
});

// ── Models Mocks ────────────────────────────────────────────────
jest.mock('../models', () => ({
  Evento: { findOne: jest.fn(), count: jest.fn() },
  Cliente: { findOne: jest.fn() },
  Funcionario: { findOne: jest.fn() },
  Escala: { count: jest.fn() },
}));

// ── Helpers ─────────────────────────────────────────────────────

function createMockEvento(id, dataEvento, overrides = {}) {
  return {
    id,
    dataEvento,
    update: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function createMockCliente(id, overrides = {}) {
  return {
    id,
    nome: 'Cliente Teste',
    update: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function createMockFuncionario(id, overrides = {}) {
  return {
    id,
    nome: 'Funcionario Teste',
    update: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

// ── Constantes ──────────────────────────────────────────────────
const VALID_UUID = '12345678-1234-1234-a234-123456789abc';
const INVALID_UUID = 'not-a-uuid';
const PAST_DATE = '2024-01-01T00:00:00.000Z';
const FUTURE_DATE = '2027-12-31T00:00:00.000Z';

// ═════════════════════════════════════════════════════════════════
// Testes
// ═════════════════════════════════════════════════════════════════

describe('Deletion Warning System', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/eventos', require('../routes/eventos.routes'));
    app.use('/api/clientes', require('../routes/clientes.routes'));
    app.use('/api/funcionarios', require('../routes/funcionarios.routes'));
    app.use((err, _req, res, _next) => {
      res.status(500).json({ success: false, message: err.message });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 1. Eventos
  // ═══════════════════════════════════════════════════════════════
  describe('DELETE /api/eventos/:id', () => {
    test('Deletar evento passado → sucesso direto (sem warning)', async () => {
      const mockEvent = createMockEvento(VALID_UUID, PAST_DATE);
      Evento.findOne.mockResolvedValue(mockEvent);

      const res = await request(app)
        .delete(`/api/eventos/${VALID_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removido');
      expect(res.body.warning).toBeUndefined();
      expect(res.body.requiresConfirmation).toBeUndefined();
      expect(mockEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({ deletadoEm: expect.any(Date) })
      );
    });

    test('Deletar evento futuro → retorna warning e NÃO deleta', async () => {
      const mockEvent = createMockEvento(VALID_UUID, FUTURE_DATE);
      Evento.findOne.mockResolvedValue(mockEvent);

      const res = await request(app)
        .delete(`/api/eventos/${VALID_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.warning).toBe(true);
      expect(res.body.requiresConfirmation).toBe(true);
      expect(res.body.message).toContain('não ocorreu');
      // Garante que o soft delete NÃO foi executado
      expect(mockEvent.update).not.toHaveBeenCalled();
    });

    test('Deletar evento futuro com ?force=true → deleta com sucesso', async () => {
      const mockEvent = createMockEvento(VALID_UUID, FUTURE_DATE);
      Evento.findOne.mockResolvedValue(mockEvent);

      const res = await request(app)
        .delete(`/api/eventos/${VALID_UUID}?force=true`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removido');
      expect(mockEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({ deletadoEm: expect.any(Date) })
      );
    });

    test('Deletar evento inexistente → 404', async () => {
      Evento.findOne.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/eventos/${VALID_UUID}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('não encontrado');
    });

    test('Operador tentando deletar evento → 403', async () => {
      const res = await request(app)
        .delete(`/api/eventos/${VALID_UUID}`)
        .set('x-test-role', 'operador');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Acesso negado');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 2. Clientes
  // ═══════════════════════════════════════════════════════════════
  describe('DELETE /api/clientes/:id', () => {
    test('Deletar cliente sem eventos futuros → sucesso direto', async () => {
      const mockCliente = createMockCliente(VALID_UUID);
      Cliente.findOne.mockResolvedValue(mockCliente);
      Evento.count.mockResolvedValue(0);

      const res = await request(app)
        .delete(`/api/clientes/${VALID_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removido');
      expect(mockCliente.update).toHaveBeenCalledWith(
        expect.objectContaining({ deletadoEm: expect.any(Date) })
      );
    });

    test('Deletar cliente com eventos futuros → retorna warning e NÃO deleta', async () => {
      const mockCliente = createMockCliente(VALID_UUID);
      Cliente.findOne.mockResolvedValue(mockCliente);
      Evento.count.mockResolvedValue(2); // 2 eventos futuros

      const res = await request(app)
        .delete(`/api/clientes/${VALID_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.warning).toBe(true);
      expect(res.body.requiresConfirmation).toBe(true);
      expect(res.body.message).toContain('evento(s) futuro(s)');
      // Garante que o soft delete NÃO foi executado
      expect(mockCliente.update).not.toHaveBeenCalled();
    });

    test('Deletar cliente com eventos futuros com ?force=true → deleta', async () => {
      const mockCliente = createMockCliente(VALID_UUID);
      Cliente.findOne.mockResolvedValue(mockCliente);
      // force=true bypassa a verificação, mesmo com eventos futuros
      Evento.count.mockResolvedValue(2);

      const res = await request(app)
        .delete(`/api/clientes/${VALID_UUID}?force=true`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removido');
      expect(mockCliente.update).toHaveBeenCalledWith(
        expect.objectContaining({ deletadoEm: expect.any(Date) })
      );
    });

    test('Deletar cliente inexistente → 404', async () => {
      Cliente.findOne.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/clientes/${VALID_UUID}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('não encontrado');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 3. Funcionários
  // ═══════════════════════════════════════════════════════════════
  describe('DELETE /api/funcionarios/:id', () => {
    test('Deletar funcionário sem alocações futuras → sucesso direto', async () => {
      const mockFunc = createMockFuncionario(VALID_UUID);
      Funcionario.findOne.mockResolvedValue(mockFunc);
      Escala.count.mockResolvedValue(0);

      const res = await request(app)
        .delete(`/api/funcionarios/${VALID_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removido');
      expect(mockFunc.update).toHaveBeenCalledWith(
        expect.objectContaining({ deletadoEm: expect.any(Date) })
      );
    });

    test('Deletar funcionário com alocações futuras → retorna warning e NÃO deleta', async () => {
      const mockFunc = createMockFuncionario(VALID_UUID);
      Funcionario.findOne.mockResolvedValue(mockFunc);
      Escala.count.mockResolvedValue(3); // 3 alocações futuras

      const res = await request(app)
        .delete(`/api/funcionarios/${VALID_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.warning).toBe(true);
      expect(res.body.requiresConfirmation).toBe(true);
      expect(res.body.message).toContain('evento(s) futuro(s)');
      // Garante que o soft delete NÃO foi executado
      expect(mockFunc.update).not.toHaveBeenCalled();
    });

    test('Deletar funcionário com alocações futuras com ?force=true → deleta', async () => {
      const mockFunc = createMockFuncionario(VALID_UUID);
      Funcionario.findOne.mockResolvedValue(mockFunc);
      Escala.count.mockResolvedValue(3);

      const res = await request(app)
        .delete(`/api/funcionarios/${VALID_UUID}?force=true`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removido');
      expect(mockFunc.update).toHaveBeenCalledWith(
        expect.objectContaining({ deletadoEm: expect.any(Date) })
      );
    });

    test('Deletar funcionário inexistente → 404', async () => {
      Funcionario.findOne.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/funcionarios/${VALID_UUID}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('não encontrado');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 4. Validações de Segurança
  // ═══════════════════════════════════════════════════════════════
  describe('Validações de segurança', () => {
    describe('UUID inválido → 400', () => {
      test('em evento', async () => {
        const res = await request(app)
          .delete(`/api/eventos/${INVALID_UUID}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('inválido');
      });

      test('em cliente', async () => {
        const res = await request(app)
          .delete(`/api/clientes/${INVALID_UUID}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('inválido');
      });

      test('em funcionário', async () => {
        const res = await request(app)
          .delete(`/api/funcionarios/${INVALID_UUID}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('inválido');
      });
    });

    describe('force com valor não "true" não bypassa warning', () => {
      test('em evento (force=abc)', async () => {
        Evento.findOne.mockResolvedValue(
          createMockEvento(VALID_UUID, FUTURE_DATE)
        );

        const res = await request(app)
          .delete(`/api/eventos/${VALID_UUID}?force=abc`);

        // Deve retornar warning porque 'abc' !== 'true'
        expect(res.body.success).toBe(false);
        expect(res.body.warning).toBe(true);
        expect(res.body.requiresConfirmation).toBe(true);
      });

      test('em cliente (force=abc)', async () => {
        Cliente.findOne.mockResolvedValue(createMockCliente(VALID_UUID));
        Evento.count.mockResolvedValue(1);

        const res = await request(app)
          .delete(`/api/clientes/${VALID_UUID}?force=abc`);

        expect(res.body.success).toBe(false);
        expect(res.body.warning).toBe(true);
        expect(res.body.requiresConfirmation).toBe(true);
      });

      test('em funcionário (force=abc)', async () => {
        Funcionario.findOne.mockResolvedValue(createMockFuncionario(VALID_UUID));
        Escala.count.mockResolvedValue(1);

        const res = await request(app)
          .delete(`/api/funcionarios/${VALID_UUID}?force=abc`);

        expect(res.body.success).toBe(false);
        expect(res.body.warning).toBe(true);
        expect(res.body.requiresConfirmation).toBe(true);
      });
    });
  });
});
