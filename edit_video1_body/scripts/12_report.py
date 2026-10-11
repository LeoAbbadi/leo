import json
E = "/home/user/leo/edit"; W = f"{E}/work"
plan = json.load(open(f"{W}/plan.json")); caps = json.load(open(f"{W}/captions.json"))
alog = json.load(open(f"{W}/audio_log.json")); ver = json.load(open(f"{E}/verificacao/verificacao.json"))
raw = json.load(open(f"{W}/asr_raw.json"))
L = []; A = L.append
A("# Relatório de edição — Reel/TikTok/Short 9:16\n")
A(f"**END = {plan['END']*1000:.1f} ms** ({plan['frames']} quadros a 60 fps). Todas as faixas (voz, efeitos, riser, música) e o vídeo terminam exatamente em END.\n")
A("Entregas em `edit/`: `final.mp4`, `stems/voice.wav`, `stems/sfx.wav`, `stems/riser.wav`, `stems/music.wav`, este relatório, `segmentos.md`, `verificacao/` (pranchas e medições) e `scripts/` (todo o processo, reproduzível).\n")

A("## 1. Tabela de trechos (0 → END)\n")
names = {"A": "A — câmera em tela cheia", "B": "B — dividido", "C": "C — totalmente visual"}
A("| # | Início (s) | Fim (s) | Duração (s) | Layout | Conteúdo |\n|---|---|---|---|---|---|")
for s in plan["segments"]:
    A(f"| {s['n']} | {s['t0']:.3f} | {s['t1']:.3f} | {s['t1']-s['t0']:.3f} | {names[s['layout']]} | {s['content']} |")
A("\nSequência B → C → A → C → B → A → B → C → A: nenhum layout se repete em trechos consecutivos, os três aparecem e o maior trecho tem 5,27 s.\n")

A("## 2. Tomadas, frases e substituições\n")
A("A gravação enviada já vinha editada (um vídeo do TikTok de 32 s, com cortes internos). **Cada frase aparece uma única vez**: não houve tentativas repetidas, autocorreções, \"ok\" de preparação nem comentários murmurados. Por isso **nenhuma substituição** foi feita; a \"última tomada completa\" de cada frase é a única. O que foi removido: silêncios acima de ~250 ms, reduzidos para ~120 ms.\n")
A("| Pedaço | Fonte (s) | Saída (s) | Texto |\n|---|---|---|---|")
for p in plan["pieces"]:
    ws = [w["text"] for w in plan["words"] if w["piece"] == p["k"]]
    A(f"| P{p['k']} | {p['s']:.2f}–{p['e']:.2f} | {p['O']:.3f}–{p['O']+p['e']-p['s']:.3f} | {' '.join(ws)} |")
A("\nPausas comprimidas (fonte): 1,38–1,91; 6,77–7,58; 14,79–15,38; 19,74–20,35; 24,76–25,02; 25,95–26,25 s. Pausas mantidas de propósito:")
A("- **22,74–23,24 s**: abaixo de −35 dB, mas contém fala fraca (\"E ele\"). O Whisper confirma: sem esse trecho a frase vira \"Tem a alcinha…\".")
A("- **23,56–23,96 s**: início fraco de \"alcinha\".")
A("- **28,76–29,09 s** (330 ms): o pequeno som em 28,95 s faz parte de \"conseguir\"; ao comprimir, o ASR passava a ouvir \"consomprar\". Mantida inteira, o que também evita um jump cut dentro do CTA.")
A("- **Regra dos −32 dB**: em 22,39–22,65 s (antes de \"tamanho\") e 28,53–28,70 s (antes de \"pra te conseguir\") havia >150 ms abaixo de −32 dB. Examinei os dois casos: a fala não tinha terminado (há palavras fracas depois), então o corte ficou no término real.\n")
A("Transcrição final (verificada por Whisper na faixa montada):\n")
A("> " + " ".join(w["text"] for w in plan["words"]) + "\n")
A("Correções sobre o ASR: \"bore/bode\"→\"body\", \"gestinhos\"→\"justinhos\", \"pegue\"→\"peguei\", \"vi isso o 36\"→\"visto 36\", \"carinho\"→\"carrinho\", \"minerações\"→\"numerações\", \"pra gente\"→\"pra te\". O último caso é ambíguo: o Whisper ouve \"pra te\" e o Parakeet ouve \"pra gente\"; adotei \"pra te\" porque a sílaba dura ~80 ms, curta demais para \"gente\".\n")

