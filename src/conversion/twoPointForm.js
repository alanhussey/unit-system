const withAliases = require('./withAliases');
const { slopeIntercept } = require('./slopeInterceptForm');

function twoPoint([x1, y1], [x2, y2]) {
  if (x1 === x2) {
    throw new Error('Cannot create an equation of a vertical line');
  }
  const slope = (y2 - y1) / (x2 - x1);
  const intercept = y1 - slope * x1;
  return slopeIntercept(slope, intercept);
}

exports.twoPoint = twoPoint;
withAliases(exports, twoPoint, 'fromExamples', 'byExample');
