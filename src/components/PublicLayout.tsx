import { AnimatePresence, motion } from "motion/react";
import { NavLink, Outlet, useLocation } from "react-router";
import { useData } from "../lib/store";
import { ChipTop } from "./Cards";

export function PublicLayout() {
  const { data, demo } = useData();
  const location = useLocation();
  const s = data?.settings;

  return (
    <div className="site">
      <header className="site-header">
        <div className="wrap site-header-inner">
          <NavLink to="/" className="brand">
            <ChipTop color="red" size={30} />
            <span>{s?.clubName ?? "Clube"}</span>
          </NavLink>
          <nav className="site-nav" aria-label="Principal">
            <NavLink to="/" end>
              Início
            </NavLink>
            <NavLink to="/torneios">Torneios</NavLink>
            <NavLink to="/ranking">Ranking</NavLink>
            <NavLink to="/admin" className="nav-club">
              Área do clube
            </NavLink>
          </nav>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div>
            <strong className="footer-brand">{s?.clubName}</strong>
            <p>{s?.address}</p>
            <p>{s?.city}</p>
          </div>
          <div>
            <p>
              WhatsApp: <span className="selectable">{s?.whatsapp}</span>
            </p>
            <p>
              E-mail: <span className="selectable">{s?.ownerEmail}</span>
            </p>
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
