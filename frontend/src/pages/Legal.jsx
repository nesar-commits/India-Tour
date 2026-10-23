import { Link } from "react-router-dom";

const TITLES = { terms: "Terms of Service", privacy: "Privacy Policy" };

export default function Legal({ doc }) {
  return (
    <section className="hero compact">
      <h1>{TITLES[doc]}</h1>
      <p className="muted">
        India-Tour's {TITLES[doc].toLowerCase()} hasn't been published yet. It will appear here
        before accounts go live.
      </p>
      <p>
        <Link to="/">← Back to exploring</Link>
      </p>
    </section>
  );
}
