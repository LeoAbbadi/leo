import { courseBySlug } from "../../content/courses";
import type { CheckoutInput, Enrollment, Gateway, Order, OrderStatus } from "./types";

/**
 * Modo demonstração: simula o Mercado Pago dentro do navegador para dar para
 * testar a compra inteira (Pix, cartão, confirmação e liberação do curso)
 * antes de ligar o banco de dados e a conta de pagamentos.
 */

const KEY = "leo-helena:demo:v1";
const PIX_MINUTES = 30;

interface DemoDb {
  orders: Order[];
  enrollments: Enrollment[];
}

let memory: DemoDb | null = null;
const listeners = new Set<() => void>();
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(KEY) : null;
channel?.addEventListener("message", () => {
  memory = null;
  listeners.forEach((l) => l());
});

function read(): DemoDb {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    memory = raw ? (JSON.parse(raw) as DemoDb) : { orders: [], enrollments: [] };
  } catch {
    memory = { orders: [], enrollments: [] };
  }
  return memory;
}

function write(db: DemoDb) {
  memory = db;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* navegador sem armazenamento: segue só na memória */
  }
  channel?.postMessage("changed");
  listeners.forEach((l) => l());
}

const randomId = (bytes = 8) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, "0")).join("");

/** Marca como vencido o Pix que passou do prazo. */
function withExpiry(order: Order): Order {
  if (order.status === "pending" && order.expiresAt && Date.parse(order.expiresAt) < Date.now()) {
    return { ...order, status: "expired" };
  }
  return order;
}

function setStatus(db: DemoDb, id: string, status: OrderStatus, source: "demo" | "manual"): DemoDb {
  const now = new Date().toISOString();
  const orders = db.orders.map((o) => {
    if (o.id !== id) return o;
    const next: Order = { ...o, status };
    if (status === "paid") {
      next.paidAt = now;
      next.verification = {
        signatureValid: source === "demo",
        amountMatches: true,
        confirmedWithProvider: source === "demo",
        source,
        checkedAt: now,
      };
    }
    return next;
  });
  const order = orders.find((o) => o.id === id);
  let enrollments = db.enrollments;
  if (order && status === "paid" && !enrollments.some((e) => e.orderId === id && !e.revokedAt)) {
    enrollments = [
      ...enrollments,
      { email: order.email, courseSlug: order.courseSlug, orderId: id, grantedAt: now },
    ];
  }
  if (order && status === "refunded") {
    enrollments = enrollments.map((e) => (e.orderId === id && !e.revokedAt ? { ...e, revokedAt: now } : e));
  }
  return { orders, enrollments };
}

export const demoGateway: Gateway = {
  mode: "demo",

  async createCheckout(input: CheckoutInput) {
    const course = courseBySlug(input.courseSlug);
    if (!course) throw new Error("Curso não encontrado.");
    const id = randomId(6);
    const now = new Date();
    const order: Order = {
      id,
      token: randomId(12),
      courseSlug: course.slug,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      cpf: input.cpf,
      amountCents: course.priceCents,
      method: input.method,
      status: "pending",
      provider: "demo",
      providerPaymentId: `DEMO-${id.toUpperCase()}`,
      createdAt: now.toISOString(),
    };
    if (input.method === "pix") {
      order.expiresAt = new Date(now.getTime() + PIX_MINUTES * 60_000).toISOString();
      // Código propositalmente inválido para bancos: é só uma demonstração.
      order.pix = { copyPaste: `DEMONSTRACAO|LEO-E-HELENA|PEDIDO-${id.toUpperCase()}|${course.code}|NAO-PAGAR` };
    }
    const db = read();
    write({ ...db, orders: [order, ...db.orders] });
    await new Promise((r) => setTimeout(r, 650));
    return order;
  },

  async getOrder(id, token) {
    const order = read().orders.find((o) => o.id === id && o.token === token);
    return order ? withExpiry(order) : null;
  },

  async enrollments(email) {
    const e = email.trim().toLowerCase();
    return read().enrollments.filter((x) => x.email === e && !x.revokedAt);
  },

  async listOrders() {
    return read().orders.map(withExpiry);
  },

  async markPaid(id) {
    write(setStatus(read(), id, "paid", "manual"));
  },

  async simulate(id, outcome) {
    await new Promise((r) => setTimeout(r, 900));
    write(setStatus(read(), id, outcome, "demo"));
  },

  subscribe(onChange) {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  },
};

/** Apaga pedidos e alunos de teste. */
export function resetDemo() {
  write({ orders: [], enrollments: [] });
}
