/**
 * Catálogo de cursos. Os preços aqui são só para o site mostrar; quem manda
 * no valor cobrado é a tabela `courses` do banco (o servidor nunca confia no
 * preço que vem do navegador).
 *
 * Os valores e módulos abaixo são um rascunho para vocês ajustarem.
 */
export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  /** Aula aberta para quem ainda não comprou. */
  preview?: boolean;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  /** Código de embarque mostrado no cartão (3 letras). */
  code: string;
  title: string;
  kicker: string;
  summary: string;
  priceCents: number;
  /** Parcelas máximas no cartão. */
  installments: number;
  format: string;
  /** Texto de duração quando não é a soma das aulas (ex.: chamada ao vivo). */
  duration?: string;
  highlight?: boolean;
  route: [string, string];
  includes: string[];
  forWho: string[];
  modules: Module[];
}

export const courses: Course[] = [
  {
    slug: "irlanda-do-zero",
    code: "IRL",
    title: "Irlanda do Zero",
    kicker: "Curso completo",
    summary:
      "Do primeiro orçamento ao primeiro salário em euro. Tudo o que fizemos para sair do Brasil e nos estabelecer em Dublin, na ordem certa.",
    priceCents: 39700,
    installments: 12,
    format: "Vídeo-aulas + materiais",
    highlight: true,
    route: ["BR", "DUB"],
    includes: [
      "7 módulos em vídeo, no seu ritmo",
      "Planilha de custos do primeiro ano",
      "Checklist de documentos para a imigração",
      "Modelo de currículo no padrão irlandês",
      "Atualizações do curso sem custo extra",
    ],
    forWho: [
      "Quem quer fazer intercâmbio de inglês com trabalho na Irlanda",
      "Quem já decidiu ir e quer evitar erros caros",
      "Casais que vão juntos e precisam planejar a dois",
    ],
    modules: [
      {
        title: "Planejamento e dinheiro",
        lessons: [
          { id: "m1a1", title: "Quanto custa de verdade: o nosso primeiro mês", minutes: 14, preview: true },
          { id: "m1a2", title: "Reserva, câmbio e como levar dinheiro", minutes: 18 },
          { id: "m1a3", title: "Planilha do primeiro ano, linha por linha", minutes: 22 },
        ],
      },
      {
        title: "Escola e curso de inglês",
        lessons: [
          { id: "m2a1", title: "Como escolher a escola (e o que perguntar)", minutes: 16 },
          { id: "m2a2", title: "Agência ou direto com a escola?", minutes: 12 },
          { id: "m2a3", title: "Seguro, carta da escola e comprovantes", minutes: 15 },
        ],
      },
      {
        title: "Documentos e imigração",
        lessons: [
          { id: "m3a1", title: "O que levar na mala de mão para a imigração", minutes: 11, preview: true },
          { id: "m3a2", title: "Stamp 2: o que permite e o que não permite", minutes: 17 },
          { id: "m3a3", title: "Agendando o IRP sem dor de cabeça", minutes: 13 },
        ],
      },
      {
        title: "Primeiras semanas",
        lessons: [
          { id: "m4a1", title: "PPS Number, passo a passo", minutes: 12 },
          { id: "m4a2", title: "Conta no banco, chip e transporte (Leap Card)", minutes: 15 },
          { id: "m4a3", title: "Comida, mercado e como não jogar dinheiro fora", minutes: 10 },
        ],
      },
      {
        title: "Casa",
        lessons: [
          { id: "m5a1", title: "Onde procurar quarto e casa em Dublin", minutes: 19 },
          { id: "m5a2", title: "Golpes mais comuns e como fugir deles", minutes: 14 },
        ],
      },
      {
        title: "Trabalho",
        lessons: [
          { id: "m6a1", title: "Currículo no padrão irlandês", minutes: 20 },
          { id: "m6a2", title: "Onde procurar e como se apresentar", minutes: 16 },
          { id: "m6a3", title: "Horas permitidas, salário mínimo e seus direitos", minutes: 13 },
        ],
      },
      {
        title: "Viajar pela Europa morando na Irlanda",
        lessons: [
          { id: "m7a1", title: "Passagem barata sem cair na armadilha da última hora", minutes: 12 },
          { id: "m7a2", title: "Roteiros de fim de semana saindo de Dublin", minutes: 18 },
        ],
      },
    ],
  },
  {
    slug: "planilha-primeiro-mes",
    code: "EUR",
    title: "Planilha do Primeiro Mês",
    kicker: "Ferramenta",
    summary:
      "A planilha que usamos para controlar renda, aluguel e gastos em euro, com a aula que explica cada aba.",
    priceCents: 4700,
    installments: 1,
    format: "Planilha + aula curta",
    route: ["€", "R$"],
    includes: [
      "Planilha pronta (Google Sheets e Excel)",
      "Conversão automática euro ↔ real",
      "Metas de quanto guardar por mês",
      "Aula de 25 minutos explicando o uso",
    ],
    forWho: ["Quem acabou de chegar e quer saber para onde o dinheiro está indo", "Quem está juntando para ir"],
    modules: [
      {
        title: "Planilha",
        lessons: [
          { id: "p1a1", title: "Como usar a planilha", minutes: 25, preview: true },
          { id: "p1a2", title: "Lendo o balanço do mês", minutes: 9 },
        ],
      },
    ],
  },
  {
    slug: "mentoria-a-dois",
    code: "1:1",
    title: "Mentoria a Dois",
    kicker: "Ao vivo",
    summary:
      "Uma chamada de 60 minutos com a gente para olhar o seu plano, tirar dúvidas e montar os próximos passos.",
    priceCents: 29000,
    installments: 6,
    format: "Chamada de vídeo",
    duration: "60 min",
    route: ["Você", "Nós"],
    includes: [
      "60 minutos com o Leo e a Helena",
      "Revisão do seu orçamento e cronograma",
      "Resumo por escrito depois da conversa",
      "Acesso ao curso Irlanda do Zero por 30 dias",
    ],
    forWho: ["Quem quer uma opinião sobre o próprio caso", "Quem tem pouco tempo e quer ir direto ao ponto"],
    modules: [
      {
        title: "Antes da chamada",
        lessons: [{ id: "c1a1", title: "Formulário de preparação", minutes: 5 }],
      },
    ],
  },
];

export const courseBySlug = (slug: string | undefined) => courses.find((c) => c.slug === slug);

export const lessonCount = (c: Course) => c.modules.reduce((n, m) => n + m.lessons.length, 0);
export const totalMinutes = (c: Course) =>
  c.modules.reduce((n, m) => n + m.lessons.reduce((s, l) => s + l.minutes, 0), 0);
