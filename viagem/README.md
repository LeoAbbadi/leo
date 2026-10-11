# Leo & Helena: viagens e cursos para morar fora

Site de viagem do Leo e da Helena, com diário, mapa das rotas e venda de cursos sobre
como se mudar para a Irlanda (Pix e cartão, confirmação automática do pagamento e
área do aluno).

> **Modo demonstração:** sem as chaves do Supabase no `.env`, pedidos, pagamentos e
> alunos são simulados e ficam só no navegador. Nada é cobrado. O guia para ligar os
> pagamentos de verdade está em [docs/pagamentos.md](docs/pagamentos.md).

## O que tem

**Visual**
- Marca nova ("nascer a dois"): dois sóis nascendo no horizonte, com a rota de avião
  decolando. Arquivos, cores e vídeos de abertura em [brand/](brand/README.md).
- **Vidro líquido** no estilo da Apple: no Chrome e no Edge o fundo é refratado de verdade
  nas bordas (mapa de deslocamento em SVG gerado para cada elemento); nos outros navegadores
  vira vidro fosco com reflexo. Reflexo que segue o ponteiro, botões que "achatam" ao toque,
  indicador do menu que escorre como gota.
- Céu ao fundo que muda com a rolagem (manhã → pôr do sol; no tema escuro, noite estrelada).
- Janela de avião no topo com a marca animada em cena: os sóis nascem no mar, o reflexo
  tremula e o avião decola.
- Mapa de pontinhos com as rotas Brasil → Dublin → Paris e aviões voando.
- Cartões-postais do diário (fotos do Google Drive ou ilustrações enquanto não há foto).
- Cursos em forma de cartão de embarque. Tema claro e escuro. Celular com barra de abas flutuante.

**Venda de cursos**
- Página de cada curso com módulos, aulas abertas e garantia de 7 dias.
- Checkout com validação de CPF e e-mail; Pix (QR code + copia e cola, vale 30 min) ou cartão
  em até 12x pelo Mercado Pago.
- Página do pedido que atualiza sozinha quando o pagamento cai.
- Área do aluno (entra com o e-mail da compra, sem senha), player com progresso por aula.
- Área dos donos (`#/admin`): receita, pedidos, verificação de cada pagamento, confirmação manual.

Na demonstração, a Área dos donos usa `leo@exemplo.com` / `dublin2026`.

## Rodando

Requer Node.js 20 ou mais novo.

```bash
cd viagem
npm install
npm run dev          # http://localhost:5173
npm run build        # versão final em dist/
```

Outros comandos:

```bash
npm run brand        # gera de novo os SVGs da marca
npm run logo:video   # grava os vídeos de abertura (precisa do FFmpeg e do Chromium do Playwright)
npm run worldmap     # recalcula os pontinhos do mapa
```

## Onde mexer

| Quer mudar | Arquivo |
|---|---|
| Textos, nomes, redes sociais | `src/content/site.ts` |
| Cursos, preços, módulos e aulas | `src/content/courses.ts` (e o preço oficial na tabela `courses`) |
| Lugares do mapa e rotas | `src/content/places.ts` |
| Fotos do diário (Google Drive) | `src/content/photos.ts` · [guia](docs/fotos-google-drive.md) |
| Cores, fontes e espaçamentos | começo de `src/styles/global.css` |

## Estrutura

```
src/
  content/        textos, cursos, lugares, fotos e pontos do mapa
  components/     Glass (vidro líquido), Logo, HeroWindow, Sky, WorldMap, Postcard, CourseTicket
  pages/          Início, Cursos, Curso, Checkout, Pedido, Aluno e admin/
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

1. Revisar textos, preços e módulos dos cursos (estão como rascunho).
2. Mandar o link da pasta de fotos do Google Drive para preencher o diário.
3. Criar o projeto no Supabase e a aplicação no Mercado Pago ([passo a passo](docs/pagamentos.md)).
4. Gravar as aulas e cadastrar os vídeos.
5. Hospedar (Vercel, Netlify ou Cloudflare Pages) e apontar um domínio.
