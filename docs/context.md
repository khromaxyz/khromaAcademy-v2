# Contexto do Projeto KhromaAcademy

## 📚 Visão Geral

O **KhromaAcademy** é uma plataforma educacional moderna e interativa projetada especificamente para o ensino de Ciência da Computação. A plataforma oferece uma experiência visual rica e intuitiva para visualização, gerenciamento e aprendizado de disciplinas acadêmicas, com foco em proporcionar uma jornada de aprendizado estruturada e envolvente.

### Características Principais

- **Plataforma de Aprendizado de C.C.**: Foco exclusivo em disciplinas de Ciência da Computação
- **Interface Moderna**: Design premium com animações suaves e efeitos visuais impressionantes
- **Visualização Dual**: Grid de cards e grafo de conhecimento interativo para diferentes perspectivas de aprendizado
- **Sistema de Temas**: 2 temas (Dark e Light) para adaptar a experiência visual
- **Cursor Customizado**: 6 tipos de cursor para uma experiência única
- **Painel Administrativo**: Gerenciamento completo de disciplinas (CRUD)
- **Conteúdo Interativo**: Sistema de blocos de conteúdo (vídeos, quizzes, código, etc.)

---

## 🛠️ Pilha de Tecnologia Front-End

### Tecnologias Core

- **TypeScript 5.3+**: Tipagem estática em modo strict para maior segurança e manutenibilidade
- **Vite 5.0+**: Build tool moderna com HMR (Hot Module Replacement) para desenvolvimento rápido
- **Vanilla JavaScript/TypeScript**: Sem frameworks, código puro para performance máxima

### Ferramentas de Desenvolvimento

- **ESLint**: Linting e qualidade de código
- **Prettier**: Formatação automática de código
- **Node.js 18+**: Runtime necessário para desenvolvimento

### Bibliotecas Externas

- **Lucide Icons**: Biblioteca de ícones SVG moderna
- **Prism.js**: Syntax highlighting para blocos de código
- **Google Fonts**: Fontes personalizadas (Manrope, Lora, Inter)

### Estrutura de Build

- **Bundler**: Vite com Rollup para produção
- **Output**: Pasta `dist/` com assets otimizados
- **Source Maps**: Habilitados para debugging
- **Tree Shaking**: Otimização automática de código

---

## 🏗️ Arquitetura da UI

### Padrão de Arquitetura

O projeto segue uma **arquitetura modular baseada em componentes**, similar a frameworks modernos, mas implementada em vanilla TypeScript:

```
┌─────────────────────────────────────────┐
│           app.ts (Entry Point)          │
└─────────────────┬───────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
┌─────▼─────┐ ┌──▼──┐ ┌──────▼──────┐
│ Services  │ │Types│ │ Components  │
│ (Singleton)││     │ │  (Classes)  │
└───────────┘ └─────┘ └─────────────┘
```

### Estrutura de Componentes

#### Componentes Principais

1. **Header** (`src/components/Header/`)
   - Navegação principal
   - Toggle do painel de configurações
   - Gerenciamento de botões de tema
   - Integração com CommandPalette

2. **MainNavigation** (`src/components/MainNavigation/`)
   - Menu lateral fixo
   - Modo expandido/colapsado
   - Navegação por teclado
   - Persistência de estado

3. **CommandPalette** (`src/components/CommandPalette/`)
   - Busca global estilo Spotlight
   - Busca fuzzy
   - Atalho Cmd/Ctrl+K

4. **DisciplineCard** (`src/components/DisciplineCard/`)
   - Renderização estática de cards de disciplina
   - Método `render()` que retorna HTML

5. **KnowledgeGraph** (`src/components/KnowledgeGraph/`)
   - Grafo de conhecimento interativo SVG
   - Visualização de relacionamentos entre disciplinas
   - Destaque de pré-requisitos

6. **Modal** (`src/components/Modal/`)
   - Modal com animação FLIP (First, Last, Invert, Play)
   - Detalhes completos da disciplina
   - Botões de ação (Começar Curso, Documentação, etc.)
   - Padrão Singleton

7. **DisciplineContent** (`src/components/DisciplineContent/`)
   - Página de conteúdo da disciplina
   - Layout sidebar + conteúdo central
   - Sistema de navegação por módulos
   - Blocos de conteúdo interativos
   - Suporte a Markdown completo

