// ============================================================
// Testes de Integração: Isolamento entre tenants
// ============================================================
// Esta suite roda contra um PostgreSQL REAL, não contra mocks. É o único
// teste que prova de fato que o buffet A não enxerga dados do buffet B —
// as demais suites mockam os models e, por definição, não conseguem
// provar isso.
//
// Pré-requisito: banco no ar com as migrations aplicadas (npm run migrate).
// Sem banco alcançável a suite é pulada com aviso, para não quebrar o
// `npm test` de quem está mexendo só no frontend.
// ============================================================
require('dotenv').config();
const request = require('supertest');
const bcrypt = require('bcryptjs');

const sequelize = require('../config/database');
const { Empresa, Usuario, Cliente, Evento, Local } = require('../models');
const { semEscopo } = require('../utils/tenantContext');
const app = require('../app');

const SENHA = 'senha-de-teste-123';
const CPF_COMPARTILHADO = '111.222.333-44';
const EMAIL_COMPARTILHADO = 'contato@cliente-em-comum.com';
const SLUGS = ['teste-iso-a', 'teste-iso-b'];

// Definido pelo globalSetup, que roda antes da coleta das suites.
const bancoDisponivel = process.env.BANCO_DISPONIVEL === '1';
let A = null;
let B = null;

/** Empresa completa: gerente, cliente, local e evento. */
async function criarTenant(sufixo) {
  return semEscopo(async () => {
    const empresa = await Empresa.create({
      nome: `Buffet ${sufixo}`,
      nomeFantasia: `Buffet ${sufixo}`,
      slug: `teste-iso-${sufixo.toLowerCase()}`,
    });

    const usuario = await Usuario.create({
      nome: `Gerente ${sufixo}`,
      email: `gerente-${sufixo.toLowerCase()}@teste-iso.com`,
      senha: await bcrypt.hash(SENHA, 10),
      role: 'gerente',
      status: 'ativo',
      empresaId: empresa.id,
    });

    // Mesmo CPF e e-mail nos dois tenants: precisa ser permitido.
    const cliente = await Cliente.create({
      nome: `Cliente de ${sufixo}`,
      email: EMAIL_COMPARTILHADO,
      rgCpf: CPF_COMPARTILHADO,
      telefone: '11999990000',
      empresaId: empresa.id,
    });

    const local = await Local.create({
      nome: `Salao ${sufixo}`,
      logradouro: 'Rua Teste',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      estado: 'SP',
      cep: '01000-000',
      empresaId: empresa.id,
    });

    const evento = await Evento.create({
      nome: `Festa de ${sufixo}`,
      clienteId: cliente.id,
      localId: local.id,
      dataEvento: new Date('2027-01-15T18:00:00'),
      horarioTermino: new Date('2027-01-15T23:00:00'),
      status: 'pendente',
      empresaId: empresa.id,
    });

    return { empresa, usuario, cliente, local, evento };
  });
}

async function logar(tenant) {
  return request(app)
    .post('/api/auth/login')
    .set('X-Tenant-Slug', tenant.empresa.slug)
    .send({ email: tenant.usuario.email, senha: SENHA });
}

async function limpar() {
  await semEscopo(async () => {
    const empresas = await Empresa.findAll({
      where: { slug: SLUGS },
      ignoraTenant: true,
    });
    for (const empresa of empresas) {
      const escopo = { where: { empresaId: empresa.id }, ignoraTenant: true, force: true };
      await Evento.destroy(escopo);
      await Cliente.destroy(escopo);
      await Local.destroy(escopo);
      await Usuario.destroy(escopo);
      await empresa.destroy({ force: true });
    }
  });
}

beforeAll(async () => {
  if (!bancoDisponivel) return;

  await sequelize.authenticate();
  await limpar();
  A = await criarTenant('A');
  B = await criarTenant('B');
  A.token = (await logar(A)).body.token;
  B.token = (await logar(B)).body.token;
}, 30000);

afterAll(async () => {
  if (bancoDisponivel) await limpar();
  await sequelize.close();
});

/** Só executa quando há banco; caso contrário marca como skipped. */
const cenario = () => (bancoDisponivel ? test : test.skip);

