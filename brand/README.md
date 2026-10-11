# Marca Leo & Helena

## Conceito: "nascer a dois"

Dois sóis nascendo juntos no horizonte.

- **Laranja = Helena.** Menor, um pouco mais baixo, inclinado e encostado no azul, como
  a cabeça dela na foto de vocês.
- **Azul = Leo.** Maior, mais alto, o "ponto azul".
- **O encontro dos dois** ganha a cor da tinta: é o "nós".
- **A linha do horizonte** é o mar, o chão de onde se parte.
- **A rota pontilhada com o avião** decola do horizonte: a mudança, a viagem.

Na foto, vocês aparecem entrando no quadro por baixo, de cabeças encostadas, com o teto
(o céu) em cima. A marca repete esse enquadramento: duas cabeças-sol surgindo no horizonte.

Formas simples (círculos, uma linha, um caminho), então ela anima bem: o horizonte se
desenha, os sóis sobem com efeito de mola, o encontro acende e o avião decola.

## Arquivos

| Arquivo | Uso |
|---|---|
| `logo-horizontal.svg` / `-escuro` | Topo de site, assinatura de e-mail, documentos |
| `logo-vertical.svg` / `-escuro` | Capas, slides de abertura, pôsteres |
| `logo-texto.svg` / `-escuro` | Só o nome "leo&helena" |
| `logo-simbolo.svg` / `-escuro` | Símbolo completo, sem o nome |
| `logo-simbolo-compacto.svg` | Tamanhos pequenos (sem a rota) |
| `logo-simbolo-mono-preto.svg` / `-branco` | Uma cor só: carimbo, bordado, gravação, fundo de foto |
| `icone-app.svg` / `-claro` | Ícone de app e favicon |
| `icone-app-1024.png` | Foto de perfil (Instagram, YouTube, TikTok) |
| `logo-animado.svg` / `-escuro` | Versão animada que toca sozinha no navegador (até dentro de `<img>`) |
| `video/logo-intro-quadrado-claro.mp4` | Abertura 1080×1080 (feed) |
| `video/logo-intro-quadrado-escuro.mp4` | Abertura 1080×1080, fundo escuro |
| `video/logo-intro-vertical-escuro.mp4` | Abertura 1080×1920 (Reels, Stories, TikTok) |
| `youtube/banner-youtube-abbadi.jpg` | Banner do canal (2560×1440, pronto para enviar) |
| `youtube/banner-youtube-abbadi.png` | O mesmo banner, sem compressão |
| `youtube/guia-areas-do-banner.png` | O que aparece na TV, no computador e no celular |

O texto "leo&helena" está convertido em curvas, então os arquivos abrem iguais em qualquer
programa (Figma, Canva, Illustrator, CapCut) sem precisar das fontes.

Para gerar tudo de novo depois de mexer na marca: `npm run brand` (SVGs),
`npm run logo:video` (vídeos) e `npm run youtube:banner` (banner do YouTube).

## Banner do YouTube

Céu e mar do topo do site (o mesmo efeito em WebGL), sem desenhos, e "ABBADI" em letras de
vidro líquido apoiadas no horizonte, com o reflexo no mar. O nome fica inteiro dentro da área
de 1546×423 px que o YouTube mostra em todos os aparelhos. Para enviar: YouTube Studio →
Personalização → Branding → Imagem do banner → `banner-youtube-abbadi.jpg`.

## Cores

| Nome | Claro | Escuro | Onde |
|---|---|---|---|
| Sol (Helena) | `#FFB46A` → `#FF6A4D` | `#FFB878` → `#FF7552` | círculo laranja, "&" |
| Mar (Leo) | `#3D7BFF` → `#1F4FCC` | `#6FA3FF` → `#3D6FE8` | círculo azul |
| Tinta | `#0B1626` | `#F3F6FB` | horizonte, rota, encontro, texto |
| Nuvem | `#F3F6FB` | `#060C18` | fundo |

## Tipografia

- **Bricolage Grotesque** (títulos e logotipo, peso 600–700, espaçamento apertado)
- **Instrument Serif Itálico** (o "&" e as palavras de destaque)
- **Figtree** (textos)
- **JetBrains Mono** (códigos de aeroporto, datas, rótulos)

Todas gratuitas no Google Fonts (licença OFL). As fontes em `fonts/` servem só para gerar
os arquivos.

## Cuidados

- Deixe em volta da marca um espaço livre de pelo menos a altura do círculo laranja.
- Não troque as cores dos sóis entre si: o laranja é sempre a Helena, à esquerda.
- Abaixo de 32 px de largura, use a versão compacta (sem a rota).
- Sobre fotos, prefira a versão monocromática branca.
