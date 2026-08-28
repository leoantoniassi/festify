// ============================================================
// Controller: Catálogos de Buffet
// ============================================================
const { Catalogo } = require('../models');

// GET /api/catalogos
async function listar(req, res, next) {
  try {
    const catalogos = await Catalogo.findAll({
      order: [['criadoEm', 'DESC']],
    });
    return res.json({ success: true, data: catalogos });
  } catch (error) {
    return next(error);
  }
}

// POST /api/catalogos
async function criar(req, res, next) {
  try {
    const { titulo, descricao, precoBase, urlExterna } = req.body;

    if (!titulo) {
      return res.status(400).json({ success: false, message: 'O título é obrigatório.' });
    }

    const catalogo = await Catalogo.create({
      titulo,
      descricao: descricao || null,
      precoBase: precoBase ? parseFloat(precoBase) : null,
      urlExterna: urlExterna || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Catálogo criado com sucesso!',
      data: catalogo,
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /api/catalogos/:id
async function atualizar(req, res, next) {
  try {
    const catalogo = await Catalogo.findOne({ where: { id: req.params.id } });
    if (!catalogo) {
      return res.status(404).json({ success: false, message: 'Catálogo não encontrado.' });
    }

    const { titulo, descricao, precoBase, urlExterna, ativo } = req.body;

    await catalogo.update({
      titulo: titulo || catalogo.titulo,
      descricao: descricao !== undefined ? descricao : catalogo.descricao,
      precoBase: precoBase !== undefined ? (precoBase ? parseFloat(precoBase) : null) : catalogo.precoBase,
      urlExterna: urlExterna !== undefined ? urlExterna : catalogo.urlExterna,
      ativo: ativo !== undefined ? (ativo === 'true' || ativo === true) : catalogo.ativo,
      atualizadoEm: new Date(),
    });

    return res.json({
      success: true,
      message: 'Catálogo atualizado com sucesso!',
      data: catalogo,
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/catalogos/:id (soft delete)
async function remover(req, res, next) {
  try {
    const catalogo = await Catalogo.findOne({ where: { id: req.params.id } });
    if (!catalogo) {
      return res.status(404).json({ success: false, message: 'Catálogo não encontrado.' });
    }

    await catalogo.update({ deletadoEm: new Date() });

    return res.json({
      success: true,
      message: 'Catálogo removido com sucesso!',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, criar, atualizar, remover };
