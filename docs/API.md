# API de Serviços

## DataService

Gerencia o armazenamento e carregamento de dados das disciplinas.

**Instância**: `dataService` (singleton)

### Métodos

#### `loadDisciplines(): Promise<Record<string, Discipline>>`
Carrega disciplinas do localStorage ou arquivo JSON.

**Retorna**: Promise com objeto de disciplinas

#### `saveDisciplines(): void`
Salva disciplinas no localStorage.

#### `getAllDisciplines(): Record<string, Discipline>`
Retorna todas as disciplinas.

**Retorna**: Objeto com todas as disciplinas

#### `getDiscipline(id: string): Discipline | undefined`
Retorna uma disciplina específica.

**Parâmetros**:
- `id`: ID da disciplina

**Retorna**: Disciplina ou undefined

#### `saveDiscipline(id: string, discipline: Discipline): void`
Salva ou atualiza uma disciplina.

**Parâmetros**:
- `id`: ID da disciplina
- `discipline`: Objeto da disciplina

#### `deleteDiscipline(id: string): void`
Remove uma disciplina.

**Parâmetros**:
- `id`: ID da disciplina

#### `exportAsJSON(): string`
Exporta disciplinas como JSON.

**Retorna**: String JSON

#### `importFromJSON(json: string): void`
Importa disciplinas de um JSON.

**Parâmetros**:
- `json`: String JSON com dados das disciplinas

**Throws**: Error se JSON inválido

---

## ThemeService

Gerencia temas da aplicação.

**Instância**: `themeService` (singleton)

### Métodos

#### `loadTheme(): ThemeType`
Carrega e aplica o tema salvo.

**Retorna**: Tipo do tema carregado

#### `applyTheme(theme: ThemeType): void`
Aplica um tema no documento.

**Parâmetros**:
- `theme`: Tipo do tema a aplicar

#### `saveTheme(): void`
Salva o tema atual no localStorage.

#### `getCurrentTheme(): ThemeType`
Retorna o tema atual.

**Retorna**: Tipo do tema atual

#### `getThemeConfig(theme: ThemeType): ThemeConfig | undefined`
Retorna configuração de um tema.

**Parâmetros**:
- `theme`: Tipo do tema

**Retorna**: Configuração do tema ou undefined

#### `getAllThemeConfigs(): ThemeConfigs`
Retorna todas as configurações de temas.

**Retorna**: Objeto com todas as configurações

#### `getAvailableThemes(): ThemeType[]`
Lista todos os temas disponíveis.

**Retorna**: Array com tipos de temas

---

## CursorService

Gerencia o cursor customizado.

**Instância**: `cursorService` (singleton)

### Métodos

#### `init(): void`
Inicializa o serviço de cursor.

#### `loadConfig(): CursorConfig`
Carrega configurações do localStorage.

**Retorna**: Configuração do cursor

#### `updateCursor(): void`
Atualiza o cursor baseado nas configurações.

#### `setType(type: CursorType): void`
Define o tipo de cursor.

**Parâmetros**:
- `type`: Tipo do cursor

#### `setEnabled(enabled: boolean): void`
Habilita ou desabilita o cursor.

**Parâmetros**:
- `enabled`: Se o cursor está habilitado

#### `toggle(): void`
Alterna o estado do cursor (habilitado/desabilitado).

#### `saveConfig(): void`
Salva configurações no localStorage.

#### `getConfig(): CursorConfig`
Retorna configuração atual.

**Retorna**: Configuração do cursor

#### `updateCursorTargets(): void`
Atualiza elementos que interagem com o cursor.

#### `destroy(): void`
Limpa recursos ao destruir o serviço.

---

## GeminiService

Serviço para comunicação com a API do Google Gemini.

**Instância**: `geminiService` (singleton)

### Métodos

#### `setApiKey(apiKey: string): void`
Define a API key e salva no localStorage.

**Parâmetros**:
- `apiKey`: Chave da API do Gemini

#### `getApiKeyStatus(): { configured: boolean; source: 'env' | 'localStorage' | 'none' }`
Obtém o status da API key (sem expor a chave real).

**Retorna**: Status da configuração

#### `setModel(model: string): void`
Define o modelo Gemini a ser usado.

