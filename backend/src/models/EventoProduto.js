// ============================================================
// Model: EventoProduto (tabela: evento_produto) — Evento ↔ Produto (N:M)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventoProduto = sequelize.define('EventoProduto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'evp_id',
  },
  // FK para empresas (tenant)
  empresaId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'evp_emp_id',
  },
  eventoId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'evp_evt_id',
  },
  produtoId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'evp_prd_id',
  },
  quantidade: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'evp_quantidade',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'evp_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'evp_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'evp_deletado_em',
  },
}, {
  tableName: 'evento_produto',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = EventoProduto;
