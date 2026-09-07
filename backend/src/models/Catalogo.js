// ============================================================
// Model: Catalogo (tabela: catalogos)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Catalogo = sequelize.define('Catalogo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'cat_id',
  },
  // FK para empresas (tenant)
  empresaId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'cat_emp_id',
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'cat_titulo',
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cat_descricao',
  },
  precoBase: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'cat_preco_base',
  },
  urlExterna: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cat_url_externa',
  },
  imagemUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cat_imagem_url',
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'cat_ativo',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'cat_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'cat_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cat_deletado_em',
  },
}, {
  tableName: 'catalogos',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = Catalogo;
