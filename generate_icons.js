const fs = require('fs');
const sharp = require('sharp');

async function build() {
  console.log('Generating icons...');
  const svg = fs.readFileSync('public/logo.svg');
  
  // favicon sized png
  await sharp(svg).resize(64, 64).toFile('public/favicon.png');
  console.log('Created intermediate png for ico');
  
  // PWA sizes
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  if (!fs.existsSync('public/icons')) {
    fs.mkdirSync('public/icons', { recursive: true });
  }
  
  for (const s of sizes) {
    await sharp(svg).resize(s, s).toFile(`public/icons/icon-${s}x${s}.png`);
    console.log(`Generated icon-${s}x${s}.png`);
  }
  
  console.log('Icon generation complete!');
}

build().catch(e => {
  console.error(e);
  process.exit(1);
});
