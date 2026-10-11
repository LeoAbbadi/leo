"""RELATORIO.md for video 2, built from plan.json, audio_log.json and verificacao/verificacao.json."""
import json
E = "/home/user/leo/edit"; W = f"{E}/work"
plan = json.load(open(f"{W}/plan.json")); alog = json.load(open(f"{W}/audio_log.json"))
ver = json.load(open(f"{E}/verificacao/verificacao.json")); raw = json.load(open(f"{W}/asr_raw.json"))
SEGS = plan["segments"]
L = []; A = L.append
A("# Relatório de edição — vídeo 2 (\"1º mês na Irlanda\"), Reel 9:16 · 1080×1920 · 60 fps\n")
A(f"**END = {plan['END']*1000:.1f} ms** ({plan['frames']} quadros a 60 fps). O vídeo e as quatro faixas (voz, efeitos, riser e música) terminam exatamente em END.\n")
A("Entregas em `edit/`: `final.mp4` (H.264 High + AAC estéreo 48 kHz), `stems/voice.wav`, `stems/sfx.wav`, `stems/riser.wav`, `stems/music.wav`, este relatório, `segmentos.md`, `verificacao/` (pranchas e medições) e `scripts/` (todo o processo, reproduzível: FFmpeg + Python + Node/HyperFrames, sem editor de vídeo).\n")

# ------------------------------------------------------------------ 1
A("## 1. Tabela de trechos (0 → END)\n")
names = {"A": "A — câmera em tela cheia", "B": "B — janela flutuante sobre fundo gráfico", "C": "C — composição totalmente visual"}
A("| # | Início (s) | Fim (s) | Duração (s) | Layout | Conteúdo |\n|---|---|---|---|---|---|")
for s in SEGS:
    A(f"| {s['n']} | {s['t0']:.3f} | {s['t1']:.3f} | {s['t1']-s['t0']:.3f} | {names[s['layout']]} | {s['content']} |")
cnt = {k: sum(1 for s in SEGS if s["layout"] == k) for k in "ABC"}
mx = max(SEGS, key=lambda s: s["t1"] - s["t0"])
A(f"\n{len(SEGS)} trechos (A {cnt['A']}, B {cnt['B']}, C {cnt['C']}). Nenhum layout se repete em trechos consecutivos e os três aparecem. O mais longo é o {mx['n']} ({mx['t1']-mx['t0']:.2f} s, abaixo de ~8 s). O gancho está em B; o encerramento, a partir do CTA, está em A.\n")

