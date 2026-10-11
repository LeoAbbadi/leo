import json
W = "/home/user/leo/edit/work"; plan = json.load(open(f"{W}/plan.json")); FPS = 60
WD = plan["words"]; P = {p["k"]: p for p in plan["pieces"]}
first_of_piece = {}
for i, w in enumerate(WD): first_of_piece.setdefault(w["piece"], i)
def cut_at(i):
    w = WD[i]
    if first_of_piece[w["piece"]] == i: return round(P[w["piece"]]["V"] * FPS)
    return round((w["t0"] + 0.05) * FPS)
SEG = [  # (first word index, layout, content)
 (0, "B", "Gancho: 'Quanto eu recebi no meu primeiro mês de Irlanda e quanto que eu gastei.' — dois cartões de vidro: Recebi (entra) × Gastei (sai)"),
 (14, "A", "'Pessoal, então, como eu falei, acabou de dar meu primeiro mês aqui de Irlanda e eu vou falar pra vocês quanto eu recebi.'"),
 (37, "C", "'Eu cheguei aqui dia 10 de julho. Então fechou o primeiro mês totalmente cheio.' — calendário: chegada em 10/jul, agosto se completa dia a dia"),
 (51, "A", "'Bom, eu gastei'"),
 (54, "C", "'muito esse mês, mas porque eu viajei pra Paris de última hora, eu comprei bolinho, besteira, isso todos os dias, tá?' — cartão de embarque Dublin→Paris; passagem rápida para petiscos que se repetem"),
 (75, "A", "'Então esses gastos não são os gastos se você não se descontrolar.'"),
 (87, "C", "'Era todo dia a gente na escola, dois, três brownie, na' — bandeja: brownies aparecem um a um"),
 (98, "B", "'loja de conveniência, café,' — cartão da loja de conveniência com café fumegando"),
 (102, "C", "'Monster, energéticos, enfim, Coca-Cola,' — latas deslizam para a prateleira de vidro"),
 (106, "A", "'botei muita comida fora também,'"),
 (111, "C", "'porque, infelizmente, eu, como sou novo aqui, às vezes esqueço que a comida aqui estraga rápido, deixei estragar rápido, ou fiquei tão cansado' — pote de comida estraga com os dias e vai para o lixo"),
 (134, "A", "'que não quis comer e estragou a comida, sabe?'"),
 (143, "C", "'Quanto que eu ganhei e quanto que sobrou nesse mês, tá?' — carteira: fluxo de entrada e de saída"),
 (154, "B", "'Bom, eu ganhei mais ou menos 3.100 euros nesse mês, tá?' — cartão Renda de agosto contando até 3.142,00 € (valor do app dele)"),
 (165, "A", "'Então o maior gasto, tirando aluguel, né? Foi essas porcarias, essas coisas que não são necessárias gastar, que eu gastei.'"),
 (185, "C", "'Gente, era todos os dias kebab, hambúrguer.' — semana: kebab e hambúrguer caem em cada dia"),
 (192, "B", "'Se eu mostrar aqui, ó, tem até um hambúrguer aqui. Olha ali, ó. Isso aqui não é do mês, essas latinhas de Monster é da semana, tá?' — janela mostra a filmagem real do quarto; acima, contador de latas da semana"),
 (219, "A", "'É um nível de gasto muito, muito alto e desnecessário, tá?'"),
 (230, "C", "'Não foi algo controlado, não comprei só o essencial, vivi muito bem mesmo. Gastei mais ou menos, de cabeça,' — lista de compras: essencial vs. extras, carimbo vermelho"),
 (249, "B", "'foi 650 e pouco do aluguel, mais a taxa da faxineira.' — documento Contas da casa: aluguel + faxineira = 677,00 €"),
 (260, "A", "'Eu fui pra Paris de última hora, então quando eu fui para Paris, eu comprei a passagem de último minuto.'"),
 (280, "C", "'E tive que pagar três vezes o valor da passagem' — cartão de embarque, preço triplica, carimbo 3×"),
 (290, "A", "'e gastei bastante em Paris, tá?'"),
 (296, "C", "'Eu fui pra Paris pra ver o jogo da FURIA, então é um gasto também que não é pra ter todos os meses, a não ser que você vá viajar todos os meses.' — moldura de fonte: página sobre a FURIA na EWC 2026 em Paris (reconstrução)"),
 (329, "B", "'Gastei com comida, em média, cento e poucos euros, tá?' — cartão Comida 131,08 €"),
 (339, "C", "'Enfim, aqui tá os gastos, vocês conseguem ver os gastos aqui.' — celular com o relatório do app (reconstrução com os valores reais), janela amplia"),
 (350, "A", "'O tópico que eu quero dizer é: vocês anotam o que vocês gastam aqui? Se sim,'"),
 (366, "B", "'vocês acham que dá pra guardar dinheiro? Porque foi isso aqui que sobrou esse mês pra mim.' — Renda − Despesas = Balanço +1.423,97 €"),
 (383, "A", "'E eu me descontrolei financeiramente em questão de comida fora, comer muito fora, muito fora mesmo.'"),
 (399, "B", "'Viajei pra outro país pra ver um jogo presencial de esportes.' — rota Dublin → Paris"),
 (410, "C", "'Comprei roupa, fiz gastos burros que não eram necessários.' — sacolas de compra + carimbo"),
 (419, "A", "'E, enfim, o que vocês acham? Vocês acham que esse valor'"),
 (430, "C", "'é um bom valor para guardar todo mês? Vocês gostariam de guardar isso?' — cofrinho de vidro recebendo 1.423,97 €"),
 (443, "A", "CTA: 'Vocês conseguem guardar isso no Brasil? E aqui, como é que está a situação de vocês?' — câmera + caixa de comentário"),
]
cuts = [cut_at(i) if i else 0 for i, _, _ in SEG] + [plan["frames"]]
segs = []
for n, (i, L, c) in enumerate(SEG):
    segs.append({"n": n + 1, "layout": L, "w0": i, "f0": cuts[n], "f1": cuts[n + 1], "t0": cuts[n] / FPS, "t1": cuts[n + 1] / FPS, "content": c})
