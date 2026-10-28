// Flying-kite effect for the INDIA TOUR logo.
//
// Each press launches a traditional Indian patang from the press point. Kites live in one
// fixed, click-through layer on <body>, so they keep flying while the router changes pages
// (clicking the logo navigates home). Every kite gets its own randomised flight path, sampled
// into a Web Animations keyframe list lasting exactly 3 s; CSS keyframes add the wind sway and
// fluttering tails. Each kite removes itself when its flight ends. There is deliberately no
// debounce or cooldown: every press launches its own kite.

const FLIGHT_MS = 3000;
const MAX_KITES = 60; // safety cap on simultaneous kites (oldest are dropped, never new ones)
const SVG_NS = "http://www.w3.org/2000/svg";

const PALETTE = {
  saffron: "#F07F14",
  emerald: "#0B8A5F",
  sky: "#29A8E0",
  yellow: "#FFC93C",
  pink: "#F2558C",
  purple: "#8B5CF6",
};
const NAMES = Object.keys(PALETTE);

let layer = null;
let launchCount = 0;

function getLayer() {
  if (layer && layer.isConnected) return layer;
  layer = document.createElement("div");
  layer.className = "kite-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);
  return layer;
}

const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/** Four colours from the palette; successive kites step through 12 distinct arrangements. */
function pickColors() {
  const start = launchCount % NAMES.length;
  const order = [...NAMES.slice(start), ...NAMES.slice(0, start)];
  if (Math.floor(launchCount / NAMES.length) % 2) order.reverse();
  return order.slice(0, 4).map((n) => PALETTE[n]);
}

/** Traditional diamond patang: four panels, centre diamond, bow and spine, tail piece, ribbons, string. */
function kiteSvg([c1, c2, c3, c4], dir) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 60 92");
  svg.setAttribute("class", "kite-svg");
  // The string trails back towards where the kite came from.
  const s = dir > 0 ? -1 : 1;
  svg.innerHTML = `
    <path class="kite-string" d="M30 34 C ${30 + s * 10} 70, ${30 + s * 40} 96, ${30 + s * 110} 150" />
    <g class="kite-tails">
      <path d="M30 66 c -7 7, 5 13, -3 22 s 4 10, -2 16" stroke="${c3}" />
      <path d="M30 66 c 7 7, -5 13, 3 22 s -4 10, 2 16" stroke="${c1}" />
    </g>
    <polygon points="30,57 23,67 37,67" fill="${c4}" />
    <polygon points="30,2 56,30 30,58 4,30" fill="${c1}" />
    <polygon points="30,2 56,30 30,30" fill="${c2}" />
    <polygon points="30,58 4,30 30,30" fill="${c2}" />
    <polygon points="30,15 43,30 30,45 17,30" fill="${c3}" />
    <circle cx="30" cy="30" r="3.6" fill="${c4}" />
    <path d="M4 30 Q30 13 56 30" class="kite-bow" />
    <line x1="30" y1="2" x2="30" y2="58" class="kite-spine" />
    <polygon points="30,2 56,30 30,58 4,30" class="kite-edge" />`;
  return svg;
}

/** Bezier point. */
function cubic(p0, p1, p2, p3, t) {
  const m = 1 - t;
  return [
    m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
    m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
  ];
}

/**
 * A wind-blown flight from (x, y): the kite dips into view, then climbs diagonally across the
 * viewport. All control points lie inside the viewport, so the whole curve does too.
 */
