# Relatório de edição — Reel/TikTok/Short 9:16

**END = 29166.7 ms** (1750 quadros a 60 fps). Todas as faixas (voz, efeitos, riser, música) e o vídeo terminam exatamente em END.

Entregas em `edit/`: `final.mp4`, `stems/voice.wav`, `stems/sfx.wav`, `stems/riser.wav`, `stems/music.wav`, este relatório, `segmentos.md`, `verificacao/` (pranchas e medições) e `scripts/` (todo o processo, reproduzível).

## 1. Tabela de trechos (0 → END)

| # | Início (s) | Fim (s) | Duração (s) | Layout | Conteúdo |
|---|---|---|---|---|---|
| 1 | 0.000 | 5.267 | 5.267 | B — dividido | Gancho: 'Olha o tamanhinho disso daqui. Chegou pra mim aqui em casa esse body e eu tava muito ansiosa.' — cartão de câmera + cabeça recortada; acima, cartão minúsculo do body com etiqueta XS/S (aproximação) → passagem rápida → foto real da embalagem SHEYAS cai com impacto → aproximação no logo |
| 2 | 5.267 | 6.500 | 1.233 | C — totalmente visual | 'Eu vou abrir junto com vocês.' — foto real da embalagem: o puxador do zíper desliza e o body (ilustração) sobe de dentro |
| 3 | 6.500 | 8.867 | 2.367 | A — câmera em tela cheia | 'Ele é um daqueles body de compressão, sabe?' — câmera em tela cheia (fala direta) |
| 4 | 8.867 | 11.650 | 2.783 | C — totalmente visual | 'Que servem pra ficar realmente bem justinhos no corpo. Eu peguei' — silhueta: o body se ajusta ao corpo (compressão animada); câmera escondida (revira os olhos 12,1–12,55 s na fonte) |
| 5 | 11.650 | 13.833 | 2.183 | B — dividido | 'o menor tamanho e vou experimentar ele com vocês.' — ilustração do body com a etiqueta XS/S (reconstrução vetorial); aproximação na etiqueta |
| 6 | 13.833 | 18.317 | 4.483 | A — câmera em tela cheia | 'E no corpo ele ficou assim, olha, gente. Ele realmente comprime bastante, viu? Olha aqui.' — câmera em tela cheia (resultado vestido, opinião) |
| 7 | 18.317 | 20.183 | 1.867 | B — dividido | 'Eu visto 36 e peguei logo o' — documento '36 ≈ PP · XS' (numeração BR) e a etiqueta XS/S (reconstrução) chegando ao lado |
| 8 | 20.183 | 23.900 | 3.717 | C — totalmente visual | 'menor tamanho, e ele tem a alcinha regulável, então não fica apertando nada, tá?' — etiqueta XS/S → passagem rápida para o bloco da alça: janela amplia 1,25×, regulador desliza, selo verde de confirmação; foto real da alça como apoio |
| 9 | 23.900 | 29.167 | 5.267 | A — câmera em tela cheia | CTA: 'Eu vou deixar o link de onde eu comprei aqui no carrinho laranja pra te conseguir comprar o teu também, porque ele atende a várias numerações.' — câmera em tela cheia + cartão de comentário digitando |

Sequência B → C → A → C → B → A → B → C → A: nenhum layout se repete em trechos consecutivos, os três aparecem e o maior trecho tem 5,27 s.

## 2. Tomadas, frases e substituições

A gravação enviada já vinha editada (um vídeo do TikTok de 32 s, com cortes internos). **Cada frase aparece uma única vez**: não houve tentativas repetidas, autocorreções, "ok" de preparação nem comentários murmurados. Por isso **nenhuma substituição** foi feita; a "última tomada completa" de cada frase é a única. O que foi removido: silêncios acima de ~250 ms, reduzidos para ~120 ms.

