module.exports = {
  testMatch: ['**/?(*.)+(spec|test).m*js'],
  moduleFileExtensions: ['js', 'mjs'],
  transform: {
    '^.+\\.m*js$': 'babel-jest',
  },
};
