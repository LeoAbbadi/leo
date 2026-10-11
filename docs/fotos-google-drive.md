# Fotos direto do Google Drive

O site mostra as fotos servidas pelo próprio Google, sem baixar nem subir os arquivos
para outro lugar. Enquanto uma foto não está configurada, aparece a ilustração do lugar
no mesmo estilo da marca.

## Organização sugerida no Drive

```
Leo & Helena - Site/
  Topo/            1 foto bem horizontal para o topo do site
  Nós/             fotos de vocês dois (os círculos do "Oi, prazer!")
  Países/
    Brasil/
    Irlanda/
    França/
    ...            uma subpasta por país novo
```

Compartilhe a pasta principal como **Qualquer pessoa com o link** (leitor). As subpastas
herdam o compartilhamento.

## Álbum de cada país (seção "Países")

Cada país do carrossel abre a sua página de fotos (`/paises/irlanda`, `/paises/franca`…).
Os países ficam em `src/content/countries.ts`. Há duas formas de colocar as fotos:

**1. Automática (recomendada).** Coloque o ID da subpasta do país em `driveFolderId`
(o trecho depois de `/folders/` no link da pasta) e uma chave da API do Google em
`VITE_GOOGLE_API_KEY` no `.env`. O site lista a pasta sozinho toda vez que alguém abre a
página: é só jogar fotos novas no Drive que elas aparecem, sem mexer no código.
A descrição da foto no Drive (botão direito → Informações do arquivo → Descrição) vira a
legenda.

Para criar a chave: [Google Cloud Console](https://console.cloud.google.com) → crie um
projeto → *APIs e serviços* → ative a **Google Drive API** → *Credenciais* → *Criar
credenciais* → **Chave de API**. Em *Restrições*, limite a chave à Drive API e ao endereço
do site. A chave só lê o que já é público.

**2. Foto por foto.** Liste os IDs em `photos` (o ID é o trecho entre `/d/` e `/view` no
link da foto):

```ts
photos: [
  { driveId: "1AbCdEf...", alt: "Ha'penny Bridge ao pôr do sol", city: "Dublin" },
],
```

A capa do cartão no carrossel é `coverDriveId` (uma foto em pé fica melhor).

**País novo:** copie um bloco em `countries.ts`, troque `id`, `name`, `of` ("da Itália"),
`tag`, `tagline` e a pasta. Ele entra no carrossel e ganha a sua página na hora.

## Outras fotos

| Onde | Arquivo e campo |
|---|---|
| Topo do site | `src/content/site.ts` → `hero.photoDriveId` |
| Três círculos do "Oi, prazer!" | `src/content/photos.ts` → `introPhotos` |
| Lugares do diário (carrossel do topo) | `src/content/photos.ts` → `diary` |
| Capa de vídeo | `src/content/videos.ts` → `thumbDriveId` |

O site pede ao Google uma versão já reduzida de cada foto, então a página continua leve
mesmo com originais grandes.

> Atalho: mandem o link da pasta no chat. Pelo conector do Google Drive dá para listar as
> fotos, pegar os IDs e preencher tudo (com legenda e local) sem vocês copiarem nada.

## Bom saber

- A foto precisa estar compartilhada como "qualquer pessoa com o link"; se não estiver,
  volta a aparecer a ilustração.
- O Google limita o número de acessos a arquivos muito populares. Se o site crescer muito,
  o próximo passo é copiar as fotos para um CDN de imagens (Cloudinary ou Supabase Storage).
- Fotos de celular costumam guardar a localização exata no arquivo. Se alguma foto for da
  casa de vocês, apaguem a localização antes de compartilhar.
