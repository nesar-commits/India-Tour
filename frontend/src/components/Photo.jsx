import { useState } from "react";

// Wikimedia Commons photo with attribution, required by the CC licenses most images use.
export default function Photo({ image, alt, className = "", credit = true }) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return <div className={`photo photo-empty ${className}`} aria-hidden="true" />;
  }

  return (
    <figure className={`photo ${className}`}>
      <img src={image.url} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      {credit && (
        <figcaption>
          <a href={image.file_page} target="_blank" rel="noreferrer" title="View on Wikimedia Commons">
            {image.author && image.author !== "Unknown" ? image.author : "Wikimedia Commons"}
          </a>
          {image.license && (
            <>
              {" · "}
              {image.license_url ? (
                <a href={image.license_url} target="_blank" rel="noreferrer">{image.license}</a>
              ) : (
                image.license
              )}
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
