import type { SceneName } from "./countries";

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
  scene: SceneName;
  caption: string;
  /** País ou região, mostrado no cartão do topo. */
  region?: string;
  /** Detalhe à direita no cartão do topo (data, situação). */
  meta?: string;
}

export const diary: Photo[] = [
  { driveId: "", alt: "Ha'penny Bridge sobre o rio Liffey", place: "Dublin", region: "Irlanda", meta: "Onde moramos", scene: "dublin", caption: "O primeiro pôr do sol no Liffey" },
  { driveId: "", alt: "Torre Eiffel ao entardecer", place: "Paris", region: "França", meta: "Ago 2026", scene: "paris", caption: "Paris de última hora" },
  { driveId: "", alt: "Penhascos de Moher", place: "Cliffs of Moher", region: "Irlanda", meta: "Na lista", scene: "cliffs", caption: "Próximo destino na lista" },
  { driveId: "", alt: "Farol de Howth", place: "Howth", region: "Irlanda", meta: "Bate-volta", scene: "howth", caption: "Bate-volta de trem saindo de Dublin" },
];

/** As três fotos redondas da seção "Oi, prazer!" (a do meio é a principal). */
export const introPhotos: Photo[] = [
  { driveId: "", alt: "Dublin ao entardecer", place: "Dublin", scene: "dublin", caption: "" },
  { driveId: "", alt: "Leo e Helena", place: "Nós", scene: "voo", caption: "" },
  { driveId: "", alt: "Paris", place: "Paris", scene: "paris", caption: "" },
];

/**
 * Endereço da imagem servida pelo próprio Google.
 * `width` pede uma versão reduzida para a página carregar rápido.
 */
export function driveImage(id: string, width = 1200): string {
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w${width}`;
}
