# Sistema de Temas

## Visão Geral

O KhromaAcademy possui um sistema de temas que permite alternar entre modo escuro e claro.

## Temas Disponíveis

- **Dark**: Modo escuro (padrão)
- **Light**: Modo claro

## Implementação Técnica

### CSS Variables

Cada tema define variáveis CSS específicas:

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

### Variáveis de Tema

- `--primary-highlight`: Cor principal de destaque
- `--gradient-main`: Gradiente linear principal
- `--gradient-conic`: Gradiente cônico para bordas

### Aplicação de Temas

O tema é aplicado via atributo `data-theme` no elemento raiz:

```typescript
document.documentElement.setAttribute('data-theme', 'dark');
document.body.setAttribute('data-theme', 'dark');
```

### Persistência

O tema selecionado é salvo no `localStorage` e restaurado automaticamente na próxima visita.

## Uso Programático

```typescript
import { themeService } from '@/services';

// Aplicar tema
themeService.applyTheme('dark');
themeService.applyTheme('light');

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
- Todos os componentes da aplicação

## Boas Práticas

1. **Contraste**: Garanta contraste adequado para acessibilidade
2. **Consistência**: Mantenha o mesmo padrão de cores em todo o tema
3. **Gradientes**: Use gradientes suaves para melhor experiência visual
4. **Teste**: Teste o tema em diferentes seções da aplicação
