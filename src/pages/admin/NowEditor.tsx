import { useEffect, useState, type FormEvent } from "react";
import { Glass } from "../../components/Glass";
import { MiniMap } from "../../components/NowCard";
import { Button, Field, useToast } from "../../components/ui";
import type { Stop } from "../../content/now";
import { isLive } from "../../lib/env";
import { fmtDate } from "../../lib/format";
import { addStop, removeLatestStop, searchCity, useStops, type Place } from "../../lib/now";

/** Cidades prontas: funcionam mesmo se a busca on-line estiver fora do ar. */
const presets: Place[] = [
  { name: "Dublin", country: "Irlanda", lat: 53.35, lon: -6.26, timezone: "Europe/Dublin" },
  { name: "Galway", country: "Irlanda", lat: 53.27, lon: -9.05, timezone: "Europe/Dublin" },
  { name: "Cork", country: "Irlanda", lat: 51.9, lon: -8.47, timezone: "Europe/Dublin" },
  { name: "Londres", country: "Reino Unido", lat: 51.51, lon: -0.13, timezone: "Europe/London" },
  { name: "Edimburgo", country: "Reino Unido", lat: 55.95, lon: -3.19, timezone: "Europe/London" },
  { name: "Paris", country: "França", lat: 48.86, lon: 2.35, timezone: "Europe/Paris" },
  { name: "Amsterdã", country: "Holanda", lat: 52.37, lon: 4.9, timezone: "Europe/Amsterdam" },
  { name: "Lisboa", country: "Portugal", lat: 38.72, lon: -9.14, timezone: "Europe/Lisbon" },
  { name: "Porto", country: "Portugal", lat: 41.15, lon: -8.61, timezone: "Europe/Lisbon" },
  { name: "Madri", country: "Espanha", lat: 40.42, lon: -3.7, timezone: "Europe/Madrid" },
  { name: "Barcelona", country: "Espanha", lat: 41.39, lon: 2.17, timezone: "Europe/Madrid" },
  { name: "Roma", country: "Itália", lat: 41.9, lon: 12.5, timezone: "Europe/Rome" },
  { name: "Berlim", country: "Alemanha", lat: 52.52, lon: 13.4, timezone: "Europe/Berlin" },
  { name: "Praga", country: "Tchéquia", lat: 50.08, lon: 14.44, timezone: "Europe/Prague" },
  { name: "São Paulo", country: "Brasil", lat: -23.55, lon: -46.63, timezone: "America/Sao_Paulo" },
  { name: "Porto Alegre", country: "Brasil", lat: -30.03, lon: -51.23, timezone: "America/Sao_Paulo" },
];

const today = () => new Date().toISOString().slice(0, 10);

export function NowEditor() {
  const stops = useStops();
  const toast = useToast();
  const now = stops[0];
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searchFailed, setSearchFailed] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);
  const [arrived, setArrived] = useState(today());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // busca enquanto digita (com uma pausa curta para não disparar a cada letra)
  useEffect(() => {
    if (q.trim().length < 2) return setResults([]);
    const t = window.setTimeout(() => {
      searchCity(q)
        .then((r) => {
          setResults(r);
          setSearchFailed(false);
        })
        .catch(() => setSearchFailed(true));
    }, 350);
    return () => window.clearTimeout(t);
  }, [q]);

  const local = presets.filter((p) => q.trim().length >= 1 && p.name.toLowerCase().includes(q.trim().toLowerCase()));
  const options = results.length ? results : local;
  const preview: Stop | null = place ? { city: place.name, country: place.country, lat: place.lat, lon: place.lon, timezone: place.timezone, arrived, note } : null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!preview) return toast("Escolha a cidade na lista.", "info");
    setBusy(true);
    try {
      await addStop({ ...preview, note: note.trim() || undefined });
      toast(`Pronto! O site agora mostra ${preview.city}.`);
      setPlace(null);
      setQ("");
      setNote("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível salvar.", "bad");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="now-editor">
      <Glass className="now-editor-current" radius={28} bezel={22} strength={30}>
        <span className="live">
          <i aria-hidden="true" /> O site mostra agora
        </span>
        <strong>
          {now.city}, {now.country}
        </strong>
        <span className="muted">Desde {fmtDate(now.arrived)}</span>
        <MiniMap stop={now} prev={stops[1]} zoom={120} />
        {stops.length > 1 && (
          <Button
            variant="ghost"
            onClick={async () => {
              await removeLatestStop();
              toast("Última parada desfeita.", "info");
            }}
          >
            Desfazer a última parada
          </Button>
        )}
      </Glass>

      <Glass className="now-editor-form" radius={28} bezel={22} strength={30}>
        <form onSubmit={save} noValidate>
          <h2 className="h3">Chegamos num lugar novo</h2>
          <p className="muted small">Digite a cidade, escolha na lista e salve. Leva 10 segundos.</p>
          <Field id="now-city" label="Cidade" placeholder="Ex.: Lisboa" autoComplete="off" value={q} onChange={(e) => (setQ(e.target.value), setPlace(null))} />
          {!place && options.length > 0 && (
            <ul className="city-options" role="listbox" aria-label="Cidades encontradas">
              {options.map((o) => (
                <li key={`${o.name}-${o.lat}-${o.lon}`}>
                  <button type="button" role="option" aria-selected={false} onClick={() => (setPlace(o), setQ(`${o.name}, ${o.country}`))}>
                    <strong>{o.name}</strong>
                    <span className="muted small">{[o.admin, o.country].filter(Boolean).join(", ")}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {searchFailed && !results.length && <p className="muted small">A busca on-line não respondeu; mostrando as cidades prontas.</p>}
          <Field id="now-date" label="Chegamos em" type="date" value={arrived} max={today()} onChange={(e) => setArrived(e.target.value)} />
          <label className="field" htmlFor="now-note">
            <span className="field-label">Uma frase (opcional)</span>
            <textarea id="now-note" rows={2} value={note} maxLength={140} placeholder="Ex.: Fim de semana em Lisboa!" onChange={(e) => setNote(e.target.value)} />
          </label>
          {preview && <MiniMap stop={preview} prev={now} zoom={120} />}
          <Button type="submit" size="lg" className="btn-block" disabled={busy || !preview}>
            {busy ? "Salvando…" : preview ? `Salvar: estamos em ${preview.city}` : "Escolha a cidade"}
          </Button>
          {!isLive && <p className="muted small">Na demonstração, a mudança fica só neste navegador.</p>}
        </form>
      </Glass>
    </div>
  );
}
