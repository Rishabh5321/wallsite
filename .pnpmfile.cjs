function readPackage(pkg) {
  if (pkg.name === '@vercel/speed-insights') {
    pkg.scripts = pkg.scripts || {};
    // This is the script that pnpm is blocking. By adding it here, we are approving it.
    pkg.scripts.postinstall = 'node-gyp-build';
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
