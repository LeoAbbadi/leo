/**
 * Fotos do Google Drive, usadas direto do Drive (sem baixar).
 *
 * Como adicionar: no Drive, compartilhe a pasta como "Qualquer pessoa com o link
 * pode ver". Copie o ID de cada foto (o trecho entre /d/ e /view no link) e
 * coloque abaixo. Veja docs/fotos-google-drive.md.
 */
export interface Photo {
  /** ID do arquivo no Google Drive. Vazio = mostra a ilustração no lugar. */
  driveId: string;
  alt: string;
  place: string;
  /** Ilustração usada enquanto a foto não existe. */
  scene: "dublin" | "paris" | "cliffs" | "howth" | "voo";
  caption: string;
}

export const diary: Photo[] = [
  { driveId: "", alt: "Ha'penny Bridge sobre o rio Liffey", place: "Dublin", scene: "dublin", caption: "O primeiro pôr do sol no Liffey" },
  { driveId: "", alt: "Torre Eiffel ao entardecer", place: "Paris", scene: "paris", caption: "Paris de última hora" },
  { driveId: "", alt: "Penhascos de Moher", place: "Cliffs of Moher", scene: "cliffs", caption: "Próximo destino na lista" },
  { driveId: "", alt: "Farol de Howth", place: "Howth", scene: "howth", caption: "Bate-volta de trem saindo de Dublin" },
];

/**
 * Endereço da imagem servida pelo próprio Google.
 * `width` pede uma versão reduzida para a página carregar rápido.
 */
export function driveImage(id: string, width = 1200): string {
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w${width}`;
}