8. **AdminPanel** (`src/components/AdminPanel/`)
   - CRUD completo de disciplinas
   - Importação/Exportação JSON e Markdown
   - Validação de formulários
   - Integração com AIAssistant

9. **AIAssistant** (`src/components/AdminPanel/AIAssistant.ts`)
   - Assistente de IA para criação de disciplinas
   - Geração de estrutura e conteúdo
   - Upload de PDFs

10. **SettingsPanel** (`src/components/SettingsPanel/`)
    - Configurações de cursor customizado
    - Seleção de temas
    - Configuração de modelo Gemini
    - Acesso ao painel administrativo

11. **AgentsPanel** (`src/components/AgentsPanel/`)
    - Painel de agentes de IA
    - Navegação entre agentes

12. **PDFToDocsAgent** (`src/components/AgentsPanel/PDFToDocsAgent/`)
    - Conversão de PDFs em disciplinas
    - Análise automática de conteúdo

13. **ContentReviewAgent** (`src/components/AgentsPanel/ContentReviewAgent/`)
    - Revisão e melhoria de conteúdo
    - Detecção de tipo de disciplina
    - Recomendação de bibliotecas

14. **GeminiChatbot** (`src/components/DisciplineContent/GeminiChatbot.ts`)
    - Chatbot integrado com Gemini
    - Múltiplas abas de conversação
    - Upload de imagens
    - Diferentes personalidades

#### Blocos de Conteúdo

Sistema modular de blocos para conteúdo educacional (`src/components/DisciplineContent/ContentBlocks/`):

- **Accordion**: Seções expansíveis
- **Callout**: Destaques informativos (info, warning, success, error)
- **Tabs**: Abas para organizar conteúdo
- **CodeBlock**: Blocos de código com syntax highlighting
- **VideoPlayer**: Player de vídeo integrado
- **Quiz**: Sistema de quizzes interativos
- **QuizBlock**: Versão avançada do Quiz
- **MonacoEditor**: Editor de código avançado
- **ThreeViewer**: Visualizador 3D
- **MatterSimulation**: Simulações de física 2D
- **FabricCanvas**: Canvas interativo

### Sistema de Estilos

#### CSS Modules

- **Design Tokens**: Variáveis CSS em `variables.css`
- **Temas**: Sistema de temas em `themes.css` via atributo `data-theme`
- **Animações**: Keyframes e transições em `animations.css`
- **Componentes**: Cada componente tem seu próprio CSS

#### Sistema de Temas

2 temas disponíveis:
- **Dark**: Modo escuro (padrão)
- **Light**: Modo claro

Aplicação via CSS Variables:
```css
:root[data-theme="dark"] {
  --primary-highlight: #41ff41;
  --gradient-main: linear-gradient(...);
  --gradient-conic: conic-gradient(...);
}

:root[data-theme="light"] {
  --primary-highlight: #0066ff;
  --gradient-main: linear-gradient(...);
  --gradient-conic: conic-gradient(...);
}
```

---

## 🔄 Fluxo de Dados

### Arquitetura de Dados

```
┌─────────────────────────────────────────────────┐
│         User Action (Click, Input, etc.)        │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │      Component       │
        │  (Event Handler)     │
        └───────────┬──────────┘
                    │
        ┌───────────▼───────────┐
        │      Service          │
        │  (Business Logic)    │
        └───────────┬──────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼────┐  ┌──────▼──────┐  ┌─────▼─────┐
│localStor│  │Custom Events│  │   DOM     │
│  age    │  │  (Update)   │  │  Update   │
└─────────┘  └─────────────┘  └───────────┘
```

### Serviços Principais

#### 1. DataService (`src/services/dataService.ts`)

**Responsabilidades:**
- Gerenciamento de dados das disciplinas
- Persistência em localStorage
- Fallback para arquivo JSON (`/disciplinas.json`)
- Importação/Exportação de dados

**Fluxo:**
1. `loadDisciplines()`: Tenta carregar do localStorage → fallback para JSON
2. `saveDiscipline()`: Salva no estado interno + localStorage
3. `deleteDiscipline()`: Remove do estado + localStorage
4. Dispara evento `disciplines-updated` para atualizar UI

