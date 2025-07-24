/**
 * Improved gallery generator
 *   – atomic write
 *   – I/O-aware concurrency
 *   – early cache hit
 *   – faster dominant-colour sampling
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import nearestColor from 'nearest-color';
import { availableParallelism } from 'os';
import glob from 'fast-glob';

// --- Configuration -------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../wallpapers');
const WEBP_DIR = path.resolve(__dirname, '../public/webp');
const LQIP_DIR = path.resolve(__dirname, '../public/lqip');
const GALLERY_DATA_FILE =
	process.argv[2] || path.resolve(__dirname, '../src/gallery-data.json');

const RESPONSIVE_WIDTHS = [320, 640, 1920]; // Added 320w for faster thumbnails
const WEBP_QUALITY = 75; // Lowered from 78 for smaller file sizes
const LQIP_QUALITY = 20;
const LQIP_WIDTH = 40;
const CONCURRENCY_LIMIT = Math.min(8, availableParallelism());

const colorMap = {
	black: '#000000',
	blue: '#0000ff',
	brown: '#a52a2a',
	cyan: '#00ffff',
	green: '#008000',
	gray: '#808080',
	magenta: '#ff00ff',
	orange: '#ffa500',
	pink: '#ffc0cb',
	purple: '#800080',
	red: '#ff0000',
	white: '#ffffff',
	yellow: '#ffff00',
	maroon: '#800000',
	navy: '#000080',
	olive: '#808000',
	teal: '#008080',
	aqua: '#00ffff',
	lime: '#00ff00',
	silver: '#c0c0c0',
	fuchsia: '#ff00ff',
	indigo: '#4b0082',
	gold: '#ffd700',
	violet: '#ee82ee',
	beige: '#f5f5dc',
	tan: '#d2b48c',
	khaki: '#f0e68c',
	salmon: '#fa8072',
	coral: '#ff7f50',
	turquoise: '#40e0d0',
	plum: '#dda0dd',
	orchid: '#da70d6',
	skyblue: '#87ceeb',
};
const getColorName = nearestColor.from(colorMap);

function buildGalleryTree(files) {
	const root = { type: 'folder', name: 'root', path: '', children: [] };
	const nodeMap = { root };

	files.forEach((file) => {
		const pathParts = file.path.split('/').filter((p) => p);
		let currentNode = root;

		pathParts.forEach((part, index) => {
			const currentPath = pathParts.slice(0, index + 1).join('/');
			let childNode = currentNode.children.find(
				(child) => child.name === part && child.type === 'folder'
			);

			if (!childNode) {
				childNode = {
					type: 'folder',
					name: part,
					path: currentPath,
					children: [],
				};
				currentNode.children.push(childNode);
				nodeMap[currentPath] = childNode;
			}
			currentNode = childNode;
		});

		currentNode.children.push(file);
	});

	if (root.children.length === 1 && root.children[0].type === 'folder') {
		const singleFolder = root.children[0];
		const rootFiles = root.children.filter((c) => c.type === 'file');
		if (rootFiles.length === 0) {
			return singleFolder;
		}
	}

	return root;
}

// --- Helpers -------------------------------------------------------

async function needsRegeneration(src, dest) {
	try {
		const [srcStat, destStat] = await Promise.all([
			fs.stat(src),
			fs.stat(dest),
		]);
		return srcStat.mtime > destStat.mtime;
	} catch (e) {
		return e.code === 'ENOENT';
	}
}

async function loadGalleryData() {
	try {
		const data = JSON.parse(await fs.readFile(GALLERY_DATA_FILE, 'utf8'));
		return {
			cache: data.cache || {},
			galleryData: data.galleryData || [],
			galleryTree: data.galleryTree || null,
		};
	} catch (e) {
		return e.code === 'ENOENT'
			? { cache: {}, galleryData: [], galleryTree: null }
			: Promise.reject(e);
	}
}

async function saveGalleryData(data) {
	const tmp = GALLERY_DATA_FILE + '.tmp';
	await fs.writeFile(tmp, JSON.stringify(data, null, 2));
	await fs.rename(tmp, GALLERY_DATA_FILE);
}

async function processImage(imgPath, cache) {
	const relPath = path.relative(SRC_DIR, imgPath);
	const stats = await fs.stat(imgPath);

	// 1. Fast cache hit ------------------------------------------------
	const cachedItem = cache[relPath];
	if (cachedItem && cachedItem.mtime === stats.mtimeMs) {
		return cachedItem.data;
	}

	// 2. Prepare paths and image instance ----------------------------
	const relPathDir = path.dirname(relPath);
	const fileName = path.basename(imgPath);
	const baseName = path.basename(fileName, path.extname(fileName));
	const image = sharp(imgPath);
	const metadata = await image.metadata();

	// 3. Handle GIFs: Don't generate thumbnails, use the original
	if (metadata.format === 'gif') {
		const { dominant } = await image
			.clone()
			.resize(64, 64, { fit: 'fill' })
			.stats();
		const dominantColor = `#${[dominant.r, dominant.g, dominant.b]
			.map((v) => v.toString(16).padStart(2, '0'))
			.join('')}`;
		const colorName = getColorName(dominantColor).name;

		const data = {
			type: 'file',
			name: fileName,
			thumbnail: `wallpapers/${relPath
				.split(path.sep)
				.map(encodeURIComponent)
				.join('/')}`,
			srcset: '', // No srcset for GIFs
			full: `wallpapers/${relPath
				.split(path.sep)
				.map(encodeURIComponent)
				.join('/')}`,
			lqip: '', // No LQIP for GIFs
			width: metadata.width,
			height: metadata.height,
			path: relPathDir === '.' ? '' : relPathDir,
			mtime: stats.mtimeMs,
			dominantColor,
			colorName,
		};
		cache[relPath] = { mtime: stats.mtimeMs, data };
		return data;
	}

	// 4. Raster formats -------------------------------------------------
	// 4a. Generate responsive WebP (run in parallel)
	const webpTasks = RESPONSIVE_WIDTHS.map(async (w) => {
		const outDir = path.join(WEBP_DIR, relPathDir);
		const out = path.join(outDir, `${baseName}_${w}w.webp`);
		if (await needsRegeneration(imgPath, out)) {
			await fs.mkdir(outDir, { recursive: true }); // safe to race
			return image
				.clone()
				.resize(w)
				.webp({ quality: WEBP_QUALITY })
				.toFile(out);
		}
	});
	await Promise.all(webpTasks);

	// 4b. LQIP
	const lqipDir = path.join(LQIP_DIR, relPathDir);
	const lqipOut = path.join(lqipDir, `${baseName}_lqip.webp`);
	if (await needsRegeneration(imgPath, lqipOut)) {
		await fs.mkdir(lqipDir, { recursive: true });
		await image
			.clone()
			.resize(LQIP_WIDTH)
			.webp({ quality: LQIP_QUALITY })
			.toFile(lqipOut);
	}

	// 4c. Dominant colour (down-sample first)
	const { dominant } = await image
		.clone()
		.resize(64, 64, { fit: 'fill' })
		.stats();
	const dominantColor = `#${[dominant.r, dominant.g, dominant.b]
		.map((v) => v.toString(16).padStart(2, '0'))
		.join('')}`;
	const colorName = getColorName(dominantColor).name;

	// 4d. Build URLs
	const encodedRelPathDir = relPathDir
		.split(path.sep)
		.map(encodeURIComponent)
		.join('/');
	const encodedBaseName = encodeURIComponent(baseName);

	const srcPathPrefix =
		relPathDir === '.'
			? `webp/${encodedBaseName}`
			: `webp/${encodedRelPathDir}/${encodedBaseName}`;
	const lqipPathPrefix =
		relPathDir === '.'
			? `lqip/${encodedBaseName}`
			: `lqip/${encodedRelPathDir}/${encodedBaseName}`;
	const srcset = RESPONSIVE_WIDTHS.map(
		(w) => `${srcPathPrefix}_${w}w.webp ${w}w`
	).join(', ');

	const data = {
		type: 'file',
		name: fileName,
		thumbnail: `${srcPathPrefix}_320w.webp`, // Use smaller thumbnail for faster LCP
		srcset,
		full: `wallpapers/${relPath
			.split(path.sep)
			.map(encodeURIComponent)
			.join('/')}`,
		lqip: `${lqipPathPrefix}_lqip.webp`,
		width: metadata.width,
		height: metadata.height,
		path: relPathDir === '.' ? '' : relPathDir,
		mtime: stats.mtimeMs,
		dominantColor,
		colorName,
	};
	cache[relPath] = { mtime: stats.mtimeMs, data };
	return data;
}

// --- Parallel runner -----------------------------------------------
async function runParallel(tasks, concurrency) {
	const results = [];
	let done = 0,
		fromCache = 0;

	const update = (cached) => {
		done++;
		if (cached) fromCache++;
		process.stdout.write(
			`\rProcessing images: ${done}/${tasks.length} (${fromCache} from cache)`
		);
	};

	const queue = [...tasks];
	const workers = Array.from({ length: concurrency }, () =>
		(async () => {
			while (queue.length) {
				const { taskFn, isCached } = queue.shift();
				try {
					const res = await taskFn();
					if (res) results.push(res);
					update(isCached);
				} catch (e) {
					console.error('\nTask failed:', e);
				}
			}
		})()
	);
	await Promise.all(workers);
	console.log(); // newline
	return results;
}

// --- Main ----------------------------------------------------------
async function main() {
	console.log('Starting gallery generation...');
	await fs.mkdir(WEBP_DIR, { recursive: true });
	await fs.mkdir(LQIP_DIR, { recursive: true });

	const { cache } = await loadGalleryData();
	const imgPaths = await glob('**/*.{png,jpg,jpeg,bmp,tiff,webp,gif}', {
		cwd: SRC_DIR,
	});
	const allImages = imgPaths.map((p) => path.join(SRC_DIR, p));

	console.log(
		`Found ${allImages.length} images. Using ${CONCURRENCY_LIMIT} workers.`
	);

	const tasks = [];
	for (const imgPath of allImages) {
		const relPath = path.relative(SRC_DIR, imgPath);
		const stats = await fs.stat(imgPath);
		const cached = cache[relPath] && cache[relPath].mtime === stats.mtimeMs;

		tasks.push({
			taskFn: () => processImage(imgPath, cache),
			isCached: cached,
		});
	}

	const galleryData = await runParallel(tasks, CONCURRENCY_LIMIT);
	const galleryTree = buildGalleryTree(galleryData);
	await saveGalleryData({ cache, galleryData, galleryTree });

	console.log('Gallery generation complete.');
}

main().catch(console.error);

