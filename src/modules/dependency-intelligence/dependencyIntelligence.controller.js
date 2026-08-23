const service = require('./dependencyIntelligence.service');
const { toPlainJSON } = require('../../common/util');

const parseMaxDepth = (raw) => {
  if (raw === undefined) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const getApplicationBlastRadius = async (req, res, next) => {
  try {
    const result = await service.getApplicationBlastRadius(req.params.id, { maxDepth: parseMaxDepth(req.query.maxDepth) });
    res.json(toPlainJSON(result));
  } catch (err) {
    next(err);
  }
};

const getTechnologyBlastRadius = async (req, res, next) => {
  try {
    const result = await service.getTechnologyBlastRadius(req.params.id, { maxDepth: parseMaxDepth(req.query.maxDepth) });
    res.json(toPlainJSON(result));
  } catch (err) {
    next(err);
  }
};

module.exports = { getApplicationBlastRadius, getTechnologyBlastRadius };
