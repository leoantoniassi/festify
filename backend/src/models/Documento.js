// ============================================================
// Model: Documento (tabela: documentos)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Documento = sequelize.define('Documento', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'doc_id',
  },
  // FK para empresas (tenant)
  empresaId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'doc_emp_id',
  },
  clienteId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'doc_cli_id',
  },
  eventoId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'doc_evt_id',
  },
  nomeArquivo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'doc_nome_arquivo',
  },
  caminhoUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'doc_caminho_url',
  },
  tipoArquivo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'doc_tipo_arquivo',
    validate: {
      isIn: [['pdf', 'jpg', 'png']],
    },
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'doc_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'doc_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'doc_deletado_em',
  },
}, {
  tableName: 'documentos',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = Documento;
