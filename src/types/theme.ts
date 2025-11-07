/**
 * Tipos de tema disponíveis na aplicação
 */
export type ThemeType =
  | 'rgb'
  | 'red'
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'cyan'
  | 'pink'
  | 'yellow'
  | 'monochrome'
  | 'neon';

/**
 * Configuração de um tema
 */
export interface ThemeConfig {
  /** Cor de destaque principal */
  primaryHighlight: string;
  /** Gradiente linear principal */
  gradientMain: string;
  /** Gradiente cônico */
  gradientConic: string;
}

/**
 * Configurações de todos os temas
 */
export type ThemeConfigs = Record<ThemeType, ThemeConfig>;

