# Documentação de Componentes

## Componentes Principais

### Header
**Arquivo**: `src/components/Header/Header.ts`

Gerencia o header da aplicação e o painel de configurações.

**Métodos**:
- `init()` - Inicializa o componente

**Funcionalidades**:
- Toggle do painel de configurações
- Gerenciamento de botões de tema
- Integração com CommandPalette (atalho Cmd/Ctrl+K)

---

### MainNavigation
**Arquivo**: `src/components/MainNavigation/MainNavigation.ts`

Menu lateral principal ultra-moderno com suporte a expansão/colapso e navegação por teclado.

**Métodos**:
- `constructor(options: MainNavigationOptions)` - Inicializa o menu
- `getElement(): HTMLElement` - Retorna o elemento do menu
- `setActive(itemId: string): void` - Define item ativo
- `toggle(): void` - Alterna entre expandido/colapsado
- `collapse(): void` - Colapsa o menu
- `expand(): void` - Expande o menu

**Funcionalidades**:
- Menu lateral fixo com modo expandido/colapsado
- Hover expansion quando colapsado
- Navegação por teclado (atalhos configuráveis)
- Persistência de estado (localStorage)
- Badges opcionais nos itens
- Tooltips quando colapsado
- Perfil do usuário no rodapé
- Itens de navegação: Home, Meus Cursos, Explorar, Trilhas, Agentes, Configurações

**Interface**:
```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  action?: () => void;
  badge?: number;
  isToggle?: boolean;
  shortcut?: string;
}
```

---

### CommandPalette
**Arquivo**: `src/components/CommandPalette/CommandPalette.ts`

Sistema de busca global estilo Spotlight/Command+K para busca rápida de cursos, ações e configurações.

**Métodos**:
- `constructor(options?: CommandPaletteOptions)` - Inicializa o palette
- `open(): void` - Abre o palette
- `close(): void` - Fecha o palette
- `registerItems(items: SearchItem[]): void` - Registra itens de busca
- `static getInstance(): CommandPalette` - Retorna instância singleton

**Funcionalidades**:
- Busca fuzzy (busca aproximada)
- Categorização de resultados (cursos, ações, configurações)
- Navegação por teclado (setas, Enter, Esc)
- Histórico de buscas recentes
- Highlight de termos encontrados
- Atalho padrão: Cmd/Ctrl+K

**Interface**:
```typescript
interface SearchItem {
  id: string;
  title: string;
  category: 'curso' | 'trilha' | 'config' | 'acao';
  icon: string;
  keywords: string[];
  action: () => void;
}
```

---

### SettingsPanel
**Arquivo**: `src/components/SettingsPanel/SettingsPanel.ts`

Gerencia o painel de configurações com suporte a tema flutuante e página completa.

**Métodos**:
- `init()` - Inicializa o painel
- `setHeaderInstance(header: Header): void` - Define instância do header
- `updateToggleStates(): void` - Atualiza estados dos toggles
- `initModelSelect(): void` - Inicializa seleção de modelo
- `initCursorOptions(): void` - Inicializa opções de cursor
- `updateAdvancedConfigUI(config, model): void` - Atualiza UI de configurações avançadas

**Funcionalidades**:
- Toggle do cursor customizado
- Seleção de tipo de cursor (Classic, Dot, Square, Crosshair, Glow, Outline)
- Configuração de modelo Gemini (2.5 Pro, Flash Lite, Flash)
- Configurações avançadas (Temperature, Top P, Top K, Max Output Tokens)
- Toggle de Google Search (embasamento)
- Acesso ao painel administrativo
- Modo escuro (preparado para implementação futura)

---

### DisciplineCard
**Arquivo**: `src/components/DisciplineCard/DisciplineCard.ts`

Componente estático para renderização de cards de disciplina.

**Métodos**:
- `static render(discipline: Discipline, id: string): string` - Retorna HTML do card

**Funcionalidades**:
- Exibição de informações da disciplina (título, descrição, período)
- Indicador visual de progresso
- Cores personalizadas por disciplina
- Design responsivo

---

### KnowledgeGraph
**Arquivo**: `src/components/KnowledgeGraph/KnowledgeGraph.ts`

Gerencia o grafo de conhecimento interativo usando SVG.

**Métodos**:
- `init()` - Inicializa o grafo
- `render(disciplines: Record<string, Discipline>)` - Renderiza o grafo

**Funcionalidades**:
- Renderização de nós e conexões SVG
- Interatividade com hover
- Destaque de pré-requisitos
- Posicionamento customizável por disciplina
- Animações suaves

---

### Modal
**Arquivo**: `src/components/Modal/Modal.ts`

