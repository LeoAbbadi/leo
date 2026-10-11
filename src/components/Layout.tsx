import { LayoutGroup, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { site } from "../content/site";
import { isLive } from "../lib/env";
import { useSession } from "../lib/session";
import { Glass } from "./Glass";
import { LogoMark, Wordmark } from "./Logo";
import { Sky } from "./Sky";

interface NavEntry {
  to: string;
  label: string;
  short?: string;
  end?: boolean;
  hash?: string;
}

const links: NavEntry[] = [
  { to: "/", label: "Início", end: true },
  { to: "/sobre", label: "Sobre nós", short: "Sobre" },
  { to: "/#paises", label: "Países", hash: "paises" },
  { to: "/#mapa", label: "Mapa", hash: "mapa" },
  { to: "/cursos", label: "Cursos" },
  { to: "/#videos", label: "Vídeos", hash: "videos" },
];

function NavItem({ entry, active, short = false }: { entry: NavEntry; active: boolean; short?: boolean }) {
  return (
    <NavLink to={entry.to} end={entry.end} className={`nav-link ${active ? "is-active" : ""}`}>
      {active && (
        <motion.span layoutId="nav-drop" className="nav-drop" transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }} />
      )}
      <span className="nav-label">{short && entry.short ? entry.short : entry.label}</span>
    </NavLink>
  );
}

const icons: Record<string, string> = {
  instagram:
    "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.9-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3.6c2.7 0 3 0 4.1.1 2.8.1 4.1 1.4 4.2 4.2.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.8-1.4 4.1-4.2 4.2-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.8-.1-4.1-1.4-4.2-4.2-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1C3.8 5 5.1 3.8 7.9 3.7c1.1-.1 1.4-.1 4.1-.1Z",
  youtube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z",
  tiktok:
    "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z",
};

export function Layout() {
  const { pathname, hash } = useLocation();
  const { email } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setPastHero(window.scrollY > Math.min(window.innerHeight * 0.55, 420));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // rola até a âncora (#mapa, #videos) ou volta ao topo ao trocar de página
  useEffect(() => {
    const anchor = hash.replace("#", "");
    if (anchor) {
      // a página pode ter acabado de abrir: espera um quadro para a seção existir
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    else window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  const activeFor = (l: NavEntry) =>
    l.hash ? pathname === "/" && hash === `#${l.hash}` : l.end ? pathname === "/" && !hash : pathname.startsWith(l.to);

  // Na página inicial, por cima da foto do topo, cada link é uma pílula de vidro
  // separada; depois de rolar, as pílulas se juntam numa barra só.
  const split = pathname === "/" && !pastHero;

  return (
    <div className="app">
      <Sky />
      <header className={`topbar ${scrolled ? "is-scrolled" : ""}`}>
        <Glass as="nav" className={`nav ${split ? "is-split" : "is-merged"}`} radius={999} bezel={18} strength={32} blur={4} aria-label="Principal">
          <Link to="/" className="nav-brand" aria-label={`${site.name}, início`}>
            <LogoMark intro loop />
            <span className="nav-brand-text">
              <Wordmark />
              <span className="nav-tag">{site.tagline}</span>
            </span>
          </Link>
          <LayoutGroup id="nav">
            <motion.div className="nav-links" layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              {links.map((l) => (
                <motion.span key={l.label} layout className="nav-pill">
                  <NavItem entry={l} active={activeFor(l)} />
                </motion.span>
              ))}
            </motion.div>
          </LayoutGroup>
          <Link to="/aluno" className="nav-cta">
            {email ? "Meus cursos" : "Área do aluno"}
          </Link>
        </Glass>
      </header>

      <Glass as="nav" className="tabbar" radius={999} bezel={16} strength={24} blur={7} aria-label="Navegação rápida">
        <LayoutGroup id="tabbar">
          {[links[0], links[2], links[4], links[1], { to: "/aluno", label: "Aluno" }].map((l) => (
            <NavItem key={l.label} entry={l} short active={activeFor(l)} />
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
  const social = (["youtube", "instagram", "tiktok"] as const).filter((k) => site.social[k]);
  return (
    <footer className="footer">
      <div className="footer-card">
        <div className="footer-top">
          <div className="footer-brand">
            <LogoMark className="footer-mark" />
            <div>
              <Wordmark />
              <p className="footer-tag">{site.tagline}</p>
              <p className="footer-blurb">Viagens pela Europa e o caminho para morar na Irlanda, contado por quem está fazendo.</p>
            </div>
          </div>
          <nav className="footer-col" aria-label="Links úteis">
            <strong>Links úteis</strong>
            <Link to="/">Início</Link>
            <Link to="/sobre">Sobre nós</Link>
            <Link to="/#paises">Países</Link>
            <Link to="/#mapa">Mapa</Link>
            <Link to="/cursos">Cursos</Link>
            <Link to="/#videos">Vídeos</Link>
            <Link to="/aluno">Área do aluno</Link>
          </nav>
          <nav className="footer-col" aria-label="Informações">
            <strong>Informações</strong>
            <Link to="/termos">Termos de uso</Link>
            <Link to="/termos#privacidade">Política de privacidade</Link>
            <Link to="/#perguntas">Perguntas frequentes</Link>
            <Link to="/admin">Área dos donos</Link>
            {site.social.email && <span className="footer-email">{site.social.email}</span>}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {site.name}. Todos os direitos reservados. Pagamentos processados pelo Mercado Pago.
          </p>
          {social.length > 0 && (
            <div className="footer-social">
              {social.map((k) => (
                <a key={k} href={site.social[k]} target="_blank" rel="noreferrer" aria-label={k}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={icons[k]} />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
