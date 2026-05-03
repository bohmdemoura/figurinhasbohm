# 📒 Figurinhas Bohm

> Álbum digital de figurinhas da Copa do Mundo — PWA com suporte offline, autenticação Firebase e sistema de trocas entre usuários.

[![Firebase Hosting](https://img.shields.io/badge/Hosting-Firebase-orange?logo=firebase)](https://figurinhasbohm.web.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.3-blue)](version.json)

---

## ✨ Funcionalidades

- **Gerenciamento de figurinhas** — marque figurinhas como faltantes, únicas ou repetidas
- **Barra de progresso** do álbum em tempo real
- **Pesquisa** de seleções por nome
- **Filtros** por status (Todas / Faltam / Únicas / Repetidas)
- **Sistema de trocas** — encontre outros usuários e compare as repetidas
- **Autenticação** por e-mail/senha com Firebase Auth
- **Modo offline** via Service Worker (PWA)
- **Layout responsivo** — coluna única no mobile, duas colunas de seleções no desktop
- **Contador de gastos** com figurinhas
- **Versionamento automático** a cada deploy

---

## 🗂️ Estrutura do Projeto

```
figurinhasBohm/
│
├── public/                     # Arquivos servidos pelo Firebase Hosting
│   ├── index.html              # Página principal (álbum)
│   ├── login.html              # Tela de login e cadastro
│   ├── trocas.html             # Interface de trocas entre usuários
│   ├── 404.html                # Página de erro personalizada
│   ├── app.js                  # Lógica principal do álbum (Firebase Firestore)
│   ├── firebase-config.js      # Inicialização do Firebase (App, Auth, Firestore)
│   ├── social.js               # Busca de repetidas de outros usuários
│   ├── sw.js                   # Service Worker (cache offline, estratégia Network First)
│   └── manifest.json           # Manifesto PWA (ícones, tema, display standalone)
│
├── .firebase/                  # Cache interno do Firebase CLI (não commitar)
├── .firebaserc                 # Projeto Firebase vinculado (figurinhasbohm)
├── firebase.json               # Configuração de hosting e regras de cache
├── bump-version.js             # Script de versionamento automático pré-deploy
├── version.json                # Versão atual da aplicação
├── package.json                # Scripts NPM (deploy, bump)
└── .gitignore
```

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | HTML5, CSS3, JavaScript (ES Modules) |
| Banco de dados | Firebase Firestore |
| Autenticação | Firebase Auth (e-mail/senha) |
| Hospedagem | Firebase Hosting |
| Offline | Service Worker (PWA) |
| Versionamento | Node.js script (`bump-version.js`) |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Firebase CLI](https://firebase.google.com/docs/cli) instalado globalmente

```bash
npm install -g firebase-tools
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/bohmdemoura/figurinhasBohm.git
cd figurinhasBohm

# Instale as dependências
npm install
```

### Servidor local

```bash
firebase serve --only hosting
```

O app estará disponível em `http://localhost:5000`.

---

## 🌐 Deploy

O deploy é gerenciado por um único comando NPM que executa o bump de versão automaticamente antes de publicar:

```bash
npm run deploy
```

Esse comando faz internamente:

1. Executa `node bump-version.js` — incrementa a versão patch, atualiza o cache do Service Worker e injeta o rodapé de versão em todos os HTMLs
2. Executa `firebase deploy --only hosting` — publica os arquivos da pasta `public/`

### Deploy manual sem bump de versão

```bash
firebase deploy --only hosting
```

---

## ⚙️ Versionamento Automático

O arquivo `bump-version.js` é executado antes de cada deploy e realiza três tarefas:

### 1. Incremento de versão

Lê `version.json` e incrementa o número de patch:

```
1.0.2 → 1.0.3
```

### 2. Atualização do cache do Service Worker

Atualiza a constante `CACHE_NAME` em `sw.js` para forçar a limpeza do cache nos navegadores após o deploy:

```js
// sw.js
const CACHE_NAME = 'figurinhas-bohm-v1.0.3';
```

### 3. Rodapé dinâmico nos HTMLs

Injeta (ou substitui) um bloco de rodapé em todos os arquivos HTML com a versão e data/hora exata do build:

```html
<!-- VERSION_FOOTER_START -->
<div>Figurinhas Bohm • v1.0.3 • 02/05/2026, 21:05</div>
<!-- VERSION_FOOTER_END -->
```

---

## 📱 PWA — Suporte Offline

O Service Worker (`sw.js`) implementa a seguinte estratégia de cache:

| Tipo de recurso | Estratégia |
|---|---|
| Arquivos HTML e JS | **Network First** — busca na rede, cai no cache se offline |
| Imagens e outros assets | **Cache First** — serve do cache, busca na rede se ausente |
| Requisições Firebase/Google | **Sem cache** — sempre vai direto à rede |

Na primeira visita, os assets listados em `assets[]` são pré-cacheados. Após cada deploy, o novo `CACHE_NAME` invalida o cache antigo automaticamente.

---

## 🔐 Autenticação

O `login.html` gerencia três fluxos com Firebase Auth:

- **Login** com e-mail e senha
- **Cadastro** com nome de usuário, e-mail e senha (mín. 6 caracteres)
- **Redefinição de senha** via e-mail

Após autenticação bem-sucedida, o usuário é redirecionado para `index.html`. Caso já esteja autenticado ao acessar `login.html`, o redirecionamento é imediato.

---

## 🔄 Sistema de Trocas

A página `trocas.html` usa o módulo `social.js` para buscar no Firestore a coleção `public_trades`. O usuário pesquisa outro jogador pelo nome de usuário e visualiza as figurinhas repetidas disponíveis para troca.

---

## 🗄️ Estrutura do Firestore

```
Firestore
│
├── users/{userId}
│   ├── stickers: { "BRA1": 1, "ARG5": 2, ... }   // quantidade por figurinha
│   └── username: "João"
│
└── public_trades/{userId}
    ├── username: "João"
    └── duplicates: ["BRA7", "ARG12", ...]          // lista de repetidas
```

---

## 🔧 Scripts NPM

| Comando | Descrição |
|---|---|
| `npm run deploy` | Bump de versão + deploy no Firebase Hosting |
| `npm run bump` | Apenas incrementa a versão (sem deploy) |

---

## 📁 Configuração do Firebase

### `firebase.json`

Define a pasta pública e regras de cache para os headers HTTP:

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

### `.firebaserc`

```json
{
  "projects": {
    "default": "figurinhasbohm"
  }
}
```

---

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📬 Suporte

Dúvidas ou problemas? Entre em contato:

✉️ [bohmdemoura@gmail.com](mailto:bohmdemoura@gmail.com)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Feito com ❤️ por <a href="https://github.com/bohmdemoura">bohmdemoura</a>
</div>
