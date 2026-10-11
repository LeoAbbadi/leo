import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativo: o build funciona em qualquer hospedagem estática e na prévia.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
