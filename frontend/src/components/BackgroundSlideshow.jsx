import { memo, useCallback, useEffect, useState } from "react";

export const DISPLAY_MS = 5000; // how long each photo is fully visible
export const FADE_MS = 1200; // crossfade duration (keep in sync with --hero-fade in CSS)

function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function usePageVisible() {
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return visible;
}

function nextIndex(from, count, failed) {
  for (let step = 1; step <= count; step++) {
    const i = (from + step) % count;
    if (!failed.has(i)) return i;
  }
  return from;
}

/**
 * Full-bleed background slideshow. Each incoming photo fades in on top of the fully
 * opaque outgoing one, which is only removed once covered, so there is never a blank or
 * darkened frame. Only the current, outgoing and next photos are mounted, so the browser
 * downloads one photo ahead instead of all of them.
 *
 * slides: [{ id, src, srcSet, place, location, credit, focus?, focusPortrait? }]
 * The slide list must keep a stable identity; give the component a new `key` to switch
 * to a different list (see StateBackgroundSlideshow).
 */
function BackgroundSlideshow({ slides, sizes = "100vw" }) {
  const count = slides.length;
  const reducedMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();

  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState(null);
  const [loaded, setLoaded] = useState(() => new Set());
  const [failed, setFailed] = useState(() => new Set());
  const [due, setDue] = useState(false); // hold time over; advance once the next photo is ready

  const next = count ? nextIndex(current, count, failed) : 0;
  const currentReady = loaded.has(current);
  const canAnimate = count > 1 && !reducedMotion && pageVisible;

  // Hold the current photo (fade-in + display time), then mark the next one as due.
  useEffect(() => {
    if (!canAnimate || !currentReady || next === current) return;
    const timer = setTimeout(() => setDue(true), FADE_MS + DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [canAnimate, currentReady, current, next]);

  // Advance only when the next photo has actually loaded, so a slow network can't cause a gap.
  useEffect(() => {
    if (!due || !canAnimate || !loaded.has(next)) return;
    setDue(false);
    setPrevious(current);
    setCurrent(next);
  }, [due, canAnimate, loaded, next, current]);

  // Drop the outgoing photo once the incoming one fully covers it.
  useEffect(() => {
    if (previous === null) return;
    const timer = setTimeout(() => setPrevious(null), FADE_MS + 100);
    return () => clearTimeout(timer);
  }, [previous]);

  // If the photo we're showing fails, skip ahead without a transition.
  useEffect(() => {
    if (failed.has(current) && failed.size < count) setCurrent(nextIndex(current, count, failed));
  }, [failed, current, count]);

  const markLoaded = useCallback((i) => setLoaded((s) => (s.has(i) ? s : new Set(s).add(i))), []);
  const markFailed = useCallback((i) => setFailed((s) => (s.has(i) ? s : new Set(s).add(i))), []);

  // No photos (or all failed): the container's neutral gradient shows instead.
  const mounted = count
    ? [...new Set([previous, current, canAnimate ? next : null])].filter((i) => i !== null && !failed.has(i))
    : [];
  const active = count && !failed.has(current) ? slides[current] : null;

  return (
    <div className="hero-slideshow" aria-hidden="true">
      {mounted.map((i) => {
        const slide = slides[i];
        const role = i === current ? "is-current" : i === previous ? "is-previous" : "is-next";
        return (
          <img
            key={slide.id}
            className={`hero-slide ${role} ${loaded.has(i) ? "is-loaded" : ""}`}
            src={slide.src}
            srcSet={slide.srcSet}
            sizes={sizes}
            alt=""
            decoding="async"
            fetchpriority={i === 0 && previous === null ? "high" : "low"}
            style={{ "--focus": slide.focus, "--focus-portrait": slide.focusPortrait }}
            onLoad={() => markLoaded(i)}
            onError={() => markFailed(i)}
          />
        );
      })}
      <div className="hero-shade" />
      {active && (
        <p className="hero-credit" key={active.id}>
          <span className="hero-credit-place">
            {active.place}, {active.location}
          </span>
          <span className="hero-credit-photo">
            Photo:{" "}
            <a href={active.credit.file_page} target="_blank" rel="noreferrer" tabIndex={-1}>
              {active.credit.author}
            </a>{" "}
            · {active.credit.license}
          </span>
        </p>
      )}
    </div>
  );
}

// With stable props, parent re-renders (e.g. typing in search) can't restart the cycle.
export default memo(BackgroundSlideshow);
