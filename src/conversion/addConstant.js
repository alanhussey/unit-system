const withAliases = require('./withAliases');
const { slopeIntercept } = require('./slopeInterceptForm');

function addConstant(constant) {
  return slopeIntercept(1, constant);
}

exports.addConstant = addConstant;
withAliases(exports, addConstant, 'add', 'constant');
