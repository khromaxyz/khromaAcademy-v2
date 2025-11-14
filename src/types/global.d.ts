/**
 * Global Type Declarations
 * Declarações de tipos para bibliotecas externas e globais
 */

/**
 * Vite Environment Variables
 */
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Lucide Icons Library
 */
declare const lucide: {
  createIcons: (options?: {
    attrs?: Record<string, string>;
    icons?: Record<string, HTMLElement>;
    baseElement?: HTMLElement;
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

