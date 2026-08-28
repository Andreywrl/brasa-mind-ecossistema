# Filme Brasamind Hub, 60 segundos

Arquivo da animação: `brasamind-hub-60s.html` (1920x1080, roda sozinha em loop).

## Os valores do Brasamind para o membro

Base do que o produto entrega hoje (landing de assinatura, área do membro e painel).

| # | Valor | Prova dentro do produto |
|---|-------|--------------------------|
| 1 | Rede qualificada e de confiança | 128 membros ativos, 90+ empresas, cada membro representa um CNPJ |
| 2 | Encontro presencial todo mês | assado, palestra e rodada de indicações, 4 anos sem parar |
| 3 | Vitrine da sua empresa | perfil no hub com especialidade, cidade, vídeo, WhatsApp, site |
| 4 | Achar quem resolve seu problema | busca e filtro por especialidade, cidade e categoria |
| 5 | Chegar no encontro já conectado | lista de confirmados, cronograma e palestrante antes do evento |
| 6 | Ingresso sem fricção | compra por PIX ou cartão, QR Code de check-in salvo na plataforma |
| 7 | Economia real | preço de membro em todo ingresso (R$ 180 no lugar de R$ 200) |
| 8 | Poder de convite | link exclusivo para convidado e para novo membro, mensagem pronta no WhatsApp |
| 9 | Reconhecimento | pontos por presença, assiduidade, convite e adimplência, ranking e medalhas |
| 10 | Vida financeira organizada | mensalidade de R$ 97 sem fidelidade, recibos, cobrança recorrente |
| 11 | Memória da sua jornada | histórico de eventos, fotos, convidados levados e pontos ganhos |
| 12 | Acesso o ano inteiro | a rede deixa de existir só na noite do encontro |

Os doze cabem numa apresentação. No filme de 60s entram cinco blocos, porque acima disso ninguém retém.

## Roteiro cronometrado

| Tempo | Cena | Texto na tela | Locução sugerida |
|-------|------|---------------|------------------|
| 00:00 a 00:06 | Contexto | Há quatro anos o Brasa junta empresários gaúchos em volta do mesmo fogo. | "Há quatro anos o Brasa junta empresários gaúchos em volta do mesmo fogo." |
| 00:06 a 00:12 | Números | 128 membros, 48 encontros, 90+ empresas, 4 anos | "São 128 membros, 48 encontros e mais de 90 empresas representadas." |
| 00:12 a 00:19 | Tensão | Só que a melhor conversa da noite não pode acabar quando o fogo apaga. | "Só que a melhor conversa da noite não pode acabar quando o fogo apaga. A indicação que ficou no guardanapo, o contato que sumiu no grupo." |
| 00:19 a 00:26 | Reveal | Um passo tecnológico. Brasamind Hub. O ecossistema digital da rede. | "Por isso o Brasa dá um novo passo, um passo tecnológico: o Brasamind Hub." |
| 00:26 a 00:41 | O que possibilita | Hub de membros, evento do mês, convites, pontos e ranking, financeiro e histórico | "Hub de membros, com sua empresa visível para a rede inteira. Evento do mês com ingresso no celular. Convites que valem pontos. Ranking e medalhas. E toda a sua vida financeira num lugar só." |
| 00:41 a 00:49 | Impacto no dia a dia | A rede na palma da mão, o ano inteiro | "Ache quem resolve o seu problema, chegue no encontro já conectado, e veja cada indicação sua virar reconhecimento." |
| 00:49 a 00:55 | Resultado | Mais indicação. Mais presença. Mais negócio fechado. | "Mais indicação, mais presença, mais negócio fechado. A mesma rede de sempre, conectada todos os dias." |
| 00:55 a 01:00 | Chamada | Vem pro Brasamind. brasamind.com.br | "Vem pro Brasamind." |

## Como usar

Abrir o arquivo no navegador (tela cheia, F11). A animação começa sozinha e repete.

Atalhos: `espaço` toca e pausa, `R` reinicia, `C` esconde a barra de controles. A barra também some sozinha depois de 2,6s sem mexer o mouse.

## Como virar mp4

1. Abrir em tela cheia numa tela de 1920x1080 (ou maior, o palco se ajusta sozinho).
2. Apertar `C` para esconder os controles e `R` para começar do zero.
3. Gravar a tela: OBS Studio (grátis, 60fps, gera mp4 direto) ou a barra de jogo do Windows (`Win+Alt+R`).
4. Cortar o começo e o fim na edição e colocar a trilha por cima. Sem trilha o vídeo funciona, mas com uma batida crescente que estoura no reveal dos 19s funciona muito melhor.

## Ajustes fáceis no HTML

- Números da cena 2: atributo `data-count` de cada bloco.
- Tempo de cada cena: atributos `data-in` e `data-out`, em segundos.
- Duração total: variável `DUR` no script.
- Cores: variáveis `--brasa` e `--ember` no topo do CSS.
- Textos: direto no HTML, cada cena é um `<section class="scene">`.
