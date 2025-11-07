# API de Serviços

## DataService

Gerencia o armazenamento e carregamento de dados das disciplinas.

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

#### `destroy(): void`
Limpa recursos ao destruir o serviço.

---

## Utilitários

### `createId(title: string): string`
Gera um ID único baseado no título.

**Parâmetros**:
- `title`: Título da disciplina

**Retorna**: ID normalizado

### `waitForDOMReady(): Promise<void>`
Aguarda o DOM estar completamente carregado.

**Retorna**: Promise que resolve quando DOM está pronto

### `fadeIn(element: HTMLElement, duration?: number): Promise<void>`
Executa animação de fade in.

**Parâmetros**:
- `element`: Elemento a animar
- `duration`: Duração em ms (padrão: 300)

**Retorna**: Promise que resolve quando animação termina

### `fadeOut(element: HTMLElement, duration?: number): Promise<void>`
Executa animação de fade out.

**Parâmetros**:
- `element`: Elemento a animar
- `duration`: Duração em ms (padrão: 300)

**Retorna**: Promise que resolve quando animação termina

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

