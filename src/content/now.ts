/**
 * "Aonde estamos agora?": valor inicial. Depois que o site estiver no ar, vocês
 * atualizam pela área dos donos (/#/admin), sem mexer em código: digitam a cidade,
 * o site encontra no mapa e salva. Este arquivo vale só até a primeira atualização.
 */
export interface Stop {
  city: string;
  country: string;
  lat: number;
  lon: number;
  /** Fuso horário IANA, ex.: "Europe/Dublin". */
  timezone: string;
  /** Dia da chegada, AAAA-MM-DD. */
  arrived: string;
  note?: string;
}

export const initialStops: Stop[] = [
  {
    city: "Dublin",
    country: "Irlanda",
    lat: 53.35,
    lon: -6.26,
    timezone: "Europe/Dublin",
    arrived: "2026-07-10",
    note: "Nossa base. Daqui saem as viagens pela Europa.",
  },
];
