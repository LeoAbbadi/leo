# Fotos direto do Google Drive

O diário de viagem mostra as fotos servidas pelo próprio Google, sem baixar nem subir
os arquivos para outro lugar. Enquanto uma foto não está configurada, aparece a
ilustração do lugar no mesmo estilo da marca.

## Como adicionar

1. No Google Drive, clique com o botão direito na pasta das fotos → **Compartilhar** →
   *Acesso geral*: **Qualquer pessoa com o link** (leitor).
2. Abra cada foto e copie o ID do link. Em
   `https://drive.google.com/file/d/1AbCdEf.../view`, o ID é `1AbCdEf...`.
3. Cole em `src/content/photos.ts`, no campo `driveId` do postal certo:
   ```ts
   { driveId: "1AbCdEf...", alt: "Ha'penny Bridge sobre o rio Liffey", place: "Dublin", scene: "dublin", caption: "O primeiro pôr do sol no Liffey" },
   ```

O site pede ao Google uma versão já reduzida (`driveImage(id, 900)`), então a página
continua leve mesmo com fotos originais grandes.

> Atalho: mandem o link da pasta no chat. Pelo conector do Google Drive dá para listar as
> fotos, pegar os IDs e preencher o diário (com legenda e local) sem vocês copiarem nada.

## Bom saber

- A foto precisa estar compartilhada como "qualquer pessoa com o link"; se não estiver,
  o postal volta a mostrar a ilustração.
- O Google limita o número de acessos a arquivos muito populares. Se o site crescer muito,
  o próximo passo é copiar as fotos para um CDN de imagens (Cloudinary ou Supabase Storage).
- Fotos de celular costumam guardar a localização exata no arquivo. Se alguma foto for da
  casa de vocês, apaguem a localização antes de compartilhar.