# ------------------------------------------------------------------ 2
A("## 2. Tomadas, substituições e conteúdo descartado\n")
A("A gravação traz várias tomadas e reinícios. Em todos os casos ficou a **última tomada completa** de cada frase; as anteriores, os reinícios, as preparações e os apartes foram retirados. Cada trecho mantido foi conferido com o Parakeet e o Whisper (janela por janela, com o perfil RMS da fronteira) e os tempos foram fixados à mão em `scripts/03_cuts.py` (`KEEP_T`).\n")
A("| Fonte removida (s) | Conteúdo descartado | Motivo / tomada que ficou |\n|---|---|---|")
rem = [
 ("8,74–9,47", "\"quanto que eu ganhei,\"", "autocorreção; ficou \"quanto eu recebi\""),
 ("12,96–15,20", "\"E agora fechou o primeiro mês de agosto, né?\"", "tomada anterior; ficou \"Então fechou o primeiro mês totalmente cheio\" (15,20)"),
 ("18,65–19,60", "\"muito esse mês,\" (1ª vez)", "repetição; ficou a 2ª, emendada em \"mas porque eu viajei…\""),
 ("30,41–32,28", "\"Basicamente.\"", "comentário solto depois da frase"),
 ("35,72–37,18", "\"na…\" + pausa", "reinício; ficou \"na loja de conveniência\" (37,18)"),
 ("55,78–59,78", "\"Essas coisas assim, geralmente, né?\" + \"Então quanto que…\"", "comentário + reinício; ficou \"Quanto que eu ganhei e quanto que sobrou\""),
 ("64,65–66,15", "\"vou botar aqui\"", "aparte (ele abre o app)"),
 ("68,91–74,75", "\"E eu gastei, o maior gasto foi lazer e porcaria, tá? Então\"", "tomada anterior; ficou \"Então o maior gasto, tirando aluguel, né? …\" (74,745)"),
 ("79,52–80,30", "hesitação no meio de \"não são … necessárias\"", "hesitação"),
 ("89,61–90,98", "\"Então assim, ó,\"", "preparação"),
 ("93,58–94,66", "\"essas latinhas de Monster,\" (1ª vez)", "repetição; ficou a 2ª (\"…é da semana, tá?\")"),
 ("96,53–97,89", "\"Então assim,\"", "preparação"),
 ("106,82–107,61", "\"vivi muito bem,\" (1ª vez)", "repetição; ficou \"vivi muito bem mesmo\""),
 ("111,09–112,60", "\"que eu não estou vendo a foto, tá?\"", "aparte"),
 ("117,04–120,09", "hesitação (117,4–118,3) + \"Gastei pra Paris,\"", "reinício; ficou \"Eu fui pra Paris de última hora…\""),
 ("144,48–145,94", "\"O que eu quero é.\"", "reinício; ficou \"O tópico que eu quero dizer é:\""),
 ("159,60–161,24", "\"questão de.\"", "reinício; ficou \"questão de comida fora,\""),
 ("163,41–164,11", "\"comer fora, né?\"", "repetição; ficou \"comer muito fora, muito fora mesmo\""),
 ("179,45–179,775", "gaguejo \"é um bom,\"", "emenda justa (8 ms, sem silêncio); ficou \"é um bom valor…\""),
]
for a_, b_, c_ in rem: A(f"| {a_} | {b_} | {c_} |")
A("\nOs demais intervalos entre trechos mantidos são só pausas ou respirações (3,73–4,33; 10,12–10,95; 17,58–18,01; 63,40–64,26; 82,51–82,98; 86,88–87,22; 91,69–92,28; 108,63–109,11; 124,97–125,51; 136,46–136,98; 139,95–140,46; 156,14–156,35; 166,00–166,31; 176,00–176,51 s). As sobras de ASR que vazavam nas bordas (\"Então quanto\", \"vou botar\", \"essa\", \"em questão\", \"uh\", \"Ah\") foram eliminadas, uma a uma, pela inspeção das fronteiras.\n")
A("Regras aplicadas na montagem: pré-roll de 40 ms; silêncios internos acima de 250 ms (abaixo de −35 dB) comprimidos para 120 ms; fim de cada fala por RMS (−35 dB e −32 dB por 150 ms); J-cut de 50 ms (a imagem troca 50 ms depois do som); cauda com fade de 170 ms; nenhuma junção com mais de 150 ms de silêncio. Os limiares são medidos na voz já normalizada (−14 LUFS, ganho de +12,24 dB sobre o áudio da câmera).\n")
sy = raw["sync"]
A(f"**Sincronização:** só existe o arquivo de vídeo. A voz limpa foi derivada do áudio da câmera (passa-altas + `afftdn`), e a correlação cruzada (mono, 16 kHz) entre câmera e voz limpa dá pico em {sy['offset_ms']:.1f} ms (razão pico/2º pico {sy['ratio']:.1f}:1). Depois disso só a voz limpa entra na mixagem.\n")
A("**Transcrição final** (a faixa montada foi conferida pelo Whisper):\n")
A("> " + " ".join(w["text"] for w in plan["words"]) + "\n")

