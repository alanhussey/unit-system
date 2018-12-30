const { SlopeIntercept } = require('./slopeInterceptForm');
const withAliases = require('./withAliases');

class AddConstant extends SlopeIntercept {
  constructor(constant) {
    super(1, constant);
  }
}

function addConstant(constant) {
  return new AddConstant(constant);
}

exports.addConstant = addConstant;
withAliases(exports, addConstant, 'add', 'constant');
