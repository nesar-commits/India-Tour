import { Link } from "react-router-dom";

export default function PlaceCard({ place, showState = false }) {
  return (
    <article className="card place-card">
      <div className="place-head">
        <h3>{place.name}</h3>
        <span className={`tag cat-${place.category.toLowerCase().replace(/\s+/g, "-")}`}>
          {place.category}
        </span>
      </div>
      <p className="muted small">
        {place.city}
        {showState && (
          <>
            {" · "}
            <Link to={`/states/${place.state_id}`}>{place.state_name}</Link>
          </>
        )}
      </p>
      <p>{place.description}</p>
    </article>
  );
}