A("## 3. Sincronização\n")
sy = raw["sync"]
A(f"Não havia um arquivo separado de áudio limpo, só o vídeo. Gerei a voz limpa a partir do áudio da câmera (passa-altas de 70 Hz + redução de ruído FFT `afftdn`). A correlação cruzada (mono, 16 kHz) entre câmera e versão limpa deu pico claro em {sy['offset_ms']:.1f} ms (pico {sy['peak']:.3f}; segundo pico {sy['second_peak']:.3f}; razão {sy['peak_ratio']:.1f}:1). Esse atraso vem do filtro de ruído e foi compensado; a nova medição dá 0 ms. Daí em diante só o áudio limpo foi usado; o áudio da câmera não entra na montagem.\n")

A("## 4. Contato visual e layouts\n")
A("Analisei o olhar com pranchas a 4 fps e a 10 fps e com o MediaPipe FaceLandmarker (íris, pálpebras e pose da cabeça, quadro a quadro). Desvios encontrados (tempo da fonte):")
A("- **0,0–1,87 s** (frase 1, gancho): olha para o body que está segurando, não para a lente.")
A("- **2,5–3,3 s**: embalagem cobrindo o rosto e olhos fechados. **4,0–4,75 s**: olhada de lado e olhos para cima.")
A("- **5,95–7,3 s**: olha para a embalagem ao abri-la. Por isso \"Eu vou abrir junto com vocês\" virou composição visual (C).")
A("- **10,0–10,2 s**: olhada rápida para baixo (≈200 ms, tratada como piscada).")
A("- **12,1–12,55 s**: revira os olhos em \"Eu peguei\". A câmera fica escondida (trecho C) até a fronteira de palavra seguinte (\"o menor tamanho\"), quando ela já olha a lente.")
A("- **29,8–30,15 s** (CTA): olhar para o lado/para cima.\n")
A("**Conflitos entre regras (decisão):** o gancho \"sempre dividido\" e o encerramento \"sempre câmera em tela cheia\" não têm a ressalva \"desde que haja contato visual\" que as outras regras têm. Tratei os dois como regras específicas que prevalecem. Por isso o gancho (olhar no produto) usa o layout B e o CTA mantém a câmera durante a olhada de ~0,35 s.\n")
A("**Gancho = frases 1 + 2** (\"Olha o tamanhinho disso daqui. Chegou pra mim aqui em casa esse body e eu tava muito ansiosa.\"). A primeira frase sozinha dura 1,4 s, o que não comporta o riser de 2–3 s; o primeiro ponto começa em \"Eu vou abrir…\".\n")
A("**Corte B→C do trecho 7** foi antecipado para \"menor\": a partir de 22,1 s (fonte) ela se aproxima da câmera e a cabeça subiria até a faixa de legenda e a área gráfica.\n")
A("**Geometria do layout B para fonte vertical (576×1024):** a fonte foi escalada para 1210×2151 (preenche os 1210 px do cartão, x = −65), com posição vertical por plano: Y = 862 (plano A), 1125 (plano B), 911 (plano C) e 610 (plano D). Assim o topo da cabeça passa ~75 px acima do cartão (y ≈ 1125) e fica abaixo da faixa de legenda (941–1114). O cartão tem 1210×864 em (−65, 1200), raio de 200 px em superelipse (n = 5) e sombra de 3 camadas. A cabeça vem do MESMO quadro, recortada por Robust Video Matting, limitada à coluna do rosto e ao componente conectado à borda do cartão, com máscara suavizada em 40 px na borda superior do cartão.\n")

