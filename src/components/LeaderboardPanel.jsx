import { useEffect, useState } from "react";
import api from "../lib/api";
import { readUserInfo } from "../lib/userInfo";
import "../styles/leaderboard.css";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
// Placeholder bar widths so hidden names don't all look identical.
const barWidth = (rank) => 70 + ((rank * 37) % 60);

export default function LeaderboardPanel() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [reload, setReload] = useState(0);
  const [showList, setShowList] = useState(false);
  const [userInfo] = useState(readUserInfo);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/api/leaderboard/me?period=${period}`, { _tokenType: "user" })
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [period, reload]);

  const pick = (value) => {
    if (value === period) return;
    setStatus("loading");
    setPeriod(value);
  };

  const initial = (userInfo.fullName || "Y").trim()[0]?.toUpperCase() || "Y";
  const classLabel = data ? [data.course, data.level ? `${data.level} Level` : null].filter(Boolean).join(" · ") : "";
  const periodWord = period === "month" ? "this month" : "of all time";

  let nextGoal = null;
  if (status === "ready" && data?.me?.rank > 1) {
    const above = data.rows.find((r) => r.rank === data.me.rank - 1);
    if (above) {
      // Ties go to whoever got there first, so passing needs one more than the student above.
      const need = above.perfects + 1 - data.me.perfects;
      nextGoal = { rank: above.rank, need, target: above.perfects + 1 };
    }
  }

  return (
    <div className="lb">
      <div className="lb-tabs" role="tablist" aria-label="Time period">
        {[
          ["month", "This month"],
          ["all", "All time"],
        ].map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={period === value} onClick={() => pick(value)}>
            {label}
          </button>
        ))}
      </div>

      {status === "loading" && <div className="lb-card lb-muted">Loading the leaderboard…</div>}

      {status === "error" && (
        <div className="lb-card lb-muted" role="alert">
          Couldn't load the leaderboard.{" "}
          <button
            type="button"
            className="lb-link"
            onClick={() => {
              setStatus("loading");
              setReload((v) => v + 1);
            }}
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && data && (
        <>
          <section className="lb-me" aria-label="Your position">
            <span className="lb-me-blob" aria-hidden="true" />
            {data.me.rank ? (
              <>
                <div className="lb-me-row">
                  <div className="lb-me-rank">#{data.me.rank}</div>
                  <div>
                    <p className="lb-me-label">Your position {periodWord}{classLabel ? ` · ${classLabel}` : ""}</p>
                    <p className="lb-me-big">{ordinal(data.me.rank)} of {plural(data.rankedCount, "student")}</p>
                    <p className="lb-me-sub">{plural(data.me.perfects, "perfect score")}</p>
                  </div>
                </div>
                {nextGoal ? (
                  <div>
                    <div className="lb-goal-text">
                      <span>{plural(nextGoal.need, "more perfect score")} to pass #{nextGoal.rank}</span>
                      <b>{data.me.perfects} / {nextGoal.target}</b>
                    </div>
                    <div className="lb-goal-track">
                      <div style={{ width: `${Math.min(100, (data.me.perfects / nextGoal.target) * 100)}%` }} />
                    </div>
                  </div>
                ) : data.me.rank === 1 ? (
                  <p className="lb-me-sub">🏆 You're top of your class {periodWord}. Keep it up!</p>
                ) : null}
              </>
            ) : (
              <div className="lb-me-row">
                <div className="lb-me-rank" style={{ fontSize: 26 }}>–</div>
                <div>
                  <p className="lb-me-label">{classLabel || "Your class"}</p>
                  <p className="lb-me-big">Not on the board yet</p>
                  <p className="lb-me-sub">Score 100% on a topic test to get your first spot.</p>
                </div>
              </div>
            )}
          </section>

          {data.me.lastPerfect && (
            <div className={`lb-card lb-why${data.me.lastPerfect.counted ? " ok" : ""}`} role="note">
              <span aria-hidden="true">{data.me.lastPerfect.counted ? "✓" : "i"}</span>
              <p>
                <b>
                  Your latest perfect score ({new Date(data.me.lastPerfect.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  {data.me.lastPerfect.total ? `, ${plural(data.me.lastPerfect.total, "question")}` : ""})
                  {data.me.lastPerfect.counted ? " counts." : " didn't count."}
                </b>{" "}
                {data.me.lastPerfect.counted ? "Nice work, it's included in your position above." : data.me.lastPerfect.reason}
              </p>
            </div>
          )}

          <button type="button" className="lb-toggle" aria-expanded={showList} onClick={() => setShowList((v) => !v)}>
            <span>
              {showList ? "Hide rankings" : "Show rankings"}
              <span className="lb-muted-inline"> · {plural(data.rankedCount, "student")} ranked</span>
            </span>
            <span aria-hidden="true" className={`lb-chevron${showList ? " open" : ""}`}>▾</span>
          </button>

          {showList && (
            <section className="lb-card lb-list" aria-label="Rankings">
              {data.rows.length === 0 ? (
                <p className="lb-muted" style={{ margin: 0, padding: "14px 8px", textAlign: "center" }}>
                  No perfect scores {period === "month" ? "this month" : "yet"}. Be the first!
                </p>
              ) : (
                <>
                  <div className="lb-list-head"><span>Position</span><span>Perfect scores</span></div>
                  {data.rows.map((row, i) => {
                    const gap = i > 0 && row.rank - data.rows[i - 1].rank > 1;
                    const top = row.rank <= 3 ? ` top${row.rank}` : "";
                    return (
                      <div key={`${row.rank}-${row.isMe}`}>
                        {gap && <div className="lb-gap" aria-hidden="true">⋯</div>}
                        <div className={`lb-row${row.isMe ? " me" : ""}${top}`} aria-current={row.isMe ? "true" : undefined}>
                          <span className="lb-pos">{row.rank}</span>
                          {row.isMe ? (
                            <span className="lb-who">
                              <span className="lb-avatar me">{initial}</span>
                              <strong>You</strong>
                            </span>
                          ) : (
                            <span className="lb-who" aria-label="Hidden classmate">
                              <i className="lb-avatar" />
                              <b style={{ width: barWidth(row.rank) }} />
                            </span>
                          )}
                          <span className="lb-count">{row.perfects}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </section>
          )}

          <section className="lb-card lb-note">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}>
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <p>
              <b>Private by design.</b> Other students only ever see numbers, never names, and nobody else can see your position.
              A perfect score is 100% on a topic or full-subject test of {data.rules?.minQuestions ?? 5}+ questions, and each topic counts once.
              Random tests need {data.rules?.minRandomQuestions ?? 20}+ questions. Retrying missed questions doesn't count.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
