import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import nearestColor from 'nearest-color';
import os from 'os';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../wallpapers');
const WEBP_DIR = path.resolve(__dirname, '../public/webp');
const LQIP_DIR = path.resolve(__dirname, '../public/lqip');
const OUTPUT_JS = path.resolve(__dirname, '../src/js/gallery-data.js');
const CACHE_FILE = path.resolve(__dirname, 'gallery-cache.json');

const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'];
const RESPONSIVE_WIDTHS = [640, 1920];
const WEBP_QUALITY = 78;
const LQIP_QUALITY = 20;
const LQIP_WIDTH = 40;
const CONCURRENCY_LIMIT = os.cpus().length;

const colorMap = {
    black: '#000000', blue: '#0000ff', brown: '#a52a2a', cyan: '#00ffff',
    green: '#008000', gray: '#808080', magenta: '#ff00ff', orange: '#ffa500',
    pink: '#ffc0cb', purple: '#800080', red: '#ff0000', white: '#ffffff',
    yellow: '#ffff00', maroon: '#800000', navy: '#000080', olive: '#808000',
    teal: '#008080', aqua: '#00ffff', lime: '#00ff00', silver: '#c0c0c0',
    fuchsia: '#ff00ff', indigo: '#4b0082', gold: '#ffd700', violet: '#ee82ee',
    beige: '#f5f5dc', tan: '#d2b48c', khaki: '#f0e68c', salmon: '#fa8072',
    coral: '#ff7f50', turquoise: '#40e0d0', plum: '#dda0dd', orchid: '#da70d6',
    skyblue: '#87ceeb',
};
const getColorName = nearestColor.from(colorMap);

// --- Helper Functions ---

async function findFiles(dir) {
    let files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(await findFiles(fullPath));
        } else if (IMG_EXTENSIONS.includes(path.extname(item.name).toLowerCase()) || path.extname(item.name).toLowerCase() === '.gif') {
            files.push(fullPath);
        }
    }
    return files;
}

async function needsRegeneration(srcPath, destPath) {
    try {
        const srcStat = await fs.stat(srcPath);
        const destStat = await fs.stat(destPath);
        return srcStat.mtime > destStat.mtime;
    } catch (err) {
        if (err.code === 'ENOENT') return true;
        throw err;
    }
}

async function loadCache() {
    try {
        const cacheData = await fs.readFile(CACHE_FILE, 'utf-8');
        return JSON.parse(cacheData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {}; // Cache file doesn't exist, return empty object
        }
        throw error;
    }
}

