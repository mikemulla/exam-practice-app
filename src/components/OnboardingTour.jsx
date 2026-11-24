import { useEffect, useRef, useState } from "react";
import { canPromptInstall, isIos, isStandalone, promptInstall } from "../lib/install";
import "../styles/onboarding.css";


/* Archimedean spiral path for the background swirl. */
function spiralPath(turns = 4.5, size = 300, step = 0.12) {
  const c = size / 2;
  const max = turns * 2 * Math.PI;
  const k = (c * 0.95) / max;
  let d = `M ${c} ${c}`;
  for (let a = step; a <= max; a += step) d += ` L ${(c + k * a * Math.cos(a)).toFixed(1)} ${(c + k * a * Math.sin(a)).toFixed(1)}`;
  return d;
}
const SPIRAL = spiralPath();

function Spirals({ tone }) {
  return (
    <div className={`ob-art ob-${tone}`} aria-hidden="true">
      <span className="ob-blob ob-blob-a" />
      <span className="ob-blob ob-blob-b" />
      <svg className="ob-spiral ob-spiral-1" viewBox="0 0 300 300"><path d={SPIRAL} /></svg>
      <svg className="ob-spiral ob-spiral-2" viewBox="0 0 300 300"><path d={SPIRAL} /></svg>
    </div>
  );
}

/* Small pictures of the real screens. */
const Visual = {
  welcome: () => (
    <div className="ob-vis ob-center">
      <div className="ob-logo">B</div>
    </div>
  ),
  test: () => (
    <div className="ob-vis ob-card">
      <div className="ob-row ob-between">
        <span className="ob-muted">Question 6 of 30</span>
        <span className="ob-pill">⏱ 12:40</span>
      </div>
      <div className="ob-line w90" />
      <div className="ob-line w60" />
      <div className="ob-opt"><b>A</b> Magnesium sulphate</div>
      <div className="ob-opt on"><b>B</b> Calcium gluconate</div>
      <div className="ob-row ob-gap">
        <span className="ob-sq flag">⚑</span>
        <span className="ob-sq">▦</span>
        <span className="ob-next">Next ›</span>
      </div>
      <span className="ob-saved">✓ Saved</span>
    </div>
  ),
  results: () => (
    <div className="ob-vis ob-card">
      <div className="ob-row ob-gap">
        <span className="ob-ring">80%</span>
        <div>
          <div className="ob-strong">24 of 30 correct</div>
          <div className="ob-up">↑ 8 points on your last try</div>
        </div>
      </div>
      <div className="ob-opt bad">✕ Reduce the rate <i>your answer</i></div>
      <div className="ob-opt good">✓ Stop it, give calcium <i>correct</i></div>
      <div className="ob-bubble">What made you choose to slow it?</div>
      <span className="ob-link">Something wrong? Report it</span>
    </div>
  ),
  review: () => (
    <div className="ob-vis ob-card ob-green">
      <div className="ob-label">Due today</div>
      <div className="ob-big">8 questions</div>
      <div className="ob-week">
        {[8, 0, 3, 0, 0, 5, 0].map((n, i) => (
          <span key={i} style={{ height: 8 + n * 5 }} className={i === 0 ? "now" : ""} />
        ))}
      </div>
      <div className="ob-steps"><span>1 day</span>→<span>3 days</span>→<span>7 days</span>→<span>✓</span></div>
    </div>
  ),
  board: () => (
    <div className="ob-vis ob-card">
      <div className="ob-rank"><span>#3</span><div><div className="ob-strong">3rd of 86</div><div className="ob-muted">12 perfect scores</div></div></div>
      {[1, 2].map((r) => (
        <div key={r} className="ob-lrow"><b>{r}</b><i /><em style={{ width: 70 + r * 14 }} /><b>{20 - r * 2}</b></div>
      ))}
      <div className="ob-lrow me"><b>3</b><i className="me">A</i><strong>You</strong><b>12</b></div>
    </div>
  ),
  stay: () => (
    <div className="ob-vis ob-card">
      <div className="ob-mail">
        <div className="ob-mail-top">📬 Your week on Bambo</div>
        <div className="ob-row ob-gap ob-stats"><span>5<small>tests</small></span><span>72%<small>average</small></span><span>4/7<small>days</small></span></div>
      </div>
      <div className="ob-phone"><span className="ob-logo sm">B</span><span>Bambo</span></div>
    </div>
  ),
};

