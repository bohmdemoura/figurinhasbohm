# Álbum de Figurinhas Bohm 🚀

Este repositório contém o código-fonte do **Álbum de Figurinhas Bohm**, uma aplicação web estática preparada para ser hospedada no **Firebase Hosting**. O projeto inclui um sistema automatizado de gestão de versões e cache para garantir que os utilizadores tenham sempre a experiência mais atualizada.

## 📁 Estrutura do Projeto

* `/public`: Contém os ficheiros front-end da aplicação (HTML, JS, CSS, Manifesto PWA).
    * `index.html`: Página principal.
    * `login.html`: Ecrã de acesso.
    * `trocas.html`: Interface para troca de figurinhas.
    * `sw.js`: Service Worker para suporte offline e gestão de cache.
* `bump-version.js`: Script de automação que gere o versionamento antes do deploy.
* `version.json`: Armazena a versão atual da aplicação (atualmente v1.0.2).
* `firebase.json` & `.firebaserc`: Configurações de alojamento e identificação do projeto no Firebase (`figurinhasbohm`).

## 🛠️ Automatização de Versão

O projeto utiliza um script personalizado (`bump-version.js`) que é executado automaticamente antes de cada deploy. Este script realiza as seguintes tarefas:

1.  **Incremento de Versão**: Lê o ficheiro `version.json` e incrementa o número do *patch* (ex: 1.0.1 → 1.0.2).
2.  **Gestão de Cache**: Atualiza a constante `CACHE_NAME` no ficheiro `sw.js` para forçar a limpeza do cache no navegador do utilizador após a atualização.
3.  **Rodapé Dinâmico**: Injeta ou atualiza um rodapé em todos os ficheiros HTML (`index.html`, `login.html`, etc.) contendo a nova versão e a data/hora exata da compilação.

## 🚀 Como Fazer o Deploy

O deploy é gerido através de scripts do NPM definidos no `package.json`.

Para publicar todas as alterações (Hosting e outras funções se existirem):
```bash
npm run deploy