async function saveCache(cache) {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function processImage(imgPath, cache) {
    const relPath = path.relative(SRC_DIR, imgPath);
    const stats = await fs.stat(imgPath);
    const cachedItem = cache[relPath];

    if (cachedItem && cachedItem.mtime === stats.mtimeMs) {
        // Check if all generated files exist, otherwise regenerate
        const thumbnailExists = await fs.access(path.join(__dirname, '../public', cachedItem.data.thumbnail)).then(() => true).catch(() => false);
        const lqipExists = cachedItem.data.lqip ? await fs.access(path.join(__dirname, '../public', cachedItem.data.lqip)).then(() => true).catch(() => false) : true;
        if (thumbnailExists && lqipExists) {
            return cachedItem.data; // Return cached data if valid
        }
    }

    // If not cached or outdated, process the image
    const relPathDir = path.dirname(relPath);
    const fileName = path.basename(imgPath);
    const baseName = path.basename(fileName, path.extname(fileName));

    if (path.extname(fileName).toLowerCase() === '.gif') {
        const image = sharp(imgPath);
        const metadata = await image.metadata();
        const encodedRelPath = relPath.split(path.sep).map(s => encodeURIComponent(s)).join('/');
        const data = {
            type: 'file', name: fileName, thumbnail: `src/${encodedRelPath}`,
            srcset: '', full: `src/${encodedRelPath}`, width: metadata.width,
            height: metadata.height, path: relPathDir === '.' ? '' : relPathDir,
            mtime: stats.mtimeMs, dominantColor: '', colorName: '',
        };
        cache[relPath] = { mtime: stats.mtimeMs, data };
        return data;
    }

    const image = sharp(imgPath);
    const metadata = await image.metadata();

    for (const width of RESPONSIVE_WIDTHS) {
        const outDir = path.join(WEBP_DIR, relPathDir);
        await fs.mkdir(outDir, { recursive: true });
        const outPath = path.join(outDir, `${baseName}_${width}w.webp`);
        if (await needsRegeneration(imgPath, outPath)) {
            await image.clone().resize(width).webp({ quality: WEBP_QUALITY }).toFile(outPath);
        }
    }

    const lqipDir = path.join(LQIP_DIR, relPathDir);
    await fs.mkdir(lqipDir, { recursive: true });
    const lqipPath = path.join(lqipDir, `${baseName}_lqip.webp`);
    if (await needsRegeneration(imgPath, lqipPath)) {
        await image.clone().resize(LQIP_WIDTH).webp({ quality: LQIP_QUALITY }).toFile(lqipPath);
    }

    const { dominant } = await image.stats();
    const dominantColor = `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`;
    const colorName = getColorName(dominantColor).name;

    const encodedRelPath = relPath.split(path.sep).map(s => encodeURIComponent(s)).join('/');
    const encodedBaseName = encodeURIComponent(baseName);
    const encodedRelPathDir = relPathDir.split(path.sep).map(s => encodeURIComponent(s)).join('/');

    const srcPathPrefix = (relPathDir === '.' ? `webp/${encodedBaseName}` : `webp/${encodedRelPathDir}/${encodedBaseName}`);
    const lqipPathPrefix = (relPathDir === '.' ? `lqip/${encodedBaseName}` : `lqip/${encodedRelPathDir}/${encodedBaseName}`);
    const srcset = RESPONSIVE_WIDTHS.map(w => `${srcPathPrefix}_${w}w.webp ${w}w`).join(', ');

    const data = {
        type: 'file', name: fileName, thumbnail: `${srcPathPrefix}_640w.webp`,
        srcset: srcset, full: `src/${encodedRelPath}`, lqip: `${lqipPathPrefix}_lqip.webp`,
        width: metadata.width, height: metadata.height, path: relPathDir === '.' ? '' : relPathDir,
        mtime: stats.mtimeMs, dominantColor, colorName,
    };

    cache[relPath] = { mtime: stats.mtimeMs, data };
    return data;
}

async function runParallel(tasks, concurrency) {
    const results = [];
    const queue = [...tasks];
    const workers = [];
    let processedCount = 0;
    let fromCacheCount = 0;

    const updateProgress = (fromCache) => {
        processedCount++;
        if (fromCache) fromCacheCount++;
        const cacheStatus = `(${fromCacheCount} from cache)`;
        process.stdout.write(`\rProcessing images: ${processedCount}/${tasks.length} ${cacheStatus}`);
    };

    for (let i = 0; i < concurrency; i++) {
        workers.push((async () => {
            while (queue.length > 0) {
                const task = queue.shift();
                if (task) {
                    try {
                        const { taskFn, isCached } = task;
                        const result = await taskFn();
                        if (result) results.push(result);
                        updateProgress(isCached);
                    } catch (error) {
                        console.error(`\nError processing task:`, error);
                    }
                }
            }
        })());
    }

    await Promise.all(workers);
    process.stdout.write('\n');
    return results;
}

// --- Main Execution ---

async function main() {
    console.log('Starting gallery generation...');
    await fs.mkdir(WEBP_DIR, { recursive: true });
    await fs.mkdir(LQIP_DIR, { recursive: true });

    const cache = await loadCache();
    const allImages = await findFiles(SRC_DIR);
    console.log(`Found ${allImages.length} images to process. Using ${CONCURRENCY_LIMIT} parallel workers.`);

    const tasks = [];
    for (const imgPath of allImages) {
        const relPath = path.relative(SRC_DIR, imgPath);
        const stats = await fs.stat(imgPath);
        const cachedItem = cache[relPath];
        const isCached = cachedItem && cachedItem.mtime === stats.mtimeMs;

        tasks.push({
            taskFn: () => processImage(imgPath, cache),
            isCached
        });
    }

    const galleryData = await runParallel(tasks, CONCURRENCY_LIMIT);

    await saveCache(cache);
    const outputContent = `export const galleryData = ${JSON.stringify(galleryData, null, 2)};`;
    await fs.writeFile(OUTPUT_JS, outputContent);

    console.log('Successfully generated gallery data and images.');
}

main().catch(console.error);