**Parâmetros**:
- `model`: Nome do modelo ('gemini-2.5-pro', 'gemini-flash-lite-latest', 'gemini-flash-latest')

#### `getModel(): string`
Retorna o modelo atual.

**Retorna**: Nome do modelo

#### `setGenerationConfig(config: GeminiGenerationConfig): void`
Define configurações de geração.

**Parâmetros**:
- `config`: Configurações (temperature, topP, topK, maxOutputTokens, enableGoogleSearch, imageSize)

#### `getGenerationConfig(): GeminiGenerationConfig`
Retorna configurações de geração atuais.

**Retorna**: Configurações de geração

#### `sendMessage(message: string, systemInstruction?: string, images?: File[]): Promise<MessageResult>`
Envia mensagem para o Gemini.

**Parâmetros**:
- `message`: Texto da mensagem
- `systemInstruction`: Instrução de sistema opcional
- `images`: Array de imagens opcionais

**Retorna**: Promise com resultado da mensagem (texto e tokens)

#### `countTokens(text: string): Promise<number>`
Conta tokens de um texto.

**Parâmetros**:
- `text`: Texto a contar

**Retorna**: Promise com número de tokens

#### `generateContent(prompt: string, systemInstruction?: string, config?: GeminiGenerationConfig): Promise<string>`
Gera conteúdo usando o Gemini.

**Parâmetros**:
- `prompt`: Prompt para geração
- `systemInstruction`: Instrução de sistema opcional
- `config`: Configurações opcionais

**Retorna**: Promise com conteúdo gerado

---

## MarkdownService

Serviço para renderização de Markdown.

**Instância**: `markdownService` (singleton)

### Métodos

#### `render(markdown: string): string`
Renderiza markdown para HTML.

**Parâmetros**:
- `markdown`: Texto em Markdown

**Retorna**: HTML renderizado

#### `renderInline(markdown: string): string`
Renderiza markdown inline (sem tags de bloco).

**Parâmetros**:
- `markdown`: Texto em Markdown inline

**Retorna**: HTML renderizado

#### `parseFrontMatter(markdown: string): { frontMatter: Record<string, any>; content: string }`
Extrai e parseia front matter YAML do markdown.

**Parâmetros**:
- `markdown`: Texto em Markdown com front matter

**Retorna**: Objeto com front matter e conteúdo

---

## LatexService

Serviço para renderização LaTeX usando KaTeX auto-render.

**Instância**: `latexService` (singleton)

### Métodos

#### `render(element: HTMLElement): void`
Renderiza todas as fórmulas LaTeX em um elemento HTML.

**Parâmetros**:
- `element`: Elemento HTML a processar

**Nota**: Processa fórmulas com delimitadores `$$`, `$`, `\[`, `\(`

---

## MermaidService

Serviço para renderização de diagramas Mermaid.

**Instância**: `mermaidService` (singleton)

### Métodos

#### `render(element: HTMLElement, definition: string): Promise<void>`
Renderiza um diagrama Mermaid.

**Parâmetros**:
- `element`: Elemento HTML onde renderizar
- `definition`: Definição do diagrama em sintaxe Mermaid

**Retorna**: Promise que resolve quando renderizado

#### `init(): Promise<void>`
Inicializa o serviço Mermaid.

**Retorna**: Promise que resolve quando inicializado

---

## PlotlyService

Serviço para renderização de gráficos Plotly.

**Instância**: `plotlyService` (singleton)

### Métodos

#### `render(element: HTMLElement, config: any): Promise<void>`
Renderiza um gráfico Plotly.

**Parâmetros**:
- `element`: Elemento HTML onde renderizar
- `config`: Configuração do gráfico Plotly

**Retorna**: Promise que resolve quando renderizado

---

## ChartService

Serviço para renderização de gráficos Chart.js.

**Instância**: `chartService` (singleton)

### Métodos

#### `render(element: HTMLElement, config: any): Chart | null`
Renderiza um gráfico Chart.js.

**Parâmetros**:
- `element`: Elemento canvas onde renderizar
- `config`: Configuração do gráfico Chart.js

**Retorna**: Instância do Chart ou null

---

## MathService

Serviço para processamento matemático usando Math.js.

**Instância**: `mathService` (singleton)

### Métodos