| Pedaço | Fonte (s) | Saída (s) | Texto |
|---|---|---|---|
| P0 | 0.00–1.38 | 0.000–1.380 | Olha o tamanhinho disso daqui. |
| P1 | 1.91–6.77 | 1.507–6.367 | Chegou pra mim aqui em casa esse body e eu tava muito ansiosa. Eu vou abrir junto com vocês. |
| P2 | 7.58–14.79 | 6.490–13.700 | Ele é um daqueles body de compressão, sabe? Que servem pra ficar realmente bem justinhos no corpo. Eu peguei o menor tamanho e vou experimentar ele com vocês. |
| P3 | 15.38–19.74 | 13.823–18.183 | E no corpo ele ficou assim, olha, gente. Ele realmente comprime bastante, viu? Olha aqui. |
| P4 | 20.35–24.76 | 18.307–22.717 | Eu visto 36 e peguei logo o menor tamanho, e ele tem a alcinha regulável, então não |
| P5 | 25.02–25.95 | 22.840–23.770 | fica apertando nada, tá? |
| P6 | 26.25–31.24 | 23.890–28.880 | Eu vou deixar o link de onde eu comprei aqui no carrinho laranja pra te conseguir comprar o teu também, porque ele atende a várias numerações. |

Pausas comprimidas (fonte): 1,38–1,91; 6,77–7,58; 14,79–15,38; 19,74–20,35; 24,76–25,02; 25,95–26,25 s. Pausas mantidas de propósito:
- **22,74–23,24 s**: abaixo de −35 dB, mas contém fala fraca ("E ele"). O Whisper confirma: sem esse trecho a frase vira "Tem a alcinha…".
- **23,56–23,96 s**: início fraco de "alcinha".
- **28,76–29,09 s** (330 ms): o pequeno som em 28,95 s faz parte de "conseguir"; ao comprimir, o ASR passava a ouvir "consomprar". Mantida inteira, o que também evita um jump cut dentro do CTA.
- **Regra dos −32 dB**: em 22,39–22,65 s (antes de "tamanho") e 28,53–28,70 s (antes de "pra te conseguir") havia >150 ms abaixo de −32 dB. Examinei os dois casos: a fala não tinha terminado (há palavras fracas depois), então o corte ficou no término real.

Transcrição final (verificada por Whisper na faixa montada):

> Olha o tamanhinho disso daqui. Chegou pra mim aqui em casa esse body e eu tava muito ansiosa. Eu vou abrir junto com vocês. Ele é um daqueles body de compressão, sabe? Que servem pra ficar realmente bem justinhos no corpo. Eu peguei o menor tamanho e vou experimentar ele com vocês. E no corpo ele ficou assim, olha, gente. Ele realmente comprime bastante, viu? Olha aqui. Eu visto 36 e peguei logo o menor tamanho, e ele tem a alcinha regulável, então não fica apertando nada, tá? Eu vou deixar o link de onde eu comprei aqui no carrinho laranja pra te conseguir comprar o teu também, porque ele atende a várias numerações.

Correções sobre o ASR: "bore/bode"→"body", "gestinhos"→"justinhos", "pegue"→"peguei", "vi isso o 36"→"visto 36", "carinho"→"carrinho", "minerações"→"numerações", "pra gente"→"pra te". O último caso é ambíguo: o Whisper ouve "pra te" e o Parakeet ouve "pra gente"; adotei "pra te" porque a sílaba dura ~80 ms, curta demais para "gente".

## 3. Sincronização

Não havia um arquivo separado de áudio limpo, só o vídeo. Gerei a voz limpa a partir do áudio da câmera (passa-altas de 70 Hz + redução de ruído FFT `afftdn`). A correlação cruzada (mono, 16 kHz) entre câmera e versão limpa deu pico claro em -25.0 ms (pico 0.978; segundo pico 0.059; razão 16.7:1). Esse atraso vem do filtro de ruído e foi compensado; a nova medição dá 0 ms. Daí em diante só o áudio limpo foi usado; o áudio da câmera não entra na montagem.

## 4. Contato visual e layouts

