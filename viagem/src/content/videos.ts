/** Vídeos em destaque na página inicial. `url` vazio = cartão sem link. */
export interface Video {
  title: string;
  kicker: string;
  /** Arte da capa enquanto não há miniatura. */
  cover: "money" | "paris" | "plane";
  url: string;
  /** ID da miniatura no Google Drive (opcional). */
  thumbDriveId?: string;
}

export const videos: Video[] = [
  {
    kicker: "Reels · Irlanda",
    title: "Quanto eu recebi e quanto gastei no meu 1º mês na Irlanda",
    cover: "money",
    url: "",
  },
];