# ------------------------------------------------------------------ 3
A("## 3. Olhar e escolha dos layouts\n")
A("O olhar foi medido quadro a quadro com o MediaPipe FaceLandmarker (blendshapes de olhos e pose da cabeça) e conferido em pranchas. Desvios do olhar no vídeo final (s): " + ", ".join(f"{a:.2f}–{b:.2f}" for a, b in plan["offlens_out"]) + ".")
A("- Todos os desvios fora do gancho, do trecho 17 e do CTA caem em trechos C (sem câmera). Os cortes para C foram postos na fronteira de palavra anterior ao desvio, quantizados a 60 fps.")
A("- **Trecho 17 (B), exceção documentada:** em 62,15–69,29 s ele vira o celular para filmar o quarto (\"Se eu mostrar aqui, ó… essas latinhas de Monster é da semana\"). A janela mostra essa filmagem real, sem rosto, porque ela é a prova do que ele diz; acima ficam o hambúrguer e o contador de latas.")
A("- **CTA (trecho 34, A):** há três olhadas curtas (143,77–144,17; 145,02–145,52; 145,92–146,50). A regra \"encerramento a partir do CTA sempre em câmera cheia\" não tem a ressalva de contato visual, então prevalece como regra específica. O CTA começa em \"Vocês conseguem guardar isso no Brasil?\" (143,15 s) para o trecho ficar abaixo de 8 s; as perguntas anteriores ficaram em A (32) e C (33, cofrinho).")
A("- **Emenda justa** do gaguejo (179,45 → 179,775 da fonte) cai exatamente na troca A → C em 138,95 s, o que esconde o salto de imagem.\n")
A("**Janela B (câmera em janela flutuante):** a câmera não é recortada por chroma nem por IA. Ela aparece numa janela 4:3 de 960×720 px em (60, 1000), centralizada embaixo, com raio de 80 px, borda de vidro de 3 px e sombra larga, suave e azul-escura (três camadas: 0/60/120, 0/24/48 e 0/4/10 em rgb(0,30,80)). O recorte interno não distorce a imagem:")
A("- **Recorte padrão** (0, 105, 576×432 da fonte 576×1024): pega da aba do boné ao queixo e para acima das sobreposições que já vêm queimadas na gravação (gráfico do app a partir de y ≈ 537 e legendas em y ≈ 820).")
A("- **Gancho** (48, 248, 480×360): exclui o título queimado \"da para guardar dinheiro na Irlanda?\" que cobre a testa.")
A("- **Trecho 8** (0, 130, 576×432) e início do **14**: nesses trechos o print do app dele começa em y = 410, à direita do rosto. Nenhum recorte 4:3 que contenha a boca evita o canto do print, que aparece no canto inferior direito da janela.")
A("O conteúdo gráfico dos trechos B fica em y 40–900.\n")

