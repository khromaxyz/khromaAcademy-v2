# Design System - Khroma Academy

## Visão Geral

O Khroma Academy utiliza um design system baseado em **dark theme** com acentos **RGB Chroma** vibrantes, criando uma experiência visual moderna e imersiva com efeitos dinâmicos e interações fluidas.

## Paleta de Cores

### Cores Principais (RGB Chroma)
- **Magenta Neon**: `#FF00C1`
- **Cyan Cyber**: `#00FFF9`
- **Deep Purple**: `#9400FF`
- **Vermelho**: `#FF4141`
- **Verde**: `#41FF41`
- **Azul**: `#4141FF`
- **Amarelo**: `#F2FF41`

### Background Dark (Padrão)
- **Preto Base**: `#0a0a0a`
- **Superfície**: `#151515`
- **Superfície Elevada**: `#1f1f1f`
- **Bordas**: `rgba(255, 255, 255, 0.08)`

### Background Light
- **Branco Base**: `#ffffff`
- **Superfície**: `#fafafa`
- **Superfície Elevada**: `#f5f6f8`
- **Bordas**: `rgba(0, 0, 0, 0.08)`

## Efeitos Visuais Principais

### Bordas RGB Chroma Dinâmicas

Elementos interativos possuem bordas animadas que aparecem no hover usando gradientes cônicos RGB:

- **Cards de Disciplina**: Borda RGB Chroma animada aparece ao passar o mouse, criando um efeito de "aurora" ao redor do card
- **Botões**: Bordas com gradiente cônico que rotaciona e muda de cor
- **Itens de Navegação**: Glow RGB sutil na lateral esquerda quando ativo ou em hover
- **Elementos Interativos**: Bordas que mudam de cor dinamicamente seguindo o espectro RGB

### Glassmorphism

Efeitos de vidro fosco aplicados em:
- **Cards**: Background com blur e saturação para efeito de vidro
- **Painéis**: Transparência com backdrop-filter
- **Modais**: Overlay com blur para profundidade
- **Sidebar**: Background semi-transparente com blur

### Glow e Aurora Effects

- **Glow RGB**: Efeito de brilho ao redor de elementos interativos usando cores RGB Chroma
- **Aurora Glow**: Animação que percorre o espectro RGB (vermelho → amarelo → verde → ciano → azul → magenta)
- **Box Shadow Dinâmico**: Sombras que mudam de cor baseado no hover e estado ativo

## Micro-interações

### Hover States

- **Cards**: Elevação, escala sutil, borda RGB Chroma aparece, glow aumenta
- **Botões**: Transformação para cima, glow intensifica, gradiente anima
- **Links**: Underline animado que cresce do centro
- **Ícones**: Rotação sutil e mudança de cor

### Transições

- **Velocidade**: Transições rápidas (0.2s) para feedback imediato
- **Easing**: Curvas suaves com spring physics para sensação natural
- **Stagger**: Animações sequenciais em listas e grids

### Estados Visuais

- **Active**: Background RGB Chroma sutil, borda destacada, glow visível
- **Hover**: Elevação, glow intensificado, borda RGB Chroma animada
- **Focus**: Ring RGB Chroma ao redor do elemento
- **Loading**: Skeleton screens e spinners com cores RGB Chroma

## Tipografia

- **Headings**: Inter (sans-serif) - Peso 700-900
- **Body**: Inter (sans-serif) - Peso 400-600
- **Code**: JetBrains Mono (monospace) - Peso 400

## Espaçamento

Sistema de espaçamento consistente:
- **XXS**: 4px
- **XS**: 8px
- **S**: 16px
- **M**: 24px
- **L**: 32px
- **XL**: 64px
- **XXL**: 96px

## Bordas e Sombras

- **Border Radius**: 24px (padrão), 12px (pequeno), 32px (grande)
- **Shadows**: Sombras suaves com múltiplas camadas
- **Glow Shadows**: Sombras coloridas RGB Chroma para elementos destacados

## Princípios de Design

1. **Dark First**: Tema escuro como padrão, com modo claro opcional
2. **RGB Accents**: Cores vibrantes para destaque e interatividade
3. **Glassmorphism**: Efeitos de vidro fosco com blur
4. **Minimalismo**: Interface limpa sem elementos desnecessários
5. **Micro-interações**: Animações suaves em todos os elementos
6. **Feedback Imediato**: Resposta visual instantânea a todas as ações
7. **Profundidade**: Uso de elevação, sombras e blur para hierarquia visual

## Elementos Especiais

### Cards de Disciplina
- Background glassmorphism
- Borda RGB Chroma animada no hover (gradiente cônico)
- Elevação e escala no hover
- Glow RGB que intensifica na interação
- Barra de progresso com gradiente RGB

### Botões
- Gradiente RGB animado
- Glow que aumenta no hover
- Transformação 3D sutil
- Estados visuais claros (hover, active, disabled)

### Navegação
- Sidebar com glassmorphism
- Itens com glow RGB lateral quando ativo
- Hover expansion quando colapsado
- Transições suaves entre estados

### Chatbot
- Background transparente com glassmorphism
- Borda RGB Chroma na lateral esquerda
- Mensagens com background escuro e bordas arredondadas
- Input com blur e bordas sutis
- Acentos RGB Chroma para elementos interativos
