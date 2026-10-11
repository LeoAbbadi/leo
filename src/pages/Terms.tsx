import { site } from "../content/site";

/**
 * Rascunho de termos e privacidade para revisão. Antes de vender de verdade,
 * vale passar por um advogado ou contador.
 */
export function Terms() {
  const contact = site.social.email || "o e-mail de contato informado no site";
  return (
    <section className="section page-top narrow-text legal">
      <span className="eyebrow">Informações</span>
      <h1 className="page-title">Termos de uso</h1>
      <p className="muted">Rascunho para revisão.</p>

      <h2 className="h3">Acesso aos cursos</h2>
      <p>
        A compra dá acesso individual ao curso escolhido, pela Área do aluno, com o e-mail usado na compra. O acesso não
        pode ser compartilhado nem revendido.
      </p>

      <h2 className="h3">Pagamento</h2>
      <p>
        Os pagamentos são processados pelo Mercado Pago, por Pix ou cartão de crédito. O site não recebe nem guarda dados
        de cartão.
      </p>

      <h2 className="h3">Garantia e reembolso</h2>
      <p>
        Você pode pedir o reembolso integral em até 7 dias após a compra (art. 49 do Código de Defesa do Consumidor). O
        acesso ao curso é removido quando o valor é devolvido.
      </p>

      <h2 className="h3" id="privacidade">
        Política de privacidade
      </h2>
      <p>
        Para emitir o pagamento e liberar o curso, guardamos nome, e-mail, CPF, o curso comprado e a situação do
        pagamento. Esses dados são usados só para isso e para falar com você sobre a compra. O CPF é exigido pelo
        Mercado Pago.
      </p>
      <p>
        Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir para ver, corrigir ou apagar os seus dados escrevendo
        para {contact}.
      </p>
    </section>
  );
}