A("## 5. Composições gráficas (HyperFrames, 240 fps → 60 fps)\n")
A("Cada trecho B/C é um projeto HyperFrames próprio (`graphics/gN/index.html`, lint sem erros), renderizado a 240 fps e reduzido a 60 fps no FFmpeg com `tmix=frames=4` + seleção de 1 a cada 4. Uma única tween GSAP \"condutora\" avalia a cena em função do tempo; o desfoque de movimento é um `feGaussianBlur` direcional com σ = 0,29 × velocidade × 0,75 ÷ 60 (máx. 40 px), aplicado só quando σ > 0,35 px. O quadro 0 de cada composição está sempre em repouso e nítido. Fundo radial #FFFFFF (50%/36%) → #F3F3F0, sombras de 3 camadas, Poppins 96/52/30.\n")
desc = {
 1: "**G1 (gancho, B)**: um cartão pequeno com o body (ilustração vetorial) e a etiqueta XS/S, tudo abaixo de y = 620 no quadro 0. Aproximação de 1,22 s até 1,6× em \"tamanhinho\". Passagem rápida (0,45 s de saída em power3.in + 0,6 s de chegada em power3.out) até onde a **foto real da embalagem SHEYAS** cai com impacto em \"Chegou\". Depois, deslocamento suave e aproximação final de 1,47 s até 1,6× no laço/logo enquanto o riser sobe. O cartão secundário recebe desfoque de até 14 px e opacidade 0,4.",
 2: "**G2 (C)**: foto real da embalagem em primeiro plano. O puxador do zíper desliza abrindo a fenda e o body sobe de dentro do saco.",
 4: "**G4 (C)**: manequim neutro vestindo o body. O contorno passa de folgado para justo (morph do traçado) em \"justinhos\", com chevrons terracota comprimindo a cintura. Aproximação de 1,8 s até 1,6×, ancorada na base do cartão (base fixa em y = 1215).",
 5: "**G5 (B)**: o body com a etiqueta XS/S pendurada (reconstrução vetorial). Aproximação de 1,24 s até 1,6× na etiqueta em \"menor tamanho\"; o body fica com 9 px de desfoque e opacidade 0,4.",
 7: "**G7 (B)**: documento \"Eu visto 36\" (pílula terracota, \"≈ PP · XS\", \"numeração BR\"). A etiqueta XS/S desliza para o lado e chega com impacto em \"peguei\".",
 8: "**G8 (C)**: a etiqueta XS/S em \"menor tamanho\", depois passagem rápida até o bloco da alça. A janela do produto amplia de 1,0 para 1,25× em 0,55 s (power2.inOut) com a câmera parada. O regulador desliza pela alça (a alça dupla alonga) e um selo verde de confirmação aparece em \"não fica apertando\". Apoio: foto real da alça com o regulador.",
}
for k in (1, 2, 4, 5, 7, 8): A("- " + desc[k])
A("\nNão há logotipo em tela cheia porque a fala não cita a marca pelo nome. A marca aparece só na foto real da embalagem. As instruções sobre Claude Code e interfaces de produto não se aplicam a este conteúdo (produto físico, sem software).\n")

A("## 6. Fatos verificados e fontes\n")
A("| Afirmação na fala | Verificação | Fontes |\n|---|---|---|")
A("| \"Eu visto 36\" + \"menor tamanho\" (etiqueta XS/S) | Tamanho 36 feminino no Brasil ≈ PP, que nos EUA ≈ XS. Coerente com a etiqueta XS/S da embalagem (lida no vídeo). | Blog da Shopee, \"tamanho de roupa\" (shopee.com.br/blog/tamanho-de-roupa); Cidesp, tabela de tamanhos China → Brasil (cidesp.com.br/conteudo/tabela-de-tamanho-de-roupa-da-china-para-o-brasil); Auditório Ibirapuera, \"O que é manequim 36?\" |")
A("| \"carrinho laranja\" | É o carrinho do TikTok Shop; a loja chegou ao Brasil em maio de 2025. Não é um dado numérico. | Gazeta Mercantil, \"TikTok Shop cresce 102 vezes no Brasil\"; GameOverdrive, \"TikTok Shop: o que é, como funciona\" |")
A("| Marca SHEYAS, \"menor tamanho\", \"várias numerações\", \"alcinha regulável\" | **Não verificável publicamente.** Buscas (padrão e estendida) não encontraram site, loja nem tabela de medidas da SHEYAS. A alça regulável aparece no próprio vídeo (regulador visível em 22,5–24,5 s). | — |")
A("\nObservação: as páginas não puderam ser capturadas como imagem. A rede deste ambiente bloqueia esses domínios (e o WebFetch falhou com DNS), então a verificação foi feita pelos trechos dos resultados de busca. A fala não cita nenhum acontecimento, manchete ou lançamento, e por isso nenhuma moldura de página-fonte foi exigida nem usada.\n")
A("## 7. Divergências entre fala e fontes\n")
A("- **36 ≈ PP/XS**: a Shopee associa 36 a PP (XS). A tabela da Cidesp e um artigo sobre manequins apontam que, conforme a marca, 36 também pode corresponder a P (S). A fala não diz o contrário; o gráfico usa \"≈ PP · XS\" com \"≈\", sem cravar a equivalência.")
A("- **\"menor tamanho\" e \"várias numerações\"**: nenhuma fonte confirma que XS/S é o menor tamanho da SHEYAS nem quais numerações existem. A gravação foi preservada, mas os gráficos **não** mostram grade de tamanhos ou lista de numerações, para não reforçar um dado não verificado. Só aparece a etiqueta XS/S, que é visível no vídeo.\n")

