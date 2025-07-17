import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sizeOf from 'image-size';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');
const OUTPUT_JS = path.resolve(__dirname, '../docs/js/gallery-data.js');
const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'];
const RESPONSIVE_WIDTHS = [320, 640, 1024, 1920];

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
        const base_name = path.basename(file_name, path.extname(file_name));
        const rel_path_dir = path.dirname(path.relative(SRC_DIR, imgPath));

        let src_path_prefix;
        if (rel_path_dir === '.') {
            src_path_prefix = `webp/${base_name}`;
        } else {
            src_path_prefix = `webp/${rel_path_dir}/${base_name}`;
        }
        src_path_prefix = src_path_prefix.replace(/\\/g, '/');

        const srcset = RESPONSIVE_WIDTHS.map(width => `${src_path_prefix}_${width}w.webp ${width}w`).join(', ');
        
        const dimensions = getDimensions(imgPath);

        galleryData.push({
            type: 'file',
            name: file_name,
            thumbnail: `${src_path_prefix}_320w.webp`,
            srcset: srcset,
            full: `src/${path.relative(SRC_DIR, imgPath).replace(/\\/g, '/')}`,
            width: dimensions.width,
            height: dimensions.height,
            path: rel_path_dir === '.' ? '' : rel_path_dir,
        });
    }

    const outputContent = `export const galleryData = ${JSON.stringify(galleryData, null, 2)};`;
    await fs.writeFile(OUTPUT_JS, outputContent);

    console.log('Successfully generated flat gallery data.');
}

generateGalleryData().catch(console.error);
