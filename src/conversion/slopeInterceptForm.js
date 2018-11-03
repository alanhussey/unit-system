const withAliases = require('./withAliases');
const createConverter = require('./createConverter');

function slopeIntercept(slope, intercept = 0) {
  return createConverter(
    value => value * slope + intercept,
    value => (value - intercept) / slope
  );
}

exports.slopeIntercept = slopeIntercept;
withAliases(exports, slopeIntercept, 'multiplyBy', 'times');
