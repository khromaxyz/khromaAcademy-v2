/**
 * Global Type Declarations
 * Declarações de tipos para bibliotecas externas e globais
 */

/**
 * Lucide Icons Library
 */
declare const lucide: {
  createIcons: (options?: {
    attrs?: Record<string, string>;
    icons?: Record<string, HTMLElement>;
  }) => void;
};

/**
 * Prism.js Syntax Highlighting
 */
declare const Prism: {
  highlightAll: () => void;
  highlightElement: (element: Element) => void;
  highlightAllUnder: (element: Element) => void;
  languages: Record<string, any>;
  plugins: Record<string, any>;
};

