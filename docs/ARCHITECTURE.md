# Arquitetura do Projeto

## Visão Geral

O KhromaAcademy é uma aplicação vanilla TypeScript organizada em módulos, seguindo princípios de separação de responsabilidades e reutilização de código. A arquitetura é baseada em componentes modulares, serviços singleton e sistema de eventos para comunicação.

## Estrutura de Pastas

### `/src/types`
Contém todas as definições TypeScript de tipos e interfaces:
- `discipline.ts` - Tipos relacionados a disciplinas
- `theme.ts` - Tipos relacionados a temas
- `cursor.ts` - Tipos relacionados ao cursor customizado
- `agent.ts` - Tipos relacionados a agentes de IA
- `index.ts` - Barrel export de todos os tipos

### `/src/services`
Serviços singleton que gerenciam estado e lógica de negócio:
- `dataService.ts` - Gerenciamento de dados (localStorage, fetch)
- `themeService.ts` - Gerenciamento de temas
- `cursorService.ts` - Gerenciamento do cursor customizado
- `geminiService.ts` - Comunicação com API Gemini
- `markdownService.ts` - Processamento de Markdown
- `mermaidService.ts` - Renderização de diagramas Mermaid
- `latexService.ts` - Processamento de LaTeX
- `plotlyService.ts` - Gráficos Plotly
- `chartService.ts` - Gráficos Chart.js
- `mathService.ts` - Processamento matemático
- `cytoscapeService.ts` - Visualização de grafos
- `gsapService.ts` - Animações GSAP
- `tippyService.ts` - Tooltips Tippy.js
- `libraryResearchService.ts` - Pesquisa de bibliotecas
- `disciplineExportService.ts` - Exportação/importação de disciplinas
- `index.ts` - Barrel export de todos os serviços

### `/src/components`
Componentes modulares organizados por funcionalidade:
- Cada componente tem seu próprio arquivo TypeScript e CSS
- Componentes são classes que encapsulam lógica e renderização
- Exemplos: Header, Modal, AdminPanel, KnowledgeGraph, CommandPalette, MainNavigation

**Estrutura de Componentes**:
```
components/
├── Header/              # Cabeçalho principal
├── MainNavigation/      # Menu lateral de navegação
├── CommandPalette/      # Sistema de busca global
├── SettingsPanel/      # Painel de configurações
├── DisciplineCard/      # Card de disciplina
├── KnowledgeGraph/      # Grafo de conhecimento
├── Modal/              # Modal de detalhes
├── AdminPanel/         # Painel administrativo
│   └── AIAssistant.ts  # Assistente de IA
├── DisciplineContent/  # Página de conteúdo
│   ├── ContentBlocks/  # Blocos de conteúdo modulares
│   ├── Sidebar.ts      # Sidebar de navegação
│   ├── TableOfContents.ts # Tabela de conteúdos
│   └── GeminiChatbot.ts # Chatbot integrado
├── AgentsPanel/        # Painel de agentes
│   ├── PDFToDocsAgent/ # Agente PDF to Docs
│   └── ContentReviewAgent/ # Agente de revisão
└── LoadingStates/      # Estados de carregamento
```

### `/src/utils`
Funções utilitárias reutilizáveis:
- `idGenerator.ts` - Geração de IDs únicos
- `domHelpers.ts` - Helpers para manipulação DOM
- `animations.ts` - Funções de animação
- `intersectionObserver.ts` - Observer para scroll spy
- `pageTransitions.ts` - Transições de página
- `disciplineTypeDetector.ts` - Detecção de tipo de disciplina
- `router.ts` - Sistema de roteamento
- `iconLoader.ts` - Carregamento de ícones Lucide
- `index.ts` - Barrel export de utilitários

### `/src/styles`
Módulos CSS organizados por propósito:
- `variables.css` - Design tokens (CSS Variables)
- `animations.css` - Keyframes e animações
- `themes.css` - Definições de temas
- `global.css` - Estilos globais
- `markdown-content.css` - Estilos para conteúdo Markdown
- `content-blocks.css` - Estilos para blocos de conteúdo
- `advanced-blocks.css` - Estilos para blocos avançados
- Componentes específicos têm seus próprios arquivos CSS

## Fluxo de Dados

```
User Action → Component → Service → Data Storage (localStorage/JSON)
                    ↓
              Update UI
                    ↓
         Custom Events (opcional)
```

### Exemplo de Fluxo

1. **Usuário clica em card de disciplina**
   - `DisciplineCard` dispara evento ou chama `Modal.open()`
   - `Modal` busca dados via `dataService.getDiscipline()`
   - `Modal` renderiza informações

2. **Usuário salva disciplina**
   - `AdminPanel` chama `dataService.saveDiscipline()`
   - `dataService` salva no localStorage
   - `dataService` dispara evento `disciplines-updated`
   - Componentes escutam evento e atualizam UI

3. **Usuário gera conteúdo com IA**
   - `AIAssistant` chama `geminiService.generateContent()`
   - `geminiService` faz requisição à API Gemini
   - Resposta é processada e salva via `dataService`

## Padrões Utilizados

### Singleton Pattern
Serviços utilizam padrão singleton para garantir uma única instância:
```typescript
export const dataService = new DataService();
export const themeService = new ThemeService();
export const cursorService = new CursorService();
```

