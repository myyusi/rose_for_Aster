
"use strict";

// Change this to your chosen password.
const PASSWORD = "Astelix";

const W = 700;
const H = 700;
const DURATION = 10;
const TICK = 16;
const ANIM = 38;
const LIFT = 32;
const GAP = 3;
const BG = "#060208";

const PHRASES = [
  "Chubby Ass", "Chubby Cheeks", "Soft Muscle", "Squishy Biceps",
  "Pretty Face", "Tiny Menace", "Silly Girl", "Miss Drama",
  "Little Gremlin", "Big Baby", "Pookie", "Goofball",
  "Dumbass", "Dumpling", "melon", "Marshmallow",
  "Squishy", "Fluffy", "Hot", "Sleepyhead",
  "Drama Queen", "little", "Troublemaker", "flat",
  "Angry Bird", "Mami", "Crybaby", "Miss Attitude",
  "Cute Little Bully", "Bouncy Baby", "Squishy Baby", "Softie",
  "Jelly Arms", "Fluffy Cheeks", "Roundie"
];

const ACCENTS = [
  "Chubby Ass", "Chubby Cheeks", "Soft Muscle", "Squishy Biceps",
  "Pretty Face", "Tiny Menace", "Silly Girl", "Miss Drama",
  "Little Gremlin", "Big Baby", "Pookie", "Goofball",
  "Dumbass", "Dumpling", "melon", "Marshmallow",
  "Squishy", "Fluffy", "Hot", "Sleepyhead",
  "Drama Queen", "little", "Troublemaker", "flat",
  "Angry Bird", "Mami", "Crybaby", "Miss Attitude",
  "Cute Little Bully", "Bouncy Baby", "Squishy Baby", "Softie",
  "Jelly Arms", "Fluffy Cheeks", "Roundie"
];

const SHORT_PHRASES = [...PHRASES];

const HEAD_WORDS = PHRASES.concat([
  "CHUBBY ASS", "CHUBBY CHEEKS", "SOFT MUSCLE",
  "SQUISHY BICEPS", "PRETTY FACE", "LITTLE MENACE",
  "BIG BABY", "DRAMA QUEEN", "SILLY GOOSE",
  "POTATO", "POTATO", "GREMLIN", "GREMLIN",
  "SQUISHY BUNS", "FLUFFY CHEEKS", "MISS ATTITUDE",
  "TINY TERROR", "CUTE BUT ANNOYING",
  "ANNOYING BUT CUTE", "STOP BEING CUTE",
  "THE AUDACITY", "MY FAVORITE HEADACHE",
  "PROFESSIONAL ANNOYER", "WORLD'S BIGGEST BABY",
  "MISS ALWAYS RIGHT", "GRUMPY BEAR", "ANGRY BIRD",
  "CERTIFIED YAPSTER", "LITTLE BRAT", "MY LITTLE GREMLIN",
  "SQUISHY BABY", "POCKET-SIZED MENACE",
  "UNNECESSARILY ADORABLE", "MY FAVORITE WEIRDO",
  "PRETTY MENACE", "FLUFFY MENACE", "TINY DINOSAUR",
  "MISS I-AM-NOT-CUTE", "MY PERSONAL NUISANCE",
  "CUTE LITTLE BULLY", "SILLY GIRL", "YOU LITTLE WEIRDO",
  "MY LITTLE HEADACHE", "MY FAVORITE PROBLEM"
]);

const HEAD_SIZES = [7, 8, 9, 10, 11, 12, 13, 14];
const HEAD_WEIGHTS = [2, 4, 5, 5, 4, 2, 1, 0.5];

const HEAD_SHAPES = [
  ellipse(400, 180, 145, 90),
  ellipse(330, 180, 120, 83),
  ellipse(470, 180, 120, 83),
  ellipse(275, 260, 98, 112),
  ellipse(525, 260, 98, 112),
  ellipse(338, 325, 118, 126),
  ellipse(462, 325, 118, 126),
  [
    [230,330], [290,365], [348,414], [400,532],
    [452,414], [510,365], [570,330], [522,452],
    [400,542], [278,452]
  ]
];

const STEM = [
  [378,493], [422,493], [427,752],
  [408,772], [390,760], [374,600]
];

const LEFT_LEAF = [
  [395,594], [359,554], [304,535], [244,541],
  [215,562], [253,609], [321,631], [374,617]
];

const RIGHT_LEAF = [
  [406,619], [442,581], [491,561], [553,578],
  [578,600], [535,640], [476,660], [425,649]
];

