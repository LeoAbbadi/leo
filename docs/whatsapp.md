# Avisos pelo WhatsApp

Cada inscrição no site gera mensagens que saem **sempre do mesmo número**, o
número oficial do clube:

| Quando | Para quem | Modelo |
| --- | --- | --- |
| Jogador clica em “Quero jogar” | Dono do clube | `aviso_inscricao` |
| Inscrição confirmada (na hora ou pelo dono) | Jogador, se informou o WhatsApp | `inscricao_confirmada` |
| Inscrição aguardando o dono (confirmação manual ligada) | Jogador | `inscricao_recebida` |

O site já gera essas mensagens e mostra todas em **Área do clube → Inscrições →
Mensagens**. O envio de verdade começa quando o número do clube estiver
conectado à API oficial do WhatsApp e o servidor (Supabase) estiver no ar.

## Por que a API oficial

A WhatsApp Business Platform (Cloud API) é a forma oficial da Meta de enviar
mensagens automáticas de um número de empresa. Serviços que automatizam o
WhatsApp Web ou o aplicativo comum funcionam no começo, mas vão contra os termos
do WhatsApp e o número pode ser banido.

## O que o dono precisa fazer (uma vez)

1. **Escolher o número do clube.** Pode ser um chip novo ou um fixo. Ele não
   pode estar em uso no aplicativo do WhatsApp; se estiver, apague a conta do
   aplicativo nesse número antes.
2. **Criar a conta empresarial da Meta** em business.facebook.com com os dados
   do clube.
3. **Criar um app** em developers.facebook.com (tipo “Empresa”) e adicionar o
   produto **WhatsApp**.
4. **Adicionar o número** no WhatsApp Manager, confirmar o código por SMS ou
   ligação e definir o nome que aparece para os jogadores (a Meta aprova o nome).
5. **Cadastrar uma forma de pagamento** no WhatsApp Manager. A Meta cobra por
   mensagem de modelo enviada; confira os valores atuais para o Brasil na página
   de preços da Meta antes de ligar.
6. **Criar os três modelos** abaixo em WhatsApp Manager → Modelos de mensagem,
   categoria **Utilidade**, idioma **Português (BR)**, com o nome e o texto
   exatamente iguais. A aprovação costuma levar de minutos a algumas horas.
7. **Gerar um token permanente**: Configurações do negócio → Usuários do sistema
   → criar usuário administrador → gerar token com a permissão
   `whatsapp_business_messaging` para o app.

Depois, me passe o **ID do número de telefone** (aparece em WhatsApp → Configuração
da API). O token é secreto: você mesmo cola nos segredos do Supabase como
`WHATSAPP_TOKEN`, sem mandar por chat.

## Textos dos modelos

A fonte oficial dos textos é `src/lib/messages.ts`. Se mudar um texto lá, mude
também o modelo na Meta (e espere a nova aprovação).

### `aviso_inscricao` (para o dono)

```
Nova inscrição no {{1}}.

Jogador: {{2}}
WhatsApp: {{3}}
E-mail: {{4}}
Torneio: {{5}}
Early bird: {{6}}
Situação: {{7}}
Inscritos: {{8}}

Veja todas as inscrições na área do clube.
```

Exemplo de variáveis para a Meta: `Sexta Big Night`, `Marina Teixeira`,
`(21) 98765-4321`, `marina@exemplo.com`, `sexta-feira, 16 de outubro às 21:00`,
`sim, +5.000 fichas no stack inicial`, `confirmada automaticamente`,
`12 de 120 vagas`.

### `inscricao_confirmada` (para o jogador)

```
Olá, {{1}}! Sua inscrição no {{2}} está confirmada.

Data: {{3}}
Horário: {{4}}
Buy-in: {{5}}
Garantido: {{6}}
Stack inicial: {{7}} fichas
Early bird: {{8}}
Local: {{9}}

Guarde esta mensagem como comprovante. Até a mesa!
```

Exemplo: `Marina`, `Sexta Big Night`, `sexta-feira, 16 de outubro`, `21:00`,
`R$ 250`, `R$ 20.000`, `30.000`, `garantido, +5.000 fichas no stack inicial`,
`Clube do Flop, Rua dos Pinheiros, 1000, Pinheiros, São Paulo, SP`.

### `inscricao_recebida` (para o jogador, quando o dono confirma manualmente)

```
Olá, {{1}}! Recebemos seu interesse no {{2}}, {{3}} às {{4}}.

Early bird: {{5}}

O clube vai confirmar sua vaga e você recebe outra mensagem por aqui.
```

Exemplo: `Marina`, `Sexta Big Night`, `sexta-feira, 16 de outubro`, `21:00`,
`garantido, +5.000 fichas no stack inicial`.

## Como fica ligado no servidor

Quando o banco de dados estiver conectado, a inscrição passa a ser gravada por
uma função no servidor, que:

1. confere os dados e calcula o early bird pelo horário do servidor;
2. grava a inscrição;
3. envia as mensagens da fila usando `supabase/functions/_shared/whatsapp.ts`;
4. marca cada mensagem como enviada (ou guarda o erro para reenviar).

Assim o token do WhatsApp nunca aparece no site e ninguém consegue disparar
mensagens sem passar pelo formulário.
