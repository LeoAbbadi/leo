import { Navigate, NavLink, Outlet } from "react-router";
import { useAuth } from "../lib/auth";
import { useData } from "../lib/store";
import { ChipTop } from "./Cards";

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
  if (!email) return <Navigate to="/admin/entrar" replace />;

  const pending = data?.interests.filter((i) => i.status === "pendente").length ?? 0;

  return (
    <div className="admin">
      <aside className="admin-side">
        <NavLink to="/" className="brand">
          <ChipTop color="red" size={26} />
          <span>{data?.settings.clubName}</span>
        </NavLink>
        <nav className="admin-nav" aria-label="Área do clube">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/admin"}>
              {label}
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