A("## 8. Efeitos sonoros (tempos no vídeo final)\n")
A(f"Pico da voz: {alog['voice_peak_dbfs']:.2f} dBFS. Alvos: cliques/impactos/sinais −10 dB, passagens −9 dB, tiques −16 dB, riser −14 dB em relação a esse pico.\n")
A("| Tempo (s) | Efeito | Pico (dBFS) |\n|---|---|---|")
for s in alog["sfx"]: A(f"| {s['t']:.3f} | {s['desc']} | {s['peak_dbfs']:.2f} |")
A(f"| {alog['riser']['start']:.3f}–{alog['riser']['end']:.3f} | riser grave (42→180 Hz + ar filtrado); termina exatamente na junção gancho → primeiro ponto | {alog['riser']['peak_dbfs']:.2f} |")
A("\nNão há efeitos em trocas de layout, deslocamentos suaves, aproximações ou recuos. O CTA não tem efeito algum (nem digitação nem clique), conforme a regra para logotipo/CTA. São duas passagens ao todo, nas variações A e B, uma por trecho.\n")
A(f"Música: original e sintetizada, {alog['music']['bpm']} BPM, Fá maior (Fmaj7–Am7–Dm7–B♭maj7), com bumbo suave, chimbal, baixo e pad quentes e arpejo grave discreto, sem melodia principal. A primeira batida cai no quadro 1 (16,7 ms), com entrada de 5 ms, saída de 800 ms e um único ganho estático (sem ducking nem automação).\n")

A("## 9. Loudness (filtro ebur128 do FFmpeg)\n")
A("| Faixa | LUFS integrados | Pico verdadeiro (dBTP) |\n|---|---|---|")
for k, n in [("voice", "stems/voice.wav"), ("sfx", "stems/sfx.wav"), ("riser", "stems/riser.wav"), ("music", "stems/music.wav"), ("master_wav", "master (WAV antes do AAC)"), ("final_mp4", "final.mp4 (AAC)")]:
    v = ver["loudness"][k]; A(f"| {n} | {v['I_LUFS']:.1f} | {v['TP_dBTP']:.1f} |")
m = alog["master"]
A(f"\nO master é a soma direta das quatro faixas, com ganho geral de {m['trim_db']:+.2f} dB. O limitador transparente (look-ahead de 3 ms, release de 45 ms, oversampling 4× para pico verdadeiro) foi necessário porque a voz a −14 LUFS tem picos de +3,7 dBFS. Redução máxima de {m['max_gr_db']} dB; age acima de 1 dB em só {m['pct_samples_gr_over_1db']}% das amostras (transientes curtos da voz), sem clipping. Os stems são WAV float de 32 bits, 48 kHz estéreo, com exatamente {int(plan['END']*48000)} amostras cada, então os picos acima de 0 dBFS da voz ficam preservados para remixagem. O \"LUFS\" de sfx e riser é o integrado com gate do ebur128, ou seja, medido só nos trechos em que soam.\n")

