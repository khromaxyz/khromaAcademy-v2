# KhromaAcademy

Uma plataforma educacional moderna e interativa para visualização e gerenciamento de disciplinas de Ciência da Computação.

## 🚀 Características

- **Interface Moderna**: Design premium com animações suaves e efeitos visuais impressionantes
- **Sistema de Temas**: 2 temas (Dark e Light) para personalizar a experiência
- **Cursor Customizado**: 6 tipos de cursor para uma experiência única
- **Visualização Dual**: Grid de cards e grafo de conhecimento interativo
- **Painel Administrativo**: Gerenciamento completo de disciplinas (CRUD)
- **Modal Animado**: Transições FLIP para uma experiência fluida
- **Agentes de IA**: Sistema de agentes para automação de tarefas educacionais
  - **PDF to Docs**: Converte PDFs em disciplinas completas
  - **Content Review**: Revisa e melhora conteúdo de disciplinas
- **Chatbot Integrado**: Chatbot com Google Gemini para assistência durante aprendizado
- **Conteúdo Interativo**: Sistema completo de blocos de conteúdo (vídeos, quizzes, código, simulações 3D, etc.)
- **Exportação/Importação**: Suporte a JSON e Markdown
- **Busca Global**: Command Palette estilo Spotlight (Cmd/Ctrl+K)
- **Menu Lateral**: Navegação moderna com modo expandido/colapsado
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
│   ├── services/        # Serviços (dados, temas, cursor, Gemini, etc.)
│   ├── components/     # Componentes modulares
│   │   ├── Header/
│   │   ├── MainNavigation/
│   │   ├── CommandPalette/
│   │   ├── DisciplineCard/
│   │   ├── KnowledgeGraph/
│   │   ├── Modal/
│   │   ├── DisciplineContent/
│   │   │   └── ContentBlocks/  # Blocos de conteúdo
│   │   ├── AdminPanel/
│   │   │   └── AIAssistant.ts
│   │   ├── AgentsPanel/
│   │   │   ├── PDFToDocsAgent/
│   │   │   └── ContentReviewAgent/
│   │   └── SettingsPanel/
│   ├── utils/           # Funções utilitárias
│   ├── styles/          # Módulos CSS
│   ├── app.ts           # Ponto de entrada
│   └── index.html       # HTML principal
├── public/              # Arquivos estáticos
│   ├── disciplinas.json # Dados padrão
│   └── disciplinas-md/   # Arquivos Markdown
├── docs/                # Documentação completa
├── dist/               # Build output
└── package.json
```

## 🎨 Temas Disponíveis

- **Dark**: Modo escuro (padrão)
- **Light**: Modo claro

## 🤖 Agentes de IA

### PDF to Docs Agent
Converte arquivos PDF em disciplinas completas automaticamente. A IA analisa o documento e cria estrutura, contexto e conteúdo educacional.

### Content Review Agent
Revisa e melhora o conteúdo de disciplinas existentes. Detecta automaticamente o tipo de disciplina e recomenda bibliotecas apropriadas.

## 📚 Documentação

Para mais informações, consulte:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura do projeto
- [COMPONENTS.md](docs/COMPONENTS.md) - Documentação dos componentes
- [API.md](docs/API.md) - API dos serviços
- [SETUP.md](docs/SETUP.md) - Guia de setup e desenvolvimento
- [THEMES.md](docs/THEMES.md) - Sistema de temas
- [context.md](docs/context.md) - Contexto completo do projeto

## 🧑‍💻 Desenvolvimento

O projeto utiliza:
- **TypeScript** para tipagem estática
- **Vite** para build e desenvolvimento
- **CSS Modules** para estilos modulares
- **ESLint + Prettier** para qualidade de código

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview

# Linting
npm run lint

# Formatação
npm run format

# Verificação de tipos
npm run type-check
```

## 🔧 Configuração

### API Key do Gemini

Para usar os agentes de IA e o chatbot, configure a API key do Google Gemini:

1. Obtenha uma API key em [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Configure via variável de ambiente:
   ```bash
   VITE_GEMINI_API_KEY=sua-api-key-aqui
   ```
3. Ou configure diretamente nas configurações da aplicação

## 📝 Licença

MIT
