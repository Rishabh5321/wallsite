export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Flattens the gallery data tree into a simple list of all files,
 * ensuring the path from the parent is preserved.
 * @param {object} node - The current node in the gallery data tree.
 * @returns {Array} A flat array of file objects.
 */
export function flattenTree(node) {
    let files = [];
    if (node.type === 'file') {
        return [node]; // The node from generate_gallery.sh already has the path
    }
    if (node.children) {
        node.children.forEach((child) => {
            files = files.concat(flattenTree(child));
        });
    }
    return files;
}