#### `evaluate(expression: string, scope?: Record<string, any>): any`
Avalia uma expressão matemática.

**Parâmetros**:
- `expression`: Expressão matemática
- `scope`: Escopo de variáveis opcional

**Retorna**: Resultado da avaliação

#### `createCalculator(element: HTMLElement): void`
Cria uma calculadora interativa em um elemento.

**Parâmetros**:
- `element`: Elemento HTML onde criar a calculadora

---

## CytoscapeService

Serviço para visualização de grafos usando Cytoscape.js.

**Instância**: `cytoscapeService` (singleton)

### Métodos

#### `render(element: HTMLElement, config: any): void`
Renderiza um grafo Cytoscape.

**Parâmetros**:
- `element`: Elemento HTML onde renderizar
- `config`: Configuração do grafo (nodes, edges, layout)

---

## GSAPService

Serviço para processamento de animações GSAP.

**Export**: Função `processGSAPAnimations`

### Funções

#### `processGSAPAnimations(container: HTMLElement): void`
Processa todos os elementos com atributo `data-gsap` e cria animações.

**Parâmetros**:
- `container`: Container HTML a processar

**Uso**:
```html
<div data-gsap='{"animation": "sequentialSearch", "array": [1,2,3,4,5], "target": 3}'></div>
```

**Tipos de animação suportados**:
- `sequentialSearch` - Busca sequencial
- `binarySearchTrace` - Busca binária
- `fadeIn` - Fade in genérico
- `slideIn` - Slide in genérico

---

## TippyService

Serviço para processamento de tooltips Tippy.js.

**Export**: Função `processTippyTooltips`

### Funções

#### `processTippyTooltips(container: HTMLElement): void`
Processa todos os elementos com atributo `data-tippy` e cria tooltips.

**Parâmetros**:
- `container`: Container HTML a processar

**Uso**:
```html
<button data-tippy="Explicação do botão">Botão</button>
```

---

## LibraryResearchService

Serviço para pesquisa e recomendação de bibliotecas baseado no tipo de disciplina.

**Instância**: `libraryResearchService` (singleton)

### Métodos

#### `getRecommendedLibraries(disciplineType: string): Promise<string[]>`
Obtém bibliotecas recomendadas para um tipo de disciplina.

**Parâmetros**:
- `disciplineType`: Tipo da disciplina

**Retorna**: Promise com array de nomes de bibliotecas

#### `getLibraryInfo(libraryName: string): Promise<any>`
Obtém informações sobre uma biblioteca.

**Parâmetros**:
- `libraryName`: Nome da biblioteca

**Retorna**: Promise com informações da biblioteca

---

## DisciplineExportService

Serviço para exportar e importar disciplinas como arquivos Markdown.

**Export**: Funções `exportDisciplineToMarkdown`, `importDisciplineFromMarkdown`, `syncDisciplineWithFile`

### Funções

#### `exportDisciplineToMarkdown(discipline: Discipline, disciplineId: string): Promise<void>`
Exporta uma disciplina completa para um arquivo Markdown.

**Parâmetros**:
- `discipline`: Disciplina a ser exportada
- `disciplineId`: ID da disciplina

**Retorna**: Promise que resolve quando o arquivo é baixado

#### `importDisciplineFromMarkdown(markdown: string): { discipline: Discipline; disciplineId: string }`
Importa uma disciplina de um arquivo Markdown.

**Parâmetros**:
- `markdown`: Conteúdo Markdown da disciplina

**Retorna**: Objeto com disciplina e ID

**Throws**: Error se Markdown inválido

#### `syncDisciplineWithFile(disciplineId: string, filePath: string): Promise<void>`
Sincroniza uma disciplina com um arquivo Markdown.

**Parâmetros**:
- `disciplineId`: ID da disciplina
- `filePath`: Caminho do arquivo Markdown

**Retorna**: Promise que resolve quando sincronizado

---

## Utilitários

### `createId(title: string): string`
Gera um ID único baseado no título.

**Arquivo**: `src/utils/idGenerator.ts`

**Parâmetros**:
- `title`: Título da disciplina

**Retorna**: ID normalizado

### Utilitários de DOM

#### `waitForDOMReady(): Promise<void>`
Aguarda o DOM estar completamente carregado.

