// ============================================================
// Controller: Configuração do Tenant (identidade visual white label)
// ============================================================
const { Empresa } = require('../models');
const { success, fail } = require('../utils/response');
const { resolverTenant } = require('../utils/resolverTenant');
const { invalidarCache } = require('../utils/brand');

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Formato consumido pelo painel web e pelo app mobile. */
function serializar(empresa) {
  return {
    id: empresa.id,
    nomeFantasia: empresa.nomeFantasia,
    slug: empresa.slug,
    logoUrl: empresa.logoUrl,
    cores: {
      primaria: empresa.corPrimaria,
      secundaria: empresa.corSecundaria,
      terciaria: empresa.corTerciaria,
    },
  };
}

// ── GET /api/tenant/config ───────────────────────────────────
// Público: o app e a tela de login precisam da marca antes de existir
// um token. Devolve só dados de identidade visual, nada sensível.
async function obterConfig(req, res, next) {
  try {
    const { empresa, erro } = await resolverTenant(req);
    if (!empresa) return fail(res, erro || 'Empresa não encontrada.', 404);

    if (empresa.status === 'cancelado') {
      return fail(res, 'Empresa não encontrada.', 404);
    }

    return success(res, serializar(empresa));
  } catch (error) {
    return next(error);
  }
}

// ── PUT /api/tenant/config ───────────────────────────────────
// Gerente do buffet edita a própria identidade visual.
async function atualizarConfig(req, res, next) {
  try {
    const empresa = await Empresa.findOne({ where: { id: req.user.empresaId } });
    if (!empresa) return fail(res, 'Empresa não encontrada.', 404);

    const { nomeFantasia, logoUrl, cores } = req.body;
    const alteracoes = {};

    if (nomeFantasia !== undefined) {
      const valor = String(nomeFantasia).trim();
      if (!valor) return fail(res, 'O nome fantasia não pode ficar vazio.');
      if (valor.length > 150) return fail(res, 'O nome fantasia deve ter no máximo 150 caracteres.');
      alteracoes.nomeFantasia = valor;
    }

    if (logoUrl !== undefined) {
      const valor = logoUrl === null ? null : String(logoUrl).trim();
      if (valor && !/^https?:\/\//i.test(valor)) {
        return fail(res, 'A logo deve ser uma URL http(s) válida.');
      }
      if (valor && valor.length > 255) {
        return fail(res, 'A URL da logo deve ter no máximo 255 caracteres.');
      }
      alteracoes.logoUrl = valor || null;
    }

    if (cores !== undefined) {
      const campos = {
        primaria: 'corPrimaria',
        secundaria: 'corSecundaria',
        terciaria: 'corTerciaria',
      };
      for (const [entrada, coluna] of Object.entries(campos)) {
        const valor = cores[entrada];
        if (valor === undefined) continue;
        if (!HEX.test(String(valor))) {
          return fail(res, `Cor ${entrada} inválida. Use o formato #RRGGBB.`);
        }
        alteracoes[coluna] = String(valor).toUpperCase();
      }
    }

    if (Object.keys(alteracoes).length === 0) {
      return fail(res, 'Nenhum campo para atualizar.');
    }

    alteracoes.atualizadoEm = new Date();
    await empresa.update(alteracoes);

    // Mensagens de WhatsApp e e-mail usam o nome e a cor daqui; sem isso
    // continuariam saindo com a marca antiga por até 5 minutos.
    invalidarCache(empresa.id);

    return success(res, serializar(empresa), 'Identidade visual atualizada!');
  } catch (error) {
    return next(error);
  }
}

module.exports = { obterConfig, atualizarConfig };
