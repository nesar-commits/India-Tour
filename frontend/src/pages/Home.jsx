import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import Chips from "../components/Chips.jsx";
import Photo from "../components/Photo.jsx";

export default function Home() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");

  const { data: stats } = useFetch(() => api.stats(), []);
  const { data: states, error, loading } = useFetch(
    () => api.states({ q, region, type }),
    [q, region, type]
  );

  return (
    <>
      <section className="hero">
        <h1>Explore India, state by state</h1>
        <p className="muted">
          Discover the capitals, languages, best seasons and must-see places of every state and
          union territory.
        </p>
        {stats && (
          <div className="stats">
            <div><strong>{stats.states}</strong><span>States</span></div>
            <div><strong>{stats.union_territories}</strong><span>Union Territories</span></div>
            <div><strong>{stats.places}</strong><span>Tourist places</span></div>
          </div>
        )}
      </section>

      <section className="filters">
        <input
          type="search"
          className="search"
          placeholder="Search a state, capital or place (e.g. Taj Mahal)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {stats && <Chips options={stats.regions} value={region} onChange={setRegion} allLabel="All regions" />}
        <Chips options={["State", "Union Territory"]} value={type} onChange={setType} allLabel="States & UTs" />
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
    </>
  );
}
