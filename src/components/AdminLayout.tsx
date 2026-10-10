import { Navigate, NavLink, Outlet, useLocation } from "react-router";
import { useAuth } from "../lib/auth";
import { useData } from "../lib/store";
import { motion } from "motion/react";
import { Backdrop } from "./Backdrop";
import { Logo } from "./Brand";

const LINKS: [string, string][] = [
  ["/admin", "Painel"],
  ["/admin/torneios", "Torneios"],
  ["/admin/inscricoes", "Inscrições"],
  ["/admin/jogadores", "Jogadores"],
  ["/admin/configuracoes", "Configurações"],
];

export function AdminLayout() {
  const { email, logout } = useAuth();
  const { data, demo } = useData();
  const location = useLocation();
  if (!email) return <Navigate to="/admin/entrar" replace />;

  const pending = data?.interests.filter((i) => i.status === "pendente").length ?? 0;
  const current =
    [...LINKS].reverse().find(([to]) => (to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(to)))?.[0] ??
    "/admin";

  return (
    <div className="admin">
      <Backdrop />
      <aside className="admin-side glass">
        <NavLink to="/" className="brand">
          <Logo size={34} />
          <span>{data?.settings.clubName}</span>
        </NavLink>
        <nav className="admin-nav" aria-label="Área do clube">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/admin"}>
              {current === to && (
                <motion.span layoutId="admin-pill" className="nav-pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="nav-label">{label}</span>
              {to === "/admin/inscricoes" && pending > 0 && <span className="nav-count">{pending}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-user">
          <span>{email}</span>
          <div className="admin-user-actions">
            <NavLink to="/" className="btn btn-ghost btn-sm">
              Ver site
            </NavLink>
            <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        {demo && (
          <p className="demo-banner">
            Modo demonstração: as alterações aparecem no site na hora, mas ficam salvas só neste navegador. Depois de
            conectar o banco de dados, valem para todos os visitantes.
          </p>
        )}
        <Outlet />
      </div>
    </div>
  );
}