# ------------------------------------------------------------------ 4
A("## 4. Composições (HyperFrames, 240 fps → 60 fps, estética Liquid Glass)\n")
A("Cada trecho B/C é um projeto HyperFrames próprio (`graphics/gNN/index.html`, lint sem erros). Ele é renderizado a 240 fps e reduzido a 60 fps no FFmpeg com `tmix=frames=4` mais a seleção de um quadro a cada quatro (`scripts/12_tmix.py`); as contagens conferem com os quadros de cada trecho. Uma única tween GSAP condutora avalia a cena em função do tempo, então qualquer quadro é determinístico.")
A("- **Movimento de câmera:** desfoque direcional com σ = 0,29 × velocidade × 0,75 ÷ 60, limitado a 40 px, e nenhum desfoque em repouso. A profundidade de campo é feita com desfoque e opacidade nos planos fora de foco.")
A("- **Fundo:** gradiente azul/ciano com vários radiais que se movem de forma orgânica e quase imperceptível. Ele é guiado pelo tempo absoluto do vídeo, então continua sem salto de um trecho gráfico para o outro. Não há grades, esferas nem áreas escuras.")
A("- **Vidro:** branco 85% com `backdrop-filter: blur(24px) saturate(1.6)`, realce interno e sombras de três camadas (0 60 120 / 0 24 48 / 0 4 10, rgba(0,30,80,…)). Raios: mídia 32 (3% da largura), documentos 40, blocos 72, telefone 84.")
A("- **Tipografia:** Poppins 96/700, 52/700 e 30/400, nada abaixo de 30 px. Cores: #1D1D1F no vidro, branco solto sobre o azul, ciano #00E5FF, verde #34C759 e vermelho #FF3B30.\n")
desc = {
 1: "dois cartões de vidro, \"Recebi\" (seta de entrada ciano) e \"Gastei\" (seta de saída vermelha), todos abaixo de y = 620 no quadro 0. Aproximação suave até 1,10× e pulso no ícone em \"recebi\". Em \"gastei\", a câmera passa ao cartão Gastei (1,6×) enquanto o cartão Recebi desfoca até 9 px (profundidade de campo).",
 3: "calendário de vidro: julho de 2026 com anel ciano e alfinete \"cheguei\" no dia 10 (sexta-feira). Troca lateral para agosto, cujos 31 dias acendem um a um até o selo de mês completo.",
 5: "cartão de embarque DUB → CDG com o avião percorrendo o arco e o selo \"última hora\". Passagem rápida (power3, 1,05 s, com whoosh no meio) até o bloco de petiscos: bolinho e salgadinho caem com impacto e a semana (D–S) se preenche de petiscos.",
 7: "bandeja de vidro na escola (livro): três brownies caem um a um em \"dois, três brownie\", com aproximação de 1,25×.",
 8: "cartão da loja de conveniência; em \"café\" o cartão do café entra com mola e vapor animado.",
 9: "prateleira de vidro: as latas MONSTER, ENERGÉTICO e COCA-COLA (genéricas, só o nome) deslizam no ritmo das palavras.",
 11: "pote de comida: o relógio gira dois dias, a comida perde a cor (filtro de deterioração), sobe o cheiro e o pote cai na lixeira em \"estragou\". A câmera aproxima até 1,4× e volta.",
 13: "carteira: moedas entram em arco; as barras \"Entrou\" e \"Sobrou\" (45,3% = 1.423,97 / 3.142,00) crescem.",
 14: "cartão \"Renda · agosto 2026\" contando de 0 até +3.142,00 € (valor do app dele, mostrado com o rótulo \"valor registrado no app dele\"), barra ciano e selo de confirmação.",
 16: "semana de vidro: os sete dias acendem e kebab e hambúrguer caem alternados em cada dia.",
 17: "hambúrguer pulsa em \"hambúrguer aqui\". Em \"Olha ali\" a câmera faz uma passagem lateral rápida (0,5 s, power3, com whoosh) até o cartão \"1 semana\", onde caem 5 latas de energético, as que aparecem na filmagem do quarto. A janela mostra a filmagem real.",
 19: "lista \"Compras do mês\": essenciais (Arroz, Leite, Pão, ilustrativos) com check e extras (Kebab, Monster, Brownie, Paris) destacados. O carimbo vermelho \"SEM CONTROLE\" bate em \"controlado\", e a câmera desce até 1,22× para os extras e volta.",
 20: "documento \"Contas da casa\": Aluguel \"650 e pouco\" + Faxineira \"+ taxa\" → \"Total no app 677,00 €\" com sinal de confirmação.",
 22: "cartão DUB → CDG \"passagem de último minuto\": a barra do preço pago cresce até 3× a do preço normal e o carimbo \"3×\" bate.",
 24: "moldura de vidro fixa (x 24, y 200, 1032×1040, raio 36) com a página-fonte; atrás, cópia desfocada (blur 40, saturação 0,7, brilho 1,05) sob véu branco de 72%. Os movimentos acontecem dentro da moldura: aproximação de 1,18× no título, descida até a linha destacada em ciano (\"Os playoffs ocorrem entre os dias 19 e 23 de agosto… Accor Arena\") e retorno.",
 25: "cartão \"Comida · agosto 2026\" contando até 131,08 € (\"cento e poucos euros\" · valor do app).",
 26: "celular (raio 84) com a tela Relatório do app em tema claro, com os valores reais da gravação. Em \"aqui\" o telefone amplia 1,15× e a lista rola até as linhas destacadas Contas da casa e Viagem; o resumo Despesas/Renda/Balanço fica fixo embaixo.",
 28: "Renda +3.142,00 € e Despesas −1.718,03 € entram; o Balanço de agosto conta até +1.423,97 € em \"sobrou\", com sinal e aproximação de 1,06×.",
 30: "mapa de vidro: a rota Dublin → Paris se desenha com o avião seguindo a curva; o bilhete \"jogo presencial\" (troféu) entra em \"presencial\".",
 31: "sacolas e camiseta caem; o carimbo vermelho \"DESNECESSÁRIO\" bate em \"burros\".",
 33: "cofrinho de vidro: o chip \"+1.423,97 € / mês\" aparece, as moedas caem e o líquido ciano sobe.",
}
for s in SEGS:
    if s["layout"] != "A": A(f"- **g{s['n']:02d} (trecho {s['n']}, {s['layout']})**: {desc[s['n']]}")
A("\n**Trechos A:** a fonte (576×1024, 30 fps) é ampliada 1,875× em tela cheia, sem zoom nem movimento artificial. As legendas queimadas da gravação continuam visíveis nesses trechos.\n")