const canvas = document.getElementById("rose");
const ctx = canvas.getContext("2d");

let words = [];
let animationFrame = null;
let startTime = 0;
let revealDuration = 10000;
let seed = 17;

function random() {
  // Deterministic random sequence, like the original SEED.
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function pick(array) {
  return array[Math.floor(random() * array.length)];
}

function ellipse(cx, cy, rx, ry, points = 160) {
  return Array.from({ length: points }, (_, i) => {
    const angle = 2 * Math.PI * i / points;
    return [
      cx + rx * Math.cos(angle),
      cy + ry * Math.sin(angle)
    ];
  });
}

function spansForPolygon(poly, y) {
  const xs = [];

  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];

    if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
      xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
  }

  xs.sort((a, b) => a - b);
  const spans = [];

  for (let i = 0; i + 1 < xs.length; i += 2) {
    spans.push([xs[i], xs[i + 1]]);
  }

  return spans;
}

function mergeSpans(spans) {
  spans.sort((a, b) => a[0] - b[0]);
  const result = [];

  for (const span of spans) {
    const last = result[result.length - 1];

    if (last && span[0] <= last[1] + 1) {
      last[1] = Math.max(last[1], span[1]);
    } else {
      result.push([...span]);
    }
  }

  return result;
}

function shapeSpans(polygons, y) {
  return mergeSpans(polygons.flatMap(poly => spansForPolygon(poly, y)));
}

function intersectSpans(a, b, minimum) {
  const result = [];

  for (const [a1, a2] of a) {
    for (const [b1, b2] of b) {
      const lo = Math.max(a1, b1);
      const hi = Math.min(a2, b2);

      if (hi - lo >= minimum) result.push([lo, hi]);
    }
  }

  return mergeSpans(result);
}

function roseColor(x, y, size, edge) {
  const dx = (x - 400) / 210;
  const dy = (y - 300) / 220;
  const radius = Math.sqrt(dx * dx + dy * dy);

  let palette;

  if (radius > 0.82) {
    palette = ["#8f0b2b", "#ae1238", "#c41d48", "#d52b53"];
  } else if (radius > 0.48) {
    palette = ["#b9143d", "#d21e49", "#e33b60", "#f04e73"];
  } else {
    palette = ["#c51b49", "#e83c68", "#f16b8b", "#ff91a9"];
  }

  if (edge) palette.push("#f5a0b3", "#ef6488");
  if (size >= 14) palette.push("#ff9ab1", "#ffd0dc");

  return pick(palette);
}

function greenColor(size) {
  const palette = [
    "#3e8034", "#559c3c", "#72b84b",
    "#91cf62", "#b1e184"
  ];

  if (size >= 9) palette.push("#a7d486", "#c0e19a");
  return pick(palette);
}

function makeFont(size) {
  return `bold ${size}px Georgia, "Times New Roman", Arial, sans-serif`;
}

function buildRegion(polygons, yStart, yEnd, rowHeight, kind) {
  const placed = [];
  const half = rowHeight / 2;

  for (let y = yStart + half; y < yEnd - half; y += rowHeight) {
    const top = shapeSpans(polygons, y - half + 1);
    const bottom = shapeSpans(polygons, y + half - 1);
    const row = intersectSpans(
      top, bottom, kind === "head" ? 19 : 16
    );

    for (const [left, right] of row) {
      const margin = kind === "head" ? 3 : 1;
      const lo = left + margin;
      const hi = right - margin;
      const available = hi - lo;

      if (available < 18) continue;

      let x = lo + random() * 2;
      const line = [];

      while (x < hi - 15) {
        const remaining = hi - x;
        const size = kind === "head"
          ? pickWeighted(HEAD_SIZES, HEAD_WEIGHTS)
          : pick(kind === "stem" ? [6, 7, 8] : [7, 8, 9, 10]);

        const pool = size >= 14
          ? ACCENTS
          : (kind === "head" ? HEAD_WORDS : SHORT_PHRASES);

        const text = pick(pool);
        ctx.font = makeFont(size);
        const width = ctx.measureText(text).width;

        if (width > remaining || width < Math.min(18, remaining * 0.20)) {
          if (remaining < 85) break;
          x += 2;
          continue;
        }

        line.push({
          x: x + width / 2,
          y,
          text,
          size,
          width,
          kind,
          edge: false,
          color: kind === "head"
            ? roseColor(x, y, size, false)
            : greenColor(size)
        });

        x += width + (kind === "head" ? GAP : 1);
      }

      if (!line.length) continue;

      const used = line.reduce((sum, item) => sum + item.width, 0)
        + Math.max(0, line.length - 1) * (kind === "head" ? GAP : 1);
      const slack = Math.max(0, available - used);
      const extra = line.length > 1 ? slack / (line.length - 1) : 0;

      line.forEach((item, i) => {
        item.x += extra * i;
        item.edge = i === 0 || i === line.length - 1;

        if (kind === "head") {
          item.color = roseColor(item.x, item.y, item.size, item.edge);
        }

        placed.push(item);
      });
    }
  }

  return placed;
}

