// ============================================================
// Model: Escala (tabela: escala) — Evento ↔ Funcionário (N:M)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Escala = sequelize.define('Escala', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'esc_id',
  },
  // FK para empresas (tenant)
  empresaId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'esc_emp_id',
  },
  eventoId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'esc_evt_id',
  },
  funcionarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'esc_fun_id',
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'esc_observacoes',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'esc_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'esc_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'esc_deletado_em',
  },
}, {
  tableName: 'escala',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = Escala;