Analisei o olhar com pranchas a 4 fps e a 10 fps e com o MediaPipe FaceLandmarker (íris, pálpebras e pose da cabeça, quadro a quadro). Desvios encontrados (tempo da fonte):
- **0,0–1,87 s** (frase 1, gancho): olha para o body que está segurando, não para a lente.
- **2,5–3,3 s**: embalagem cobrindo o rosto e olhos fechados. **4,0–4,75 s**: olhada de lado e olhos para cima.
- **5,95–7,3 s**: olha para a embalagem ao abri-la. Por isso "Eu vou abrir junto com vocês" virou composição visual (C).
- **10,0–10,2 s**: olhada rápida para baixo (≈200 ms, tratada como piscada).
- **12,1–12,55 s**: revira os olhos em "Eu peguei". A câmera fica escondida (trecho C) até a fronteira de palavra seguinte ("o menor tamanho"), quando ela já olha a lente.
- **29,8–30,15 s** (CTA): olhar para o lado/para cima.

**Conflitos entre regras (decisão):** o gancho "sempre dividido" e o encerramento "sempre câmera em tela cheia" não têm a ressalva "desde que haja contato visual" que as outras regras têm. Tratei os dois como regras específicas que prevalecem. Por isso o gancho (olhar no produto) usa o layout B e o CTA mantém a câmera durante a olhada de ~0,35 s.

**Gancho = frases 1 + 2** ("Olha o tamanhinho disso daqui. Chegou pra mim aqui em casa esse body e eu tava muito ansiosa."). A primeira frase sozinha dura 1,4 s, o que não comporta o riser de 2–3 s; o primeiro ponto começa em "Eu vou abrir…".

**Corte B→C do trecho 7** foi antecipado para "menor": a partir de 22,1 s (fonte) ela se aproxima da câmera e a cabeça subiria até a faixa de legenda e a área gráfica.

**Geometria do layout B para fonte vertical (576×1024):** a fonte foi escalada para 1210×2151 (preenche os 1210 px do cartão, x = −65), com posição vertical por plano: Y = 862 (plano A), 1125 (plano B), 911 (plano C) e 610 (plano D). Assim o topo da cabeça passa ~75 px acima do cartão (y ≈ 1125) e fica abaixo da faixa de legenda (941–1114). O cartão tem 1210×864 em (−65, 1200), raio de 200 px em superelipse (n = 5) e sombra de 3 camadas. A cabeça vem do MESMO quadro, recortada por Robust Video Matting, limitada à coluna do rosto e ao componente conectado à borda do cartão, com máscara suavizada em 40 px na borda superior do cartão.

## 5. Composições gráficas (HyperFrames, 240 fps → 60 fps)

Cada trecho B/C é um projeto HyperFrames próprio (`graphics/gN/index.html`, lint sem erros), renderizado a 240 fps e reduzido a 60 fps no FFmpeg com `tmix=frames=4` + seleção de 1 a cada 4. Uma única tween GSAP "condutora" avalia a cena em função do tempo; o desfoque de movimento é um `feGaussianBlur` direcional com σ = 0,29 × velocidade × 0,75 ÷ 60 (máx. 40 px), aplicado só quando σ > 0,35 px. O quadro 0 de cada composição está sempre em repouso e nítido. Fundo radial #FFFFFF (50%/36%) → #F3F3F0, sombras de 3 camadas, Poppins 96/52/30.