**Estrutura de Dados:**
```typescript
interface Discipline {
  title: string;
  period: string;
  description: string;
  syllabus: string[];
  progress: number;
  color: string;
  prerequisites: string[];
  position: { x: number; y: number };
  icon: string;
  modules?: ModuleMetadata[];
  subModuleContent?: Record<string, string>;
  context?: string;
}
```

#### 2. ThemeService (`src/services/themeService.ts`)

**Responsabilidades:**
- Gerenciamento de temas
- Aplicação de temas via atributo `data-theme`
- Persistência de preferência do usuário

**Fluxo:**
1. `loadTheme()`: Carrega tema salvo do localStorage
2. `applyTheme()`: Aplica tema no `document.documentElement`
3. `saveTheme()`: Salva preferência no localStorage

#### 3. CursorService (`src/services/cursorService.ts`)

**Responsabilidades:**
- Gerenciamento do cursor customizado
- 6 tipos de cursor disponíveis
- Configuração de targets interativos

**Fluxo:**
1. `init()`: Inicializa cursor baseado em configuração
2. `updateCursor()`: Atualiza cursor baseado no tipo selecionado
3. `updateCursorTargets()`: Atualiza elementos que interagem com cursor

#### 4. GeminiService (`src/services/geminiService.ts`)

**Responsabilidades:**
- Comunicação com API do Google Gemini
- Gerenciamento de modelos e configurações
- Contagem de tokens
- Geração de conteúdo

**Fluxo:**
1. `setApiKey()`: Configura API key
2. `setModel()`: Define modelo a usar
3. `sendMessage()`: Envia mensagem e recebe resposta
4. `generateContent()`: Gera conteúdo usando prompts

#### 5. MarkdownService (`src/services/markdownService.ts`)

**Responsabilidades:**
- Renderização de Markdown para HTML
- Parse de front matter YAML
- Integração com syntax highlighting

#### 6. LatexService (`src/services/latexService.ts`)

**Responsabilidades:**
- Renderização de fórmulas LaTeX usando KaTeX
- Processamento automático via auto-render

#### 7. MermaidService (`src/services/mermaidService.ts`)

**Responsabilidades:**
- Renderização de diagramas Mermaid
- Inicialização e configuração do Mermaid

#### 8. PlotlyService (`src/services/plotlyService.ts`)

**Responsabilidades:**
- Renderização de gráficos Plotly
- Suporte a múltiplos tipos de gráficos

#### 9. ChartService (`src/services/chartService.ts`)

**Responsabilidades:**
- Renderização de gráficos Chart.js
- Gráficos simples e responsivos

#### 10. MathService (`src/services/mathService.ts`)

**Responsabilidades:**
- Processamento matemático usando Math.js
- Avaliação de expressões
- Calculadoras interativas

#### 11. CytoscapeService (`src/services/cytoscapeService.ts`)

**Responsabilidades:**
- Visualização de grafos interativos
- Layouts customizados

#### 12. GSAPService (`src/services/gsapService.ts`)

**Responsabilidades:**
- Processamento de animações GSAP
- Animações de algoritmos (busca sequencial, binária)

#### 13. TippyService (`src/services/tippyService.ts`)

**Responsabilidades:**
- Processamento de tooltips Tippy.js
- Tooltips contextuais

#### 14. LibraryResearchService (`src/services/libraryResearchService.ts`)

**Responsabilidades:**
- Pesquisa e recomendação de bibliotecas
- Informações sobre bibliotecas

#### 15. DisciplineExportService (`src/services/disciplineExportService.ts`)

**Responsabilidades:**
- Exportação de disciplinas para Markdown
- Importação de disciplinas de Markdown
- Sincronização com arquivos

### Eventos Customizados

Sistema de comunicação entre componentes via eventos do DOM:

- **`disciplines-updated`**: Disparado quando disciplinas são modificadas
- **`modal-opened`**: Disparado quando modal é aberto
- **`modal-closed`**: Disparado quando modal é fechado

**Exemplo de Uso:**
```typescript
window.addEventListener('disciplines-updated', () => {
  renderAll();
  adminPanel.refreshDisciplinesList();
});
```

### Padrão Singleton

Todos os serviços seguem o padrão Singleton para garantir uma única instância:

```typescript
export const dataService = new DataService();
export const themeService = new ThemeService();
export const cursorService = new CursorService();
```

---

## ⚙️ Funcionalidades Centrais

### 1. Visualização de Disciplinas

