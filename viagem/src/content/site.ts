/**
 * Textos e dados do site. Tudo que vocês quiserem trocar (nomes, frases,
 * redes sociais) fica aqui, sem precisar mexer no resto do código.
 */
export const site = {
  name: "Leo & Helena",
  /** Versão curta usada na aba do navegador e no rodapé. */
  short: "leo&helena",
  tagline: "viagens · vida fora",
  homeBase: { city: "Dublin", country: "Irlanda", iata: "DUB", since: "2026-07-10" },
  hero: {
    eyebrow: "DUB · desde 10 jul 2026",
    title: ["A gente foi", "morar", "fora."],
    subtitle:
      "Somos o Leo e a Helena. Aqui a gente mostra as viagens pela Europa e ensina, passo a passo, como sair do Brasil e começar a vida na Irlanda: visto, escola, casa e primeiro emprego.",
  },
  about: {
    title: "Oi, somos o Leo e a Helena",
    paragraphs: [
      "Dois brasileiros que trocaram o Brasil por Dublin em julho de 2026. Chegamos com mala, planilha e muita dúvida, e fomos resolvendo uma coisa de cada vez: escola, IRP, PPS, conta no banco, casa, trabalho.",
      "Tudo o que aprendemos (inclusive os erros, como o primeiro mês gastando demais com comida fora) virou conteúdo. A ideia é simples: encurtar o caminho de quem quer fazer o mesmo.",
    ],
  },
  /** Deixe vazio ("") para esconder o link. */
  social: {
    instagram: "",
    youtube: "",
    tiktok: "",
    email: "",
  },
} as const;

export type Site = typeof site;
