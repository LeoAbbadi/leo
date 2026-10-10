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
- Botão “Quero jogar”: registra o interesse, marca se ganhou early bird e gera o e-mail para o dono.
- Ranking do semestre com pódio, tabela e regras de pontuação.

**Área do clube** (`#/admin`)
- Painel com inscrições a confirmar, torneios sem resultado e líder do ranking.
- Torneios: criar, editar, repetir na semana seguinte, excluir.
- Resultados: classificação final (arrastar para ordenar), pontos calculados na hora.
- Jogadores: cadastro, busca, posição no ranking.
- Inscrições: confirmar ou cancelar vagas e ler os e-mails gerados.
- Configurações: dados do clube, prazo e bônus do early bird, temporada, prêmio e tabela de pontos.

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
    seed.ts         Dados de exemplo
    auth.tsx        Login (demonstração)
  components/       Cartas, fichas, cartão de torneio, modal, layouts
  pages/            Início, Grade, Ranking
  pages/admin/      Área do clube
  styles/global.css Visual do site
```

## Próximos passos

1. **Banco de dados** (sugestão: Supabase): criar as tabelas, trocar o
   `LocalDataSource` por uma implementação que lê e grava no banco.
2. **Login real** do dono (Supabase Auth) no lugar da senha de demonstração.
3. **E-mail** ao dono a cada interesse (ex.: Resend), disparado pelo servidor.
4. **Hospedagem** (Vercel ou Netlify) ligada a este repositório.
5. **Vídeos e animações extras** gerados no Higgsfield para o topo do site.