Gerencia modais com animação FLIP e design moderno.

**Métodos**:
- `init()` - Inicializa o modal
- `open(id: string, discipline: Discipline, triggerElement: HTMLElement)` - Abre modal
- `close()` - Fecha modal
- `static getInstance()` - Retorna instância singleton

**Funcionalidades**:
- Animação FLIP (First, Last, Invert, Play)
- Layout moderno com sidebar e conteúdo principal
- Exibição de detalhes da disciplina (título, descrição, período)
- Visualização de progresso (circular e barra)
- Lista de syllabus numerada
- Seção de pré-requisitos (quando disponível)
- Botões de ação:
  - "Começar Curso" - Abre página de conteúdo
  - "Ver Documentação"
  - "Baixar Material"
  - "Progresso Detalhado"

---

### AdminPanel
**Arquivo**: `src/components/AdminPanel/AdminPanel.ts`

Painel administrativo completo para gerenciamento de disciplinas.

**Métodos**:
- `init()` - Inicializa o painel
- `open()` - Abre o painel
- `close()` - Fecha o painel
- `refreshDisciplinesList()` - Atualiza a lista de disciplinas
- `editDiscipline(id: string)` - Edita uma disciplina
- `deleteDiscipline(id: string)` - Remove uma disciplina
- `loadGeneratedModules(disciplineId: string, modules: any[]): void` - Carrega módulos gerados pela IA

**Funcionalidades**:
- CRUD completo de disciplinas
- Importação/Exportação JSON
- Importação/Exportação Markdown
- Validação de formulários
- Integração com AIAssistant para geração de disciplinas
- Gerenciamento de módulos e sub-módulos

---

### AIAssistant
**Arquivo**: `src/components/AdminPanel/AIAssistant.ts`

Assistente de IA para criação e geração de disciplinas usando Google Gemini.

**Métodos**:
- `init()` - Inicializa o assistente
- `open()` - Abre o modal do assistente
- `close()` - Fecha o modal
- `generateDiscipline()` - Gera disciplina usando IA

**Funcionalidades**:
- Formulário para criação de disciplina
- Upload de PDFs para contexto adicional
- Geração de estrutura de módulos e sub-módulos
- Geração de contexto educacional
- Preview da disciplina gerada
- Edição antes de salvar
- Integração com geminiService

---

### DisciplineContent
**Arquivo**: `src/components/DisciplineContent/DisciplineContent.ts`

Página completa de conteúdo da disciplina com suporte a Markdown e blocos interativos.

**Métodos**:
- `init()` - Inicializa o componente
- `render(discipline: Discipline)` - Renderiza a estrutura do conteúdo
- `show()` - Mostra o conteúdo
- `hide()` - Esconde o conteúdo
- `loadModule(moduleId: string, subModuleId?: string): Promise<void>` - Carrega módulo específico
- `static getInstance()` - Retorna instância singleton

**Funcionalidades**:
- Layout com sidebar fixa à esquerda
- Menu de navegação com seções:
  - Módulos (com indicadores de progresso)
  - Documentação
  - Livros
  - Exercícios
- Área central de conteúdo com:
  - Header com breadcrumb
  - Renderização de Markdown
  - Suporte a blocos de conteúdo interativos
  - Table of Contents automático
- Indicador de progresso geral na sidebar
- Chatbot integrado (GeminiChatbot)
- Design responsivo
- Suporte a múltiplos formatos de conteúdo (Markdown, LaTeX, Mermaid, Plotly, Chart.js, etc.)

---

### Sidebar
**Arquivo**: `src/components/DisciplineContent/Sidebar.ts`

Sidebar de navegação para a página de conteúdo da disciplina.

**Funcionalidades**:
- Navegação por módulos e sub-módulos
- Indicadores de progresso
- Scroll spy para destacar seção atual
- Design responsivo

---

### TableOfContents
**Arquivo**: `src/components/DisciplineContent/TableOfContents.ts`

Tabela de conteúdos automática gerada a partir dos cabeçalhos do conteúdo.

**Funcionalidades**:
- Geração automática de TOC
- Scroll spy para destacar seção atual
- Links de navegação rápida
- Design minimalista

---

### GeminiChatbot
**Arquivo**: `src/components/DisciplineContent/GeminiChatbot.ts`

Chatbot integrado com Google Gemini para assistência durante o aprendizado.

**Métodos**:
- `create(): HTMLElement` - Cria o elemento do chatbot
- `init(): void` - Inicializa o chatbot
- `sendMessage(message: string, images?: File[]): Promise<void>` - Envia mensagem
- `minimize(): void` - Minimiza o chatbot
- `maximize(): void` - Maximiza o chatbot

