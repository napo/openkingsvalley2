import fs from "node:fs";
import path from "node:path";

const ASM_PATH = "tools/original/kingsvalley2.asm";
const OUT_DIR = "public/assets/msx";

const OUT_JSON = path.join(OUT_DIR, "gfx.json");
const OUT_TILES_SVG = path.join(OUT_DIR, "tiles-preview.svg");
const OUT_SPRITES_SVG = path.join(OUT_DIR, "sprites-preview.svg");

const LABELS = [
  "GFX_InGame",
  "GFX_GEMA",
  "GFX_SPRITES2",
  "GFX_MOMIA",
  "GFX_Prota",
  "GFX_ProtaKnife",
  "GFX_ProtaPico",
];

const SPRITE_LABELS = new Set([
  "GFX_SPRITES2",
  "GFX_MOMIA",
  "GFX_Prota",
  "GFX_ProtaKnife",
  "GFX_ProtaPico",
]);

function parseNumber(token) {
  token = token.trim();

  if (!token) return null;

  if (token.startsWith("#")) {
    return parseInt(token.slice(1), 16);
  }

  if (/^[0-9A-Fa-f]+h$/.test(token)) {
    return parseInt(token.slice(0, -1), 16);
  }

  if (/^[01]+b$/.test(token)) {
    return parseInt(token.slice(0, -1), 2);
  }

  if (/^\d+$/.test(token)) {
    return parseInt(token, 10);
  }

  return null;
}

function stripComment(line) {
  return line.split(";")[0].trim();
}

function extractLabelBytes(source, label) {
  const lines = source.split(/\r?\n/);
  const bytes = [];
  let active = false;

  for (const rawLine of lines) {
    const line = stripComment(rawLine);
    if (!line) continue;

    const labelMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*):/);

    if (labelMatch) {
      const foundLabel = labelMatch[1];

      if (active && foundLabel !== label) {
        break;
      }

      active = foundLabel === label;
    }

    if (!active) continue;

    const dbIndex = line.indexOf("db");
    const dwIndex = line.indexOf("dw");

    if (dbIndex !== -1) {
      const body = line.slice(dbIndex + 2);
      const tokens = body.split(",");

      for (const token of tokens) {
        const n = parseNumber(token);
        if (n !== null) bytes.push(n & 0xff);
      }
    }

    if (dwIndex !== -1) {
      const body = line.slice(dwIndex + 2);
      const tokens = body.split(",");

      for (const token of tokens) {
        const n = parseNumber(token);

        if (n !== null) {
          bytes.push(n & 0xff);
          bytes.push((n >> 8) & 0xff);
        }
      }
    }
  }

  return bytes;
}

function unpackGfx(bytes, skipAddressWord = false) {
  let offset = skipAddressWord ? 2 : 0;
  const out = [];

  while (offset < bytes.length) {
    const control = bytes[offset++];
    const count = control & 0x7f;

    if (count === 0) {
      if (control === 0x00) {
        break;
      }

      // 0x80 = nuovo blocco con nuovo indirizzo VRAM.
      // Saltiamo i 2 byte di indirizzo.
      offset += 2;
      continue;
    }

    if ((control & 0x80) !== 0) {
      for (let i = 0; i < count; i++) {
        out.push(bytes[offset++] ?? 0);
      }
    } else {
      const value = bytes[offset++] ?? 0;

      for (let i = 0; i < count; i++) {
        out.push(value);
      }
    }
  }

  return out;
}

function bytesToTiles(patternBytes) {
  const tiles = [];

  for (let i = 0; i + 7 < patternBytes.length; i += 8) {
    tiles.push(patternBytes.slice(i, i + 8));
  }

  return tiles;
}

function tileToBits(tile) {
  return tile.map((rowByte) => {
    const row = [];

    for (let bit = 7; bit >= 0; bit--) {
      row.push((rowByte >> bit) & 1);
    }

    return row;
  });
}

function bytesToSprites16(patternBytes) {
  const sprites = [];

  for (let i = 0; i + 31 < patternBytes.length; i += 32) {
    const left = patternBytes.slice(i, i + 16);
    const right = patternBytes.slice(i + 16, i + 32);

    sprites.push({
      left,
      right,
    });
  }

  return sprites;
}

