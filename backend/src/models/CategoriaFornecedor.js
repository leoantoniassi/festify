// ============================================================
// Model: CategoriaFornecedor (tabela: categorias_fornecedor) — lookup
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaFornecedor = sequelize.define('CategoriaFornecedor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'caf_id',
  },
  // FK para empresas (tenant)
  empresaId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'caf_emp_id',
  },
  nome: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
    field: 'caf_nome',
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'caf_descricao',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'caf_criado_em',
  },
}, {
  tableName: 'categorias_fornecedor',
  timestamps: false,
});

module.exports = CategoriaFornecedor;
