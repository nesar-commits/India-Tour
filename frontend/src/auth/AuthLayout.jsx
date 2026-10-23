import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeftIcon, MapPinIcon } from "../components/Icons.jsx";

const commons = (path, file) => (width) =>
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${width}px-${file}`;

const taj = commons("1/1d/Taj_Mahal_%28Edited%29.jpeg", "Taj_Mahal_%28Edited%29.jpeg");
const houseboat = commons("e/ee/House_Boat_DSW.jpg", "House_Boat_DSW.jpg");

// One scene per auth route. Both are rendered so switching routes crossfades instead of reloading.
const SCENES = [
  {
    path: "/login",
    src: taj,
    alt: "The Taj Mahal reflected in its long garden pool, Agra",
    place: "Taj Mahal",
    location: "Agra, Uttar Pradesh",
    tagline: "Marble, moonlight and four centuries of stories.",
    credit: {
      author: "Yann; edited by Jim Carter",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      filePage: "https://commons.wikimedia.org/wiki/File:Taj_Mahal_(Edited).jpeg",
    },
  },
  {
    path: "/signup",
    src: houseboat,
    alt: "A traditional houseboat gliding along the palm-lined Kerala backwaters",
    place: "Kerala Backwaters",
    location: "Alappuzha, Kerala",
    tagline: "Slow mornings on still water, framed by coconut palms.",
    credit: {
      author: "Augustus Binu",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      filePage: "https://commons.wikimedia.org/wiki/File:House_Boat_DSW.jpg",
    },
  },
];

export default function AuthLayout() {
  const { pathname } = useLocation();
  const active = SCENES.find((s) => s.path === pathname) ?? SCENES[0];

  return (
    <div className="auth">
      <aside className="auth-visual">
        {SCENES.map((s) => (
          <img
            key={s.path}
            className={`auth-visual-img ${s === active ? "is-active" : ""}`}
            src={s.src(1280)}
            srcSet={`${s.src(960)} 960w, ${s.src(1280)} 1280w`}
            sizes="(min-width: 960px) 55vw, 100vw"
            alt={s === active ? s.alt : ""}
            aria-hidden={s === active ? undefined : true}
            fetchpriority={s === active ? "high" : "low"}
          />
        ))}
        <div className="auth-visual-shade" aria-hidden="true" />

        <Link to="/" className="auth-brand" aria-label="India-Tour home">
          <span className="auth-brand-mark" aria-hidden="true" />
          India-Tour
        </Link>

        <div className="auth-visual-caption" key={active.path}>
          <p className="auth-visual-location">
            <MapPinIcon size={15} />
            {active.place} · {active.location}
          </p>
          <p className="auth-visual-tagline">{active.tagline}</p>
          <p className="auth-visual-stats">36 states &amp; union territories · 190 handpicked places</p>
        </div>

        <p className="auth-visual-credit">
          Photo:{" "}
          <a href={active.credit.filePage} target="_blank" rel="noreferrer">
            {active.credit.author}
          </a>{" "}
          ·{" "}
          <a href={active.credit.licenseUrl} target="_blank" rel="noreferrer">
            {active.credit.license}
          </a>
        </p>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel-top">
          <Link to="/" className="auth-back">
            <ArrowLeftIcon size={16} />
            Back to explore
          </Link>
        </div>
        <div className="auth-form-wrap" key={pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