- **G1 (gancho, B)**: um cartão pequeno com o body (ilustração vetorial) e a etiqueta XS/S, tudo abaixo de y = 620 no quadro 0. Aproximação de 1,22 s até 1,6× em "tamanhinho". Passagem rápida (0,45 s de saída em power3.in + 0,6 s de chegada em power3.out) até onde a **foto real da embalagem SHEYAS** cai com impacto em "Chegou". Depois, deslocamento suave e aproximação final de 1,47 s até 1,6× no laço/logo enquanto o riser sobe. O cartão secundário recebe desfoque de até 14 px e opacidade 0,4.
- **G2 (C)**: foto real da embalagem em primeiro plano. O puxador do zíper desliza abrindo a fenda e o body sobe de dentro do saco.
- **G4 (C)**: manequim neutro vestindo o body. O contorno passa de folgado para justo (morph do traçado) em "justinhos", com chevrons terracota comprimindo a cintura. Aproximação de 1,8 s até 1,6×, ancorada na base do cartão (base fixa em y = 1215).
- **G5 (B)**: o body com a etiqueta XS/S pendurada (reconstrução vetorial). Aproximação de 1,24 s até 1,6× na etiqueta em "menor tamanho"; o body fica com 9 px de desfoque e opacidade 0,4.
- **G7 (B)**: documento "Eu visto 36" (pílula terracota, "≈ PP · XS", "numeração BR"). A etiqueta XS/S desliza para o lado e chega com impacto em "peguei".
- **G8 (C)**: a etiqueta XS/S em "menor tamanho", depois passagem rápida até o bloco da alça. A janela do produto amplia de 1,0 para 1,25× em 0,55 s (power2.inOut) com a câmera parada. O regulador desliza pela alça (a alça dupla alonga) e um selo verde de confirmação aparece em "não fica apertando". Apoio: foto real da alça com o regulador.

Não há logotipo em tela cheia porque a fala não cita a marca pelo nome. A marca aparece só na foto real da embalagem. As instruções sobre Claude Code e interfaces de produto não se aplicam a este conteúdo (produto físico, sem software).

## 6. Fatos verificados e fontes

| Afirmação na fala | Verificação | Fontes |
|---|---|---|
| "Eu visto 36" + "menor tamanho" (etiqueta XS/S) | Tamanho 36 feminino no Brasil ≈ PP, que nos EUA ≈ XS. Coerente com a etiqueta XS/S da embalagem (lida no vídeo). | Blog da Shopee, "tamanho de roupa" (shopee.com.br/blog/tamanho-de-roupa); Cidesp, tabela de tamanhos China → Brasil (cidesp.com.br/conteudo/tabela-de-tamanho-de-roupa-da-china-para-o-brasil); Auditório Ibirapuera, "O que é manequim 36?" |
| "carrinho laranja" | É o carrinho do TikTok Shop; a loja chegou ao Brasil em maio de 2025. Não é um dado numérico. | Gazeta Mercantil, "TikTok Shop cresce 102 vezes no Brasil"; GameOverdrive, "TikTok Shop: o que é, como funciona" |
| Marca SHEYAS, "menor tamanho", "várias numerações", "alcinha regulável" | **Não verificável publicamente.** Buscas (padrão e estendida) não encontraram site, loja nem tabela de medidas da SHEYAS. A alça regulável aparece no próprio vídeo (regulador visível em 22,5–24,5 s). | — |

Observação: as páginas não puderam ser capturadas como imagem. A rede deste ambiente bloqueia esses domínios (e o WebFetch falhou com DNS), então a verificação foi feita pelos trechos dos resultados de busca. A fala não cita nenhum acontecimento, manchete ou lançamento, e por isso nenhuma moldura de página-fonte foi exigida nem usada.

## 7. Divergências entre fala e fontes

- **36 ≈ PP/XS**: a Shopee associa 36 a PP (XS). A tabela da Cidesp e um artigo sobre manequins apontam que, conforme a marca, 36 também pode corresponder a P (S). A fala não diz o contrário; o gráfico usa "≈ PP · XS" com "≈", sem cravar a equivalência.
- **"menor tamanho" e "várias numerações"**: nenhuma fonte confirma que XS/S é o menor tamanho da SHEYAS nem quais numerações existem. A gravação foi preservada, mas os gráficos **não** mostram grade de tamanhos ou lista de numerações, para não reforçar um dado não verificado. Só aparece a etiqueta XS/S, que é visível no vídeo.

## 8. Efeitos sonoros (tempos no vídeo final)

