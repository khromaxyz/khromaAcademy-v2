/**
 * Icon Loader Utility
 * Gerencia ícones Lucide dinamicamente com cache
 */

interface IconConfig {
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

// Cache de ícones carregados
const iconCache = new Map<string, string>();

/**
 * Lista de ícones Lucide disponíveis para uso
 */
export const AVAILABLE_ICONS = {
  // Navegação
  arrowLeft: 'arrow-left',
  arrowRight: 'arrow-right',
  chevronDown: 'chevron-down',
  chevronUp: 'chevron-up',
  chevronLeft: 'chevron-left',
  chevronRight: 'chevron-right',
  menu: 'menu',
  x: 'x',
  
  // Conteúdo
  book: 'book',
  bookOpen: 'book-open',
  fileText: 'file-text',
  code: 'code',
  terminal: 'terminal',
  database: 'database',
  layers: 'layers',
  box: 'box',
  package: 'package',
  
  // Ações
  play: 'play',
  pause: 'pause',
  check: 'check',
  checkCircle: 'check-circle',
  circle: 'circle',
  lock: 'lock',
  unlock: 'unlock',
  copy: 'copy',
  download: 'download',
  share: 'share-2',
  bookmark: 'bookmark',
  
  // UI
  info: 'info',
  alertCircle: 'alert-circle',
  alertTriangle: 'alert-triangle',
  lightbulb: 'lightbulb',
  zap: 'zap',
  star: 'star',
  heart: 'heart',
  
  // Tempo e Métricas
  clock: 'clock',
  calendar: 'calendar',
  trendingUp: 'trending-up',
  activity: 'activity',
  
  // Pessoas
  user: 'user',
  users: 'users',
  userCheck: 'user-check',
  
  // Ferramentas
  settings: 'settings',
  search: 'search',
  filter: 'filter',
  edit: 'edit-3',
  trash: 'trash-2',
  
  // Mídia
  video: 'video',
  image: 'image',
  mic: 'mic',
  
  // Comunicação
  messageCircle: 'message-circle',
  mail: 'mail',
  
  // Lista e Organização
  list: 'list',
  grid: 'grid',
  layout: 'layout',
  
  // Outros
  target: 'target',
  award: 'award',
  shield: 'shield',
  cpu: 'cpu',
  globe: 'globe',
} as const;

/**
 * Obtém ícone Lucide por nome
 * @param iconName - Nome do ícone (ex: 'book', 'chevron-down')
 * @param config - Configurações do ícone
 * @returns String HTML do SVG
 */
export function getIcon(
  iconName: string,
  config: IconConfig = {}
): string {
  const {
    size = 20,
    strokeWidth = 2,
    className = '',
    color = 'currentColor',
  } = config;

  const cacheKey = `${iconName}-${size}-${strokeWidth}-${className}-${color}`;
  
  // Retorna do cache se disponível
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  // Gera o SVG
  const svg = `<svg 
    class="lucide-icon ${className}" 
    width="${size}" 
    height="${size}" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="${color}" 
    stroke-width="${strokeWidth}" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    data-lucide="${iconName}"
  ></svg>`;

  // Armazena no cache
  iconCache.set(cacheKey, svg);

  return svg;
}

/**
 * Cria elemento de ícone Lucide
 * @param iconName - Nome do ícone
 * @param config - Configurações do ícone
 * @returns HTMLElement
 */
export function createIconElement(
  iconName: string,
  config: IconConfig = {}
): HTMLElement {
  const container = document.createElement('span');
  container.innerHTML = getIcon(iconName, config);
  const icon = container.firstElementChild as HTMLElement;
  
  // Inicializa o ícone Lucide se disponível
  if (typeof lucide !== 'undefined') {
    lucide.createIcons({
      icons: {
        [iconName]: icon,
      },
    });
  }
  
  return icon;
}

/**
 * Inicializa todos os ícones Lucide na página
 */
export function initializeLucideIcons(): void {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * Limpa o cache de ícones
 */
export function clearIconCache(): void {
  iconCache.clear();
}

/**
 * Tipos para ícones
 */
export type IconName = keyof typeof AVAILABLE_ICONS;

/**
 * Obtém ícone tipado
 */
export function getTypedIcon(
  iconName: IconName,
  config: IconConfig = {}
): string {
  return getIcon(AVAILABLE_ICONS[iconName], config);
}

