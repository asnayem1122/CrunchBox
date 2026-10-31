import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targets = [
  {
    svg: 'assets/brand/logo-mark.svg',
    png: 'assets/images/icon.png',
    width: 1024,
    height: 1024,
  },
  {
    svg: 'assets/brand/adaptive-foreground.svg',
    png: 'assets/images/adaptive-icon.png',
    width: 1024,
    height: 1024,
  },
  {
    svg: 'assets/brand/adaptive-background.svg',
    png: 'assets/images/adaptive-bg.png',
    width: 1024,
    height: 1024,
  },
  {
    svg: 'assets/brand/logo-monochrome.svg',
    png: 'assets/images/monochrome-icon.png',
    width: 1024,
    height: 1024,
  },
  {
    svg: 'assets/brand/logo-mark.svg',
    png: 'assets/images/splash-icon.png',
    width: 1024,
    height: 1024,
  },
  {
    svg: 'assets/brand/logo-mark.svg',
    png: 'assets/images/favicon.png',
    width: 192,
    height: 192,
  },
  {
    svg: 'assets/brand/logo-mark.svg',
    png: 'assets/store/play-store-icon.png',
    width: 512,
    height: 512,
  },
  {
    svg: 'assets/brand/feature-graphic.svg',
    png: 'assets/store/feature-graphic.png',
    width: 1024,
    height: 500,
  },
  {
    svg: 'assets/brand/logo-wordmark.svg',
    png: 'assets/images/wordmark.png',
    width: 1600,
    height: 480,
  },
];

console.log('--- Generating CrunchBox Brand PNG Assets via @resvg/resvg-js ---');

for (const target of targets) {
  const svgPath = path.join(rootDir, target.svg);
  const pngPath = path.join(rootDir, target.png);

  if (!fs.existsSync(svgPath)) {
    console.error(`SVG source not found: ${svgPath}`);
    process.exit(1);
  }

  const svgContent = fs.readFileSync(svgPath, 'utf-8');
  const resvg = new Resvg(svgContent, {
    fitTo: {
      mode: 'width',
      value: target.width,
    },
    shapeRendering: 2, // geometricPrecision
    textRendering: 1, // optimizeLegibility
    imageRendering: 0, // optimizeQuality
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outDir = path.dirname(pngPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`[OK] Rendered ${target.svg} -> ${target.png} (${target.width}x${target.height}, ${pngBuffer.length} bytes)`);
}

console.log('All brand PNG assets generated successfully!');
