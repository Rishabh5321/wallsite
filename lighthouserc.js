module.exports = {
  ci: {
    collect: {
      staticDistDir: './public',
      url: ['http://localhost:8000']
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', {minScore: 0.8}],
        'errors-in-console': 'off',
        'network-dependency-tree-insight': 'off',
        'categories:accessibility': ['error', {minScore: 1}]
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
