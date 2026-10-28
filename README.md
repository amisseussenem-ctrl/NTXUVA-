# NTXUVA - Jogo Tradicional de Tabuleiro (Mancala 4x6)

Um jogo de tabuleiro tradicional africano completo, moderno e fiel às regras autênticas do **NTXUVA** (Moçambique e África Austral).

---

## 📋 Características Principais

- **Geometria Autêntica 4x6:** Tabuleiro com 24 covas (2 linhas de 6 para cada jogador) e 48 pedras no total (2 pedras por cova no início).
- **Regra de Moto-Moto (5 Giros):**
  - Quando um jogador efetua 5 voltas completas contínuas no seu campo sem efetuar captura, a cova onde completa o 5º giro acende em destaque vermelho e exibe a inscrição **"MOTO-MOTO"**.
  - Ocorre uma pausa de 1 segundo de aviso e a jogada encerra imediatamente, passando a vez ao adversário.
- **Regras Estritas de Captura:**
  - Se a última pedra cair numa cova com pedras da linha frontal e a cova frontal adversária tiver pedras, ocorre a captura frontal.
  - Se houver pedras na cova traseira adversária correspondente, ocorre também a captura de retaguarda.
- **Condições Estritas de Vitória e Fim de Jogo:**
  - Vitória por captura de todas as pedras adversárias ou bloqueio total.
  - Empate apenas por mútuo acordo entre os jogadores.
- **Modos de Jogo:**
  - 👥 **2 Jogadores Local (Pass & Play):** Jogue no mesmo dispositivo com rotação e interface otimizada.
  - 🤖 **Contra a IA:** Modos Fácil, Médio e Difícil com motor heurístico tático.
  - 🌐 **Multiplayer Online em Tempo Real:** Criação de salas com código de 6 dígitos, WebSockets de baixa latência e sincronização autoritária no servidor.
  - 🧩 **Modo Desafios:** 60 puzzles táticos progressivos com validação automática.
- **Progressive Web App (PWA):**
  - Instalável em Android, iOS, Windows, Mac e Linux com suporte offline e Service Worker dedicado.
- **Design & Áudio:**
  - Interface rica com texturas de madeira e sementes tradicionais.
  - Efeitos sonoros procedurais nativos via Web Audio API (sem dependência de ficheiros externos de som).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** (ou yarn / pnpm / bun)

### Instalação

1. Extraia o ficheiro zip para uma pasta no seu computador.
2. Abra um terminal na pasta do projeto e instale as dependências:
   ```bash
   npm install
   ```

### Executar em Desenvolvimento

Para iniciar o servidor com recarregamento em direto (porta 3000):
```bash
npm run dev
```
Abra o navegador em: [http://localhost:3000](http://localhost:3000)

### Compilar para Produção

Para gerar os ficheiros otimizados de produção:
```bash
npm run build
```

Para iniciar o servidor em modo de produção:
```bash
npm start
```

### Executar Testes Automatizados

O projeto inclui uma suíte completa de testes unitários para o motor de regras e os desafios:
```bash
npm test
```

---

## 📂 Estrutura de Ficheiros

```
├── public/                 # Ícones PWA, manifesto e Service Worker
├── src/
│   ├── components/         # Componentes React (Tabuleiro, Covas, Modais, etc.)
│   ├── data/               # Dados dos 60 desafios e tutoriais
│   ├── hooks/              # Custom hooks React
│   ├── models/             # Motor de regras do NTXUVA e IA heurística
│   ├── types/              # Tipagem TypeScript
│   ├── utils/              # Efeitos sonoros, animações e helpers
│   ├── App.tsx             # Componente raiz da aplicação
│   └── main.tsx            # Ponto de entrada React
├── server.ts               # Ponto de entrada do servidor Node
├── server.core.ts          # Servidor Express + WebSocket para multiplayer online
├── firestore.rules         # Regras de segurança Firestore
├── package.json            # Dependências e scripts
└── vite.config.ts          # Configuração do Vite e bundling
```

---

Divirta-se jogando **NTXUVA**!
