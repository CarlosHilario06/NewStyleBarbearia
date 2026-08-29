# New Style Barbearia — Site

Site institucional de uma página (one page) da New Style Barbearia, feito em HTML, CSS e JavaScript puros — sem framework, sem build, sem dependências para instalar. Landing page de alta conversão: uma seção principal (hero) direta com CTA duplo (agendar / WhatsApp), prova social (anos de experiência), serviços, sobre, o barbeiro, localização/contato e uma faixa final de chamada para ação — sempre com botão de WhatsApp flutuante.

## Paleta de cores

Definida em `:root` no topo do `style.css`, para manter tudo consistente:

| Uso | Variável | Cor |
|---|---|---|
| Fundo principal | `--bg` | `#121110` (carvão quase preto) |
| Fundo alternado (seções) | `--bg-alt` | `#1a1815` |
| Painéis / cards | `--panel` | `#1e1c19` |
| Madeira (faixa de CTA) | `--wood` / `--wood-dark` | `#6b4a2f` / `#33220f` |
| Destaque / botões | `--brass` / `--brass-soft` | `#c9a24b` / `#e9d29c` (latão dourado) |
| Texto principal | `--text` / `--cream` | `#efe7d8` / `#f3ead9` |
| Texto secundário | `--text-dim` / `--text-faint` | `#b3aa9a` / `#7d7568` |
| Linhas / bordas | `--line` | `#38332c` |

A ideia por trás da paleta: carvão escuro + madeira + latão dourado, remetendo a barbearia clássica com um acabamento moderno. Para trocar a cor de destaque, por exemplo, basta editar `--brass` e `--brass-soft` — o resto do site (botões, ícones, links, bordas em hover) segue essas variáveis.

## Tipografia

Duas famílias apenas, carregadas via Google Fonts no `<head>` do `index.html`:

- **Oswald** (peso 500–700) — títulos (`h1`, `h2`, `h3`), rótulos em caixa alta (eyebrows), botões, menu e itens de destaque.
- **Inter** (peso 400–700) — texto corrido (parágrafos, descrições).

Esse par foi escolhido para manter contraste claro entre título (condensada, em caixa alta, com presença) e corpo de texto (legível, neutra) sem misturar uma terceira fonte.

## Estrutura de arquivos

```
.
├── index.html        → estrutura e conteúdo do site
├── style.css          → todo o estilo visual (paleta, tipografia, layout)
├── script.js           → menu mobile, header ao rolar, animações de entrada
├── favicon.png         → ícone da aba do navegador
├── logo-branca.png     → logo usada no menu e no rodapé
├── carlinho.png        → foto do barbeiro (seção "O barbeiro")
├── ambiente.jpg        → foto do ambiente (fundo do hero e seção "Sobre")
└── README.md
```

Nenhuma dependência externa de JavaScript (sem CDN de animação/3D) — as animações de entrada ao rolar usam `IntersectionObserver` nativo do navegador, então o conteúdo nunca fica preso invisível se algo falhar ao carregar.

## Como visualizar localmente

Não precisa de nenhuma instalação. Basta abrir o `index.html` direto no navegador (duplo clique) ou, se preferir rodar um servidor local:

```bash
python3 -m http.server 8000
```

e acessar `http://localhost:8000` no navegador.

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub (ex: `new-style-barbearia`).
2. Suba os arquivos desta pasta para o repositório (mantendo a estrutura de pastas acima).
3. No repositório, vá em **Settings → Pages**.
4. Em **Branch**, selecione `main` (ou `master`) e a pasta `/root`, depois clique em **Save**.
5. Em alguns minutos o GitHub Pages vai gerar um link tipo `https://seu-usuario.github.io/new-style-barbearia/` com o site no ar.

## Como editar as informações do site

Tudo fica no arquivo `index.html`. Os principais pontos:

- **Link de agendamento** (botão "Agendar horário" / "Agendar"): procure por `chat.inbarberapp.com` e troque pela sua URL.
- **WhatsApp**: procure por `wa.me/5514996005808` e troque o número (mantendo o formato `55` + DDD + número).
- **Instagram**: procure por `instagram.com/carlinhoo_06` e troque pelo seu usuário.
- **Endereço / Google Maps**: procure pela seção `id="local"` — lá tem o texto do endereço e dois links de mapa ("Ver no Google Maps" e o `iframe` do mapa embutido, que usa o endereço na URL).
- **Textos** (sobre a barbearia, sobre o barbeiro, serviços): é só editar o texto direto dentro das tags `<p>`, `<h1>`, `<h2>` etc.

## Como trocar as fotos

Basta substituir os arquivos na raiz do projeto **mantendo o mesmo nome**:

- `ambiente.jpg` — foto do ambiente, usada como fundo do hero e na seção "Sobre".
- `carlinho.png` — foto do barbeiro na seção "O barbeiro" (se for trocar, uma foto com fundo já removido/transparente fica melhor, pois o layout foi pensado pra isso).
- `logo-branca.png` — logo em branco/transparente (usada no menu e no rodapé).
- `favicon.png` — ícone pequeno que aparece na aba do navegador.

Se preferir usar outro nome de arquivo, lembre de atualizar também o caminho correspondente dentro do `index.html` (procure por `src="...`) e, no caso do `ambiente.jpg`, dentro do `style.css` (procure por `url('ambiente.jpg')`).

## Domínio próprio (opcional)

O GitHub Pages permite apontar um domínio próprio (ex: `www.newstylebarbearia.com.br`) em **Settings → Pages → Custom domain**. Isso exige configurar um registro DNS no seu provedor de domínio — o próprio GitHub mostra o passo a passo na hora.
