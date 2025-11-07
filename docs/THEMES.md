# Sistema de Temas

## Visão Geral

O KhromaAcademy possui um sistema flexível de temas que permite personalizar completamente a aparência da interface.

## Temas Disponíveis

### RGB (Multicolor) - Padrão
Paleta colorida com todas as cores principais.

### Temas Monocromáticos
- **Red**: Vermelho
- **Green**: Verde  
- **Blue**: Azul
- **Purple**: Roxo
- **Orange**: Laranja
- **Cyan**: Ciano
- **Pink**: Rosa
- **Yellow**: Amarelo

### Temas Especiais
- **Monochrome**: Escala de cinza
- **Neon**: Cores neon vibrantes

## Implementação Técnica

### CSS Variables

Cada tema define variáveis CSS específicas:

```css
:root[data-theme="red"] {
  --primary-highlight: #FF4141;
  --gradient-main: linear-gradient(...);
  --gradient-conic: conic-gradient(...);
}
```

### Variáveis de Tema

- `--primary-highlight`: Cor principal de destaque
- `--gradient-main`: Gradiente linear principal
- `--gradient-conic`: Gradiente cônico para bordas

### Aplicação de Temas

O tema é aplicado via atributo `data-theme` no elemento raiz:

```typescript
document.documentElement.setAttribute('data-theme', 'red');
```

### Persistência

O tema selecionado é salvo no `localStorage` e restaurado automaticamente na próxima visita.

## Adicionar Novo Tema

### 1. Adicionar Tipo TypeScript

Em `src/types/theme.ts`:
```typescript
export type ThemeType = 
  | 'rgb'
  | 'red'
  | 'novo-tema'; // Adicionar aqui
```

### 2. Adicionar Configuração

Em `src/services/themeService.ts`:
```typescript
const THEME_CONFIGS: ThemeConfigs = {
  // ... temas existentes
  'novo-tema': {
    primaryHighlight: '#COR',
    gradientMain: 'linear-gradient(...)',
    gradientConic: 'conic-gradient(...)',
  },
};
```

### 3. Adicionar CSS

Em `src/styles/themes.css`:
```css
:root[data-theme="novo-tema"] {
  --primary-highlight: #COR;
  --gradient-main: linear-gradient(...);
  --gradient-conic: conic-gradient(...);
}
```

### 4. Adicionar Botão no HTML

Em `src/index.html`:
```html
<button class="theme-btn-enhanced link" data-theme="novo-tema" title="Novo Tema"></button>
```

### 5. Adicionar Estilo do Botão

Em `src/styles/settings.css`:
```css
.theme-btn-enhanced[data-theme="novo-tema"] {
  background: linear-gradient(...);
}
```

## Uso Programático

```typescript
import { themeService } from '@/services';

// Aplicar tema
themeService.applyTheme('red');

// Salvar tema
themeService.saveTheme();

// Obter tema atual
const currentTheme = themeService.getCurrentTheme();
```

## Elementos que Respondem ao Tema

- Logo e textos com gradiente
- Botões de ação
- Bordas animadas dos cards
- Cursor customizado
- Highlight de elementos interativos
- Progresso visual

## Boas Práticas

1. **Contraste**: Garanta contraste adequado para acessibilidade
2. **Consistência**: Mantenha o mesmo padrão de cores em todo o tema
3. **Gradientes**: Use gradientes suaves para melhor experiência visual
4. **Teste**: Teste o tema em diferentes seções da aplicação