const SLIDES = [
  { key: "welcome", tone: "blue", title: "Welcome to the new Bambo", text: "A fresh look and new tools to help you learn faster. Here's a 1-minute tour of what's new." },
  { key: "test", tone: "blue", title: "Practise your way", text: "Take a topic test, a full subject or a random mix. Flag questions, jump around with the grid, and your answers save as you go, so you can leave and finish later." },
  { key: "results", tone: "teal", title: "Learn from every mistake", text: "See every answer explained, talk a mistake through with the tutor, or retry just the ones you missed. Spot a wrong question? Report it in one tap." },
  { key: "review", tone: "green", title: "Review at the right time", text: "Questions you get wrong come back after 1 day, then 3, then 7, just before you'd forget them. Check the Review tab for what's due today." },
  { key: "board", tone: "amber", title: "Climb the leaderboard, privately", text: "Perfect scores on topic tests move you up your class leaderboard. Classmates are never named, and only you can see your position." },
  { key: "stay", tone: "violet", title: "Stay on track", text: "Get a short progress email every Sunday (switch it off any time in your menu), and add Bambo to your home screen so it opens like an app." },
];

export default function OnboardingTour({ onDone }) {
  const [i, setI] = useState(0);
  const [iosHint, setIosHint] = useState(false);
  const touch = useRef(null);
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];
  const Vis = Visual[slide.key];
  const showInstall = last && !isStandalone() && (canPromptInstall() || isIos());

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setI((v) => Math.min(v + 1, SLIDES.length - 1));
      else if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
      else if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onDone]);

  return (
    <div className="ob-scrim">
      <div
        className="ob-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome tour"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (dx < -50) setI((v) => Math.min(v + 1, SLIDES.length - 1));
          if (dx > 50) setI((v) => Math.max(v - 1, 0));
          touch.current = null;
        }}
      >
        <button type="button" className="ob-skip" onClick={onDone}>{last ? "Close" : "Skip"}</button>
        <div className={`ob-stage ob-${slide.tone}`} key={slide.key}>
          <Spirals tone={slide.tone} />
          <Vis />
        </div>
        <div className="ob-copy" key={`c-${slide.key}`} aria-live="polite">
          <p className="ob-count">{i + 1} of {SLIDES.length}</p>
          <h2>{slide.title}</h2>
          <p>{slide.text}</p>
          {iosHint && <p className="ob-ios">On iPhone: tap <b>Share</b> in Safari, then <b>Add to Home Screen</b>.</p>}
        </div>
        <div className="ob-dots" role="tablist" aria-label="Slides">
          {SLIDES.map((s, n) => (
            <button key={s.key} type="button" role="tab" aria-selected={n === i} aria-label={`Slide ${n + 1}: ${s.title}`} className={n === i ? "on" : ""} onClick={() => setI(n)} />
          ))}
        </div>
        <div className="ob-actions">
          {i > 0 ? (
            <button type="button" className="ob-btn ghost" onClick={() => setI(i - 1)}>Back</button>
          ) : (
            <span />
          )}
          {last ? (
            <div className="ob-row ob-gap" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
              {showInstall && (
                <button
                  type="button"
                  className="ob-btn ghost"
                  onClick={async () => {
                    if (canPromptInstall()) await promptInstall();
                    else setIosHint(true);
                  }}
                >
                  📲 Install app
                </button>
              )}
              <button type="button" className="ob-btn" onClick={onDone}>Start practising</button>
            </div>
          ) : (
            <button type="button" className="ob-btn" onClick={() => setI(i + 1)}>{i === 0 ? "Show me" : "Next"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
