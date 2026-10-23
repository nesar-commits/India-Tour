import BackgroundSlideshow from "./BackgroundSlideshow.jsx";

// A 3:2 photo filling a ~75vh hero on a portrait screen is ~110vh wide.
const SIZES = "(orientation: portrait) 110vh, 100vw";

/**
 * Background slideshow for one state's page. `images` must come from getStateSlides(stateId).
 *
 * Keying the slideshow by state means switching states replaces it entirely in the same
 * render: the old state's timers are cleared, its <img> elements (and their pending load
 * callbacks) are discarded, and the new state starts fresh from its first photo. No photo
 * from the previous state can stay on screen or be used as a fallback; until the new
 * state's first photo loads, the neutral India-Tour gradient shows.
 */
export default function StateBackgroundSlideshow({ stateId, images }) {
  return <BackgroundSlideshow key={stateId} slides={images} sizes={SIZES} />;
}
