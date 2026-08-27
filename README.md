# New Style Barbearia — Site

Site institucional de uma página (one page) da New Style Barbearia, feito em HTML, CSS e JavaScript puros — sem framework, sem build, sem dependências para instalar. O topo (hero) tem uma animação 3D autoral (um poste de barbeiro estilizado, feito em Three.js) e o restante da página usa GSAP + ScrollTrigger para as animações de entrada ao rolar.

## Estrutura de pastas

```
.
├── index.html        → estrutura e conteúdo do site
├── style.css          → todo o estilo visual
├── script.js           → menu mobile, header, animações de entrada (GSAP)
├── three-scene.js      → cena 3D do hero (Three.js), gerada por código, sem modelo externo
├── favicon.png         → ícone da aba do navegador
├── logo-branca.png     → logo usada no menu e no rodapé
├── carlinho.png        → foto do barbeiro (seção "O barbeiro")
├── ambiente.jpg        → foto do ambiente (seção "Sobre")
└── README.md
```

Three.js e GSAP são carregados via CDN (não precisam de instalação). O site funciona sem 3D em navegadores/dispositivos sem WebGL — o hero cai automaticamente para o fundo em gradiente, sem quebrar o layout.

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

Basta substituir os arquivos na raiz do projeto **mantendo o mesmo nome**:

- `ambiente.jpg` — foto do ambiente, usada na seção "Sobre".
- `carlinho.png` — foto do barbeiro na seção "O barbeiro" (se for trocar, uma foto com fundo já removido/transparente fica melhor, pois o layout foi pensado pra isso).
- `logo-branca.png` — logo em branco/transparente (usada no menu e no rodapé).
- `favicon.png` — ícone pequeno que aparece na aba do navegador.

Se preferir usar outro nome de arquivo, lembre de atualizar também o caminho correspondente dentro do `index.html` (procure por `src="...`).

## Sobre a animação 3D do topo

O hero usa uma cena Three.js própria (`three-scene.js`): uma reconstrução estilizada do próprio ambiente da barbearia, baseada na foto 360° real da loja — um cômodo em U com 3 paredes (parede do espelho, parede de fundo com TV/quadros/espelho redondo, parede da porta) aberto na frente, nas proporções reais do espaço — 4,80m x 3,60m, pé-direito 2,60m. Cadeira de barbeiro, sofá, espelho, TV, porta, ventilador, tripé de luz de anel e banqueta são todos modelados com geometria simples (caixas, cilindros) direto no código — não depende de nenhum arquivo de modelo 3D externo nem de scan/foto real.

Ao carregar, os móveis "aparecem" na cena com uma animação de entrada escalonada. Em desktop, dá pra **clicar e arrastar** o mouse sobre a cena pra olhar ao redor (a câmera gira dentro de um limite, pra nunca atravessar as paredes); em qualquer dispositivo ela também balança sozinha bem devagar quando ninguém está arrastando, e reage à rolagem da página. Em toque (celular/tablet) o arrastar fica desativado de propósito, pra não atrapalhar o scroll normal da página.

Para ajustar posições, cores ou as dimensões do cômodo, edite as constantes no início de `three-scene.js` (`ROOM_W`, `ROOM_D`, `ROOM_H`). A cena respeita a preferência do sistema por "movimento reduzido" (`prefers-reduced-motion`), desligando o balanço automático da câmera para quem tem essa opção ativada.

**Importante:** isso é uma maquete estilizada, não um tour 3D fotorrealista (tipo Matterport/scan 3D). Pra esse nível de realismo seria necessário escanear o ambiente de verdade (com um app tipo Polycam ou Luma AI, ou contratando um serviço de tour virtual) e carregar o modelo escaneado no lugar dessa geometria simples.

## Domínio próprio (opcional)

O GitHub Pages permite apontar um domínio próprio (ex: `www.newstylebarbearia.com.br`) em **Settings → Pages → Custom domain**. Isso exige configurar um registro DNS no seu provedor de domínio — o próprio GitHub mostra o passo a passo na hora.
