import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isLive } from "./env";
import { getSupabase } from "./supabase";

/**
 * Quem está usando o site: o aluno (pelo e-mail da compra) e, se for o caso,
 * o dono. No modo demonstração basta digitar o e-mail; no modo real o
 * Supabase manda um link de acesso por e-mail.
 */

const KEY = "leo-helena:session:v1";
export const DEMO_ADMIN = { email: "leo@exemplo.com", password: "dublin2026" };

interface SessionValue {
  ready: boolean;
  email: string | null;
  isAdmin: boolean;
  /** "ok" quando já entrou; "link" quando mandamos um link por e-mail. */
  signIn(email: string): Promise<"ok" | "link">;
  adminSignIn(email: string, password: string): Promise<boolean>;
  signOut(): Promise<void>;
}

const Ctx = createContext<SessionValue | null>(null);

function readDemo(): { email: string | null; isAdmin: boolean } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* sem armazenamento */
  }
  return { email: null, isAdmin: false };
}

function writeDemo(v: { email: string | null; isAdmin: boolean }) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* sem armazenamento */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() =>
    isLive ? { ready: false, email: null as string | null, isAdmin: false } : { ready: true, ...readDemo() },
  );

  useEffect(() => {
    if (!isLive) return;
    let unsub = () => {};
    getSupabase().then((sb) => {
      const apply = (user: { email?: string; app_metadata?: Record<string, unknown> } | null | undefined) =>
        setState({
          ready: true,
          email: user?.email?.toLowerCase() ?? null,
          isAdmin: user?.app_metadata?.role === "admin",
        });
      sb.auth.getSession().then(({ data }) => apply(data.session?.user));
      const { data } = sb.auth.onAuthStateChange((_e, s) => {
        apply(s?.user);
        // volta para a página certa depois do link mágico
        const next = new URLSearchParams(location.search).get("next");
        if (s && next) {
          history.replaceState(null, "", location.pathname + "#/" + next);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
      });
      unsub = () => data.subscription.unsubscribe();
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!isLive) {
      const next = { email: clean, isAdmin: false };
      writeDemo(next);
      setState({ ready: true, ...next });
      return "ok" as const;
    }
    const sb = await getSupabase();
    const { error } = await sb.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: `${location.origin}${location.pathname}?next=aluno` },
    });
    if (error) throw new Error(error.message);
    return "link" as const;
  }, []);

  const adminSignIn = useCallback(async (email: string, password: string) => {
    if (isLive) throw new Error("No modo real, entre pelo link enviado ao e-mail de administrador.");
    const ok = email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
    if (ok) {
      const next = { email: DEMO_ADMIN.email, isAdmin: true };
      writeDemo(next);
      setState({ ready: true, ...next });
    }
    return ok;
  }, []);

  const signOut = useCallback(async () => {
    if (isLive) await (await getSupabase()).auth.signOut();
    writeDemo({ email: null, isAdmin: false });
    setState({ ready: true, email: null, isAdmin: false });
  }, []);

  const value = useMemo(() => ({ ...state, signIn, adminSignIn, signOut }), [state, signIn, adminSignIn, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession fora do SessionProvider");
  return v;
}
