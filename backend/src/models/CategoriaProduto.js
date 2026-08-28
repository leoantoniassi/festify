// ============================================================
// Model: CategoriaProduto (tabela: categorias_produto) — lookup
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaProduto = sequelize.define('CategoriaProduto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'cap_id',
  },
  // FK para empresas (tenant)
  empresaId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'cap_emp_id',
  },
  nome: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
    field: 'cap_nome',
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cap_descricao',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'cap_criado_em',
  },
}, {
  tableName: 'categorias_produto',
  timestamps: false,
});

module.exports = CategoriaProduto;
