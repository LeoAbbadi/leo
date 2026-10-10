import { createContext, useContext, useState, type ReactNode } from "react";
import { useData } from "./store";

/**
 * Login de demonstração: confere o e-mail do dono cadastrado nas
 * configurações e uma senha fixa. Não protege nada de verdade; será
 * substituído pelo login do banco de dados (ex.: Supabase Auth).
 */
export const DEMO_PASSWORD = "flop2026";
const SESSION_KEY = "clube-poker:sessao";

interface AuthContextValue {
  email: string | null;
  login(email: string, password: string): string | null;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data } = useData();
  const [email, setEmail] = useState<string | null>(readSession);

  const value: AuthContextValue = {
    email,
    login(inputEmail, password) {
      const owner = data?.settings.ownerEmail.toLowerCase();
      if (inputEmail.trim().toLowerCase() !== owner || password !== DEMO_PASSWORD) {
        return "E-mail ou senha incorretos. Confira os dados de acesso e tente de novo.";
      }
      try {
        sessionStorage.setItem(SESSION_KEY, inputEmail);
      } catch {
        /* sem armazenamento: a sessão dura até recarregar a página */
      }
      setEmail(inputEmail);
      return null;
    },
    logout() {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        /* nada a limpar */
      }
      setEmail(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
