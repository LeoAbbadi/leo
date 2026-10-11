import { MotionConfig } from "motion/react";
import { HashRouter, Navigate, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/ui";
import { SessionProvider } from "./lib/session";
import { About } from "./pages/About";
import { Admin } from "./pages/admin/Admin";
import { Blog } from "./pages/Blog";
import { Learn } from "./pages/Learn";
import { Now } from "./pages/Now";
import { Post } from "./pages/Post";
import { Checkout } from "./pages/Checkout";
import { Country } from "./pages/Country";
import { CourseDetail } from "./pages/CourseDetail";
import { Home } from "./pages/Home";
import { Order } from "./pages/Order";
import { Player, Student } from "./pages/Student";
import { Terms } from "./pages/Terms";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SessionProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="sobre" element={<About />} />
                <Route path="termos" element={<Terms />} />
                <Route path="paises/:id" element={<Country />} />
                <Route path="diario" element={<Blog />} />
                <Route path="diario/:slug" element={<Post />} />
                <Route path="agora" element={<Now />} />
                <Route path="aprender" element={<Learn />} />
                <Route path="cursos" element={<Navigate to="/aprender" replace />} />
                <Route path="cursos/:slug" element={<CourseDetail />} />
                <Route path="checkout/:slug" element={<Checkout />} />
                <Route path="pedido/:id" element={<Order />} />
                <Route path="aluno" element={<Student />} />
                <Route path="aluno/:slug" element={<Player />} />
                <Route path="admin" element={<Admin />} />
                <Route path="*" element={<Home />} />
              </Route>
            </Routes>
          </HashRouter>
        </ToastProvider>
      </SessionProvider>
    </MotionConfig>
  );
}
