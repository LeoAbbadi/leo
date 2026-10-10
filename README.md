# Clube do Flop: gerenciador de torneios de poker

Site do clube com grade de torneios, inscrição com early bird, ranking do semestre
e uma área privada para o dono do clube editar tudo.

> **Modo demonstração:** por enquanto os dados ficam salvos no navegador
> (`localStorage`). O próximo passo é conectar um banco de dados para as
> alterações do dono valerem para todos os visitantes.

## O que já funciona

**Site público**
- Início com animação da mesa (cartas sendo distribuídas e fichas caindo), relógio do próximo torneio e letreiro com a grade.
- Grade de torneios (próximos 7 dias, todas as datas, já jogados) com contagem regressiva do early bird.
- Botão “Quero jogar”: inscreve o jogador, marca se ganhou early bird e gera os avisos:
  WhatsApp e e-mail para o dono, e confirmação com os dados do torneio no WhatsApp do jogador.
  Tudo sai do mesmo número do clube (veja [docs/whatsapp.md](docs/whatsapp.md)).
- Ranking do semestre com pódio, tabela e regras de pontuação.

**Área do clube** (`#/admin`)
- Painel com inscrições a confirmar, torneios sem resultado e líder do ranking.
- Torneios: criar, editar, repetir na semana seguinte, excluir.
- Resultados: classificação final (arrastar para ordenar), pontos calculados na hora.
- Jogadores: cadastro, busca, posição no ranking.
- Inscrições: confirmar ou cancelar vagas e ver as mensagens de WhatsApp e e-mail geradas.
- Configurações: dados do clube, WhatsApp do dono, confirmação automática ou manual,
  prazo e bônus do early bird, temporada, prêmio e tabela de pontos.

Acesso de demonstração: `dono@clubedoflop.com.br` / `flop2026`.

## Rodando no computador

Requer Node.js 20 ou mais novo.

```bash
npm install
npm run dev        # abre em http://localhost:5173
npm run build      # gera a versão final em dist/
```

## Estrutura

```
src/
  lib/
    types.ts        Tipos de dados (torneio, jogador, inscrição, resultado)
    dataSource.ts   Onde os dados ficam (hoje: navegador; depois: banco)
    store.tsx       Estado do app e ações (inscrever, salvar torneio…)
    ranking.ts      Cálculo do ranking e dos pontos
    messages.ts     Textos das mensagens de WhatsApp e e-mail
    seed.ts         Dados de exemplo
    auth.tsx        Login (demonstração)
  components/       Cartas, fichas, cartão de torneio, modal, layouts
  pages/            Início, Grade, Ranking
  pages/admin/      Área do clube
  styles/global.css Visual do site
supabase/functions/_shared/whatsapp.ts   Envio pela API oficial do WhatsApp
docs/whatsapp.md  Como conectar o número do clube
```

## Próximos passos

1. **Banco de dados** (sugestão: Supabase): criar as tabelas, trocar o
   `LocalDataSource` por uma implementação que lê e grava no banco.
2. **Login real** do dono (Supabase Auth) no lugar da senha de demonstração.
3. **WhatsApp e e-mail** enviados pelo servidor: WhatsApp Cloud API (passo a passo em
   [docs/whatsapp.md](docs/whatsapp.md)) e um serviço de e-mail (ex.: Resend).
4. **Hospedagem** (Vercel ou Netlify) ligada a este repositório.
5. **Vídeos e animações extras** gerados no Higgsfield para o topo do site.
