import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import Chips from "../components/Chips.jsx";
import PlaceCard from "../components/PlaceCard.jsx";
import StateBackgroundSlideshow from "../components/StateBackgroundSlideshow.jsx";
import { getNeighbourStates, getStateSlides, normalizeStateSlug, resolveStateId } from "../data/stateSlides.js";

export default function StateDetail() {
  const { id: param } = useParams();
  const stateId = resolveStateId(param) ?? normalizeStateSlug(param);
  const images = getStateSlides(stateId); // only this state's photos ([] if unknown)
  const neighbours = getNeighbourStates(stateId);

  const [category, setCategory] = useState("");
  useEffect(() => setCategory(""), [stateId]);

  const { data, error } = useFetch(() => api.state(stateId), [stateId]);
  // While the next state loads, the previous state's data must not be shown.
  const state = data?.id === stateId ? data : null;
  const notFound = error === "Not found";

  useEffect(() => {
    if (state) document.title = `${state.name} · India Tour`;
    return () => (document.title = "India Tour");
  }, [state]);

  // Accept names and other spellings (/states/Tamil Nadu) but show one canonical URL.
  if (param !== stateId) return <Navigate to={`/states/${stateId}`} replace />;

  const categories = state ? [...new Set(state.places.map((p) => p.category))].sort() : [];
  const places = state ? (category ? state.places.filter((p) => p.category === category) : state.places) : [];

  return (
    <>
      <section className="page-hero state-page-hero" data-state={stateId}>
        {!notFound && <StateBackgroundSlideshow stateId={stateId} images={images} />}
        <div className="container state-hero-content">
          <Link to="/" className="hero-back">← All states</Link>
          {state ? (
            <>
              <div className="state-hero-tags">
                <span className="hero-tag">{state.region} India</span>
                <span className="hero-tag outline">{state.type}</span>
              </div>
              <h1>{state.name}</h1>
              <p className="state-hero-lead">{state.description}</p>
              <dl className="state-hero-facts">
                <div><dt>Capital</dt><dd>{state.capital}</dd></div>
                <div><dt>Languages</dt><dd>{state.languages.join(", ")}</dd></div>
                <div><dt>Best time to visit</dt><dd>{state.best_time}</dd></div>
              </dl>
            </>
          ) : notFound ? (
            <>
              <h1>State not found</h1>
              <p className="state-hero-lead">We couldn't find “{param}”. Pick a state from the list instead.</p>
            </>
          ) : error ? (
            <p className="state-hero-lead">Could not load this state: {error}. Is the API running?</p>
          ) : (
            <div className="state-hero-skeleton" aria-busy="true" aria-label="Loading state">
              <span /><span /><span />
            </div>
          )}
        </div>
      </section>

      <div className="container">
        {state && (
          <>
            <div className="section-head">
              <h2>Tourist places ({places.length})</h2>
              <Chips options={categories} value={category} onChange={setCategory} />
            </div>
            <section className="grid">
              {places.map((p) => (
                <PlaceCard key={p.name} place={p} />
              ))}
            </section>
          </>
        )}

        {neighbours.previous && (
          <nav className="state-pager" aria-label="More states">
            <Link to={`/states/${neighbours.previous.id}`} rel="prev">
              <span>Previous</span>← {neighbours.previous.name}
            </Link>
            <Link to={`/states/${neighbours.next.id}`} rel="next">
              <span>Next</span>{neighbours.next.name} →
            </Link>
          </nav>
        )}
      </div>
    </>
  );
}
