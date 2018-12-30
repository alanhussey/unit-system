const withAliases = require('./withAliases');
const { SlopeIntercept } = require('./slopeInterceptForm');

class TwoPoint extends SlopeIntercept {
  constructor([x1, y1], [x2, y2]) {
    if (x1 === x2) {
      throw new Error('Cannot create an equation of a vertical line');
    }
    const slope = (y2 - y1) / (x2 - x1);
    const intercept = y1 - slope * x1;
    super(slope, intercept);
  }
}

function twoPoint([x1, y1], [x2, y2]) {
  return new TwoPoint([x1, y1], [x2, y2]);
}

exports.twoPoint = twoPoint;
withAliases(exports, twoPoint, 'fromExamples', 'byExample');
