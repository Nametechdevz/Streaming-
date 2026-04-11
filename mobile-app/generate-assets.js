/**
 * generate-assets.js
 * Generates placeholder PNG assets required for the Expo APK build.
 * Run: node generate-assets.js
 *
 * Produces:
 *   assets/icon.png          (1024x1024) – app icon
 *   assets/adaptive-icon.png (1024x1024) – Android adaptive icon foreground
 *   assets/splash.png        (1284x2778) – splash screen
 *   assets/favicon.png       (48x48)     – web favicon
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR);

// ---------------------------------------------------------------------------
// Minimal PNG encoder (no external deps)
// ---------------------------------------------------------------------------
const zlib = require('zlib');

function writePNG(width, height, fillFn) {
  // Build raw pixel data (RGBA)
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(width * 4);
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = fillFn(x, y, width, height);
      row[x * 4 + 0] = r;
      row[x * 4 + 1] = g;
      row[x * 4 + 2] = b;
      row[x * 4 + 3] = a;
    }
    rows.push(row);
  }

  // Filter type 0 (None) per row
  const rawData = Buffer.concat(
    rows.map(r => Buffer.concat([Buffer.from([0]), r]))
  );

  const compressed = zlib.deflateSync(rawData, { level: 9 });

  function crc32(buf) {
    const table = (() => {
      const t = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c;
      }
      return t;
    })();
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcBuf = Buffer.concat([t, data]);
    const crcVal = Buffer.alloc(4); crcVal.writeUInt32BE(crc32(crcBuf));
    return Buffer.concat([len, t, data, crcVal]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// ---------------------------------------------------------------------------
// Pixel fill functions
// ---------------------------------------------------------------------------

/** Background: #0a0a0f  Accent circle: #e50914 */
function iconFill(x, y, w, h) {
  const bg = [10, 10, 15, 255];
  const accent = [229, 9, 20, 255];

  const cx = w / 2, cy = h / 2;
  const r = w * 0.38;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

  // Rounded-square mask (superellipse r=10)
  const padding = w * 0.08;
  const rx = Math.abs(x - cx) - (w / 2 - padding);
  const ry = Math.abs(y - cy) - (h / 2 - padding);
  const outside = Math.max(rx, 0) ** 2 + Math.max(ry, 0) ** 2 > (w * 0.04) ** 2;
  if (outside) return [0, 0, 0, 0]; // transparent outside rounded rect

  if (dist < r) return accent;  // red circle
  return bg;
}

/** Splash: full dark background with centered accent rectangle */
function splashFill(x, y, w, h) {
  const bg = [10, 10, 15, 255];
  const accent = [229, 9, 20, 255];

  const cx = w / 2, cy = h / 2;
  const rw = w * 0.18, rh = h * 0.09;
  const inRect =
    x >= cx - rw && x <= cx + rw &&
    y >= cy - rh && y <= cy + rh;

  return inRect ? accent : bg;
}

/** Favicon: small red square */
function faviconFill(x, y, w, h) {
  return [229, 9, 20, 255];
}

// ---------------------------------------------------------------------------
// Generate files
// ---------------------------------------------------------------------------
const assets = [
  { file: 'icon.png',          w: 1024, h: 1024, fn: iconFill },
  { file: 'adaptive-icon.png', w: 1024, h: 1024, fn: iconFill },
  { file: 'splash.png',        w: 1284, h: 2778, fn: splashFill },
  { file: 'favicon.png',       w: 48,   h: 48,   fn: faviconFill }
];

for (const { file, w, h, fn } of assets) {
  const outPath = path.join(ASSETS_DIR, file);
  const buf = writePNG(w, h, fn);
  fs.writeFileSync(outPath, buf);
  console.log(`✓ Created assets/${file}  (${w}x${h}, ${buf.length} bytes)`);
}

console.log('\nAll assets generated in ./assets/');
