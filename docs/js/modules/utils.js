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

export function flattenTree(node) {
    let files = [];
    if (node.type === 'file') {
        const parts = node.full.split('/');
        // The folder name is usually the second to last part if it's src/Category/file.jpg
        const folderName = parts.length > 2 ? parts[parts.length - 2] : 'Root';
        return [{ ...node, path: folderName }];
    }
    if (node.children) {
        node.children.forEach((child) => {
            files = files.concat(flattenTree(child));
        });
    }
    return files;
}
