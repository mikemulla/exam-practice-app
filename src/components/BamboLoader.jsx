import { useState } from "react";
import "../styles/loader.css";

const TIPS = [
  "Tip: flag a question you're unsure about and come back to it before you submit.",
  "Tip: read the last line of the question first, so you know what it is asking.",
  "Tip: after a test, read why the wrong options are wrong, not just the right one.",
  "Tip: a short daily test keeps your streak alive and your memory fresh.",
  "Tip: retake your weakest topic after reading its quick review.",
  "Tip: score 100% on a topic test to climb the leaderboard.",
];

export default function BamboLoader({
  message = "Getting your questions ready",
  tip,
  inline = false,
}) {
  const [shownTip] = useState(
    () => tip || TIPS[Math.floor(Math.random() * TIPS.length)],
  );

  return (
    <div
      className={`bl-screen${inline ? " bl-inline" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="bl-art" aria-hidden="true">
        <span className="bl-blob2" />
        <span className="bl-blob" />
        <span className="bl-mark">B</span>
      </div>
      <div className="bl-copy">
        <p className="bl-message">{message}</p>
        <div className="bl-track" aria-hidden="true">
          <div className="bl-bar" />
        </div>
      </div>
      {shownTip && <p className="bl-tip">{shownTip}</p>}
    </div>
  );
}
