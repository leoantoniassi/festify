// ============================================================
// Model: OrcamentoProduto (tabela: orcamento_produto) — Orçamento ↔ Produto (N:M)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrcamentoProduto = sequelize.define('OrcamentoProduto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'orp_id',
  },
  // FK para empresas (tenant)
  empresaId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'orp_emp_id',
  },
  orcamentoId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'orp_orc_id',
  },
  produtoId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'orp_prd_id',
  },
  quantidade: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'orp_quantidade',
  },
  precoUnitario: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'orp_preco_unitario',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'orp_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'orp_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'orp_deletado_em',
  },
}, {
  tableName: 'orcamento_produto',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = OrcamentoProduto;