Pico da voz: 3.72 dBFS. Alvos: cliques/impactos/sinais −10 dB, passagens −9 dB, tiques −16 dB, riser −14 dB em relação a esse pico.

| Tempo (s) | Efeito | Pico (dBFS) |
|---|---|---|
| 1.750 | passagem (ruído filtrado, variação A) — pico no meio do movimento rápido | -5.28 |
| 2.300 | impacto abafado — chegada de cartão | -6.28 |
| 5.387 | sequência leve de tiques do zíper (5.387–5.967 s) | -12.28 |
| 6.007 | impacto abafado — chegada de cartão | -6.28 |
| 19.617 | impacto abafado — chegada de cartão | -6.28 |
| 21.077 | passagem (ruído filtrado, variação B) — pico no meio do movimento rápido | -5.28 |
| 22.840 | sinal de duas notas (Dó6→Sol6) — confirmação | -6.28 |
| 2.667–5.267 | riser grave (42→180 Hz + ar filtrado); termina exatamente na junção gancho → primeiro ponto | -10.28 |

Não há efeitos em trocas de layout, deslocamentos suaves, aproximações ou recuos. O CTA não tem efeito algum (nem digitação nem clique), conforme a regra para logotipo/CTA. São duas passagens ao todo, nas variações A e B, uma por trecho.

Música: original e sintetizada, 110 BPM, Fá maior (Fmaj7–Am7–Dm7–B♭maj7), com bumbo suave, chimbal, baixo e pad quentes e arpejo grave discreto, sem melodia principal. A primeira batida cai no quadro 1 (16,7 ms), com entrada de 5 ms, saída de 800 ms e um único ganho estático (sem ducking nem automação).

## 9. Loudness (filtro ebur128 do FFmpeg)

| Faixa | LUFS integrados | Pico verdadeiro (dBTP) |
|---|---|---|
| stems/voice.wav | -14.0 | 3.7 |
| stems/sfx.wav | -17.7 | -5.1 |
| stems/riser.wav | -20.4 | -10.3 |
| stems/music.wav | -24.0 | -10.9 |
| master (WAV antes do AAC) | -14.0 | -1.4 |
| final.mp4 (AAC) | -14.0 | -1.3 |

O master é a soma direta das quatro faixas, com ganho geral de -0.06 dB. O limitador transparente (look-ahead de 3 ms, release de 45 ms, oversampling 4× para pico verdadeiro) foi necessário porque a voz a −14 LUFS tem picos de +3,7 dBFS. Redução máxima de 5.85 dB; age acima de 1 dB em só 2.82% das amostras (transientes curtos da voz), sem clipping. Os stems são WAV float de 32 bits, 48 kHz estéreo, com exatamente 1400000 amostras cada, então os picos acima de 0 dBFS da voz ficam preservados para remixagem. O "LUFS" de sfx e riser é o integrado com gate do ebur128, ou seja, medido só nos trechos em que soam.

## 10. Reconstruções, alternativas técnicas e decisões

