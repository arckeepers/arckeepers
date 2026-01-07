/**
 * PWA Icon Generator
 * 
 * This script generates PWA icons from the arc.svg file.
 * Run with: npx tsx scripts/generate-icons.ts
 * 
 * Note: This creates simple colored placeholder icons.
 * For production, consider using a proper image tool to convert the SVG.
 */

import * as fs from 'fs';
import * as path from 'path';

// Simple PNG generator using raw bytes
// Creates a solid colored square with "AK" text simulation
function createSimplePNG(size: number): Buffer {
  // PNG header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // Length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(size, 8); // Width
  ihdr.writeUInt32BE(size, 12); // Height
  ihdr.writeUInt8(8, 16); // Bit depth
  ihdr.writeUInt8(2, 17); // Color type (RGB)
  ihdr.writeUInt8(0, 18); // Compression
  ihdr.writeUInt8(0, 19); // Filter
  ihdr.writeUInt8(0, 20); // Interlace
  
  // Calculate CRC for IHDR
  const ihdrData = ihdr.subarray(4, 21);
  const ihdrCrc = crc32(ihdrData);
  ihdr.writeUInt32BE(ihdrCrc, 21);
  
  // Create image data - simple gradient with accent color
  // Theme: #1e293b (slate-800) background with #3b82f6 (blue-500) accent
  const rawData: number[] = [];
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  
  for (let y = 0; y < size; y++) {
    rawData.push(0); // Filter byte for each row
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < radius) {
        // Blue circle (accent color #3b82f6)
        rawData.push(0x3b, 0x82, 0xf6);
      } else {
        // Slate background (#1e293b)
        rawData.push(0x1e, 0x29, 0x3b);
      }
    }
  }
  
  // Compress with deflate (using simple zlib-like compression)
  const compressed = deflateSimple(Buffer.from(rawData));
  
  // IDAT chunk
  const idatLength = compressed.length;
  const idat = Buffer.alloc(idatLength + 12);
  idat.writeUInt32BE(idatLength, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  idat.writeUInt32BE(idatCrc, idatLength + 8);
  
  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Simple CRC32 implementation
function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  const table = makeCrcTable();
  
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  
  return (crc ^ 0xffffffff) >>> 0;
}

function makeCrcTable(): number[] {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

// Very simple deflate - stores data uncompressed
// For real compression, use zlib, but this works for basic PNG
function deflateSimple(data: Buffer): Buffer {
  const chunks: Buffer[] = [];
  
  // Zlib header
  chunks.push(Buffer.from([0x78, 0x01])); // CMF, FLG
  
  let offset = 0;
  while (offset < data.length) {
    const remaining = data.length - offset;
    const chunkSize = Math.min(remaining, 65535);
    const isLast = offset + chunkSize >= data.length;
    
    // Block header
    const header = Buffer.alloc(5);
    header.writeUInt8(isLast ? 1 : 0, 0); // BFINAL + BTYPE=00 (stored)
    header.writeUInt16LE(chunkSize, 1);
    header.writeUInt16LE(chunkSize ^ 0xffff, 3);
    chunks.push(header);
    
    // Block data
    chunks.push(data.subarray(offset, offset + chunkSize));
    offset += chunkSize;
  }
  
  // Adler-32 checksum
  let a = 1, b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE((b << 16) | a, 0);
  chunks.push(adler);
  
  return Buffer.concat(chunks);
}

// Generate icons
const publicDir = path.join(process.cwd(), 'public');

console.log('Generating PWA icons...');

const png192 = createSimplePNG(192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('✓ Created pwa-192x192.png');

const png512 = createSimplePNG(512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('✓ Created pwa-512x512.png');

console.log('\nDone! For better quality icons, consider using a tool like:');
console.log('  - https://realfavicongenerator.net/');
console.log('  - Figma/Sketch export');
console.log('  - ImageMagick: convert arc.svg -resize 512x512 pwa-512x512.png');