### Event-Driven Architecture
Componentes comunicam-se via eventos customizados:
```typescript
window.dispatchEvent(new CustomEvent('disciplines-updated'));
window.addEventListener('disciplines-updated', () => {
  // Atualizar UI
});
```

### Component Lifecycle
Componentes seguem um padrão de inicialização:
1. `init()` - Configuração inicial
2. Renderização
3. Event listeners
4. Cleanup (quando necessário)

### Barrel Exports
Uso de barrel exports para imports limpos:
```typescript
// services/index.ts
export * from './dataService';
export * from './themeService';

// Uso
import { dataService, themeService } from '@/services';
```

## Sistema de Agentes de IA

O projeto possui um sistema modular de agentes de IA que automatizam tarefas educacionais:

### Arquitetura de Agentes

```
AgentsPanel (Container)
├── PDFToDocsAgent
│   └── Converte PDFs em disciplinas
└── ContentReviewAgent
    └── Revisa e melhora conteúdo
```

### Fluxo de Agente

1. **Usuário inicia agente** → `AgentsPanel` cria instância do agente
2. **Agente processa** → Usa `geminiService` para comunicação com IA
3. **Agente gera resultado** → Salva via `dataService` ou `disciplineExportService`
4. **Histórico salvo** → Agente salva histórico de operações

## Sistema de Blocos de Conteúdo

Blocos modulares processados automaticamente no conteúdo Markdown:

### Processamento

1. `DisciplineContent` renderiza Markdown via `markdownService`
2. HTML renderizado é processado para encontrar blocos especiais
3. Cada tipo de bloco é processado pelo serviço apropriado:
   - `data-mermaid` → `mermaidService`
   - `data-plotly` → `plotlyService`
   - `data-chart` → `chartService`
   - `data-gsap` → `gsapService`
   - `data-tippy` → `tippyService`
   - LaTeX → `latexService`
   - Blocos customizados → Componentes específicos

### Tipos de Blocos

- **Accordion** - Seções expansíveis
- **Callout** - Destaques informativos
- **Tabs** - Sistema de abas
- **CodeBlock** - Blocos de código
- **VideoPlayer** - Player de vídeo
- **Quiz** - Quizzes interativos
- **MonacoEditor** - Editor de código
- **ThreeViewer** - Visualizador 3D
- **MatterSimulation** - Simulações de física
- **FabricCanvas** - Canvas interativo

## Sistema de Exportação/Importação

### Exportação Markdown

1. `disciplineExportService.exportDisciplineToMarkdown()` converte disciplina em Markdown
2. Front matter YAML contém metadados
3. Conteúdo é estruturado em módulos e sub-módulos
4. Arquivo é baixado automaticamente

### Importação Markdown

1. `disciplineExportService.importDisciplineFromMarkdown()` parseia Markdown
2. Front matter é extraído via `markdownService.parseFrontMatter()`
3. Estrutura de módulos é reconstruída
4. Disciplina é salva via `dataService`

## Build e Deploy

O projeto utiliza Vite como bundler:
- **Desenvolvimento**: HMR (Hot Module Replacement) para desenvolvimento rápido
- **Produção**: Build otimizado com tree-shaking e minificação
- **Output**: Pasta `dist/` com assets otimizados

### Configuração Vite

- **Root**: `./src`
- **Public Dir**: `../public`
- **Build Output**: `../dist`
- **Aliases**: `@/*` para imports absolutos

## Dependências

### Core
- **Vite**: Build tool e dev server
- **TypeScript**: Tipagem estática
- **ESLint + Prettier**: Linting e formatação

### Bibliotecas Externas
- **markdown-it**: Parser de Markdown
- **katex**: Renderização de LaTeX
- **mermaid**: Diagramas
- **plotly.js**: Gráficos avançados
- **chart.js**: Gráficos simples
- **cytoscape**: Visualização de grafos
- **three.js**: Visualizações 3D
- **matter.js**: Simulações de física
- **fabric.js**: Canvas interativo
- **monaco-editor**: Editor de código
- **gsap**: Animações
- **tippy.js**: Tooltips

## Princípios de Design

1. **Separação de Responsabilidades**: Cada módulo tem uma responsabilidade clara
2. **Reutilização**: Componentes e utilitários são reutilizáveis
3. **Tipagem Forte**: TypeScript em modo strict
4. **Performance**: Lazy loading de módulos, animações otimizadas
5. **Acessibilidade**: ARIA labels e suporte a navegação por teclado
6. **Manutenibilidade**: Código organizado e documentado

## Comunicação Entre Módulos

### 1. Eventos Customizados
```typescript
window.dispatchEvent(new CustomEvent('disciplines-updated'));
```

### 2. Serviços Compartilhados
```typescript
import { dataService } from '@/services';
const discipline = dataService.getDiscipline(id);
```

### 3. Callbacks
```typescript
mainNavigation = new MainNavigation({
  onNavigate: handleNavigation,
});
```

### 4. Instâncias Globais (quando necessário)
```typescript
(window as any).modalInstance = modal;
```

## Estrutura de Dados

### Discipline
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

### Persistência

- **localStorage**: Dados do usuário (disciplinas, tema, cursor, histórico)
- **JSON File**: Fallback para dados padrão (`public/disciplinas.json`)
- **Markdown Files**: Exportação/importação (`public/disciplinas-md/`)