**Funcionalidades**:
- Chat interativo com Google Gemini
- Suporte a múltiplas abas de conversação
- Histórico de conversas
- Upload de imagens
- Diferentes personalidades (default, tutor, professor, amigo)
- Redimensionamento de largura
- Scroll automático
- Contagem de tokens
- Integração com conteúdo da página atual
- Persistência de histórico (localStorage)

---

### AgentsPanel
**Arquivo**: `src/components/AgentsPanel/AgentsPanel.ts`

Painel principal que exibe todos os agentes de IA disponíveis.

**Métodos**:
- `create(): HTMLElement` - Cria o elemento do painel

**Funcionalidades**:
- Lista de agentes disponíveis
- Navegação entre agentes
- Interface unificada para todos os agentes
- Design moderno e intuitivo

**Agentes Disponíveis**:
- PDF to Docs Agent
- Content Review Agent

---

### PDFToDocsAgent
**Arquivo**: `src/components/AgentsPanel/PDFToDocsAgent/PDFToDocsAgent.ts`

Agente de IA que converte PDFs em disciplinas completas automaticamente.

**Métodos**:
- `create(): HTMLElement` - Cria o elemento do agente
- `init(): void` - Inicializa o agente
- `processPDF(pdfFile: File, prompt?: string): Promise<void>` - Processa PDF

**Funcionalidades**:
- Upload de arquivo PDF
- Análise do conteúdo do PDF
- Geração automática de estrutura de disciplina
- Geração de conteúdo educacional
- Histórico de conversões
- Integração com geminiService

---

### ContentReviewAgent
**Arquivo**: `src/components/AgentsPanel/ContentReviewAgent/ContentReviewAgent.ts`

Agente de IA que revisa e melhora o conteúdo de disciplinas existentes.

**Métodos**:
- `create(): HTMLElement` - Cria o elemento do agente
- `init(): void` - Inicializa o agente
- `reviewDiscipline(disciplineId: string, prompt?: string): Promise<void>` - Revisa disciplina

**Funcionalidades**:
- Seleção de disciplina para revisão
- Detecção automática do tipo de disciplina
- Recomendação de bibliotecas apropriadas
- Revisão e melhoria de conteúdo
- Geração de sugestões de melhorias
- Histórico de revisões
- Métricas de revisão (tokens, duração)

---

### LoadingStates
**Arquivo**: `src/components/LoadingStates/`

Componentes para estados de carregamento.

#### Spinner
**Arquivo**: `src/components/LoadingStates/Spinner.ts`

Spinner de carregamento animado.

**Métodos**:
- `static create(options?: SpinnerOptions): HTMLElement` - Cria spinner

#### Skeleton
**Arquivo**: `src/components/LoadingStates/Skeleton.ts`

Placeholder de carregamento estilo skeleton.

**Métodos**:
- `static create(options?: SkeletonOptions): HTMLElement` - Cria skeleton

---

## Blocos de Conteúdo

Os blocos de conteúdo são componentes modulares usados dentro do conteúdo Markdown das disciplinas. Eles são processados automaticamente pelo `DisciplineContent`.

### Accordion
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/Accordion.ts`

Seções expansíveis/colapsáveis.

**Uso no Markdown**:
```html
<div class="accordion-block" data-title="Título">
  Conteúdo aqui
</div>
```

---

### Callout
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/Callout.ts`

Destaques informativos (info, warning, success, error).

**Uso no Markdown**:
```html
<div class="callout-block" data-type="info">
  Mensagem informativa
</div>
```

**Tipos**: `info`, `warning`, `success`, `error`

---

### Tabs
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/Tabs.ts`

Sistema de abas para organizar conteúdo.

**Uso no Markdown**:
```html
<div class="tabs-block">
  <div class="tab" data-label="Tab 1">Conteúdo 1</div>
  <div class="tab" data-label="Tab 2">Conteúdo 2</div>
</div>
```

---

### CodeBlock
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/CodeBlock.ts`

Blocos de código com syntax highlighting usando Prism.js.

**Uso no Markdown**:
````markdown
```javascript
const code = "example";
```
````

**Funcionalidades**:
- Syntax highlighting
- Copy to clipboard
- Números de linha opcionais
- Múltiplas linguagens suportadas

---

### VideoPlayer
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/VideoPlayer.ts`

Player de vídeo integrado.

**Uso no Markdown**:
```html
<div class="video-block" data-src="https://youtube.com/watch?v=..." data-title="Título do Vídeo"></div>
```

**Funcionalidades**:
- Suporte a YouTube, Vimeo e vídeos diretos
- Controles customizados
- Design responsivo

---

### Quiz
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/Quiz.ts`

