module.exports = {
  ci: {
    collect: {
      staticDistDir: './public',
      url: ['http://localhost:8000'],
      settings: {
        emulatedFormFactor: 'desktop',
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.6}],
        'categories:accessibility': ['error', {minScore: 1}]
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