# validation
off = plan["offlens_out"]; probs = []
for k, s in enumerate(segs):
    d = s["t1"] - s["t0"]
    if d > 8.2: probs.append(f"seg{s['n']} too long {d:.2f}")
    if k and s["layout"] == segs[k - 1]["layout"]: probs.append(f"seg{s['n']} same layout as previous")
    if s["layout"] in "AB" and s["n"] not in (1, len(segs)) and s["n"] != 17:
        for a, b in off:
            ov = min(b, s["t1"]) - max(a, s["t0"])
            if ov > 0.12: probs.append(f"seg{s['n']} {s['layout']} shows camera off-lens {max(a, s['t0']):.2f}-{min(b, s['t1']):.2f}")
print("layouts:", {L: sum(1 for s in segs if s["layout"] == L) for L in "ABC"}, "problems:", probs or "none")
plan["segments"] = segs; json.dump(plan, open(f"{W}/plan.json", "w"), indent=1, ensure_ascii=False)
names = {"A": "A — câmera em tela cheia", "B": "B — janela flutuante sobre fundo gráfico", "C": "C — composição totalmente visual"}
L = ["# Tabela de trechos (0 → END)", "", f"END = {plan['END']*1000:.1f} ms ({plan['frames']} quadros a 60 fps)", "",
     "| # | Início (s) | Fim (s) | Duração (s) | Layout | Conteúdo |", "|---|---|---|---|---|---|"]
for s in segs: L.append(f"| {s['n']} | {s['t0']:.3f} | {s['t1']:.3f} | {s['t1']-s['t0']:.3f} | {names[s['layout']]} | {s['content']} |")
open("/home/user/leo/edit/segmentos.md", "w").write("\n".join(L) + "\n")
for s in segs: print(f"{s['n']:>2} {s['layout']} {s['t0']:7.3f}-{s['t1']:7.3f} ({s['t1']-s['t0']:.2f})")
