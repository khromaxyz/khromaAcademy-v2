/**
 * Callout Component
 * Componente de destaque para informações importantes
 */

import './Callout.css';

export type CalloutType = 'info' | 'warning' | 'tip' | 'danger' | 'success';

export interface CalloutOptions {
  type?: CalloutType;
  title?: string;
  icon?: string;
  className?: string;
}

/**
 * Classe Callout para criar blocos de destaque
 */
export class Callout {
  /**
   * Ícones padrão por tipo
   */
  private static icons: Record<CalloutType, string> = {
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`,
    tip: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
      <path d="M9 21h6"></path>
    </svg>`,
    danger: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`,
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>`
  };

  /**
   * Títulos padrão por tipo
   */
  private static titles: Record<CalloutType, string> = {
    info: 'Informação',
    warning: 'Atenção',
    tip: 'Dica',
    danger: 'Cuidado',
    success: 'Sucesso'
  };

  /**
   * Cria um elemento callout
   */
  static create(content: string, options: CalloutOptions = {}): HTMLElement {
    const {
      type = 'info',
      title = this.titles[type],
      icon = this.icons[type],
      className = ''
    } = options;

    const callout = document.createElement('div');
    callout.className = `callout callout-${type} ${className}`.trim();

    callout.innerHTML = `
      <div class="callout-header">
        <div class="callout-icon">${icon}</div>
        <div class="callout-title">${title}</div>
      </div>
      <div class="callout-content">${content}</div>
    `;

    return callout;
  }

  /**
   * Métodos de conveniência para tipos específicos
   */
  static info(content: string, title?: string): HTMLElement {
    return this.create(content, { type: 'info', title });
  }

  static warning(content: string, title?: string): HTMLElement {
    return this.create(content, { type: 'warning', title });
  }

  static tip(content: string, title?: string): HTMLElement {
    return this.create(content, { type: 'tip', title });
  }

  static danger(content: string, title?: string): HTMLElement {
    return this.create(content, { type: 'danger', title });
  }

  static success(content: string, title?: string): HTMLElement {
    return this.create(content, { type: 'success', title });
  }
}