# ------------------------------------------------------------------ 5
A("## 5. Fatos verificados e fontes\n")
A("| Afirmação na fala | Verificação | Fonte |\n|---|---|---|")
A("| \"Eu fui pra Paris pra ver o jogo da FURIA\" | A fase de CS2 da Esports World Cup 2026 foi em Paris, de 12 a 23 de agosto de 2026, com grande final na Accor Arena (o evento saiu de Riad por questões de segurança). A FURIA jogou: venceu a Wildcard em 12/08 e a G2 por 2–1 nas quartas em 20/08. O TechTudo diz que a FURIA enfrentaria a Aurora na quarta-feira (19) e que os playoffs iam de 19 a 23/08, com final na Accor Arena. | [TechTudo — CS2 na EWC 2026: FURIA é destaque na última semana do torneio](https://www.techtudo.com.br/noticias/2026/08/cs2-na-ewc-2026-furia-e-destaque-na-ultima-semana-do-torneio-edjogos.ghtml); [Accor Arena — EWC26 Paris: CS2 Grand Finals](https://www.accorarena.com/en/events-and-tickets/ewc26-paris-cs2-grand-finals--1a52e); [NAVI — Wildcard vs FURIA, 12/08/2026](https://navi.gg/en/tournaments/ewc-2026/match/13857); [NAVI — G2 vs FURIA, 20/08/2026](https://navi.gg/en/tournaments/ewc-2026/match/13872); [BLAST — G2 vs FURIA](https://blast.tv/cs/tournaments/esports-world-cup-2026-cs2/match/7f5f85d3/g2-furia); [Wikipedia — 2026 Esports World Cup](https://en.wikipedia.org/wiki/2026_Esports_World_Cup); [Dust2 Brasil — FURIA vs FUT](https://www.dust2.com.br/partidas/2396611/furia-vs-fut) |")
A("| \"Viajei pra outro país pra ver um jogo presencial de esportes\" | Coerente com a viagem Dublin → Paris (França) e com o evento acima. | idem |")
A("| \"Eu cheguei aqui dia 10 de julho… fechou o primeiro mês totalmente cheio\" | Pessoal, não verificável publicamente. O calendário confere: 10/07/2026 é sexta-feira e agosto de 2026 começa num sábado. O app dele mostra o período \"ago. 2026 (01 ago. – 31 ago.)\". | calendário; tela do app na gravação |")
A("| \"ganhei mais ou menos 3.100 euros\" | O app dele (print na própria gravação) mostra **Renda +3.142,00 €**. | tela do app na gravação |")
A("| \"650 e pouco do aluguel, mais a taxa da faxineira\" | O app mostra **Contas da casa 677,00 € (39,4%)**, coerente com ~650 € + taxa. | tela do app na gravação |")
A("| \"Gastei com comida, em média, cento e poucos euros\" | O app mostra **Comida 131,08 € (7,6%)**. | tela do app na gravação |")
A("| \"foi isso aqui que sobrou\" | O app mostra **Balanço +1.423,97 €** (= 3.142,00 − 1.718,03). | tela do app na gravação |")
A("| \"pagar três vezes o valor da passagem\", \"comida estraga rápido\", latas \"da semana\" | Pessoal ou subjetivo, sem fonte pública. As latas aparecem na filmagem do quarto. | gravação |")
A("\n**Captura das páginas:** a rede deste ambiente bloqueia esses sites (curl sem resposta; WebFetch com erro de DNS), então não foi possível capturar as páginas como imagem. A moldura do trecho 24 traz a **reconstrução fiel do texto** da matéria do TechTudo (título e trechos citados acima, tal como saíram na busca) e diz isso na própria tela: \"Reconstrução fiel do texto da página — a captura de tela foi bloqueada pela rede deste ambiente.\"\n")

