function readPackage(pkg) {
	if (pkg.name === '@vercel/speed-insights') {
		pkg.scripts = pkg.scripts || {};
		// Approve the postinstall script manually
		pkg.scripts.postinstall = 'node-gyp-build';
	}
	return pkg;
}

module.exports = {
	hooks: {
		readPackage,
	},
};
