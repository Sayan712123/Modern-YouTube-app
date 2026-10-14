import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function calculateCrc(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = Buffer.alloc(4 + len);
  typeAndData.write(type, 0, 4, 'ascii');
  data.copy(typeAndData, 4);
  buf.writeUInt32BE(calculateCrc(typeAndData), 8 + len);
  return buf;
}

function generatePng(width, height) {
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      // YouTube Red Background (#FF0000)
      let r = 255, g = 0, b = 0, a = 255;

      // Rounded rect margin check
      const cornerR = Math.floor(width * 0.22);
      let isInside = true;
      const dx = Math.min(x, width - 1 - x);
      const dy = Math.min(y, height - 1 - y);
      if (dx < cornerR && dy < cornerR) {
        const dist = Math.hypot(cornerR - dx, cornerR - dy);
        if (dist > cornerR) isInside = false;
      }

      if (!isInside) {
        r = 0; g = 0; b = 0; a = 0;
      } else {
        // White play triangle in center
        // Triangle from x: 0.38 to 0.68, y: 0.32 to 0.68
        const cx = width / 2;
        const cy = height / 2;
        const tLeft = width * 0.38;
        const tRight = width * 0.66;
        const tTop = height * 0.33;
        const tBottom = height * 0.67;

        if (x >= tLeft && x <= tRight) {
          const progress = (x - tLeft) / (tRight - tLeft);
          const allowedYSpan = ((tBottom - tTop) / 2) * (1 - progress);
          if (y >= cy - allowedYSpan && y <= cy + allowedYSpan) {
            r = 255; g = 255; b = 255; a = 255;
          }
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve('public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), generatePng(192, 192));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), generatePng(512, 512));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), generatePng(512, 512));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), generatePng(180, 180));

console.log('Successfully generated all PWA and Android WebAPK compliant PNG icons!');
