import { useEffect, useState } from "react";
import api from "../lib/api";
import { canPromptInstall, isIos, isStandalone, onInstallChange, promptInstall } from "../lib/install";
import { refreshStudentLogin } from "../lib/session";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import { readUserInfo } from "../lib/userInfo";
import "../styles/dashboard.css";

const Icon = ({ d }) => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const MOON = <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />;
const SUN = (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>
);

const LINKS = [
  ["home", "Home", "/user-dashboard"],
  ["subjects", "Subjects", "/user"],
  ["results", "Results", "/user-dashboard?tab=history"],
  ["mistakes", "Review", "/mistakes"],
  ["leaderboard", "Leaderboard", "/user-dashboard?tab=leaderboard"],
];

export default function StudentHeader({ active }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInfo] = useState(readUserInfo);
  const [weekly, setWeekly] = useState(null); // null = not loaded yet
  const [installable, setInstallable] = useState(canPromptInstall);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => onInstallChange(() => setInstallable(canPromptInstall())), []);
  useEffect(() => {
    refreshStudentLogin();
  }, []);
  useEffect(() => {
    if (!menuOpen || weekly !== null) return;
    api
      .get("/api/digest/prefs", { _tokenType: "user" })
      .then((res) => setWeekly(Boolean(res.data?.weeklyDigest)))
      .catch(() => {});
  }, [menuOpen, weekly]);

  const toggleWeekly = async () => {
    const next = !weekly;
    setWeekly(next);
    try {
      await api.put("/api/digest/prefs", { weeklyDigest: next }, { _tokenType: "user" });
    } catch {
      setWeekly(!next);
    }
  };
  const showInstall = !isStandalone() && (installable || isIos());

  const initials =
    (userInfo.fullName || "S")
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S";
  const classLabel = [userInfo.course?.name, userInfo.level ? `${userInfo.level} Level` : null]
    .filter(Boolean)
    .join(" · ");

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    navigate("/user-login");
  };

  return (
    <header className="db-header">
      <div className="db-header-inner">
        <a
          className="db-brand"
          href="/user-dashboard"
          aria-label="Bambo home"
          onClick={(e) => {
            e.preventDefault();
            go("/user-dashboard");
          }}
        >
          B
        </a>
        <nav className="db-nav" aria-label="Main">
          {LINKS.map(([key, label, path]) => (
            <button
              key={key}
              type="button"
              aria-current={active === key ? "page" : undefined}
              onClick={() => go(path)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="db-tools">
          <button
            type="button"
            className="db-icon-btn"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Icon d={isDarkMode ? SUN : MOON} />
          </button>
          <button
            type="button"
            className="db-avatar"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {initials}
          </button>
          {menuOpen && (
            <>
              <div className="db-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="db-menu" role="menu">
                <div className="db-menu-who">
                  <strong>{userInfo.fullName || "Student"}</strong>
                  <span>{classLabel || "Your account"}</span>
                </div>
                <button type="button" role="menuitem" onClick={() => go("/user")}>Practise a subject</button>
                <button type="button" role="menuitem" onClick={() => go("/request-subject")}>Request a subject</button>
                {weekly !== null && (
                  <button type="button" role="menuitemcheckbox" aria-checked={weekly} className="db-menu-toggle" onClick={toggleWeekly}>
                    <span>Weekly progress email</span>
                    <span className={`db-switch${weekly ? " on" : ""}`} aria-hidden="true" />
                  </button>
                )}
                {showInstall && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      if (installable) {
                        setMenuOpen(false);
                        await promptInstall();
                      } else {
                        setIosHelp(true);
                      }
                    }}
                  >
                    📲 Install Bambo app
                  </button>
                )}
                {iosHelp && (
                  <p className="db-menu-help">On iPhone: tap the <b>Share</b> button in Safari, then <b>Add to Home Screen</b>.</p>
                )}
                <button type="button" role="menuitem" onClick={() => go("/user-dashboard?tour=1")}>App tour</button>
                <button type="button" role="menuitem" onClick={() => go("/")}>Public homepage</button>
                <button type="button" role="menuitem" className="db-danger" onClick={logout}>Log out</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