function flightKeyframes(x, y, size) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const m = size * 0.75; // margin keeping the kite fully on screen
  const dir = x < W * 0.6 ? 1 : -1; // fly towards the side with more room
  const across = (frac) => clamp(dir > 0 ? W * frac : W * (1 - frac), m, W - m);

  const p0 = [x, y];
  const p1 = [clamp(x + dir * rand(60, 180), m, W - m), clamp(y + rand(0.28, 0.5) * H, m, H - m)]; // caught by the wind: swoop into view
  const p2 = [across(rand(0.42, 0.62)), clamp(rand(0.42, 0.72) * H, m, H - m)];
  const p3 = [across(rand(0.74, 0.92)), clamp(rand(0.1, 0.28) * H, m, H - m)]; // climb diagonally upward
  const gust = rand(8, 16); // side-to-side wind wobble
  const gustFreq = rand(2.2, 3.4);
  const phase = rand(0, Math.PI * 2);

  const frames = [];
  const N = 48;
  let prev = p0;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const t = 1 - Math.pow(1 - u, 1.35); // brisk launch, then a gliding finish
    let [px, py] = cubic(p0, p1, p2, p3, t);
    px += Math.sin(u * Math.PI * 2 * gustFreq + phase) * gust * Math.min(1, u * 4);
    py += Math.cos(u * Math.PI * 2 * gustFreq * 0.8 + phase) * gust * 0.5 * Math.min(1, u * 4);
    // lean into the direction of travel, like a kite pulling on its string
    const lean = clamp((px - prev[0]) * 1.6, -24, 24) + Math.sin(u * 9 + phase) * 4;
    const scale = u < 0.12 ? 0.45 + (u / 0.12) * 0.55 : 1 + Math.sin(u * Math.PI) * 0.08;
    // visible from the very first frame; fades out smoothly over the last ~0.55 s
    const opacity = u < 0.03 ? 0.55 + (u / 0.03) * 0.45 : u > 0.82 ? Math.max(0, (1 - u) / 0.18) : 1;
    frames.push({
      offset: u,
      opacity: +opacity.toFixed(3),
      transform: `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -38%) rotate(${lean.toFixed(1)}deg) scale(${scale.toFixed(3)})`,
    });
    prev = [px, py];
  }
  return { frames, dir };
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Launches a kite from viewport coordinates (x, y). */
export function launchKite(x, y) {
  const host = getLayer();
  while (host.childElementCount >= MAX_KITES) host.firstElementChild.remove();
  launchCount++;

  const size = window.innerWidth < 640 ? 50 : 66;
  const kite = document.createElement("div");
  kite.className = "kite";
  kite.style.setProperty("--kite-size", `${size}px`);
  kite.style.setProperty("--sway-ms", `${Math.round(rand(900, 1300))}ms`);
  kite.style.setProperty("--flutter-ms", `${Math.round(rand(320, 460))}ms`);

  const reduced = prefersReducedMotion();
  const { frames, dir } = reduced ? { frames: null, dir: 1 } : flightKeyframes(x, y, size);
  const sway = document.createElement("div");
  sway.className = "kite-sway";
  sway.appendChild(kiteSvg(pickColors(), dir));
  kite.appendChild(sway);
  host.appendChild(kite);

  const remove = () => kite.remove();
  let animation;
  if (reduced) {
    // No travel: the kite simply appears beside the logo and fades away.
    kite.classList.add("kite--still");
    animation = kite.animate(
      [
        { opacity: 0, transform: `translate(${x}px, ${y + 34}px) translate(-50%, -38%)` },
        { opacity: 1, offset: 0.15 },
        { opacity: 1, offset: 0.7 },
        { opacity: 0, transform: `translate(${x}px, ${y + 34}px) translate(-50%, -38%)` },
      ],
      { duration: 1200, fill: "both" }
    );
  } else {
    animation = kite.animate(frames, { duration: FLIGHT_MS, easing: "linear", fill: "both" });
  }
  animation.onfinish = remove;
  setTimeout(remove, (reduced ? 1200 : FLIGHT_MS) + 400); // fallback if the animation never finishes (e.g. tab hidden)
}

/** Launches a kite from the centre of an element (used for keyboard activation). */
export function launchKiteFrom(el) {
  const r = el.getBoundingClientRect();
  launchKite(r.left + r.width / 2, r.top + r.height / 2);
}

/**
 * Props to spread onto the logo's link. Pointer presses launch instantly at the press point;
 * keyboard activation (a click with no pointer, detail === 0) launches from the logo's centre.
 * Navigation is untouched: nothing calls preventDefault.
 */
export const kiteLaunchHandlers = {
  onPointerDown(e) {
    if (e.button === 0 || e.pointerType !== "mouse") launchKite(e.clientX, e.clientY);
  },
  onClick(e) {
    if (e.detail === 0) launchKiteFrom(e.currentTarget);
  },
};
