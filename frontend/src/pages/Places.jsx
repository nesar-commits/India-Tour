import { useState } from "react";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import Chips from "../components/Chips.jsx";
import PlaceCard from "../components/PlaceCard.jsx";

export default function Places() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");

  const { data: stats } = useFetch(() => api.stats(), []);
  const { data: places, error, loading } = useFetch(
    () => api.places({ q, category, region }),
    [q, category, region]
  );

  return (
    <>
      <section className="hero compact">
        <h1>All tourist places</h1>
        <p className="muted">Filter every listed destination by type and region.</p>
      </section>

      <section className="filters">
        <input
          type="search"
          className="search"
          placeholder="Search places, cities or descriptions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {stats && (
          <>
            <Chips options={stats.categories} value={category} onChange={setCategory} allLabel="All types" />
            <Chips options={stats.regions} value={region} onChange={setRegion} allLabel="All regions" />
          </>
        )}
      </section>

      {error && <p className="status error">Could not load places: {error}. Is the API running?</p>}
      {loading && !places && <p className="status">Loading…</p>}
      {places && <p className="muted small">{places.length} places</p>}

      <section className="grid">
        {places?.map((p) => (
          <PlaceCard key={`${p.state_id}-${p.name}`} place={p} showState />
        ))}
      </section>
    </>
  );
}