- **Entrada única**: só veio o vídeo. O áudio limpo foi derivado do próprio áudio da câmera (ver §3), em vez de interromper o trabalho.
- **Transcrição**: o Hugging Face está bloqueado neste ambiente, então os modelos foram baixados dos *releases* do GitHub (sherpa-onnx). Usei Parakeet-TDT 0.6B v3 (tempos por palavra, rodado por pedaço para evitar o adiantamento depois de silêncios) e Whisper large-v3-turbo para conferir o texto e as junções.
- **Olhar**: MediaPipe FaceLandmarker. A `libEGL` que faltava foi resolvida com a cópia que vem no Chromium (em `edit/.localdeps`, sem instalar nada no sistema).
- **Recorte de fundo**: usei Robust Video Matting (ResNet50, ONNX) no lugar do `remove-background` do HyperFrames (u2net por quadro). O RVM é recorrente, o que dá cabelo estável entre quadros e evita cintilação na borda da cabeça.
- **Reconstruções vetoriais** (identificadas como tal): o body (silhueta), o manequim, a etiqueta "XS/S" (a etiqueta real tem ~95 px na fonte, pequena demais para ampliar) e a ilustração da alça com regulador. **Fotos reais**: a embalagem SHEYAS (espelhada de volta para o logo ficar legível; a câmera grava espelhada) e o close da alça. Os recortes evitam a marca d'água.
- **Marca d'água**: o vídeo de origem traz a marca d'água do TikTok (@helenakrecomenda) e o aviso "Unauthorised commercial use of video strictly prohibited". Não removi nada disso das imagens de câmera; confirme que você tem os direitos de uso.
- **Capa**: "O tamanhinho desse body!" (Poppins Bold 110 px, caixa branca de y = 262 a 603, raio de 2,8%), só no quadro 0.
- **Legendas**: geradas dos tempos da faixa final; a primeira aparece no quadro 1. Os destaques usam Instrument Serif Itálico em #FFFF00; a fonte não tem versão bold, então o negrito é sintético (traço fino da mesma cor). A cadência é H n n (n) H… do início ao fim, sem dois destaques seguidos e sem destacar artigos ou preposições.
- **CTA**: a fala não pede uma palavra específica. Digitei "link", a palavra central da chamada ("vou deixar o link…"), com cursor piscante, e depois animei o clique em publicar (o botão afunda, gera uma onda e vira um check). Caixa única com avatar genérico, sem painel, texto de plataforma ou pedido de DM.
- **Qualidade da fonte**: a câmera tem 576×1024 a 30 fps. Foi ampliada 1,875× (tela cheia) ou 2,1× (cartão) e cada quadro de origem é repetido em 2 quadros a 60 fps. Não há zoom nem movimento artificial na câmera.

## 11. Verificação final

- **Arquivo**: h264 1080x1920 60/1 frames=1750 pix=yuv420p bitrate=6316 kb/s; áudio aac 48000 Hz ch=2 270 kb/s; duração 29.167 s; 1750 quadros decodificados.
- **Dois lados de cada corte** (20 quadros conferidos): em cada quadro com câmera, comparei a imagem renderizada com os quadros-fonte vizinhos. 12/12 batem com o quadro-fonte esperado (±1). Prancha: `verificacao/cortes.png`.
- **Cabeça × cartão** (primeiro quadro e movimento mais rápido de cada trecho B): o degrau de cor na borda do cartão (y 1196 vs 1204) foi 9.1, 6.9, 13.7, 2.2, 15.4, 11.4; dentro do cartão, 10.8, 5.7, 11.6, 3.3, 14.1, 11.8 (mesma ordem de grandeza, sem descontinuidade). A cabeça recortada está presente desde o primeiro quadro de cada trecho dividido. Prancha: `verificacao/cabeca_cartao.png`.
- **Passagens**: meio do movimento 1.750 s → pico 1.750 s; meio do movimento 21.077 s → pico 21.077 s.
- **Riser**: termina de soar em 5.2666 s; a junção do gancho é em 5.2667 s.
- **Silêncio nas junções** (abaixo de −35 dB): 130 ms, 120 ms, 120 ms, 100 ms, 120 ms, 120 ms. Todos ≤ 150 ms.
- **Loudness**: final.mp4 com -14.0 LUFS e -1.3 dBTP; voz -14.0 LUFS; música -24.0 LUFS (≈10 LU abaixo da voz). Tudo dentro de ±0,5 LU.
- **Fim**: a última amostra audível da voz é em 29.128 s (END = 29.167 s). O vídeo termina no último quadro previsto, sem quadro branco, cabeça congelada ou silêncio sobrando.
- **Prancha completa** (`verificacao/prancha_completa.png`): as legendas não cobrem o rosto; o amarelo alterna (nunca dois destaques seguidos); o conteúdo fica nas áreas seguras; não há grades nem áreas escuras nos gráficos; a capa aparece limpa só no quadro 0; não há erros de máscara visíveis.
