# Arquitetura do Projeto

## Visão Geral

O KhromaAcademy é uma aplicação vanilla TypeScript organizada em módulos, seguindo princípios de separação de responsabilidades e reutilização de código.

## Estrutura de Pastas

### `/src/types`
Contém todas as definições TypeScript de tipos e interfaces:
- `discipline.ts` - Tipos relacionados a disciplinas
- `theme.ts` - Tipos relacionados a temas
- `cursor.ts` - Tipos relacionados ao cursor customizado

### `/src/services`
Serviços singleton que gerenciam estado e lógica de negócio:
- `dataService.ts` - Gerenciamento de dados (localStorage, fetch)
- `themeService.ts` - Gerenciamento de temas
- `cursorService.ts` - Gerenciamento do cursor customizado

### `/src/components`
Componentes modulares organizados por funcionalidade:
- Cada componente tem seu próprio arquivo TypeScript e CSS
- Componentes são classes que encapsulam lógica e renderização
- Exemplos: Header, Modal, AdminPanel, KnowledgeGraph

### `/src/utils`
Funções utilitárias reutilizáveis:
- `idGenerator.ts` - Geração de IDs únicos
- `domHelpers.ts` - Helpers para manipulação DOM
- `animations.ts` - Funções de animação

### `/src/styles`
Módulos CSS organizados por propósito:
- `variables.css` - Design tokens (CSS Variables)
- `animations.css` - Keyframes e animações
- `themes.css` - Definições de temas
- `global.css` - Estilos globais
- Componentes específicos têm seus próprios arquivos CSS

## Fluxo de Dados

```
User Action → Component → Service → Data Storage (localStorage/JSON)
                    ↓
              Update UI
```

## Padrões Utilizados

### Singleton Pattern
Serviços utilizam padrão singleton para garantir uma única instância:
```typescript
export const dataService = new DataService();
```

### Event-Driven Architecture
Componentes comunicam-se via eventos customizados:
```typescript
window.dispatchEvent(new CustomEvent('disciplines-updated'));
```

### Component Lifecycle
Componentes seguem um padrão de inicialização:
1. `init()` - Configuração inicial
2. Renderização
3. Event listeners
4. Cleanup (quando necessário)

## Build e Deploy

O projeto utiliza Vite como bundler:
- **Desenvolvimento**: HMR (Hot Module Replacement) para desenvolvimento rápido
- **Produção**: Build otimizado com tree-shaking e minificação

## Dependências

- **Vite**: Build tool e dev server
- **TypeScript**: Tipagem estática
- **ESLint + Prettier**: Linting e formatação

## Princípios de Design

1. **Separação de Responsabilidades**: Cada módulo tem uma responsabilidade clara
2. **Reutilização**: Componentes e utilitários são reutilizáveis
3. **Tipagem Forte**: TypeScript em modo strict
4. **Performance**: Lazy loading e otimizações quando necessário
5. **Acessibilidade**: ARIA labels e suporte a navegação por teclado

