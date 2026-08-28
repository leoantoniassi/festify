const { Documento } = require('../models');
const { detectarTipo, isUrlExterna } = require('../utils/fileUtils');

async function findDocumentoOrFail(id) {
  const documento = await Documento.findOne({ where: { id: id } });
  if (!documento) {
    const err = new Error('Documento não encontrado.');
    err.statusCode = 404;
    throw err;
  }
  return documento;
}

function validarCriacao(body) {
  if (!body.nomeArquivo) return 'O nome do documento é obrigatório.';
  if (!body.caminhoUrl) return 'A localização do arquivo é obrigatória.';

  if (!isUrlExterna(body.caminhoUrl) && body.caminhoUrl.includes('..')) {
    return 'Caminho de arquivo inválido: não são permitidos segmentos "..".';
  }

  return null;
}

function montarPayloadCriacao(body) {
  return {
    nomeArquivo: body.nomeArquivo,
    caminhoUrl: body.caminhoUrl,
    tipoArquivo: detectarTipo(body.caminhoUrl),
    clienteId: body.clienteId || null,
    eventoId: body.eventoId || null,
  };
}

function montarPayloadAtualizacao(body) {
  const payload = { atualizadoEm: new Date() };

  if (body.nomeArquivo !== undefined) payload.nomeArquivo = body.nomeArquivo;
  if (body.caminhoUrl !== undefined) {
    payload.caminhoUrl = body.caminhoUrl;
    payload.tipoArquivo = detectarTipo(body.caminhoUrl);
  }
  if (body.clienteId !== undefined) payload.clienteId = body.clienteId || null;
  if (body.eventoId !== undefined) payload.eventoId = body.eventoId || null;

  return payload;
}

function infoArquivo(documento) {
  return {
    caminho: documento.caminhoUrl,
    isExterno: isUrlExterna(documento.caminhoUrl),
  };
}

module.exports = {
  findDocumentoOrFail,
  validarCriacao,
  montarPayloadCriacao,
  montarPayloadAtualizacao,
  infoArquivo,
};
