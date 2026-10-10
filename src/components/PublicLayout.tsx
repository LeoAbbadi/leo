import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { displayPhone } from "../lib/messages";
import { useData } from "../lib/store";
import { Backdrop } from "./Backdrop";
import { Logo } from "./Brand";

const NAV: [string, string][] = [
  ["/", "Início"],
  ["/torneios", "Torneios"],
  ["/ranking", "Ranking"],
];

export function PublicLayout() {
  const { data, demo } = useData();
  const location = useLocation();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));
  const s = data?.settings;
  const current = NAV.find(([to]) => (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)))?.[0];

  return (
    <div className="site">
      <Backdrop />
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <motion.div
          className="nav-bar glass"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <NavLink to="/" className="brand" aria-label={s?.clubName ?? "Início"}>
            <Logo size={38} />
            <span className="brand-name">{s?.clubName}</span>
          </NavLink>
          <nav className="site-nav" aria-label="Principal">
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"} className="nav-link">
                {current === to && (
                  <motion.span
                    layoutId="nav-pill"
                    className="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>
          <NavLink to="/admin" className="btn btn-primary btn-sm nav-club">
            Área do clube
          </NavLink>
        </motion.div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.35 }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-card glass">
            <div className="footer-brand">
              <Logo size={88} />
              <div>
                <strong>{s?.clubName}</strong>
                <p>{s?.tagline}</p>
              </div>
            </div>
            <div className="footer-info">
              <p>{s?.address}</p>
              <p>{s?.city}</p>
            </div>
            <div className="footer-info">
              <p>
                Contato: <span className="selectable">{s ? displayPhone(s.whatsapp) : ""}</span>
              </p>
              <p>
                E-mail: <span className="selectable">{s?.ownerEmail}</span>
              </p>
              {s?.instagram && (
                <p>
                  Instagram:{" "}
                  <a href={`https://www.instagram.com/${s.instagram}/`} target="_blank" rel="noopener noreferrer">
                    @{s.instagram}
                  </a>
                </p>
              )}
            </div>
          </div>
          {demo && (
            <p className="demo-note">
              Modo demonstração: os dados de exemplo ficam salvos só neste navegador até o banco de dados ser conectado.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