**Arquivo**: `src/utils/domHelpers.ts`

**Retorna**: Promise que resolve quando DOM está pronto

### Utilitários de Animações

#### `fadeIn(element: HTMLElement, duration?: number): Promise<void>`
Executa animação de fade in.

**Arquivo**: `src/utils/animations.ts`

**Parâmetros**:
- `element`: Elemento a animar
- `duration`: Duração em ms (padrão: 300)

**Retorna**: Promise que resolve quando animação termina

#### `fadeOut(element: HTMLElement, duration?: number): Promise<void>`
Executa animação de fade out.

**Arquivo**: `src/utils/animations.ts`

**Parâmetros**:
- `element`: Elemento a animar
- `duration`: Duração em ms (padrão: 300)

**Retorna**: Promise que resolve quando animação termina

#### `fadeInUp(element: HTMLElement, duration?: number): Promise<void>`
Executa animação de fade in com movimento para cima.

**Arquivo**: `src/utils/animations.ts`

#### `fadeInDown(element: HTMLElement, duration?: number): Promise<void>`
Executa animação de fade in com movimento para baixo.

**Arquivo**: `src/utils/animations.ts`

#### `fadeInScale(element: HTMLElement, duration?: number): Promise<void>`
Executa animação de fade in com escala.

**Arquivo**: `src/utils/animations.ts`

### Utilitários de Disciplinas

#### `detectDisciplineType(title: string, description?: string): DisciplineType`
Detecta o tipo de disciplina baseado no título e descrição.

**Arquivo**: `src/utils/disciplineTypeDetector.ts`

**Parâmetros**:
- `title`: Título da disciplina
- `description`: Descrição opcional

**Retorna**: Tipo de disciplina detectado

#### `getRecommendedLibraries(type: DisciplineType): string[]`
Obtém bibliotecas recomendadas para um tipo de disciplina.

**Arquivo**: `src/utils/disciplineTypeDetector.ts`

**Parâmetros**:
- `type`: Tipo de disciplina

**Retorna**: Array de nomes de bibliotecas

#### `getRecommendedLibrariesWithInfo(type: DisciplineType): Promise<RecommendedLibrary[]>`
Obtém bibliotecas recomendadas com informações detalhadas.

**Arquivo**: `src/utils/disciplineTypeDetector.ts`

**Parâmetros**:
- `type`: Tipo de disciplina

**Retorna**: Promise com array de bibliotecas e informações

#### `getDisciplineTypeLabel(type: DisciplineType): string`
Obtém o label legível de um tipo de disciplina.

**Arquivo**: `src/utils/disciplineTypeDetector.ts`

**Parâmetros**:
- `type`: Tipo de disciplina

**Retorna**: Label legível (ex: "Estrutura de Dados")

---

## Eventos Customizados

### `disciplines-updated`
Disparado quando disciplinas são atualizadas.

**Uso**:
```typescript
window.addEventListener('disciplines-updated', () => {
  // Atualizar UI
});
```

### `modal-opened`
Disparado quando modal é aberto.

**Uso**:
```typescript
window.addEventListener('modal-opened', () => {
  // Ação ao abrir modal
});
```

### `modal-closed`
Disparado quando modal é fechado.

**Uso**:
```typescript
window.addEventListener('modal-closed', () => {
  // Ação ao fechar modal
});
```

### `navigation-change`
Disparado quando navegação muda.

**Uso**:
```typescript
window.addEventListener('navigation-change', ((e: CustomEvent) => {
  const itemId = e.detail?.itemId;
  // Navegar para itemId
}) as EventListener);
```

### `open-command-palette`
Disparado para abrir CommandPalette.

**Uso**:
```typescript
window.dispatchEvent(new CustomEvent('open-command-palette'));
```

---

## Padrão de Uso

Todos os serviços seguem o padrão singleton e são exportados via barrel exports:

```typescript
import { dataService, themeService, geminiService } from '@/services';
import { markdownService, latexService } from '@/services';
```

Para funções utilitárias:

```typescript
import { processGSAPAnimations, processTippyTooltips } from '@/services';
```

Para serviços de exportação:

```typescript
import { exportDisciplineToMarkdown, importDisciplineFromMarkdown } from '@/services/disciplineExportService';
```
