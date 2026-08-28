// ============================================================
// Model: Orcamento (tabela: orcamentos)
// ============================================================
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Orcamento = sequelize.define(
  "Orcamento",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "orc_id",
    },
    // FK para empresas (tenant)
    empresaId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "orc_emp_id",
    },
    clienteId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "orc_cli_id",
    },
    // FK para locais
    localId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "orc_loc_id",
    },
    valorTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "orc_valor_total",
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: "orc_nome",
    },
    qtdPessoas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "orc_qtd_pessoas",
    },
    qtdAdultos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "orc_qtd_adultos",
    },
    qtdCriancas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "orc_qtd_criancas",
    },
    qtdBebes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "orc_qtd_bebes",
    },
    dataValidade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "orc_data_validade",
    },
    dataEvento: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "orc_data_evento",
      validate: {
        dataValida(value) {
          if (value && isNaN(new Date(value).getTime())) {
            throw new Error("Data do evento inválida.");
          }
        },
      },
    },
    horarioTermino: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "orc_horario_termino",
      validate: {
        dataValida(value) {
          if (value && isNaN(new Date(value).getTime())) {
            throw new Error("Horário de término inválido.");
          }
        },
        aposInicioEvento(value) {
          if (value && this.dataEvento) {
            const fim = new Date(value);
            const inicio = new Date(this.dataEvento);
            if (!isNaN(inicio.getTime()) && !isNaN(fim.getTime()) && fim <= inicio) {
              throw new Error("Horário de término deve ser posterior à data de início do evento.");
            }
          }
        },
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pendente",
      field: "orc_status",
      validate: {
        isIn: [["pendente", "aprovado", "reprovado"]],
      },
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "orc_observacoes",
    },
    criadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "orc_criado_em",
    },
    atualizadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "orc_atualizado_em",
    },
    deletadoEm: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "orc_deletado_em",
    },
  },
  {
    tableName: "orcamentos",
    timestamps: false,
    defaultScope: {
      where: { deletadoEm: null },
    },
    scopes: {
      comDeletados: {},
    },
  },
);

module.exports = Orcamento;