# ------------------------------------------------------------------ 6
A("## 6. Divergências entre a fala e as fontes\n")
A("- **3.100 × 3.142,00 €**: ele diz \"mais ou menos\"; o gráfico mostra o valor do app com o rótulo \"valor registrado no app dele\".")
A("- **\"O maior gasto, tirando aluguel, foi essas porcarias\"**: no app, a maior categoria depois de Contas da casa é **Viagem (354,95 €, 20,7%)**, à frente de Brasil (140,00 €), Comida (131,08 €) e Lazer (121,64 €). Mesmo somando Comida + Lazer + Itens diários (304,37 €), o total fica abaixo de Viagem. A frase foi mantida (é a avaliação dele), mas nenhum gráfico afirma que as \"porcarias\" foram o maior gasto: o trecho 15 é câmera.")
A("- **EWC 2026**: as fontes divergem sobre os jogos e a colocação final da FURIA. O TechTudo fala de FURIA × Aurora na quarta (19); a NAVI registra G2 × FURIA em 20/08 nas quartas; a BLAST lista a FURIA na decisão de 23/08; a página geral da Wikipedia não traz a classificação de CS2. Ele não diz qual jogo viu, então o gráfico só mostra a página com o período dos playoffs e a final na Accor Arena, sem afirmar resultado.")
A("- **Relatório do app (trecho 26)**: as 12 linhas legíveis somam 1.640,96 €. Falta uma linha de 77,07 € (4,5%), ilegível na gravação, que foi omitida em vez de inventada. O resumo Despesas −1.718,03 € é o valor real.\n")

# ------------------------------------------------------------------ 7
A("## 7. Efeitos sonoros (tempos no vídeo final)\n")
vp = alog["voice_peak_dbfs"]
A(f"Todos os efeitos foram sintetizados por código (NumPy/SciPy), inspirados nos sons de interface da Apple. Pico da voz (stem): {vp:.2f} dBFS. Alvos em relação a esse pico: cliques/impactos/sinais −10 dB, passagens −9 dB, teclas/tiques −16 dB, riser −14 dB.\n")
A("| Tempo (s) | Efeito | Pico (dBFS) | Relativo à voz | Composição |\n|---|---|---|---|---|")
for s in alog["sfx"]: A(f"| {s['t']:.3f} | {s['desc']} | {s['peak_dbfs']:.2f} | {s['peak_dbfs']-vp:+.1f} dB | {s['comp']} |")
r = alog["riser"]
A(f"| {r['start']:.3f}–{r['end']:.3f} | riser grave e sutil (40→150 Hz + ar filtrado), 2,6 s, terminando exatamente na junção do gancho (3,867 s) | {r['peak_dbfs']:.2f} | {r['peak_dbfs']-vp:+.1f} dB | — |")
nwh = sum(1 for s in alog["sfx"] if "passagem" in s["desc"])
A(f"\nHá {nwh} passagens (whoosh), só nos dois movimentos rápidos de câmera (trechos 5 e 17), uma por trecho, com pico no meio exato do movimento. Não há efeito em trocas de layout, derivas, aproximações, recuos ou zooms. O CTA não tem efeito.\n")
mu = alog["music"]
A(f"**Música:** original e sintetizada, lo-fi synth / corporate ambient a {mu['bpm']} BPM, {mu['key']}. Tem piano elétrico, pad, bumbo macio, estalo, chimbal e baixo; os dois primeiros compassos são só teclas e pad. A primeira batida cai no quadro 1 ({mu['first_beat_s']*1000:.1f} ms), com entrada de 5 ms, saída de 800 ms e nível constante em −24 LUFS (sem ducking nem automação).\n")

# ------------------------------------------------------------------ 8
A("## 8. Loudness (filtro ebur128 do FFmpeg)\n")
A("| Faixa | LUFS integrados | LRA (LU) | Pico verdadeiro (dBTP) |\n|---|---|---|---|")
for k, n in [("voice", "stems/voice.wav"), ("sfx", "stems/sfx.wav"), ("riser", "stems/riser.wav"), ("music", "stems/music.wav"), ("master_wav", "master (WAV antes do AAC)"), ("final_mp4", "final.mp4 (AAC 320 kb/s)")]:
    v = ver["loudness"][k]; A(f"| {n} | {v['I_LUFS']:.1f} | {v['LRA_LU']:.1f} | {v['TP_dBTP']:.1f} |")
