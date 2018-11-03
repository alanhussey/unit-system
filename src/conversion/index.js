const slopeInterceptForm = require('./slopeInterceptForm');
const divideBy = require('./divideBy');
const twoPointForm = require('./twoPointForm');
const addConstant = require('./addConstant');

module.exports = {
  ...divideBy,
  ...slopeInterceptForm,
  ...twoPointForm,
  ...addConstant,
};
