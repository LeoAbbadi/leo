/**
 * Países do carrossel "Países" e das páginas de fotos (/paises/:id).
 *
 * Fotos, duas formas (veja docs/fotos-google-drive.md):
 *  1. `photos`: IDs de fotos do Google Drive, um por um;
 *  2. `driveFolderId`: o ID de uma subpasta do Drive só com as fotos daquele país.
 *     Com a chave VITE_GOOGLE_API_KEY no .env, o site lista a pasta sozinho:
 *     é só jogar fotos novas lá que elas aparecem.
 */

export type SceneName = "dublin" | "paris" | "cliffs" | "howth" | "voo" | "brasil" | "proximo";

export interface CountryPhoto {
  driveId: string;
  alt: string;
  city?: string;
  caption?: string;
}

export interface Country {
  id: string;
  name: string;
  /** Nome com a preposição certa: "do Brasil", "da Irlanda". */
  of: string;
  /** Etiqueta no canto do cartão. */
  tag: string;
  tagline: string;
  /** "casa" = de onde viemos, "base" = onde moramos, "visitado", "proximo" = ainda não fomos. */
  status: "casa" | "base" | "visitado" | "proximo";
  /** Quando: "Desde jul 2026", "Ago 2026"… */
  when?: string;
  cities: string[];
  /** Capa do cartão: foto do Drive ou, sem ela, a ilustração. */
  coverDriveId: string;
  scene: SceneName;
  /** Ilustrações mostradas na página do país enquanto não há fotos. */
  scenes: { name: SceneName; label: string }[];
  driveFolderId: string;
  photos: CountryPhoto[];
}

export const countries: Country[] = [
  {
    id: "brasil",
    of: "do Brasil",
    name: "Brasil",
    tag: "#América do Sul",
    tagline: "Onde tudo começou",
    status: "casa",
    cities: [],
    coverDriveId: "",
    scene: "brasil",
    scenes: [{ name: "brasil", label: "Brasil" }],
    driveFolderId: "",
    photos: [],
  },
  {
    id: "irlanda",
    of: "da Irlanda",
    name: "Irlanda",
    tag: "#Europa",
    tagline: "Onde a gente mora desde julho de 2026",
    status: "base",
    when: "Desde jul 2026",
    cities: ["Dublin"],
    coverDriveId: "",
    scene: "cliffs",
    scenes: [
      { name: "dublin", label: "Dublin" },
      { name: "cliffs", label: "Cliffs of Moher (na lista)" },
    ],
    driveFolderId: "",
    photos: [],
  },
  {
    id: "franca",
    of: "da França",
    name: "França",
    tag: "#Europa",
    tagline: "Paris de última hora para ver a FURIA ao vivo",
    status: "visitado",
    when: "Ago 2026",
    cities: ["Paris"],
    coverDriveId: "",
    scene: "paris",
    scenes: [{ name: "paris", label: "Paris" }],
    driveFolderId: "",
    photos: [],
  },
  {
    id: "proximo",
    of: "do próximo destino",
    name: "Próximo destino",
    tag: "#Em breve",
    tagline: "O próximo país entra aqui",
    status: "proximo",
    cities: [],
    coverDriveId: "",
    scene: "proximo",
    scenes: [],
    driveFolderId: "",
    photos: [],
  },
];

export const countryById = (id: string | undefined) => countries.find((c) => c.id === id);
