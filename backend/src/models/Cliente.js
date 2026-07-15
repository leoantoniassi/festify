// ============================================================
// Model: Cliente (tabela: clientes)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'cli_id',
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'cli_nome',
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true,
    field: 'cli_email',
  },
  rgCpf: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'cli_rgcpf',
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'cli_telefone',
  },
  telefoneResidencial: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'cli_telefone_residencial',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'cli_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'cli_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cli_deletado_em',
  },
}, {
  tableName: 'clientes',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = Cliente;
