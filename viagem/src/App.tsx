import { MotionConfig } from "motion/react";
import { HashRouter, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/ui";
import { SessionProvider } from "./lib/session";
import { Admin } from "./pages/admin/Admin";
import { Checkout } from "./pages/Checkout";
import { CourseDetail } from "./pages/CourseDetail";
import { Courses } from "./pages/Courses";
import { Home } from "./pages/Home";
import { Order } from "./pages/Order";
import { Player, Student } from "./pages/Student";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SessionProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="cursos" element={<Courses />} />
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
