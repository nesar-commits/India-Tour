import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import Chips from "../components/Chips.jsx";
import Photo from "../components/Photo.jsx";
import BackgroundSlideshow from "../components/BackgroundSlideshow.jsx";
import { ArrowRightIcon } from "../components/Icons.jsx";
import heroData from "../data/heroSlides.json";

const HOME_SLIDES = heroData.slides.map((s) => ({
  ...s,
  focusPortrait: s.focus_portrait,
  src: `/hero/${s.id}-1920.webp`,
  srcSet: heroData.widths.map((w) => `/hero/${s.id}-${w}.webp ${w}w`).join(", "),
}));
// Portrait screens crop a 3:2 photo to full height, so they need a wider source.
const HOME_SIZES = "(orientation: portrait) 150vh, 100vw";

export default function Home() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const resultsRef = useRef(null);

  const { data: stats } = useFetch(() => api.stats(), []);
  const { data: states, error, loading } = useFetch(
    () => api.states({ q, region, type }),
    [q, region, type]
  );

  // Results filter live as you type; submitting just takes you to them.
  const exploreResults = (e) => {
    e.preventDefault();
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  };

  return (
    <>
      <section className="page-hero home-hero">
        <BackgroundSlideshow slides={HOME_SLIDES} sizes={HOME_SIZES} />
        <div className="container home-hero-content">
          <p className="home-hero-eyebrow">28 states · 8 union territories · one incredible country</p>
          <h1>Explore India, state by state</h1>
          <p className="home-hero-lead">
            Discover the capitals, languages, best seasons and must-see places of every state and
            union territory.
          </p>

          <form className="hero-search" role="search" onSubmit={exploreResults}>
            <label htmlFor="hero-search-input" className="visually-hidden">
              Search a state, capital or place
            </label>
            <svg className="hero-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="hero-search-input"
              type="search"
              placeholder="Search a state, capital or place (e.g. Taj Mahal)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="hero-search-btn">
              Explore
              <ArrowRightIcon size={18} />
            </button>
          </form>

          <div className="home-hero-actions">
            <Link to="/places" className="hero-link">Browse all tourist places →</Link>
          </div>

          {/* Rendered before data arrives so the hero never shifts when stats load. */}
          <dl className="hero-stats">
            <div><dt>States</dt><dd>{stats?.states ?? "–"}</dd></div>
            <div><dt>Union Territories</dt><dd>{stats?.union_territories ?? "–"}</dd></div>
            <div><dt>Tourist places</dt><dd>{stats?.places ?? "–"}</dd></div>
          </dl>
        </div>
      </section>

      <div className="container">
        <section className="filters" ref={resultsRef} id="explore" aria-label="Filter states">
          {stats && <Chips options={stats.regions} value={region} onChange={setRegion} allLabel="All regions" />}
          <Chips options={["State", "Union Territory"]} value={type} onChange={setType} allLabel="States & UTs" />
          {q && (
            <p className="muted small">
              Showing results for “{q}” ·{" "}
              <button type="button" className="link-button" onClick={() => setQ("")}>Clear search</button>
            </p>
          )}
        </section>

        {error && <p className="status error">Could not load states: {error}. Is the API running?</p>}
        {loading && !states && <p className="status">Loading…</p>}
        {states && states.length === 0 && <p className="status">No matches found.</p>}

        <section className="grid">
          {states?.map((s) => (
            <Link key={s.id} to={`/states/${s.id}`} className={`card state-card region-${s.region.toLowerCase()}`}>
              <Photo image={s.cover_image} alt={s.name} className="state-photo" credit={false} />
              <div className="state-card-body">
                <div className="state-card-top">
                  <span className="tag">{s.region}</span>
                  {s.type === "Union Territory" && <span className="tag outline">UT</span>}
                </div>
                <h2>{s.name}</h2>
                <p className="muted small">Capital: {s.capital}</p>
                <p className="small count">{s.place_count} places to visit →</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
