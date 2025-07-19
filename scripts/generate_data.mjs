import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sizeOf from 'image-size';
import { execSync } from 'child_process';
import nearestColor from 'nearest-color';

// Basic color names and their hex values
const colorMap = {
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    purple: '#800080',
    orange: '#ffa500',
    pink: '#ffc0cb',
    brown: '#a52a2a',
    black: '#000000',
    white: '#ffffff',
    gray: '#808080',
};

const getColorName = nearestColor.from(colorMap);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../wallpapers');
const OUTPUT_JS = path.resolve(__dirname, '../src/js/gallery-data.js');
const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'];
const RESPONSIVE_WIDTHS = [640, 1920];
const LQIP_DIR = path.resolve(__dirname, '../public/lqip'); // New: LQIP directory

async function findFiles(dir) {
    let files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(await findFiles(fullPath));
        } else if (IMG_EXTENSIONS.includes(path.extname(item.name).toLowerCase())) {
            files.push(fullPath);
        }
    }
    return files;
}

function getDimensions(filePath) {
    try {
        const dimensions = sizeOf(filePath);
        return { width: dimensions.width, height: dimensions.height };
    } catch (e) {
        console.error(`Error getting dimensions for ${filePath}:`, e);
        return { width: 1920, height: 1080 }; // Fallback
    }
}

async function generateGalleryData() {
    console.log('Generating gallery data file:', OUTPUT_JS);

    const allImages = await findFiles(SRC_DIR);
    const galleryData = [];

    for (const imgPath of allImages) {
        const file_name = path.basename(imgPath);
        const rel_path = path.relative(SRC_DIR, imgPath);
        const rel_path_dir = path.dirname(rel_path);

        if (path.extname(file_name).toLowerCase() === '.gif') {
            const dimensions = getDimensions(imgPath);
            const stats = await fs.stat(imgPath);
            galleryData.push({
                type: 'file',
                name: file_name,
                thumbnail: `src/${rel_path.replace(/\\/g, '/')}`, // point to original gif
                srcset: '', // no srcset for gifs
                full: `src/${rel_path.replace(/\\/g, '/')}`,
                width: dimensions.width,
                height: dimensions.height,
                path: rel_path_dir === '.' ? '' : rel_path_dir,
                mtime: stats.mtimeMs,
                dominantColor: '', // No dominant color for GIFs
                colorName: '', // No color name for GIFs
            });
        } else {
            const base_name = path.basename(file_name, path.extname(file_name));
            let src_path_prefix;
            let lqip_path_prefix;
            if (rel_path_dir === '.') {
                src_path_prefix = `webp/${base_name}`;
                lqip_path_prefix = `lqip/${base_name}`;
            } else {
                src_path_prefix = `webp/${rel_path_dir}/${base_name}`;
                lqip_path_prefix = `lqip/${rel_path_dir}/${base_name}`;
            }
            src_path_prefix = src_path_prefix.replace(/\\/g, '/');
            lqip_path_prefix = lqip_path_prefix.replace(/\\/g, '/');

            const srcset = RESPONSIVE_WIDTHS.map(width => `${src_path_prefix}_${width}w.webp ${width}w`).join(', ');
            
            const dimensions = getDimensions(imgPath);
            const stats = await fs.stat(imgPath);

            // Get dominant color using ImageMagick
            let dominantColor = '#000000'; // Default color
            let colorName = 'black'; // Default color name
            try {
                const colorCmd = `magick "${imgPath}" -resize 1x1 -format "#%[hex:p{0,0}]" info:-`;
                const hexWithAlpha = execSync(colorCmd).toString().trim();
                dominantColor = hexWithAlpha.slice(0, 7); // Remove alpha channel
                colorName = getColorName(dominantColor).name;
            } catch (e) {
                console.error(`Could not get dominant color for ${imgPath}:`, e.message);
            }

            galleryData.push({
                type: 'file',
                name: file_name,
                thumbnail: `${src_path_prefix}_640w.webp`,
                srcset: srcset,
                full: `src/${rel_path.replace(/\\/g, '/')}`,
                lqip: `${lqip_path_prefix}_lqip.webp`, // New: LQIP path
                width: dimensions.width,
                height: dimensions.height,
                path: rel_path_dir === '.' ? '' : rel_path_dir,
                mtime: stats.mtimeMs,
                dominantColor,
                colorName,
            });
        }
    }

    const outputContent = `export const galleryData = ${JSON.stringify(galleryData, null, 2)};`;
    await fs.writeFile(OUTPUT_JS, outputContent);

    console.log('Successfully generated flat gallery data.');
}

generateGalleryData().catch(console.error);
