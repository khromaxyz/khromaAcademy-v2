/**
 * Spinner Loading Component
 * Componente de loading spinner animado
 */

import './Spinner.css';

export interface SpinnerOptions {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | string;
  color?: string;
  thickness?: string;
  speed?: 'slow' | 'normal' | 'fast';
  variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'ring';
  className?: string;
  label?: string;
}

/**
 * Classe Spinner para criar loading indicators
 */
export class Spinner {
  /**
   * Cria um spinner element
   */
  static create(options: SpinnerOptions = {}): HTMLElement {
    const {
      size = 'medium',
      color = 'var(--primary-highlight)',
      thickness = '3px',
      speed = 'normal',
      variant = 'default',
      className = '',
      label = 'Carregando...'
    } = options;

    const container = document.createElement('div');
    container.className = `spinner-container ${className}`.trim();
    container.setAttribute('role', 'status');
    container.setAttribute('aria-label', label);

    let spinner: HTMLElement;

    switch (variant) {
      case 'dots':
        spinner = this.createDotsSpinner();
        break;
      case 'pulse':
        spinner = this.createPulseSpinner();
        break;
      case 'bars':
        spinner = this.createBarsSpinner();
        break;
      case 'ring':
        spinner = this.createRingSpinner();
        break;
      default:
        spinner = this.createDefaultSpinner();
    }

    spinner.className += ` spinner-${variant} spinner-${speed}`;
    
    // Set size
    const sizeMap = {
      small: '20px',
      medium: '40px',
      large: '60px',
      xlarge: '80px'
    };
    const spinnerSize = sizeMap[size as keyof typeof sizeMap] || size;
    spinner.style.width = spinnerSize;
    spinner.style.height = spinnerSize;

    // Set color
    spinner.style.setProperty('--spinner-color', color);
    spinner.style.setProperty('--spinner-thickness', thickness);

    container.appendChild(spinner);

    // Acessibilidade
    const srOnly = document.createElement('span');
    srOnly.className = 'sr-only';
    srOnly.textContent = label;
    container.appendChild(srOnly);

    return container;
  }

  /**
   * Spinner padrão (circular)
   */
  private static createDefaultSpinner(): HTMLElement {
    const spinner = document.createElement('div');
    spinner.className = 'spinner spinner-default';
    return spinner;
  }

  /**
   * Spinner de pontos
   */
  private static createDotsSpinner(): HTMLElement {
    const spinner = document.createElement('div');
    spinner.className = 'spinner spinner-dots';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'spinner-dot';
      spinner.appendChild(dot);
    }
    
    return spinner;
  }

  /**
   * Spinner de pulse
   */
  private static createPulseSpinner(): HTMLElement {
    const spinner = document.createElement('div');
    spinner.className = 'spinner spinner-pulse';
    
    for (let i = 0; i < 2; i++) {
      const ring = document.createElement('div');
      ring.className = 'spinner-pulse-ring';
      spinner.appendChild(ring);
    }
    
    return spinner;
  }

  /**
   * Spinner de barras
   */
  private static createBarsSpinner(): HTMLElement {
    const spinner = document.createElement('div');
    spinner.className = 'spinner spinner-bars';
    
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.className = 'spinner-bar';
      spinner.appendChild(bar);
    }
    
    return spinner;
  }

  /**
   * Spinner de anel
   */
  private static createRingSpinner(): HTMLElement {
    const spinner = document.createElement('div');
    spinner.className = 'spinner spinner-ring';
    
    for (let i = 0; i < 4; i++) {
      const ring = document.createElement('div');
      ring.className = 'spinner-ring-piece';
      spinner.appendChild(ring);
    }
    
    return spinner;
  }

  /**
   * Cria um spinner inline (pequeno, para botões)
   */
  static inline(color = 'currentColor'): HTMLElement {
    return this.create({
      size: 'small',
      color,
      variant: 'default',
      className: 'spinner-inline'
    });
  }

  /**
   * Cria um spinner de página inteira (overlay)
   */
  static fullPage(options: Partial<SpinnerOptions> = {}): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'spinner-overlay';
    
    const spinner = this.create({
      size: 'large',
      ...options
    });
    
    overlay.appendChild(spinner);
    
    // Mensagem opcional
    if (options.label) {
      const label = document.createElement('div');
      label.className = 'spinner-label';
      label.textContent = options.label;
      overlay.appendChild(label);
    }
    
    return overlay;
  }

  /**
   * Cria um spinner com mensagem
   */
  static withLabel(label: string, options: Partial<SpinnerOptions> = {}): HTMLElement {
    const container = document.createElement('div');
    container.className = 'spinner-with-label';
    
    const spinner = this.create({
      ...options,
      label
    });
    
    const labelElement = document.createElement('div');
    labelElement.className = 'spinner-label-text';
    labelElement.textContent = label;
    
    container.appendChild(spinner);
    container.appendChild(labelElement);
    
    return container;
  }

  /**
   * Mostra spinner em um elemento (substitui conteúdo)
   */
  static show(element: HTMLElement, options: SpinnerOptions = {}): () => void {
    const originalContent = element.innerHTML;
    const spinner = this.create(options);
    
    element.innerHTML = '';
    element.appendChild(spinner);
    element.classList.add('is-loading');
    
    // Retorna função para remover o spinner
    return () => {
      element.innerHTML = originalContent;
      element.classList.remove('is-loading');
    };
  }

  /**
   * Mostra spinner de página inteira
   */
  static showFullPage(options: Partial<SpinnerOptions> = {}): () => void {
    const spinner = this.fullPage(options);
    document.body.appendChild(spinner);
    document.body.classList.add('spinner-active');
    
    // Retorna função para remover o spinner
    return () => {
      spinner.style.opacity = '0';
      setTimeout(() => {
        spinner.remove();
        document.body.classList.remove('spinner-active');
      }, 300);
    };
  }
}

/**
 * Loading Button - adiciona spinner a botão
 */
export class LoadingButton {
  private button: HTMLButtonElement;
  private originalContent: string;
  private spinner: HTMLElement | null = null;
  private isLoading = false;

  constructor(button: HTMLButtonElement) {
    this.button = button;
    this.originalContent = button.innerHTML;
  }

  /**
   * Inicia loading
   */
  start(label = 'Carregando...'): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.button.disabled = true;
    this.originalContent = this.button.innerHTML;

    this.spinner = Spinner.inline();
    this.button.innerHTML = '';
    this.button.appendChild(this.spinner);

    if (label) {
      const text = document.createElement('span');
      text.textContent = label;
      text.style.marginLeft = 'var(--space-s)';
      this.button.appendChild(text);
    }

    this.button.classList.add('btn-loading');
  }

  /**
   * Para loading
   */
  stop(): void {
    if (!this.isLoading) return;

    this.isLoading = false;
    this.button.disabled = false;
    this.button.innerHTML = this.originalContent;
    this.button.classList.remove('btn-loading');
    this.spinner = null;
  }

  /**
   * Verifica se está loading
   */
  get loading(): boolean {
    return this.isLoading;
  }
}