#### Grid de Cards
- Cards interativos com informações da disciplina
- Animação FLIP ao abrir modal
- Indicadores visuais de progresso
- Cores personalizadas por disciplina

#### Grafo de Conhecimento
- Visualização SVG interativa
- Nós representando disciplinas
- Conexões indicando pré-requisitos
- Hover effects para destacar relacionamentos
- Posicionamento customizável por disciplina

### 2. Modal de Detalhes

Funcionalidades:
- **Informações Básicas**: Título, descrição, período
- **Progresso Visual**: Circular e barra de progresso
- **Syllabus**: Lista numerada de tópicos
- **Pré-requisitos**: Tags visuais das disciplinas requeridas
- **Estatísticas**: Total de módulos, horas estimadas, módulos completos
- **Ações**: Botões para começar curso, ver documentação, baixar material

### 3. Página de Conteúdo da Disciplina

Estrutura:
- **Sidebar Fixa**: Navegação por módulos com indicadores de progresso
- **Conteúdo Central**: Área expansível com conteúdo rico
- **Tabela de Conteúdo**: Scroll spy automático
- **Blocos Interativos**: Accordion, Tabs, CodeBlock, VideoPlayer, Quiz, Callout

### 4. Painel Administrativo

Funcionalidades CRUD:
- **Create**: Formulário para criar nova disciplina
- **Read**: Lista de todas as disciplinas
- **Update**: Edição inline de disciplinas
- **Delete**: Remoção com confirmação
- **Import/Export**: Backup e restore via JSON

### 5. Sistema de Temas

- 2 temas disponíveis (Dark e Light)
- Troca instantânea via botões
- Persistência de preferência
- Aplicação global via CSS Variables

### 6. Cursor Customizado

- 6 tipos disponíveis (Classic, Dot, Glow, Pulse, Trail, Magnetic)
- Configuração via painel de settings
- Interação com elementos específicos
- Persistência de configuração

### 7. Animações e Transições

- **FLIP Animations**: Para modais e transições de página
- **Stagger Animations**: Para listas e elementos sequenciais
- **Fade In/Out**: Para elementos dinâmicos
- **Progress Bar**: Barra de progresso para transições
- **Loading States**: Estados de carregamento com spinners

---

## 📁 Estrutura de Diretórios

```
khromaAcademy/
├── src/
│   ├── app.ts                    # Ponto de entrada da aplicação
│   ├── index.html                # HTML principal
│   ├── components/               # Componentes modulares
│   │   ├── Header/
│   │   ├── DisciplineCard/
│   │   ├── KnowledgeGraph/
│   │   ├── Modal/
│   │   ├── DisciplineContent/
│   │   │   └── ContentBlocks/    # Blocos de conteúdo
│   │   ├── AdminPanel/
│   │   ├── SettingsPanel/
│   │   └── LoadingStates/
│   ├── services/                 # Serviços singleton
│   │   ├── dataService.ts
│   │   ├── themeService.ts
│   │   └── cursorService.ts
│   ├── types/                    # Definições TypeScript
│   │   ├── discipline.ts
│   │   ├── theme.ts
│   │   └── cursor.ts
│   ├── utils/                    # Funções utilitárias
│   │   ├── animations.ts
│   │   ├── domHelpers.ts
│   │   ├── pageTransitions.ts
│   │   └── ...
│   └── styles/                   # Módulos CSS
│       ├── variables.css
│       ├── themes.css
│       ├── animations.css
│       └── ...
├── public/
│   └── disciplinas.json         # Dados padrão
├── docs/                         # Documentação
│   ├── context.md               # Este arquivo
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── COMPONENTS.md
│   ├── SETUP.md
│   └── THEMES.md
├── dist/                         # Build output
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Inicialização da Aplicação

### Fluxo de Startup

```typescript
// 1. Aguardar DOM estar pronto
DOMContentLoaded → initializeApp()

// 2. Carregar dados e configurações
await dataService.loadDisciplines()
themeService.loadTheme()
cursorService.init()

// 3. Inicializar componentes
Header.init()
SettingsPanel.init()
KnowledgeGraph.init()
Modal.init()
AdminPanel.init()
DisciplineContent.init()

// 4. Renderizar conteúdo
renderAll() // Grid + Grafo