m = alog["master"]; vl = alog["voice_leveller"]
A(f"\n- **Voz:** normalizada a −14 LUFS. Antes disso passou por um nivelador suave (detector RMS de 3 ms, joelho de 6 dB, 2,5:1 acima de {vl['thr_dbfs_rms3ms']:.0f} dBFS, ataque com look-ahead de 1,5 ms, release de 90 ms). Ele age no máximo {vl['max_gr_db']} dB, nas palavras gritadas e plosivas; sem ele a voz a −14 LUFS tinha picos de +6 dBTP e o limitador do master chegava a 7,6 dB de redução.")
A(f"- **Master:** soma direta das quatro faixas com ganho geral de {m['trim_db']:+.2f} dB. O limitador transparente (pico verdadeiro com oversampling 4×, look-ahead de 3 ms, release de 45 ms, teto em −1,4 dBTP) reduz no máximo {m['max_gr_db']} dB e passa de 1 dB em só {m['pct_samples_gr_over_1db']}% das amostras.")
A("- **Stems:** WAV float de 32 bits, 48 kHz estéreo, com a duração exata de END. O LUFS de sfx e riser é o integrado com gate, ou seja, medido só onde soam.\n")

# ------------------------------------------------------------------ 9
A("## 9. Reconstruções, decisões e alternativas técnicas\n")
for line in [
 "**Legendas:** você pediu para não colocar legendas novas, já que a gravação tem as suas. Não gerei nenhuma. As legendas queimadas aparecem nos trechos A. Nos trechos B elas ficam fora do recorte da janela (o recorte vai da aba do boné ao queixo, como você autorizou); nos trechos C a tela é só gráfico. Durante o CTA, a caixa de comentário cobre a faixa onde elas ficam.",
 "**Capa (só no quadro 0):** \"Dá pra guardar / na Irlanda?\", o tema central do vídeo e do seu título original. Poppins Bold 110 px, branco puro, em duas linhas numa caixa de vidro translúcida (desfoque do fundo + tinta azul) de y 262 a 603, raio de 2,8% e ~50 px de margem lateral, com sombra azul suave. Os cartões do gancho estão abaixo de y = 620.",
 "**CTA:** a fala não pede uma palavra específica (\"como é que está a situação de vocês?\"). Digitei \"Consigo!\", a resposta mais direta a \"Vocês conseguem guardar isso no Brasil?\", com cursor piscante. Depois vem o clique em publicar: o botão afunda, solta uma onda e vira um check verde. É uma única caixa de vidro (branco 85% + desfoque do fundo + sombras de três camadas, raio 72) com avatar genérico, na área x 43, y 1344, 994×276, sem painel e sem texto de plataforma.",
 "**Página-fonte (trecho 24):** é uma reconstrução do texto, porque a rede bloqueou a captura (ver §5), e está identificada na tela.",
 "**App (trecho 26):** a única captura real do app é o print na própria gravação, com ~260 px de largura, que fica ilegível ampliado. Reconstruí a tela Relatório em tema claro com os mesmos valores; a linha de 77,07 € ilegível foi omitida. O print real continua visível nos trechos A e no canto da janela B dos trechos 8 e 14.",
 "**Logotipos:** a fala cita Monster, Coca-Cola e FURIA, mas não foi possível baixar os logotipos oficiais (rede bloqueada) e não desenhei imitações. As latas são genéricas, só com o nome em texto. A regra sobre Claude Code e interfaces de produto de software não se aplica a este conteúdo.",
 "**Ilustrativos:** Arroz, Leite e Pão (trecho 19) são exemplos de itens essenciais, não compras citadas. O contador de 5 latas (trecho 17) corresponde às latas visíveis na filmagem do quarto.",
 "**Ferramentas:** o Hugging Face está bloqueado, então o Parakeet-TDT 0.6B v3 e o Whisper turbo (sherpa-onnx) vieram dos *releases* do GitHub. O MediaPipe precisou da `libEGL` do Chromium já instalado (em `.localdeps`, sem instalar nada no sistema). Todas as dependências estão no projeto (`.venv`, `node_modules`).",
 "**Cores:** a decodificação e a codificação passam pelo FFmpeg com matriz BT.709 explícita (entrada, gráficos e saída), sem desvio de cor entre câmera e gráficos.",
]: A("- " + line)
A("")

