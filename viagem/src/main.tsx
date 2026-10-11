import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/global.css";

// Volta do checkout do Mercado Pago: ?pedido=<id>&t=<código> → página do pedido.
const params = new URLSearchParams(location.search);
const pedido = params.get("pedido");
const token = params.get("t");
if (pedido && token) {
  history.replaceState(null, "", `${location.pathname}#/pedido/${encodeURIComponent(pedido)}?t=${encodeURIComponent(token)}`);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
