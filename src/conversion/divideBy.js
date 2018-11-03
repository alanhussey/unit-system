const { multiplyBy } = require('./slopeInterceptForm');

function divideBy(divisor) {
  return multiplyBy(1 / divisor);
}

exports.divideBy = divideBy;
