module.exports = {
  testEnvironment: 'node',
  // Sonda o banco antes dos workers: a suite tenantIsolation precisa
  // saber disso na fase de coleta, não em beforeAll.
  globalSetup: '<rootDir>/jest.globalSetup.js',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  restoreMocks: true,
};
