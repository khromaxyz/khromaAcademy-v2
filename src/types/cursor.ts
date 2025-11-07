/**
 * Tipos de cursor customizado disponíveis
 */
export type CursorType = 'classic' | 'dot' | 'square' | 'crosshair' | 'glow' | 'outline';

/**
 * Configurações do cursor
 */
export interface CursorConfig {
  /** Tipo de cursor ativo */
  type: CursorType;
  /** Se o cursor está habilitado */
  enabled: boolean;
}

