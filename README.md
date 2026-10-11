# Leo & Helena: diário de viagem

Blog de viagem do Leo e da Helena: a vida em Dublin, as viagens pela Europa, um álbum
de fotos por país e a aba "Aonde estamos agora?", atualizada a cada viagem.
Quem quiser aprender a sair do país encontra um único botão, "Quero aprender", que
leva ao curso.

> **Modo demonstração:** sem as chaves do Supabase no `.env`, a localização atual e as
> compras ficam só no navegador e nada é cobrado. Os guias estão em
> [docs/pagamentos.md](docs/pagamentos.md) e [docs/fotos-google-drive.md](docs/fotos-google-drive.md).

## O que tem

**Blog**
- Topo cinematográfico (inspirado no Wanderlust): céu e mar em WebGL com os dois sóis da
  marca refletidos na água, penhascos, rota de avião e pino; título em serifa; cartão de
  vidro "Aonde estamos agora?" com mapa, hora local, tempo e dias no lugar; últimas do diário.
- **Diário** (`/diario`): posts com capa, categorias, tempo de leitura, barra de progresso,
  números em destaque e dicas. Os três primeiros são rascunhos feitos a partir do vídeo do
  primeiro mês em Dublin.
- **Aonde estamos agora?** (`/agora`): cidade atual em destaque sobre o mapa, hora local,
  tempo agora (Open-Meteo), há quantos dias, e a lista de paradas.
- **Países**: carrossel 3D (inspirado no Voyage) e um álbum de fotos por país (`/paises/:id`)
  com galeria e foto em tela cheia; as fotos podem vir sozinhas de uma subpasta do Drive.
- "Oi, prazer!" com fotos redondas e adesivos arrastáveis, mapa-múndi com as rotas, vídeos,
  página "Sobre nós" com linha do tempo.
- Marca "nascer a dois" ([brand/](brand/README.md)), vidro líquido com refração real no
  Chrome e no Edge, tema único azul-escuro.

**Atualizar "Aonde estamos agora?"**
Na área dos donos (`/#/admin`), aba "Onde estamos": digitem a cidade, escolham na lista,
coloquem a data e uma frase e salvem. O topo, a aba "Agora" e o rodapé mudam na hora.
Na demonstração o acesso é `leo@exemplo.com` / `dublin2026`.

**Curso (em segundo plano)**
- `/aprender`: página calma com o curso Irlanda do Zero e as outras opções.
- Checkout com Pix ou cartão (Mercado Pago), confirmação automática verificada no servidor,
  acesso pelo e-mail da compra. Os pedidos ficam na área dos donos, aba "Pedidos do curso".

## Rodando

Requer Node.js 20 ou mais novo.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # versão final em dist/
```

Outros comandos:

```bash
npm run brand        # gera de novo os SVGs da marca
npm run logo:video   # grava os vídeos de abertura (precisa do FFmpeg e do Chromium do Playwright)
npm run worldmap     # recalcula o contorno do mapa-múndi
```

## Onde mexer

| Quer mudar | Arquivo |
|---|---|
| Textos, nomes, redes sociais, foto do topo | `src/content/site.ts` |
| Posts do diário | `src/content/posts.ts` |
| Onde estamos (valor inicial) | `src/content/now.ts` (depois, pela área dos donos) |
| Vídeos em destaque | `src/content/videos.ts` |
| Cursos, preços, módulos e aulas | `src/content/courses.ts` (e o preço oficial na tabela `courses`) |
| Lugares do mapa e rotas | `src/content/places.ts` |
| Países e álbuns de fotos | `src/content/countries.ts` · [guia](docs/fotos-google-drive.md) |
| Fotos (círculos, diário) do Google Drive | `src/content/photos.ts` · [guia](docs/fotos-google-drive.md) |
| Cores, fontes e espaçamentos | começo de `src/styles/global.css` |

## Estrutura

```
src/
  content/        textos, cursos, lugares, fotos e pontos do mapa
  components/     Glass (vidro líquido), Logo, HeroScene, HeroOcean (WebGL), NowCard, BlogCard, Coverflow, Stickers, Sky, WorldMap, Postcard, CourseTicket
  pages/          Início, Diário, Post, Agora, País (álbum), Sobre, Aprender, Curso, Checkout, Pedido, Aluno, Termos e admin/
  lib/now.ts      onde estamos: paradas, hora local, tempo e busca de cidades
  lib/payments/   pagamentos: demonstração (navegador) e real (Supabase + Mercado Pago)
  lib/session.tsx login do aluno e dos donos
supabase/
  migrations/     tabelas, segurança por linha e funções do banco
  functions/      create-checkout e mercadopago-webhook (Deno), com testes da assinatura
brand/            marca: SVGs, versão animada, vídeos e guia
docs/             pagamentos e fotos do Google Drive
scripts/          geradores da marca, do vídeo, do mapa e da prévia
```

## Próximos passos

1. Revisar os posts do diário (rascunhos) e escrever os próximos.
2. Mandar o link da pasta de fotos do Google Drive (uma subpasta por país).
3. Criar o projeto no Supabase, para "Aonde estamos agora?" valer para todos os visitantes
   ([passo a passo](docs/pagamentos.md); a tabela `travel_log` vem na segunda migração).
4. Hospedar (Vercel, Netlify ou Cloudflare Pages) e apontar um domínio.
5. Quando quiserem vender: revisar o curso, criar a conta no Mercado Pago e gravar as aulas.
