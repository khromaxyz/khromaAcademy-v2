# Prompt: Criação do Menu de Navegação - Khroma Academy

## Contexto do Site

O **Khroma Academy** é uma plataforma educacional moderna focada em Ciência da Computação. É um ambiente de aprendizado interativo onde estudantes podem explorar disciplinas, visualizar conteúdos educacionais e gerenciar seu progresso de estudos.

A plataforma possui uma identidade visual única: tema escuro (dark theme) com acentos RGB vibrantes (vermelho, verde, azul, magenta, ciano, amarelo) que criam uma experiência visual moderna e imersiva. O design é minimalista, limpo e focado na experiência do usuário.

## Design Geral

### Estilo Visual
- **Tema escuro** como base principal
- **Acentos RGB Chroma** vibrantes para elementos interativos e destaques
- **Glassmorphism** com efeitos de vidro fosco e blur sutil
- **Minimalismo** - interface limpa sem elementos desnecessários
- **Micro-interações** suaves em todos os elementos

### Paleta de Cores
- Backgrounds escuros (preto base, superfícies escuras)
- Bordas sutis com transparência
- Cores RGB vibrantes para highlights e interações
- Texto em tons de branco/cinza para contraste

## Funcionalidades do Menu

### Estrutura da Sidebar
O menu é uma **sidebar lateral fixa** posicionada no lado esquerdo da tela, abaixo do header. A estrutura completa inclui:

#### Área Principal de Navegação
- **Home**: Página inicial da plataforma
- **Meus Cursos**: Visualização dos cursos em que o usuário está inscrito
- **Explorar**: Catálogo completo de cursos disponíveis
- **Trilhas**: Caminhos de aprendizado estruturados
- **Agentes**: Painel de agentes de IA disponíveis na plataforma
- **Separador visual**: Linha sutil antes do botão de recolher
- **Recolher/Expandir**: Botão para alternar entre modo compacto e expandido
- **Configurações**: Acesso às configurações da plataforma

#### Rodapé do Menu
- **Perfil do usuário**: Avatar circular com imagem do usuário
- **Informações do usuário**: Nome e status (Online/Offline)
- **Indicador de status**: Ponto colorido animado mostrando se está online

### Estados e Comportamentos

#### Modo Expandido
- Mostra ícones + labels textuais de todos os itens
- Largura completa da sidebar visível
- Todos os elementos (badges, labels, perfil) totalmente visíveis
- Espaçamento confortável entre itens

#### Modo Colapsado
- Mostra apenas os ícones centralizados
- Largura reduzida da sidebar
- Labels e badges ficam ocultos
- Tooltips aparecem ao passar o mouse sobre os itens
- Perfil mostra apenas o avatar

#### Hover Expansion
- Quando colapsado, ao passar o mouse sobre a sidebar, ela expande temporariamente
- Mostra todos os elementos como se estivesse expandido
- Ao sair do mouse, retorna ao estado colapsado
- Transição suave e natural

#### Item Ativo
- Destaque visual claro para a seção/página atual
- Background sutil com cor RGB Chroma
- Indicador lateral (barra vertical) na cor do tema
- Texto/ícone destacado com cor primária

### Interatividade e Recursos

#### Efeitos Visuais
- **Hover effects**: Glow RGB animado nas bordas dos itens ao passar o mouse
- **Click feedback**: Animação de scale ao clicar nos itens
- **Active state**: Background e indicador visual para item selecionado
- **Transições suaves**: Todas as mudanças de estado são animadas

#### Tooltips
- Aparecem quando o menu está colapsado
- Mostram o nome completo do item ao passar o mouse
- Posicionados à direita do item
- Design minimalista com blur e bordas sutis

#### Badges
- Indicadores numéricos opcionais nos itens
- Podem mostrar notificações, contadores ou alertas
- Design circular com cor RGB Chroma
- Animação de pulse quando aparecem

#### Atalhos de Teclado
- Suporte a navegação rápida via teclado
- Atalhos específicos para cada seção (ex: Cmd/Ctrl + H para Home)
- Modal de ajuda mostrando todos os atalhos disponíveis
- Navegação por setas (↑↓) entre itens quando focado

#### Persistência de Estado
- Salva preferência de expandido/colapsado no navegador
- Lembra qual item estava ativo
- Restaura estado ao recarregar a página

#### Eventos e Comunicação
- Dispara eventos customizados ao mudar de seção
- Comunica com outros componentes da aplicação
- Permite integração com sistema de roteamento

### Responsividade

#### Desktop (> 1024px)
- Sidebar sempre visível e fixa no lado esquerdo
- Posicionada abaixo do header (64px de altura)
- Altura total: viewport menos altura do header
- Scroll interno se necessário para muitos itens

#### Tablet (768px - 1024px)
- Sidebar pode iniciar colapsada por padrão
- Comportamento similar ao desktop
- Ajustes de espaçamento para telas médias

#### Mobile (< 768px)
- Sidebar oculta por padrão (fora da tela)
- Botão hamburger no header para abrir/fechar
- Ao abrir, aparece como drawer lateral deslizando da esquerda
- Backdrop escuro com blur cobre o conteúdo principal
- Fecha ao clicar fora ou fazer swipe para a esquerda
- Suporte a gestos de swipe para abrir/fechar
- Quando aberta, mostra todos os elementos (como expandida)

## Diretrizes de Design

### Princípios
1. **Minimalismo**: Menos é mais - apenas elementos essenciais
2. **Clareza**: Navegação intuitiva e fácil de entender
3. **Consistência**: Seguir o padrão visual da plataforma
4. **Performance**: Animações suaves mas não pesadas
5. **Acessibilidade**: Suporte a navegação por teclado e leitores de tela

### Elementos Visuais
- Ícones simples e limpos
- Espaçamento generoso entre itens
- Bordas arredondadas sutis
- Efeitos de glow RGB apenas em interações (hover/active)
- Separadores visuais discretos quando necessário

### Animações
- Transições suaves (não abruptas)
- Efeitos de spring physics para sensação natural
- Feedback imediato em todas as ações
- Respeitar preferências de movimento reduzido

## Notas para a IA

Use sua criatividade para:
- Escolher fontes apropriadas que combinem com o design minimalista
- Criar animações e transições que sejam suaves e modernas
- Decidir sobre detalhes de espaçamento, tamanhos e proporções
- Implementar efeitos visuais que complementem o tema RGB Chroma
- Adaptar o design para diferentes tamanhos de tela de forma elegante

O objetivo é criar um menu que seja **funcional, bonito e alinhado com a identidade visual da plataforma**, mantendo o foco na experiência do usuário e na facilidade de navegação.

