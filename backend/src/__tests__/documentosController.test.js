const request = require('supertest');
const express = require('express');
const { Documento } = require('../models');

let mockRole = 'operador';

// Mock do middleware de autenticação para controle dinâmico da role do usuário
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 'uuid-usuario', email: 'teste@exemplo.com', role: mockRole };
  next();
});

jest.mock('../models', () => ({
  Documento: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
  Cliente: {},
  Evento: {},
}));

describe('DocumentosController e Rotas', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/documentos', require('../routes/documentos.routes'));
    app.use((err, _req, res, _next) => {
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    });
  });

  describe('GET /api/documentos (listar)', () => {
    test('deve permitir acesso a um operador', async () => {
      mockRole = 'operador';
      Documento.findAll.mockResolvedValue([]);

      const res = await request(app).get('/api/documentos');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Documento.findAll).toHaveBeenCalled();
    });

    test('deve permitir acesso a um gerente', async () => {
      mockRole = 'gerente';
      Documento.findAll.mockResolvedValue([]);

      const res = await request(app).get('/api/documentos');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('deve negar acesso a uma role inválida', async () => {
      mockRole = 'invalido';

      const res = await request(app).get('/api/documentos');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Acesso negado');
    });
  });

  describe('POST /api/documentos (criar)', () => {
    const payload = {
      nomeArquivo: 'Contrato.pdf',
      caminhoUrl: 'https://drive.google.com/contrato.pdf',
    };

    test('deve permitir a criação por um operador', async () => {
      mockRole = 'operador';
      const created = { id: 'uuid-doc', ...payload, tipoArquivo: 'pdf', clienteId: null, eventoId: null };
      Documento.create.mockResolvedValue(created);

      const res = await request(app)
        .post('/api/documentos')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Documento.create).toHaveBeenCalled();
    });

    test('deve permitir a criação por um gerente', async () => {
      mockRole = 'gerente';
      const created = { id: 'uuid-doc', ...payload, tipoArquivo: 'pdf', clienteId: null, eventoId: null };
      Documento.create.mockResolvedValue(created);

      const res = await request(app)
        .post('/api/documentos')
        .send(payload);

      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/documentos/:id (atualizar)', () => {
    const payload = {
      nomeArquivo: 'Contrato Novo.pdf',
    };

    test('deve permitir a atualização por um operador', async () => {
      mockRole = 'operador';
      const mockDoc = {
        id: 'uuid-doc',
        nomeArquivo: 'Contrato.pdf',
        caminhoUrl: 'https://drive.google.com/contrato.pdf',
        update: jest.fn().mockResolvedValue(true),
      };
      Documento.findOne.mockResolvedValue(mockDoc);

      const res = await request(app)
        .put('/api/documentos/uuid-doc')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/documentos/:id (remover)', () => {
    test('deve permitir a exclusão por um gerente', async () => {
      mockRole = 'gerente';
      const mockDoc = {
        id: 'uuid-doc',
        update: jest.fn().mockResolvedValue(true),
      };
      Documento.findOne.mockResolvedValue(mockDoc);

      const res = await request(app).delete('/api/documentos/uuid-doc');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('deve negar a exclusão por um operador', async () => {
      mockRole = 'operador';

      const res = await request(app).delete('/api/documentos/uuid-doc');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
