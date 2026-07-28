import { useNavigate, useParams } from "react-router-dom";
import { publicReviews } from "../data/publicReviews";

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M9 3L5 7l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2.5a5.5 5.5 0 0 0-3 10.1c.5.35.8.9.8 1.5v.4h4.4v-.4c0-.6.3-1.15.8-1.5A5.5 5.5 0 0 0 10 2.5Z"
        stroke="var(--button-primary)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M8 17h4M8.5 14.5h3"
        stroke="var(--button-primary)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    position: "relative",
    overflow: "hidden",
  },
  blobField: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  inner: {
    position: "relative",
    zIndex: 1,
    maxWidth: "780px",
    margin: "0 auto",
    padding: "2.5rem 1.25rem 4rem",
  },
  header: { marginBottom: "1rem" },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "1.25rem",
    padding: "7px 14px",
    border: "0.5px solid var(--border-color)",
    borderRadius: "8px",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  eyebrow: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--button-primary)",
    background: "var(--surface-alt)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "6px 12px",
    borderRadius: "999px",
    marginBottom: "1rem",
  },
  heading: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 1.75rem",
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
  },
  summary: {
    padding: "1.25rem 1.5rem",
    borderLeft: "3px solid var(--button-primary)",
    borderRadius: "0 14px 14px 0",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontSize: "15.5px",
    lineHeight: "1.75",
    marginBottom: "0.5rem",
  },
  section: {
    padding: "2rem 0",
    borderTop: "0.5px solid var(--border-color)",
  },
  sectionHeading: {
    fontSize: "21px",
    fontWeight: "600",
    color: "var(--text-primary)",
    letterSpacing: "-0.01em",
    margin: "0 0 0.9rem",
  },
  sectionP: {
    color: "var(--text-secondary)",
    fontSize: "14.5px",
    lineHeight: "1.8",
    margin: "0 0 0.9rem",
  },
  sectionUl: { margin: 0, paddingLeft: "20px" },
  sectionLi: {
    color: "var(--text-secondary)",
    fontSize: "14.5px",
    lineHeight: "1.85",
  },
  tipsCard: {
    background: "var(--bg-secondary)",
    border: "0.5px solid var(--border-color)",
    borderRadius: "14px",
    padding: "1.5rem",
    marginTop: "1rem",
  },
  tipsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1rem",
  },
  iconBubble: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "var(--surface-alt)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: 0,
  },
  tipsUl: { margin: 0, paddingLeft: "20px" },
  tipsLi: {
    color: "var(--text-secondary)",
    fontSize: "14px",
    lineHeight: "1.9",
  },
  cta: {
    marginTop: "2rem",
    padding: "2rem",
    borderRadius: "16px",
    background: "var(--button-primary)",
    color: "#fff",
    textAlign: "center",
  },
  ctaTitle: { margin: "0 0 8px", fontSize: "20px", fontWeight: "600" },
  ctaBody: {
    margin: "0 0 1.25rem",
    opacity: 0.92,
    fontSize: "13.5px",
    lineHeight: "1.7",
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "11px 18px",
    borderRadius: "8px",
    background: "#fff",
    color: "var(--button-primary)",
    border: "none",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "transform 0.15s",
    letterSpacing: "-0.01em",
  },
};

export default function PublicQuickReviewDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const r = publicReviews.find((x) => x.slug === slug);

  if (!r) {
    navigate("/quick-reviews", { replace: true });
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes driftA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(26px, -20px) scale(1.05); }
        }
        @keyframes driftB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-18px, 16px) scale(1.04); }
        }
        .article-header { animation: fadeUp 0.4s ease both; }
        .article-body { animation: fadeUp 0.45s ease both; animation-delay: 0.05s; }
        .article-cta-btn:hover { transform: translateY(-2px); }
        .blob-a {
          position: absolute; top: -130px; right: -160px;
          width: 440px; height: 440px;
          background:
            radial-gradient(circle at 27% 24%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 24%),
            radial-gradient(circle at 62% 70%, #7dd8ff 0%, #33b5f0 32%, #1a7fd4 58%, #0f5aa6 80%, #0a3f7a 100%);
          border-radius: 58% 42% 65% 35% / 45% 55% 45% 55%;
          filter: blur(1px);
          box-shadow: 0 60px 110px -25px rgba(15, 90, 166, 0.4);
          animation: driftA 18s ease-in-out infinite;
        }
        .blob-b {
          position: absolute; top: 40px; right: 60px;
          width: 100px; height: 100px;
          background:
            radial-gradient(circle at 30% 26%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 26%),
            radial-gradient(circle at 62% 68%, #66cdf4 0%, #1f8fdc 45%, #0e5a9e 100%);
          border-radius: 50%;
          filter: blur(0.5px);
          box-shadow: 0 22px 42px -12px rgba(15, 90, 166, 0.4);
          animation: driftB 13s ease-in-out infinite;
        }
      `}</style>

      <div style={S.page}>
        <div style={S.blobField}>
          <div className="blob-a" />
          <div className="blob-b" />
        </div>

        <div style={S.inner}>
          <div className="article-header" style={S.header}>
            <button
              onClick={() => navigate("/quick-reviews")}
              style={S.backBtn}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--surface-alt)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")
              }
            >
              <ChevronLeft />
              Back to Quick Reviews
            </button>

            <div>
              <span style={S.eyebrow}>{r.subject}</span>
            </div>
            <h1 style={S.heading}>{r.title}</h1>
          </div>

          <div className="article-body">
            <div style={S.summary}>{r.summary}</div>

            {r.sections.map((s) => (
              <section style={S.section} key={s.heading}>
                <h2 style={S.sectionHeading}>{s.heading}</h2>
                {s.paragraphs.map((p) => (
                  <p style={S.sectionP} key={p}>
                    {p}
                  </p>
                ))}
                <ul style={S.sectionUl}>
                  {s.points.map((p) => (
                    <li style={S.sectionLi} key={p}>
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div style={S.tipsCard}>
              <div style={S.tipsHeader}>
                <div style={S.iconBubble}>
                  <TipIcon />
                </div>
                <h2 style={S.tipsTitle}>Exam tips</h2>
              </div>
              <ul style={S.tipsUl}>
                {r.examTips.map((t) => (
                  <li style={S.tipsLi} key={t}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={S.cta}>
              <h2 style={S.ctaTitle}>Ready to practise?</h2>
              <p style={S.ctaBody}>
                Create a free Bambo account to access topic tests, explanations,
                and progress tracking.
              </p>
              <button
                className="article-cta-btn"
                style={S.ctaButton}
                onClick={() => navigate("/user-signup")}
              >
                <span>Create free account</span>
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
