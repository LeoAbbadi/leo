/** Lugares do mapa e do diário. Coordenadas em graus (latitude, longitude). */
export interface Place {
  id: string;
  city: string;
  country: string;
  iata: string;
  lat: number;
  lon: number;
  kind: "casa" | "base" | "viagem";
  /** Data da viagem ou da mudança (AAAA-MM-DD). */
  date?: string;
  note: string;
  /** Link do vídeo ou da série sobre o lugar (opcional). */
  video?: string;
  /** ID do país em src/content/countries.ts (abre o álbum de fotos). */
  album?: string;
}

export const places: Place[] = [
  {
    id: "brasil",
    city: "Brasil",
    country: "Brasil",
    iata: "BR",
    lat: -23.43,
    lon: -46.47,
    kind: "casa",
    note: "Onde tudo começou.",
    album: "brasil",
  },
  {
    id: "dublin",
    city: "Dublin",
    country: "Irlanda",
    iata: "DUB",
    lat: 53.35,
    lon: -6.26,
    kind: "base",
    date: "2026-07-10",
    note: "Nossa casa desde julho de 2026.",
    album: "irlanda",
  },
  {
    id: "paris",
    city: "Paris",
    country: "França",
    iata: "CDG",
    lat: 48.86,
    lon: 2.35,
    kind: "viagem",
    date: "2026-08",
    note: "Viagem de última hora para ver a FURIA jogar ao vivo.",
    album: "franca",
  },
];

/** Rotas desenhadas no mapa, na ordem em que aconteceram. */
export const routes: [string, string][] = [
  ["brasil", "dublin"],
  ["dublin", "paris"],
];