Sistema de quizzes interativos.

**Uso no Markdown**:
```html
<div class="quiz-block" data-question="Pergunta?" data-options='["Opção 1", "Opção 2"]' data-correct="0"></div>
```

**Funcionalidades**:
- Múltiplas questões
- Feedback imediato
- Estatísticas de acertos

---

### QuizBlock
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/QuizBlock.ts`

Versão avançada do Quiz com suporte a múltiplas questões e tipos diferentes.

**Funcionalidades**:
- Múltiplas questões em um único bloco
- Diferentes tipos de questões (múltipla escolha, verdadeiro/falso, etc.)
- Resultados detalhados

---

### MonacoEditor
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/MonacoEditor.ts`

Editor de código avançado usando Monaco Editor (mesmo editor do VS Code).

**Uso no Markdown**:
```html
<div class="monaco-editor-block" data-language="javascript" data-code="const x = 1;"></div>
```

**Funcionalidades**:
- Syntax highlighting avançado
- Autocomplete
- Múltiplas linguagens
- Temas customizáveis

---

### ThreeViewer
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/ThreeViewer.ts`

Visualizador 3D usando Three.js.

**Uso no Markdown**:
```html
<div class="three-viewer-block" data-scene='{"type": "cube"}'></div>
```

**Funcionalidades**:
- Visualizações 3D interativas
- Controles de câmera
- Múltiplos tipos de cenas

---

### MatterSimulation
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/MatterSimulation.ts`

Simulações de física 2D usando Matter.js.

**Uso no Markdown**:
```html
<div class="matter-simulation-block" data-config='{"type": "gravity"}'></div>
```

**Funcionalidades**:
- Simulações de física interativas
- Controles de parâmetros
- Visualizações em tempo real

---

### FabricCanvas
**Arquivo**: `src/components/DisciplineContent/ContentBlocks/FabricCanvas.ts`

Canvas interativo para desenho e manipulação usando Fabric.js.

**Uso no Markdown**:
```html
<div class="fabric-canvas-block" data-width="800" data-height="600"></div>
```

**Funcionalidades**:
- Desenho interativo
- Manipulação de objetos
- Exportação de imagens

---

## Padrão de Componentes

Todos os componentes seguem um padrão similar:

```typescript
export class ComponentName {
  private element: HTMLElement | null = null;

  init(): void {
    // Inicialização
  }

  // Métodos privados/públicos
}
```

### Padrão Singleton

Alguns componentes usam o padrão Singleton:

```typescript
export class ComponentName {
  private static instance: ComponentName | null = null;

  static getInstance(): ComponentName {
    if (!ComponentName.instance) {
      ComponentName.instance = new ComponentName();
    }
    return ComponentName.instance;
  }
}
```

Componentes que usam Singleton:
- `Modal`
- `DisciplineContent`
- `CommandPalette`

## CSS dos Componentes

Cada componente tem seu próprio arquivo CSS importado junto com o componente:
- `ComponentName.css` - Estilos específicos do componente

## Comunicação Entre Componentes

Componentes comunicam-se via:

1. **Eventos Customizados**: `window.dispatchEvent(new CustomEvent('event-name'))`
   - `disciplines-updated` - Disparado quando disciplinas são modificadas
   - `modal-opened` - Disparado quando modal é aberto
   - `modal-closed` - Disparado quando modal é fechado
   - `navigation-change` - Disparado quando navegação muda
   - `open-command-palette` - Disparado para abrir CommandPalette

2. **Serviços Compartilhados**: `dataService`, `themeService`, `cursorService`, `geminiService`, etc.

3. **Callbacks**: Quando necessário para comunicação direta

4. **Instâncias Globais**: Alguns componentes expõem instâncias globalmente via `window`:
   - `window.settingsPanelInstance`
   - `window.modalInstance`
   - `window.adminPanelInstance`

## Estrutura de Diretórios

```
src/components/
├── Header/
├── MainNavigation/
├── CommandPalette/
├── SettingsPanel/
├── DisciplineCard/
├── KnowledgeGraph/
├── Modal/
├── AdminPanel/
│   └── AIAssistant.ts
├── DisciplineContent/
│   ├── ContentBlocks/
│   ├── Sidebar.ts
│   ├── TableOfContents.ts
│   └── GeminiChatbot.ts
├── AgentsPanel/
│   ├── PDFToDocsAgent/
│   └── ContentReviewAgent/
└── LoadingStates/
    ├── Spinner.ts
    └── Skeleton.ts
```