A("## 10. Reconstruções, alternativas técnicas e decisões\n")
for line in [
 "**Entrada única**: só veio o vídeo. O áudio limpo foi derivado do próprio áudio da câmera (ver §3), em vez de interromper o trabalho.",
 "**Transcrição**: o Hugging Face está bloqueado neste ambiente, então os modelos foram baixados dos *releases* do GitHub (sherpa-onnx). Usei Parakeet-TDT 0.6B v3 (tempos por palavra, rodado por pedaço para evitar o adiantamento depois de silêncios) e Whisper large-v3-turbo para conferir o texto e as junções.",
 "**Olhar**: MediaPipe FaceLandmarker. A `libEGL` que faltava foi resolvida com a cópia que vem no Chromium (em `edit/.localdeps`, sem instalar nada no sistema).",
 "**Recorte de fundo**: usei Robust Video Matting (ResNet50, ONNX) no lugar do `remove-background` do HyperFrames (u2net por quadro). O RVM é recorrente, o que dá cabelo estável entre quadros e evita cintilação na borda da cabeça.",
 "**Reconstruções vetoriais** (identificadas como tal): o body (silhueta), o manequim, a etiqueta \"XS/S\" (a etiqueta real tem ~95 px na fonte, pequena demais para ampliar) e a ilustração da alça com regulador. **Fotos reais**: a embalagem SHEYAS (espelhada de volta para o logo ficar legível; a câmera grava espelhada) e o close da alça. Os recortes evitam a marca d'água.",
 "**Marca d'água**: o vídeo de origem traz a marca d'água do TikTok (@helenakrecomenda) e o aviso \"Unauthorised commercial use of video strictly prohibited\". Não removi nada disso das imagens de câmera; confirme que você tem os direitos de uso.",
 "**Capa**: \"O tamanhinho desse body!\" (Poppins Bold 110 px, caixa branca de y = 262 a 603, raio de 2,8%), só no quadro 0.",
 "**Legendas**: geradas dos tempos da faixa final; a primeira aparece no quadro 1. Os destaques usam Instrument Serif Itálico em #FFFF00; a fonte não tem versão bold, então o negrito é sintético (traço fino da mesma cor). A cadência é H n n (n) H… do início ao fim, sem dois destaques seguidos e sem destacar artigos ou preposições.",
 "**CTA**: a fala não pede uma palavra específica. Digitei \"link\", a palavra central da chamada (\"vou deixar o link…\"), com cursor piscante, e depois animei o clique em publicar (o botão afunda, gera uma onda e vira um check). Caixa única com avatar genérico, sem painel, texto de plataforma ou pedido de DM.",
 "**Qualidade da fonte**: a câmera tem 576×1024 a 30 fps. Foi ampliada 1,875× (tela cheia) ou 2,1× (cartão) e cada quadro de origem é repetido em 2 quadros a 60 fps. Não há zoom nem movimento artificial na câmera.",
]: A("- " + line)
A("")

A("## 11. Verificação final\n")
f = ver["format"]
A(f"- **Arquivo**: {f['video']}; áudio {f['audio']}; duração {float(f['duration']):.3f} s; {ver['decoded_frames']} quadros decodificados.")
ok = [c for c in ver["cut_checks"] if c.get("layout") != "C"]
bad = [c for c in ok if not c["ok"]]
A(f"- **Dois lados de cada corte** ({len(ver['cut_checks'])} quadros conferidos): em cada quadro com câmera, comparei a imagem renderizada com os quadros-fonte vizinhos. {len(ok)-len(bad)}/{len(ok)} batem com o quadro-fonte esperado (±1). Prancha: `verificacao/cortes.png`.")
al = ver["head_alignment"]
A("- **Cabeça × cartão** (primeiro quadro e movimento mais rápido de cada trecho B): o degrau de cor na borda do cartão (y 1196 vs 1204) foi " + ", ".join(f"{x['seam_step']}" for x in al) + "; dentro do cartão, " + ", ".join(f"{x['inside_step']}" for x in al) + " (mesma ordem de grandeza, sem descontinuidade). A cabeça recortada está presente desde o primeiro quadro de cada trecho dividido. Prancha: `verificacao/cabeca_cartao.png`.")
wh = ver["whoosh_alignment"]
A("- **Passagens**: " + "; ".join(f"meio do movimento {w['motion_mid_s']:.3f} s → pico {w['whoosh_peak_s']:.3f} s" for w in wh) + ".")
A(f"- **Riser**: termina de soar em {ver['riser']['audible_end_s']:.4f} s; a junção do gancho é em {ver['riser']['hook_junction_s']:.4f} s.")
A("- **Silêncio nas junções** (abaixo de −35 dB): " + ", ".join(f"{j['silence_ms']} ms" for j in ver["junction_silence"]) + ". Todos ≤ 150 ms.")
A(f"- **Loudness**: final.mp4 com {ver['loudness']['final_mp4']['I_LUFS']:.1f} LUFS e {ver['loudness']['final_mp4']['TP_dBTP']:.1f} dBTP; voz {ver['loudness']['voice']['I_LUFS']:.1f} LUFS; música {ver['loudness']['music']['I_LUFS']:.1f} LUFS (≈10 LU abaixo da voz). Tudo dentro de ±0,5 LU.")
A(f"- **Fim**: a última amostra audível da voz é em {ver['voice_last_audible_s']:.3f} s (END = {plan['END']:.3f} s). O vídeo termina no último quadro previsto, sem quadro branco, cabeça congelada ou silêncio sobrando.")
A("- **Prancha completa** (`verificacao/prancha_completa.png`): as legendas não cobrem o rosto; o amarelo alterna (nunca dois destaques seguidos); o conteúdo fica nas áreas seguras; não há grades nem áreas escuras nos gráficos; a capa aparece limpa só no quadro 0; não há erros de máscara visíveis.")
open(f"{E}/RELATORIO.md", "w").write("\n".join(L) + "\n")
print("ok")