function sprite16ToBits(sprite) {
  const rows = [];

  for (let y = 0; y < 16; y++) {
    const row = [];

    const leftByte = sprite.left[y] ?? 0;
    const rightByte = sprite.right[y] ?? 0;

    for (let bit = 7; bit >= 0; bit--) {
      row.push((leftByte >> bit) & 1);
    }

    for (let bit = 7; bit >= 0; bit--) {
      row.push((rightByte >> bit) & 1);
    }

    rows.push(row);
  }

  return rows;
}

function makeTilesSvg(tileSets) {
  const tileSize = 8;
  const scale = 4;
  const gap = 2;
  const cols = 16;

  let svg = "";
  let yOffset = 0;

  for (const [label, tiles] of Object.entries(tileSets)) {
    svg += `<text x="0" y="${yOffset + 12}" fill="white" font-family="monospace" font-size="10">${label}</text>\n`;

    yOffset += 18;

    tiles.forEach((tile, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const baseX = col * (tileSize * scale + gap);
      const baseY = yOffset + row * (tileSize * scale + gap);

      svg += `<g>\n`;
      svg += `<rect x="${baseX}" y="${baseY}" width="${tileSize * scale}" height="${tileSize * scale}" fill="#111"/>\n`;

      const bits = tileToBits(tile);

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if (bits[y][x]) {
            svg += `<rect x="${baseX + x * scale}" y="${baseY + y * scale}" width="${scale}" height="${scale}" fill="#fff"/>\n`;
          }
        }
      }

      svg += `</g>\n`;
    });

    yOffset +=
      Math.ceil(tiles.length / cols) *
        (tileSize * scale + gap) +
      20;
  }

  const width = cols * (tileSize * scale + gap);
  const height = Math.max(100, yOffset + 20);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#000"/>
${svg}
</svg>`;
}

function makeSpriteSvg(spriteSets) {
  const spriteSize = 16;
  const scale = 3;
  const gap = 4;
  const cols = 12;

  let svg = "";
  let yOffset = 0;

  for (const [label, sprites] of Object.entries(spriteSets)) {
    svg += `<text x="0" y="${yOffset + 12}" fill="white" font-family="monospace" font-size="10">${label}</text>\n`;

    yOffset += 18;

    sprites.forEach((sprite, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const baseX = col * (spriteSize * scale + gap);
      const baseY = yOffset + row * (spriteSize * scale + gap);

      svg += `<g>\n`;
      svg += `<rect x="${baseX}" y="${baseY}" width="${spriteSize * scale}" height="${spriteSize * scale}" fill="#111"/>\n`;

      const bits = sprite16ToBits(sprite);

      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (bits[y][x]) {
            svg += `<rect x="${baseX + x * scale}" y="${baseY + y * scale}" width="${scale}" height="${scale}" fill="#fff"/>\n`;
          }
        }
      }

      svg += `</g>\n`;
    });

    yOffset +=
      Math.ceil(sprites.length / cols) *
        (spriteSize * scale + gap) +
      20;
  }

  const width = cols * (spriteSize * scale + gap);
  const height = Math.max(100, yOffset + 20);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#000"/>
${svg}
</svg>`;
}

function main() {
  if (!fs.existsSync(ASM_PATH)) {
    console.error(`Missing ${ASM_PATH}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, {
    recursive: true,
  });

  const source = fs.readFileSync(ASM_PATH, "utf8");

  const result = {};
  const tileSets = {};
  const spriteSets = {};

  for (const label of LABELS) {
    const raw = extractLabelBytes(source, label);

    if (raw.length === 0) {
      console.warn(`Label not found or empty: ${label}`);
      continue;
    }

    const isSpriteLabel = SPRITE_LABELS.has(label);
    const unpacked = unpackGfx(raw, isSpriteLabel);

    const tiles = bytesToTiles(unpacked);

    result[label] = {
      rawBytes: raw.length,
      unpackedBytes: unpacked.length,
      tiles,
    };

    tileSets[label] = tiles;

    if (isSpriteLabel) {
      spriteSets[label] = bytesToSprites16(unpacked);
      result[label].sprites16 = spriteSets[label];
    }
  }

  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify(result, null, 2)
  );

  fs.writeFileSync(
    OUT_TILES_SVG,
    makeTilesSvg(tileSets)
  );

  fs.writeFileSync(
    OUT_SPRITES_SVG,
    makeSpriteSvg(spriteSets)
  );

  console.log(`Wrote ${OUT_JSON}`);
  console.log(`Wrote ${OUT_TILES_SVG}`);
  console.log(`Wrote ${OUT_SPRITES_SVG}`);
}

main();