// 5. Configurar listeners
- Event listeners para cards
- Event listeners para nodes do grafo
- Event listeners para eventos customizados
```

### Ordem de Renderização

1. **Preloader**: Animação de carregamento inicial
2. **Header**: Cabeçalho com logo e navegação
3. **Grid/Grafo**: Visualização de disciplinas
4. **Modal**: Pronto, mas oculto até interação
5. **DisciplineContent**: Pronto, mas oculto até ação

---

## 🎯 Princípios de Design

### 1. Separação de Responsabilidades
- Cada módulo tem uma responsabilidade clara
- Services para lógica de negócio
- Components para apresentação
- Utils para funções auxiliares

### 2. Reutilização de Código
- Componentes modulares e reutilizáveis
- Utilitários genéricos
- Sistema de temas centralizado

### 3. Tipagem Forte
- TypeScript em modo strict
- Interfaces bem definidas
- Type guards quando necessário

### 4. Performance
- Lazy loading de módulos
- Animações otimizadas com CSS
- Event delegation quando apropriado
- Singleton pattern para evitar instâncias múltiplas

### 5. Acessibilidade
- ARIA labels em elementos interativos
- Navegação por teclado
- Contraste adequado nos temas
- Estrutura semântica HTML

### 6. Manutenibilidade
- Código organizado e documentado
- Padrões consistentes
- CSS modular
- Barrel exports para imports limpos

---

## 🔧 Configurações Importantes

### Vite (`vite.config.ts`)
- **Root**: `./src`
- **Public Dir**: `../public`
- **Build Output**: `../dist`
- **Aliases**: `@/*` para imports absolutos
- **Port**: 3000 (desenvolvimento)

### TypeScript (`tsconfig.json`)
- **Target**: ES2020
- **Module**: ES2020
- **Strict**: true
- **Path Aliases**: Configurados para `@/*`

### Build Process
1. TypeScript compilation (`tsc`)
2. Vite build com Rollup
3. Minificação e otimização
4. Output em `dist/`

---

## 📝 Notas para Novos Colaboradores

### Pontos de Entrada

1. **`src/app.ts`**: Ponto de entrada principal - inicializa todos os componentes
2. **`src/index.html`**: Estrutura HTML base
3. **`src/components/`**: Componentes principais da UI

### Serviços Principais

- **DataService**: Use para qualquer operação com dados de disciplinas
- **ThemeService**: Use para mudanças de tema
- **CursorService**: Use para configurações de cursor

### Adicionar Novo Componente

1. Criar pasta em `src/components/NomeComponente/`
2. Criar `NomeComponente.ts` e `NomeComponente.css`
3. Exportar classe do componente
4. Importar em `app.ts` e inicializar

### Adicionar Novo Serviço

1. Criar arquivo em `src/services/NomeServico.ts`
2. Implementar classe com padrão singleton
3. Exportar instância: `export const nomeServico = new NomeServico()`

### Sistema de Eventos

Use eventos customizados para comunicação entre componentes:
```typescript
// Disparar evento
window.dispatchEvent(new CustomEvent('disciplines-updated'));

// Escutar evento
window.addEventListener('disciplines-updated', () => {
  // Atualizar UI
});
```

### Persistência de Dados

- **localStorage**: Para dados do usuário (disciplinas, tema, cursor)
- **JSON File**: Fallback para dados padrão
- **Chave**: `khroma-disciplines`, `khroma-theme`, `khroma-cursor`

---

## 🔗 Referências

Para mais detalhes, consulte:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitetura detalhada do projeto
- **[COMPONENTS.md](./COMPONENTS.md)**: Documentação de componentes
- **[API.md](./API.md)**: API dos serviços
- **[SETUP.md](./SETUP.md)**: Guia de setup e desenvolvimento
- **[THEMES.md](./THEMES.md)**: Sistema de temas

---

## 📊 Estatísticas do Projeto

- **Linguagem**: TypeScript 100%
- **Framework**: Vanilla (sem frameworks)
- **Build Tool**: Vite 5.0+
- **Componentes**: ~20 componentes principais
- **Serviços**: 14 serviços singleton
- **Temas**: 2 temas disponíveis (Dark e Light)
- **Tipos de Cursor**: 6 tipos
- **Blocos de Conteúdo**: 11 blocos modulares
- **Agentes de IA**: 2 agentes (PDF to Docs, Content Review)
- **Bibliotecas Externas**: 15+ bibliotecas integradas

---

**Última atualização**: 2024
**Versão**: 1.0.0