function pickWeighted(values, weights) {
  let n = random() * weights.reduce((a, b) => a + b, 0);

  for (let i = 0; i < values.length; i++) {
    n -= weights[i];
    if (n <= 0) return values[i];
  }

  return values[0];
}

function buildRose() {
  seed = 17;
  words = [];

  const headRow = 14;
  const leafRow = 12;
  const stemRow = 11;

  words.push(...buildRegion(HEAD_SHAPES, 88, 540, headRow, "head"));
  words.push(...buildRegion([LEFT_LEAF], 543, 618, leafRow, "leaf"));
  words.push(...buildRegion([RIGHT_LEAF], 575, 651, leafRow, "leaf"));
  words.push(...buildRegion([STEM], 492, 773, stemRow, "stem"));

  const outer = words.filter(word => word.edge);
  const inner = words.filter(word => !word.edge);

  outer.sort((a, b) =>
    Math.atan2(a.y - 300, a.x - 400) -
    Math.atan2(b.y - 300, b.x - 400)
  );

  for (let i = inner.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [inner[i], inner[j]] = [inner[j], inner[i]];
  }

  words = outer.concat(inner).map(word => ({
    ...word,
    dx: (random() * 12) - 6,
    phase: random() * Math.PI * 2
  }));
}

function drawWord(word, progress, now) {
  const u = Math.max(0, Math.min(1, progress));
  const eased = 1 - Math.pow(1 - u, 3);
  const x = word.x + word.dx * (1 - eased);
  const y = word.y - LIFT * (1 - eased);

  ctx.font = makeFont(word.size);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = BG;
  ctx.fillText(word.text, x + 1, y + 2);

  ctx.globalAlpha = 0.35 * eased;
  ctx.fillStyle = word.color;
  ctx.fillText(word.text, x, y);
  ctx.globalAlpha = 1;

  let color = word.color;

  if (u < 1) {
    const fade = eased;
    ctx.globalAlpha = fade;
  } else {
    // A gentle individual-word shimmer after the rose blooms.
    const shimmer = Math.max(
      0,
      Math.sin(now / 650 + word.phase)
    ) * 0.20;

    if (shimmer > 0.05) {
      color = blendColor(word.color, "#ffd0dc", shimmer);
    }
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = color;
  ctx.fillText(word.text, x, y);
  ctx.globalAlpha = 1;
}

function blendColor(a, b, amount) {
  const parse = hex => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];

  const aa = parse(a);
  const bb = parse(b);

  return "#" + aa.map((v, i) =>
    Math.round(v + (bb[i] - v) * amount)
      .toString(16).padStart(2, "0")
  ).join("");
}

function frame(now) {
  ctx.clearRect(0, 0, W, H);

  const elapsed = now - startTime;
  const total = Math.max(1, words.length);
  const interval = revealDuration / total;

  words.forEach((word, index) => {
    const localProgress = (elapsed - index * interval) / (ANIM * TICK);
    if (localProgress >= 0) {
      drawWord(word, Math.min(1, localProgress), now);
    }
  });

  if (elapsed < revealDuration + ANIM * TICK) {
    animationFrame = requestAnimationFrame(frame);
  } else {
    animationFrame = null;
  }
}

function startRose() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
  }

  buildRose();
  startTime = performance.now();
  animationFrame = requestAnimationFrame(frame);
}

document.getElementById("password-form").addEventListener("submit", event => {
  event.preventDefault();

  const entered = document.getElementById("password").value;
  const error = document.getElementById("error");

  if (entered !== PASSWORD) {
    error.textContent = "Wrong password, silly. Try again. 🌸";
    document.getElementById("password").select();
    return;
  }

  document.getElementById("gate").hidden = true;
  document.getElementById("garden").hidden = false;
  startRose();
});

document.getElementById("replay").addEventListener("click", startRose);
