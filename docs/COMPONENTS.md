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

---

### SettingsPanel
**Arquivo**: `src/components/SettingsPanel/SettingsPanel.ts`

Gerencia o painel de configurações.

**Métodos**:
- `init()` - Inicializa o painel

**Funcionalidades**:
- Toggle do cursor customizado
- Seleção de tipo de cursor
- Acesso ao painel administrativo

---

### DisciplineCard
**Arquivo**: `src/components/DisciplineCard/DisciplineCard.ts`

Componente estático para renderização de cards de disciplina.

**Métodos**:
- `static render(discipline: Discipline, id: string): string` - Retorna HTML do card

---

### KnowledgeGraph
**Arquivo**: `src/components/KnowledgeGraph/KnowledgeGraph.ts`

Gerencia o grafo de conhecimento interativo.

**Métodos**:
- `init()` - Inicializa o grafo
- `render(disciplines: Record<string, Discipline>)` - Renderiza o grafo

**Funcionalidades**:
- Renderização de nós e conexões
- Interatividade com hover
- Destaque de pré-requisitos

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
- `refreshDisciplinesList()` - Atualiza a lista de disciplinas
- `editDiscipline(id: string)` - Edita uma disciplina
- `deleteDiscipline(id: string)` - Remove uma disciplina

**Funcionalidades**:
- CRUD completo de disciplinas
- Importação/Exportação JSON
- Validação de formulários

---

### DisciplineContent
**Arquivo**: `src/components/DisciplineContent/DisciplineContent.ts`

Estrutura preparatória para página de conteúdo da disciplina com layout sidebar + conteúdo central.

**Métodos**:
- `init()` - Inicializa o componente
- `render(discipline: Discipline)` - Renderiza a estrutura do conteúdo
- `show()` - Mostra o conteúdo
- `hide()` - Esconde o conteúdo
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
  - Área de conteúdo expansível
  - Placeholder preparatório
- Indicador de progresso geral na sidebar
- Design responsivo

**Nota**: Esta é uma estrutura preparatória. A funcionalidade completa será implementada futuramente.

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

## CSS dos Componentes

Cada componente tem seu próprio arquivo CSS importado junto com o componente:
- `ComponentName.css` - Estilos específicos do componente

## Comunicação Entre Componentes

Componentes comunicam-se via:
1. **Eventos Customizados**: `window.dispatchEvent(new CustomEvent('event-name'))`
2. **Serviços Compartilhados**: `dataService`, `themeService`, `cursorService`
3. **Callbacks**: Quando necessário para comunicação direta