describe('Isolamento entre tenants', () => {
  describe('Modelagem', () => {
    cenario()('dois buffets podem ter o mesmo CPF e e-mail de cliente', () => {
      expect(A.cliente.rgCpf).toBe(B.cliente.rgCpf);
      expect(A.cliente.email).toBe(B.cliente.email);
      expect(A.cliente.id).not.toBe(B.cliente.id);
    });

    cenario()('o JWT carrega a empresa do usuario', async () => {
      const res = await logar(A);
      expect(res.status).toBe(200);
      expect(res.body.data.empresaId).toBe(A.empresa.id);
      expect(res.body.data.empresa.slug).toBe(A.empresa.slug);
    });

    cenario()('login com slug de outra empresa nao encontra o usuario', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('X-Tenant-Slug', B.empresa.slug)
        .send({ email: A.usuario.email, senha: SENHA });
      expect(res.status).toBe(401);
    });
  });

  describe('Listagens nao vazam', () => {
    const recursos = [
      ['clientes', () => A.cliente.id, () => B.cliente.id],
      ['eventos', () => A.evento.id, () => B.evento.id],
      ['locais', () => A.local.id, () => B.local.id],
    ];

    recursos.forEach(([rota, idProprio, idAlheio]) => {
      cenario()(`GET /api/${rota} devolve so os do proprio tenant`, async () => {
        const res = await request(app)
          .get(`/api/${rota}`)
          .set('Authorization', `Bearer ${A.token}`);

        expect(res.status).toBe(200);
        const ids = res.body.data.map((registro) => registro.id);
        expect(ids).toContain(idProprio());
        expect(ids).not.toContain(idAlheio());
      });
    });
  });

  describe('Acesso direto por id', () => {
    // 404 e nao 403: 403 confirmaria que o registro existe.
    cenario()('GET de cliente de outro tenant devolve 404', async () => {
      const res = await request(app)
        .get(`/api/clientes/${B.cliente.id}`)
        .set('Authorization', `Bearer ${A.token}`);
      expect(res.status).toBe(404);
    });

    cenario()('GET de evento de outro tenant devolve 404', async () => {
      const res = await request(app)
        .get(`/api/eventos/${B.evento.id}`)
        .set('Authorization', `Bearer ${A.token}`);
      expect(res.status).toBe(404);
    });

    cenario()('PUT em cliente de outro tenant nao altera nada', async () => {
      const nomeOriginal = B.cliente.nome;

      await request(app)
        .put(`/api/clientes/${B.cliente.id}`)
        .set('Authorization', `Bearer ${A.token}`)
        .send({ nome: 'INVADIDO' });

      const depois = await semEscopo(() =>
        Cliente.findOne({ where: { id: B.cliente.id }, ignoraTenant: true })
      );
      expect(depois.nome).toBe(nomeOriginal);
    });

    cenario()('DELETE em evento de outro tenant nao remove nada', async () => {
      await request(app)
        .delete(`/api/eventos/${B.evento.id}`)
        .set('Authorization', `Bearer ${A.token}`);

      const depois = await semEscopo(() =>
        Evento.findOne({ where: { id: B.evento.id }, ignoraTenant: true })
      );
      expect(depois).not.toBeNull();
      expect(depois.deletadoEm).toBeNull();
    });
  });

  describe('Escrita', () => {
    cenario()('POST grava no tenant do token, mesmo forjando empresaId', async () => {
      const res = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${A.token}`)
        .send({
          nome: 'Cliente Criado Por A',
          rgCpf: '999.888.777-66',
          telefone: '11988887777',
          empresaId: B.empresa.id, // tentativa deliberada
        });

      expect(res.status).toBe(201);

      const criado = await semEscopo(() =>
        Cliente.findOne({ where: { id: res.body.data.id }, ignoraTenant: true })
      );
      expect(criado.empresaId).toBe(A.empresa.id);
    });
  });

  describe('Agregacoes e busca', () => {
    cenario()('dashboard conta apenas o proprio tenant', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${A.token}`);

      expect(res.status).toBe(200);
      // Se o escopo falhasse no count(), viriam tambem os registros de B.
      expect(res.body.data.totalEventos).toBe(1);
    });

    cenario()('busca global nao retorna registros de outro tenant', async () => {
      const res = await request(app)
        .get('/api/busca')
        .query({ q: 'Cliente de B' })
        .set('Authorization', `Bearer ${A.token}`);

      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body)).not.toContain(B.cliente.id);
    });
  });
});
