import { LayoutGroup, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { site } from "../content/site";
import { isLive } from "../lib/env";
import { useSession } from "../lib/session";
import { Glass } from "./Glass";
import { LogoMark, Wordmark } from "./Logo";
import { Sky } from "./Sky";

const links = [
  { to: "/", label: "Início", end: true },
  { to: "/cursos", label: "Cursos" },
  { to: "/#diario", label: "Diário", hash: "diario" },
  { to: "/#nos", label: "Sobre", hash: "nos" },
];

function NavItem({ to, label, end, active }: { to: string; label: string; end?: boolean; active: boolean }) {
  return (
    <NavLink to={to} end={end} className={`nav-link ${active ? "is-active" : ""}`}>
      {active && (
        <motion.span
          layoutId="nav-drop"
          className="nav-drop"
          transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
        />
      )}
      <span className="nav-label">{label}</span>
    </NavLink>
  );
}

export function Layout() {
  const { pathname, hash } = useLocation();
  const { email } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // rola até a âncora (#diario, #nos) ou volta ao topo ao trocar de página
  useEffect(() => {
    const anchor = hash.replace("#", "");
    if (anchor) {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, hash]);

  const activeFor = (l: (typeof links)[number]) =>
    l.hash ? pathname === "/" && hash === `#${l.hash}` : l.end ? pathname === "/" && !hash : pathname.startsWith(l.to);

  return (
    <div className="app">
      <Sky />
      <header className={`topbar ${scrolled ? "is-scrolled" : ""}`}>
        <Glass as="nav" className="nav" radius={999} bezel={18} strength={32} blur={4} aria-label="Principal">
          <Link to="/" className="nav-brand" aria-label={`${site.name}, início`}>
            <LogoMark intro loop />
            <Wordmark />
          </Link>
          <LayoutGroup id="nav">
            <div className="nav-links">
              {links.map((l) => (
                <NavItem key={l.label} to={l.to} label={l.label} end={l.end} active={activeFor(l)} />
              ))}
            </div>
          </LayoutGroup>
          <Link to="/aluno" className="nav-cta">
            {email ? "Meus cursos" : "Área do aluno"}
          </Link>
        </Glass>
      </header>

      <Glass as="nav" className="tabbar" radius={999} bezel={16} strength={24} blur={7} aria-label="Navegação rápida">
        <LayoutGroup id="tabbar">
          {[...links.filter((l) => l.label !== "Sobre"), { to: "/aluno", label: "Aluno" }].map((l) => (
            <NavItem
              key={l.label}
              to={l.to}
              label={l.label}
              end={"end" in l ? l.end : undefined}
              active={"hash" in l || "end" in l ? activeFor(l as (typeof links)[number]) : pathname.startsWith(l.to)}
            />
          ))}
        </LayoutGroup>
      </Glass>

      {!isLive && (
        <div className="demo-ribbon" role="note">
          Modo demonstração: pagamentos simulados, nada é cobrado.
        </div>
      )}

      <main id="conteudo">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  const social = Object.entries(site.social).filter(([, v]) => v);
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <LogoMark className="footer-mark" />
          <div>
            <Wordmark />
            <p className="footer-tag">{site.tagline}</p>
          </div>
        </div>
        <nav className="footer-nav" aria-label="Rodapé">
          <Link to="/cursos">Cursos</Link>
          <Link to="/#diario">Diário</Link>
          <Link to="/aluno">Área do aluno</Link>
          <Link to="/admin">Área dos donos</Link>
        </nav>
        {social.length > 0 && (
          <nav className="footer-nav" aria-label="Redes sociais">
            {social.map(([k, v]) => (
              <a key={k} href={k === "email" ? `mailto:${v}` : v} target="_blank" rel="noreferrer">
                {k === "email" ? v : k[0].toUpperCase() + k.slice(1)}
              </a>
            ))}
          </nav>
        )}
        <p className="footer-legal">
          © {new Date().getFullYear()} {site.name}. Compras com garantia de 7 dias (art. 49 do Código de Defesa do
          Consumidor). Pagamentos processados pelo Mercado Pago.
        </p>
      </div>
    </footer>
  );
}
