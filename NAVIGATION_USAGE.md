# 🎯 Guia de Uso - Menu Lateral Khroma Academy

## 🚀 Como Usar

### Navegação Básica

#### Com Mouse
- **Clique** em qualquer item do menu para navegar
- **Hover** sobre itens para ver efeitos visuais
- **Clique em "Recolher"** para colapsar/expandir o menu
- **Hover no menu colapsado** para expansão temporária

#### Com Teclado
- **Tab**: Navegar entre itens
- **Enter/Space**: Ativar item focado
- **Arrow Down/Up**: Navegar para próximo/anterior item
- **Home**: Ir para primeiro item
- **End**: Ir para último item
- **Escape**: Colapsar menu (se expandido)

#### Mobile
- **Toque no ícone hamburger** (canto superior esquerdo) para abrir
- **Toque fora do menu** para fechar
- **Toque em qualquer item** para navegar e fechar automaticamente

## 📱 Páginas Disponíveis

### Home
- Página inicial com hero section
- Grid/Grafo de disciplinas
- Acesso via: Menu → Home ou URL `#home`

### Cursos
- Visualização completa das disciplinas
- Mesma funcionalidade da página inicial (sem hero)
- Acesso via: Menu → Cursos ou URL `#cursos`

### Trilhas (Em Breve)
- Página placeholder para trilhas de aprendizado
- Acesso via: Menu → Trilhas ou URL `#trilhas`

### Comunidade (Em Breve)
- Página placeholder para comunidade
- Badge com notificações (3)
- Acesso via: Menu → Comunidade ou URL `#comunidade`

### Configurações
- Painel de configurações existente
- Troca de temas
- Customização de cursor
- Gerenciamento de disciplinas
- Acesso via: Menu → Configurações

## 🎨 Funcionalidades Especiais

### Estados do Menu

#### Expandido (Padrão Desktop)
- Largura: 280px
- Mostra ícones + labels + badges
- Perfil do usuário completo visível

#### Colapsado
- Largura: 80px
- Mostra apenas ícones
- Tooltips aparecem ao hover
- Clique em "Recolher" para alternar

#### Hover Expansion (Colapsado)
- Passe o mouse sobre o menu colapsado
- Aguarde 300ms
- Menu expande temporariamente
- Sai ao remover o mouse

### Badges de Notificação

Atualmente visível em:
- **Comunidade**: 3 notificações

Para atualizar programaticamente:
```javascript
mainNavigation.updateBadge('comunidade', 5); // Atualiza para 5
mainNavigation.updateBadge('comunidade', 0); // Remove badge
```

### Perfil do Usuário

Localizado no rodapé do menu:
- Avatar com anel animado (progress ring)
- Nome: "Khroma RGB"
- Status: "Online" (indicador verde pulsante)
- Clicável (preparado para futuras ações)

## 🎭 Efeitos Visuais

### Ripple Effect
- Aparece ao clicar em qualquer item
- Efeito de onda expandindo
- Duração: 600ms

### Glow Effect
- Itens ativos têm glow verde
- Intensifica ao hover
- Suaviza ao sair

### Animações de Entrada
- Logo aparece com bounce
- Itens aparecem em sequência (stagger)
- Delay de 50ms entre cada item

### Transições de Página
- Fade out da página atual (200ms)
- Troca de conteúdo
- Fade in da nova página (200ms)
- Scroll automático para o topo

## 🔧 Customização

### Persistência de Estado

O menu salva automaticamente:
- Estado expandido/colapsado
- Página ativa atual

Dados salvos em `localStorage`:
```javascript
localStorage.getItem('nav-collapsed') // "true" ou "false"
localStorage.getItem('nav-active')    // "home", "cursos", etc.
```

### Programação

#### Navegar Programaticamente
```javascript
// Via router
router.navigateTo('cursos');

// Via menu (também atualiza router)
mainNavigation.setActive('cursos');
```

#### Controlar Estado do Menu
```javascript
mainNavigation.expand();   // Expandir
mainNavigation.collapse(); // Colapsar
mainNavigation.toggle();   // Alternar
```

#### Escutar Eventos
```javascript
// Mudança de navegação
window.addEventListener('navigation-change', (e) => {
  console.log('Navegou para:', e.detail.itemId);
});

// Toggle do menu
window.addEventListener('navigation-toggle', (e) => {
  console.log('Menu colapsado:', e.detail.collapsed);
});

// Mudança de página (router)
window.addEventListener('page-change', (e) => {
  console.log('Página mudou para:', e.detail.pageId);
});
```

## 🎯 Atalhos de Teclado

### Globais
- `Esc`: Colapsar menu (se expandido)

### Dentro do Menu (quando focado)
- `↓`: Próximo item
- `↑`: Item anterior
- `Home`: Primeiro item
- `End`: Último item
- `Enter` ou `Space`: Ativar item

## 📱 Comportamento Responsivo

### Desktop (> 1024px)
- Menu sempre visível
- Expandido por padrão
- Pode ser colapsado manualmente

### Tablet (768px - 1024px)
- Menu sempre visível
- Colapsado por padrão
- Pode ser expandido manualmente

### Mobile (< 768px)
- Menu oculto por padrão
- Botão hamburger visível
- Overlay ao abrir
- Backdrop com blur
- Fecha ao clicar fora ou navegar

## 🎨 Temas

O menu se adapta automaticamente ao tema ativo:
- Cores primárias do tema
- Gradientes personalizados
- Glow effects na cor do tema

Temas disponíveis:
- RGB (padrão)
- Red, Green, Blue
- Purple, Orange, Cyan
- Pink, Yellow
- Monochrome, Neon

## 🐛 Solução de Problemas

### Menu não aparece
- Verifique se o container `#main-navigation-container` existe no HTML
- Verifique se o JavaScript foi carregado
- Abra o console para ver erros

### Menu sobrepõe conteúdo
- Verifique se o body tem `padding-left` correto
- Classes `nav-collapsed` devem estar funcionando
- Verifique z-index de outros elementos

### Animações lentas
- Pode ser `prefers-reduced-motion` ativo
- Verifique performance do dispositivo
- Desative animações extras se necessário

### Mobile: Menu não abre
- Verifique se o botão hamburger foi criado
- Verifique largura da tela (< 768px)
- Tente recarregar a página

## 💡 Dicas

1. **Performance**: O menu usa `will-change` para otimizar animações
2. **Acessibilidade**: Sempre navegável por teclado
3. **Mobile**: Feche o menu após navegar para economizar espaço
4. **Desktop**: Use o modo colapsado para mais espaço de conteúdo
5. **Hover**: No modo colapsado, passe o mouse para ver labels

## 🎉 Easter Eggs

- Clique no logo para uma animação especial
- Hover no avatar para efeitos extras
- Navegação rápida com teclado

---

**Aproveite o novo menu lateral! 🚀**

