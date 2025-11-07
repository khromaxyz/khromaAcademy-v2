# KhromaAcademy

Uma plataforma educacional moderna e interativa para visualização e gerenciamento de disciplinas de Ciência da Computação.

## 🚀 Características

- **Interface Moderna**: Design premium com animações suaves e efeitos visuais impressionantes
- **Sistema de Temas**: 11 temas diferentes para personalizar a experiência
- **Cursor Customizado**: 6 tipos de cursor para uma experiência única
- **Visualização Dual**: Grid de cards e grafo de conhecimento interativo
- **Painel Administrativo**: Gerenciamento completo de disciplinas
- **Modal Animado**: Transições FLIP para uma experiência fluida
- **Responsivo**: Totalmente adaptável para dispositivos móveis

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 📁 Estrutura do Projeto

```
khromaAcademy/
├── src/
│   ├── types/           # Definições TypeScript
│   ├── services/        # Serviços (dados, temas, cursor)
│   ├── components/      # Componentes React-like
│   ├── utils/           # Funções utilitárias
│   ├── styles/          # Módulos CSS
│   ├── app.ts           # Ponto de entrada
│   └── index.html       # HTML principal
├── public/              # Arquivos estáticos
├── docs/                # Documentação
└── dist/               # Build output
```

## 🎨 Temas Disponíveis

- RGB (Multicolor) - Padrão
- Vermelho
- Verde
- Azul
- Roxo
- Laranja
- Ciano
- Rosa
- Amarelo
- Monocromático
- Neon

## 📚 Documentação

Para mais informações, consulte:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura do projeto
- [COMPONENTS.md](docs/COMPONENTS.md) - Documentação dos componentes
- [SETUP.md](docs/SETUP.md) - Guia de setup e desenvolvimento
- [THEMES.md](docs/THEMES.md) - Sistema de temas

## 🧑‍💻 Desenvolvimento

O projeto utiliza:
- **TypeScript** para tipagem estática
- **Vite** para build e desenvolvimento
- **CSS Modules** para estilos modulares
- **ESLint + Prettier** para qualidade de código

## 📝 Licença

MIT

