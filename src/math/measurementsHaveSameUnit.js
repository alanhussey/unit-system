function measurementsHaveSameUnit(measurements) {
  return measurements.every((measurement, index, array) => {
    if (index === 0) {
      return true;
    }
    const previousMeasurement = array[index - 1];
    return previousMeasurement.unit === measurement.unit;
  });
}

module.exports = measurementsHaveSameUnit;
