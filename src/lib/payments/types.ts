export type PaymentMethod = "pix" | "card";

/**
 * pending  – aguardando pagamento
 * paid     – pagamento confirmado e acesso liberado
 * failed   – recusado pelo banco ou cartão
 * expired  – Pix venceu sem pagamento
 * refunded – devolvido (acesso removido)
 */
export type OrderStatus = "pending" | "paid" | "failed" | "expired" | "refunded";

export interface Verification {
  /** Assinatura do aviso do Mercado Pago conferida com a chave secreta. */
  signatureValid: boolean;
  /** Valor pago igual ao preço do curso no banco. */
  amountMatches: boolean;
  /** Pagamento consultado direto na API (não confiamos só no aviso). */
  confirmedWithProvider: boolean;
  source: "webhook" | "manual" | "demo";
  checkedAt: string;
}

export interface Order {
  id: string;
  /** Código secreto que deixa o comprador acompanhar o pedido sem login. */
  token: string;
  courseSlug: string;
  name: string;
  email: string;
  cpf: string;
  amountCents: number;
  method: PaymentMethod;
  status: OrderStatus;
  provider: "demo" | "mercadopago";
  providerPaymentId?: string;
  createdAt: string;
  paidAt?: string;
  expiresAt?: string;
  pix?: { copyPaste: string; qrBase64?: string };
  /** Endereço do checkout do Mercado Pago (cartão). */
  checkoutUrl?: string;
  verification?: Verification;
}

export interface CheckoutInput {
  courseSlug: string;
  name: string;
  email: string;
  cpf: string;
  method: PaymentMethod;
}

export interface Enrollment {
  email: string;
  courseSlug: string;
  orderId: string;
  grantedAt: string;
  revokedAt?: string;
}

export interface Gateway {
  mode: "demo" | "live";
  createCheckout(input: CheckoutInput): Promise<Order>;
  getOrder(id: string, token: string): Promise<Order | null>;
  /** Cursos liberados para o e-mail da sessão. */
  enrollments(email: string): Promise<Enrollment[]>;
  /** Área do dono: todos os pedidos. */
  listOrders(): Promise<Order[]>;
  /** Confirma um pagamento recebido por fora (ex.: Pix direto na conta). */
  markPaid(id: string): Promise<void>;
  /** Só no modo demonstração: simula a resposta do banco. */
  simulate?(id: string, outcome: "paid" | "failed" | "expired" | "refunded"): Promise<void>;
  subscribe(onChange: () => void): () => void;
}
