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
    /** Primeira linha fixa; a segunda vai trocando. */
    lead: "Morando na Irlanda",
    rotating: ["e viajando a Europa", "e mostrando o caminho", "e contando tudo"],
    subtitle:
      "Somos o Leo e a Helena. Aqui a gente mostra as viagens pela Europa e ensina, passo a passo, como sair do Brasil e começar a vida na Irlanda.",
    /** Texto do botão de vídeo do topo (leva para a seção de vídeos). */
    video: { title: "Assistir ao vídeo", sub: "Nosso 1º mês em Dublin" },
    /** ID de uma foto ou vídeo do Google Drive para o topo. Vazio = ilustração animada. */
    photoDriveId: "",
  },
  intro: {
    hello: "Oi, prazer!",
    names: "Somos Leo e Helena",
    text: "Em julho de 2026 a gente trocou o Brasil por Dublin. Chegamos com mala, planilha e muita dúvida, e fomos resolvendo uma coisa de cada vez: escola, documentos, casa e trabalho. Aqui a gente divide as viagens e tudo o que aprendeu no caminho.",
  },
  hashtag: "#LEOEHELENA",
  about: {
    title: "Oi, somos o Leo e a Helena",
    paragraphs: [
      "Dois brasileiros que trocaram o Brasil por Dublin em julho de 2026. Chegamos com mala, planilha e muita dúvida, e fomos resolvendo uma coisa de cada vez: escola, IRP, PPS, conta no banco, casa, trabalho.",
      "Tudo o que aprendemos (inclusive os erros, como o primeiro mês gastando demais com comida fora) virou conteúdo. A ideia é simples: encurtar o caminho de quem quer fazer o mesmo.",
    ],
  },
  /** Linha do tempo da página "Sobre nós". */
  timeline: [
    { when: "Antes", title: "A decisão", text: "Juntar dinheiro, escolher a escola e montar a planilha da mudança." },
    { when: "10 jul 2026", title: "Chegada em Dublin", text: "Mala, imigração e os primeiros dias procurando o caminho de casa." },
    { when: "Jul–ago 2026", title: "O primeiro mês", text: "Escola de inglês todo dia, documentos, trabalho e as primeiras contas em euro." },
    { when: "Ago 2026", title: "Paris de última hora", text: "Uma viagem relâmpago para ver a FURIA jogar ao vivo." },
  ],
  /** Deixe vazio ("") para esconder o link. */
  social: {
    instagram: "",
    youtube: "",
    tiktok: "",
    email: "",
  },
} as const;

export type Site = typeof site;
