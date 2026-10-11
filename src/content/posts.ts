import type { SceneName } from "./countries";

/**
 * Posts do diário. Os três primeiros são rascunhos escritos a partir do vídeo
 * do primeiro mês em Dublin: revisem e reescrevam do jeito de vocês.
 *
 * Blocos do texto:
 *  { p: "parágrafo" } · { h2: "subtítulo" } · { list: ["item", …] }
 *  { stats: [["3.142 €", "recebido em agosto"], …] } · { tip: "destaque" }
 *  { photo: "ID do Drive", caption: "legenda" }
 */
export type Block =
  | { p: string }
  | { h2: string }
  | { list: string[] }
  | { stats: [string, string][] }
  | { tip: string }
  | { photo: string; caption?: string };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** AAAA-MM-DD */
  date: string;
  category: "Vida na Irlanda" | "Viagens" | "Dinheiro" | "Diário";
  author: "Leo" | "Helena" | "Leo e Helena";
  /** ID do país em countries.ts (aparece no álbum). */
  country?: string;
  coverDriveId: string;
  scene: SceneName;
  body: Block[];
}

export const posts: Post[] = [
  {
    slug: "primeiro-mes-em-dublin",
    title: "Nosso primeiro mês em Dublin: quanto entrou e quanto saiu",
    excerpt: "Agosto foi o primeiro mês inteiro na Irlanda. As contas de verdade, os gastos bobos e o que sobrou no fim.",
    date: "2026-09-01",
    category: "Dinheiro",
    author: "Leo",
    country: "irlanda",
    coverDriveId: "",
    scene: "dublin",
    body: [
      { p: "Cheguei em Dublin no dia 10 de julho, então agosto foi o primeiro mês inteirinho por aqui. Resolvi abrir as contas: quanto entrou, quanto saiu e quanto sobrou." },
      {
        stats: [
          ["3.142 €", "recebido em agosto"],
          ["677 €", "aluguel + faxina"],
          ["+1.423,97 €", "o que sobrou"],
        ],
      },
      { h2: "Onde o dinheiro foi" },
      { p: "Tirando o aluguel, o maior gasto não foi nada essencial. Foi besteira, todo dia:" },
      {
        list: [
          "Dois, três brownies por dia na escola",
          "Café, Monster e Coca-Cola na loja de conveniência",
          "Kebab e hambúrguer quase todos os dias",
          "Roupa e outros gastos que não precisavam acontecer",
        ],
      },
      { p: "Também joguei comida fora. Aqui a comida estraga rápido, e às vezes eu chegava tão cansado que não queria cozinhar e deixava estragar." },
      { h2: "A viagem de última hora" },
      { p: "No meio do mês fui para Paris ver a FURIA jogar ao vivo. Comprei a passagem em cima da hora e paguei três vezes o preço normal. Valeu a experiência, mas não é um gasto para ter todo mês." },
      { tip: "Anote tudo o que gasta. Foi só olhando o relatório do app que eu vi quanto ia embora em coisa pequena." },
      { h2: "E aí, dá para guardar?" },
      { p: "Mesmo gastando sem controle, sobraram 1.423,97 €. Controlando a comida fora e comprando passagem com antecedência, sobra bem mais. E vocês: anotam o que gastam? Conseguiriam guardar isso no Brasil?" },
    ],
  },
  {
    slug: "paris-de-ultima-hora",
    title: "Paris de última hora para ver a FURIA ao vivo",
    excerpt: "Uma viagem relâmpago saindo de Dublin, a passagem que custou o triplo e por que valeu mesmo assim.",
    date: "2026-08-20",
    category: "Viagens",
    author: "Leo",
    country: "franca",
    coverDriveId: "",
    scene: "paris",
    body: [
      { p: "Morar na Irlanda deixa a Europa a um voo curto de distância. Em agosto aproveitei isso do jeito mais impulsivo possível: fui para Paris ver a FURIA jogar ao vivo." },
      { h2: "O preço da pressa" },
      { p: "Comprei a passagem de última hora e paguei três vezes o valor normal. Em Paris também gastei bastante. Foi a viagem mais cara do mês, e a que mais pesou no balanço." },
      { tip: "Passagem na Europa fica barata com antecedência. Se o plano é viajar, compre assim que decidir." },
      { p: "Ver o jogo ao vivo foi incrível. Da próxima vez, com planejamento." },
    ],
  },
  {
    slug: "comecando-o-diario",
    title: "Começando o nosso diário",
    excerpt: "O que vai aparecer por aqui: viagens, a vida em Dublin e as contas de verdade de quem acabou de chegar.",
    date: "2026-10-11",
    category: "Diário",
    author: "Leo e Helena",
    coverDriveId: "",
    scene: "cliffs",
    body: [
      { p: "Oi! Este é o nosso diário. A gente saiu do Brasil em julho de 2026 e mora em Dublin desde então." },
      { p: "Aqui vamos contar as viagens pela Europa, como é o dia a dia na Irlanda e os números reais: quanto custa, quanto entra, o que deu certo e o que deu errado." },
      { list: ["Viagens, com o álbum de fotos de cada país", "Vida na Irlanda: escola, documentos, casa e trabalho", "Dinheiro: as contas de cada mês"] },
      { p: "E na aba \"Aonde estamos agora?\" dá para ver onde a gente está neste momento. A gente atualiza a cada viagem." },
    ],
  },
];

export const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));
export const postBySlug = (slug: string | undefined) => posts.find((p) => p.slug === slug);

/** Minutos de leitura (200 palavras por minuto). */
export function readingTime(p: Post) {
  const words = p.body
    .map((b) => ("p" in b ? b.p : "h2" in b ? b.h2 : "list" in b ? b.list.join(" ") : "tip" in b ? b.tip : ""))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
