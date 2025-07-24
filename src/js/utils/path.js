/**
 * Encodes a path for use in a URL, specifically handling spaces.
 * @param {string} path - The path to encode.
 * @returns {string} The encoded path.
 */
export function encodePath(path) {
	if (!path) return '';
	return path.replace(/ /g, '%20');
}
