# New Style Barbearia — Site

Site institucional de uma página (one page) da New Style Barbearia, feito em HTML, CSS e JavaScript puros — sem framework, sem build, sem dependências para instalar.

## Estrutura de pastas

```
.
├── index.html          → estrutura e conteúdo do site
├── css/
│   └── style.css        → todo o estilo visual
├── js/
│   └── script.js        → menu mobile (abrir/fechar)
├── assets/
│   ├── favicon.png       → ícone da aba do navegador
│   ├── logo-branca.png   → logo usada no menu e no rodapé
│   ├── carlinho.png      → foto do barbeiro (seção "O barbeiro")
│   └── ambiente.jpg      → foto de fundo do topo (hero)
└── README.md
```

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

Tudo fica no arquivo `index.html`. Os principais pontos ficam logo no topo, dentro das tags `<a href="...">`:

- **Link de agendamento** (botão "Agendar horário" / "Agendar"): procure por `chat.inbarberapp.com` e troque pela sua URL.
- **WhatsApp**: procure por `wa.me/5514996005808` e troque o número (mantendo o formato `55` + DDD + número).
- **Instagram**: procure por `instagram.com/carlinhoo_06` e troque pelo seu usuário.
- **Endereço / Google Maps**: procure pela seção `id="local"` — lá tem o texto do endereço e dois links de mapa (`MAPS_LINK`, mostrado como "Ver no Google Maps", e o `iframe` do mapa embutido, que usa o endereço na URL).
- **Textos** (sobre a barbearia, sobre o barbeiro, serviços): é só editar o texto direto dentro das tags `<p>`, `<h1>`, `<h2>` etc.

## Como trocar as fotos

Basta substituir os arquivos dentro de `assets/` **mantendo o mesmo nome**:

- `ambiente.jpg` — foto de fundo do topo do site.
- `carlinho.png` — foto do barbeiro na seção "O barbeiro" (se for trocar, uma foto com fundo já removido/transparente fica melhor, pois o layout foi pensado pra isso).
- `logo-branca.png` — logo em branco/transparente (usada sobre fundo escuro).
- `favicon.png` — ícone pequeno que aparece na aba do navegador.

Se preferir usar outro nome de arquivo, lembre de atualizar também o caminho correspondente dentro do `index.html` (procure por `src="assets/...`) e, no caso do `ambiente.jpg`, dentro do `css/style.css` (procure por `url('../assets/ambiente.jpg')`).

## Domínio próprio (opcional)

O GitHub Pages permite apontar um domínio próprio (ex: `www.newstylebarbearia.com.br`) em **Settings → Pages → Custom domain**. Isso exige configurar um registro DNS no seu provedor de domínio — o próprio GitHub mostra o passo a passo na hora.