# ------------------------------------------------------------------ 10
A("## 10. Verificação final\n")
f = ver["format"]; cc = ver["cut_checks"]; bg = ver["background"]; js = ver["junction_silence"]
A(f"- **Arquivo:** {f['video']}; áudio {f['audio']}; duração {f['duration_s']:.3f} s; {ver['decoded_frames']} quadros decodificados (esperado {f['expected_frames']}).")
A(f"- **Dois lados de cada corte:** {cc['n']} quadros conferidos (o último antes e o primeiro depois de cada troca de trecho e de cada junção de áudio). Câmera: o quadro final foi comparado com os quadros-fonte vizinhos (±6), no quadro inteiro (A) ou na janela (B). Gráficos: o quadro final foi comparado com o quadro da composição. **{cc['ok']}/{cc['n']}** batem com o quadro esperado. Pranchas: `verificacao/cortes.png` e `verificacao/primeiros_quadros.png`.")
if cc["falhas"]: A("  - Diferenças: " + "; ".join(f"f{x['frame']} s{x['seg']} esperado {x['esperado']} melhor {x['melhor']}" for x in cc["falhas"]))
A(f"- **Fundo:** a variação de cor quadro a quadro na faixa só de fundo do topo (y 4–36, acima de todo conteúdo) é de no máximo {bg['max_step_within_segments_rgb']:.2f} níveis RGB (média {bg['mean_step_within_segments_rgb']:.3f}), um movimento contínuo e imperceptível. Nos cortes B↔C diretos, o salto é de " + (", ".join(f"{x['step']:.2f}" for x in bg["steps_at_B_C_cuts"]) or "—") + " níveis: o fundo continua porque é guiado pelo tempo absoluto. A translucidez do vidro foi conferida nas pranchas (o fundo aparece desfocado através dos cartões).")
al = ver["sfx_alignment"]; whs = [x for x in al if x["medido"] == "pico de energia"]; ons = [x for x in al if x["medido"] == "início" and x["erro_ms"] is not None]
A("- **Efeitos:** início medido de cada clique, impacto ou sinal em relação ao evento: erro máximo de " + f"{max(abs(x['erro_ms']) for x in ons):.1f} ms. Passagens: " + "; ".join(f"meio do movimento {x['t']:.3f} s → pico {x['medido_s']:.3f} s ({x['erro_ms']:+.1f} ms)" for x in whs) + ".")
A(f"- **Riser:** soa de {ver['riser']['start_s']:.3f} s a {ver['riser']['audible_end_s']:.4f} s; a junção do gancho é em {ver['riser']['hook_junction_s']:.4f} s; pico {ver['riser']['peak_rel_voice_db']:+.1f} dB em relação à voz.")
A(f"- **Música:** começa a soar em {ver['music']['first_audible_s']*1000:.1f} ms (quadro 1 = 16,7 ms) e termina em {ver['music']['last_audible_s']:.3f} s (END = {ver['music']['END_s']:.3f} s).")
A(f"- **Silêncio nas junções** (abaixo de −35 dB): máximo de {js['max_ms']} ms; " + ("nenhuma acima de 150 ms." if not js["over_150"] else "acima de 150 ms: " + ", ".join(f"{x['junction_s']} s ({x['silence_ms']} ms)" for x in js["over_150"])))
lf = ver["loudness"]["final_mp4"]
A(f"- **Loudness:** final.mp4 com {lf['I_LUFS']:.1f} LUFS e {lf['TP_dBTP']:.1f} dBTP; voz {ver['loudness']['voice']['I_LUFS']:.1f} LUFS; música {ver['loudness']['music']['I_LUFS']:.1f} LUFS.")
A(f"- **Fim:** a última amostra audível da voz é em {ver['voice_last_audible_s']:.3f} s (END = {plan['END']:.3f} s). O vídeo termina no último quadro previsto, sem quadro preto, imagem congelada ou silêncio sobrando.")
A("- **Pranchas** (`verificacao/prancha_completa.png`, a cada 0,5 s): a capa aparece limpa só no quadro 0; o conteúdo gráfico fica nas áreas seguras (em C, a base do elemento principal fica em y ≈ 1200–1230); a janela B não pega as sobreposições queimadas, salvo o canto do print nos trechos 8 e 14 (ver §3); não há grades, esferas nem áreas escuras no fundo; o CTA fica dentro da área pedida.")
open(f"{E}/RELATORIO.md", "w").write("\n".join(L) + "\n")
print("ok", len(L), "lines")
