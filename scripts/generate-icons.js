const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  console.log('🎨 Генерация иконок...');
  
  try {
    // Генерируем 96x96 PNG
    const svg96 = fs.readFileSync(path.join(publicDir, 'icon-96.svg'));
    await sharp(svg96)
      .png()
      .resize(96, 96)
      .toFile(path.join(publicDir, 'icon-96.png'));
    console.log('✅ icon-96.png создана');
    
    // Генерируем 144x144 PNG
    const svg144 = fs.readFileSync(path.join(publicDir, 'icon-144.svg'));
    await sharp(svg144)
      .png()
      .resize(144, 144)
      .toFile(path.join(publicDir, 'icon-144.png'));
    console.log('✅ icon-144.png создана');
    
    // Генерируем 192x192 PNG
    const svg192 = fs.readFileSync(path.join(publicDir, 'icon-192.svg'));
    await sharp(svg192)
      .png()
      .resize(192, 192)
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ icon-192.png создана');
    
    // Генерируем 512x512 PNG
    const svg512 = fs.readFileSync(path.join(publicDir, 'icon-512.svg'));
    await sharp(svg512)
      .png()
      .resize(512, 512)
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ icon-512.png создана');
    
    console.log('\n🎉 Все иконки успешно сгенерированы!');
  } catch (error) {
    console.error('❌ Ошибка генерации иконок:', error);
    process.exit(1);
  }
}

generateIcons();
