import { Link } from "react-router-dom";
import Photo from "./Photo.jsx";

export default function PlaceCard({ place, showState = false }) {
  return (
    <article className="card place-card">
      <Photo image={place.image} alt={place.name} className="place-photo" />
      <div className="place-body">
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
        {place.image?.source_page && (
          <a className="small more" href={place.image.source_page} target="_blank" rel="noreferrer">
            Read more on Wikipedia ↗
          </a>
        )}
      </div>
    </article>
  );
}
