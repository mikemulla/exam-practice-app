import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }) =>
    `public-nav-link${isActive ? " active" : ""}`;

  return (
    <>
      <style>{`
        .public-nav{position:sticky;top:0;z-index:1000;border-bottom:1px solid var(--border-color);background:color-mix(in srgb,var(--bg-primary) 92%,transparent);backdrop-filter:blur(16px)}
        .public-nav-inner{max-width:1180px;min-height:70px;margin:auto;padding:0 20px;display:flex;align-items:center;gap:24px}
        .public-brand{display:flex;align-items:center;gap:10px;color:var(--text-primary);text-decoration:none;font-size:20px;font-weight:800;margin-right:auto}
        .public-brand-mark{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--button-primary);color:#fff}
        .public-links,.public-actions{display:flex;align-items:center;gap:6px}
        .public-nav-link{padding:9px 12px;border-radius:8px;color:var(--text-secondary);text-decoration:none;font-size:14px;font-weight:600}
        .public-nav-link:hover,.public-nav-link.active{color:var(--button-primary);background:var(--surface-alt)}
        .public-nav-button{padding:10px 15px;border-radius:9px;text-decoration:none;font-size:14px;font-weight:700}
        .public-nav-button.secondary{color:var(--button-primary);border:1px solid var(--border-color);background:var(--bg-secondary)}
        .public-nav-button.primary{color:#fff;background:var(--button-primary)}
        .menu-button{display:none;width:42px;height:42px;border:1px solid var(--border-color);border-radius:10px;background:var(--bg-secondary);color:var(--text-primary);cursor:pointer;align-items:center;justify-content:center;padding:0}
        .menu-icon{width:18px;height:14px;display:flex;flex-direction:column;align-items:center;justify-content:space-between}
        .menu-icon span{width:18px;height:2px;border-radius:999px;background:currentColor;display:block;flex-shrink:0;transform-origin:center;transition:transform .2s ease,opacity .2s ease}
        .menu-icon.open span:nth-child(1){transform:translateY(6px) rotate(45deg)}
        .menu-icon.open span:nth-child(2){opacity:0}
        .menu-icon.open span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
        .mobile-menu{display:none}
        @media(max-width:820px){.public-links,.public-actions{display:none}.menu-button{display:flex}.public-nav-inner{min-height:64px}.mobile-menu{display:grid;grid-template-rows:0fr;transition:.25s;border-top:0 solid var(--border-color)}.mobile-menu.open{grid-template-rows:1fr;border-top-width:1px}.mobile-menu>div{overflow:hidden}.mobile-links{padding:14px 20px 20px;display:flex;flex-direction:column;gap:5px}.mobile-links .public-nav-link{padding:12px}.mobile-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}.mobile-actions a{text-align:center}}
        @media(max-width:420px){.mobile-actions{grid-template-columns:1fr}}
      `}</style>
      <header className="public-nav">
        <div className="public-nav-inner">
          <Link className="public-brand" to="/">
            <span className="public-brand-mark">B</span>
          </Link>
          <nav className="public-links">
            <NavLink end to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/quick-reviews" className={linkClass}>
              Quick Reviews
            </NavLink>
            <NavLink to="/sample-questions" className={linkClass}>
              Sample Questions
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
          </nav>

          <button
            className="menu-button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span
              className={`menu-icon${open ? " open" : ""}`}
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
        <div className={`mobile-menu${open ? " open" : ""}`}>
          <div>
            <nav className="mobile-links">
              <NavLink end to="/" className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/quick-reviews" className={linkClass}>
                Quick Reviews
              </NavLink>
              <NavLink to="/sample-questions" className={linkClass}>
                Sample Questions
              </NavLink>
              <NavLink to="/about" className={linkClass}>
                About
              </NavLink>
              <NavLink to="/contact" className={linkClass}>
                Contact
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
export default PublicNavbar;
