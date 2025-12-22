#!/usr/bin/env node

/**
 * Script to generate PWA icons from existing assets
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ sharp is not installed. Installing...');
  console.error('Please run: npm install sharp --save-dev');
  process.exit(1);
}

const iconsDir = path.join(process.cwd(), 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG buffer for icon
const createSVGBuffer = (size) => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">AD</text>
</svg>`;
  return Buffer.from(svg);
};

console.log('🎨 Generating PWA icons...');

// Icon sizes to generate
const sizes = [
  { size: 192, filename: 'icon-192x192.png' },
  { size: 512, filename: 'icon-512x512.png' },
  { size: 180, filename: 'apple-touch-icon.png' },
];

// Generate PNG icons from SVG
async function generateIcons() {
  for (const { size, filename } of sizes) {
    try {
      const svgBuffer = createSVGBuffer(size);
      const pngBuffer = await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer();
      
      const iconPath = path.join(iconsDir, filename);
      fs.writeFileSync(iconPath, pngBuffer);
      console.log(`✓ Created ${iconPath} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error creating ${filename}:`, error.message);
    }
  }
  
  console.log('\n✅ All icons generated successfully!');
  console.log('📝 Note: For production, consider replacing these with professionally designed icons.');
}

generateIcons().catch(console.error);

