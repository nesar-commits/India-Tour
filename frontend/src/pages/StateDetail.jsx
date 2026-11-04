import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import Chips from "../components/Chips.jsx";
import PlaceCard from "../components/PlaceCard.jsx";
import Photo from "../components/Photo.jsx";

export default function StateDetail() {
  const { id } = useParams();
  const [category, setCategory] = useState("");
  const { data: state, error, loading } = useFetch(() => api.state(id), [id]);

  if (loading) return <p className="status">Loading…</p>;
  if (error) return <p className="status error">{error === "Not found" ? "State not found." : error}</p>;

  const categories = [...new Set(state.places.map((p) => p.category))].sort();
  const cover = state.places.find((p) => p.image)?.image;
  const places = category ? state.places.filter((p) => p.category === category) : state.places;

  return (
    <>
      <Link to="/" className="back">← All states</Link>
      <section className={`state-hero region-${state.region.toLowerCase()}`}>
        <Photo image={cover} alt={state.name} className="hero-photo" />
        <div className="state-card-top">
          <span className="tag">{state.region} India</span>
          <span className="tag outline">{state.type}</span>
        </div>
        <h1>{state.name}</h1>
        <p>{state.description}</p>
        <dl className="facts">
          <div><dt>Capital</dt><dd>{state.capital}</dd></div>
          <div><dt>Languages</dt><dd>{state.languages.join(", ")}</dd></div>
          <div><dt>Best time to visit</dt><dd>{state.best_time}</dd></div>
        </dl>
      </section>

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
  );
}
