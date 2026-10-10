import { MotionConfig } from "motion/react";
import { HashRouter, Route, Routes } from "react-router";
import { AdminLayout } from "./components/AdminLayout";
import { PublicLayout } from "./components/PublicLayout";
import { ToastProvider } from "./components/ui";
import { AuthProvider } from "./lib/auth";
import { DataProvider } from "./lib/store";
import { Home } from "./pages/Home";
import { Ranking } from "./pages/Ranking";
import { Schedule } from "./pages/Schedule";
import { Dashboard } from "./pages/admin/Dashboard";
import { Interests } from "./pages/admin/Interests";
import { Login } from "./pages/admin/Login";
import { Players } from "./pages/admin/Players";
import { Results } from "./pages/admin/Results";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { Tournaments } from "./pages/admin/Tournaments";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <DataProvider>
        <AuthProvider>
          <ToastProvider>
            <HashRouter>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route index element={<Home />} />
                  <Route path="torneios" element={<Schedule />} />
                  <Route path="ranking" element={<Ranking />} />
                </Route>
                <Route path="admin/entrar" element={<Login />} />
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="torneios" element={<Tournaments />} />
                  <Route path="torneios/:id/resultados" element={<Results />} />
                  <Route path="jogadores" element={<Players />} />
                  <Route path="inscricoes" element={<Interests />} />
                  <Route path="configuracoes" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<PublicLayout />}>
                  <Route path="*" element={<Home />} />
                </Route>
              </Routes>
            </HashRouter>
          </ToastProvider>
        </AuthProvider>
      </DataProvider>
    </MotionConfig>
  );
}
