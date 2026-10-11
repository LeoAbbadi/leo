import { useEffect, useState } from "react";
import type { Country, CountryPhoto } from "../content/countries";
import { env } from "./env";

/**
 * Fotos de um país: as listadas à mão em `photos` e, se houver chave do Google
 * e uma pasta configurada, todas as imagens daquela pasta do Drive (lidas na hora).
 */
export function useCountryPhotos(country: Country | undefined) {
  const [fromFolder, setFromFolder] = useState<CountryPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const folder = country?.driveFolderId;

  useEffect(() => {
    setFromFolder([]);
    if (!folder || !env.googleApiKey) return;
    const ctrl = new AbortController();
    const q = `'${folder}' in parents and mimeType contains 'image/' and trashed = false`;
    const url =
      "https://www.googleapis.com/drive/v3/files?" +
      new URLSearchParams({
        q,
        fields: "files(id,name,description)",
        orderBy: "name",
        pageSize: "300",
        key: env.googleApiKey,
      });
    setLoading(true);
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { files?: { id: string; name: string; description?: string }[] }) =>
        setFromFolder(
          (data.files ?? []).map((f) => ({
            driveId: f.id,
            alt: f.description || `Foto ${country?.of ?? ""}`.trim(),
            caption: f.description || undefined,
          })),
        ),
      )
      .catch(() => setFromFolder([]))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [folder, country?.of]);

  const manual = country?.photos ?? [];
  const seen = new Set(manual.map((p) => p.driveId));
  return { photos: [...manual, ...fromFolder.filter((p) => !seen.has(p.driveId))], loading };
}
