/**
 * Accordion Component
 * Componente expansível para FAQ e conteúdo colapsável
 */

import './Accordion.css';

export interface AccordionItem {
  title: string;
  content: string;
  isOpen?: boolean;
  icon?: string;
}

export interface AccordionOptions {
  allowMultiple?: boolean;
  className?: string;
  animationDuration?: number;
}

/**
 * Classe Accordion para criar listas expansíveis
 */
export class Accordion {
  private container: HTMLElement;
  private items: AccordionItem[];
  private options: AccordionOptions;
  private openIndices: Set<number>;

  constructor(items: AccordionItem[], options: AccordionOptions = {}) {
    this.items = items;
    this.options = {
      allowMultiple: false,
      animationDuration: 300,
      ...options
    };
    this.openIndices = new Set(
      items.map((item, index) => (item.isOpen ? index : -1)).filter(i => i >= 0)
    );
    this.container = this.create();
  }

  /**
   * Cria o elemento accordion
   */
  private create(): HTMLElement {
    const accordion = document.createElement('div');
    accordion.className = `accordion ${this.options.className || ''}`.trim();

    this.items.forEach((item, index) => {
      const accordionItem = this.createItem(item, index);
      accordion.appendChild(accordionItem);
    });

    return accordion;
  }

  /**
   * Cria um item do accordion
   */
  private createItem(item: AccordionItem, index: number): HTMLElement {
    const isOpen = this.openIndices.has(index);

    const itemElement = document.createElement('div');
    itemElement.className = `accordion-item ${isOpen ? 'is-open' : ''}`;
    itemElement.dataset.index = String(index);

    const header = document.createElement('button');
    header.className = 'accordion-header';
    header.setAttribute('aria-expanded', String(isOpen));
    header.innerHTML = `
      ${item.icon ? `<span class="accordion-icon">${item.icon}</span>` : ''}
      <span class="accordion-title">${item.title}</span>
      <span class="accordion-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    `;

    const content = document.createElement('div');
    content.className = 'accordion-content';
    content.innerHTML = `<div class="accordion-content-inner">${item.content}</div>`;

    if (!isOpen) {
      content.style.maxHeight = '0';
      content.style.opacity = '0';
    }

    header.addEventListener('click', () => this.toggle(index));

    itemElement.appendChild(header);
    itemElement.appendChild(content);

    return itemElement;
  }

  /**
   * Alterna o estado de um item
   */
  private toggle(index: number): void {
    const isCurrentlyOpen = this.openIndices.has(index);

    // Se não permite múltiplos, fechar todos
    if (!this.options.allowMultiple && !isCurrentlyOpen) {
      Array.from(this.openIndices).forEach(i => this.close(i));
    }

    if (isCurrentlyOpen) {
      this.close(index);
    } else {
      this.open(index);
    }
  }

  /**
   * Abre um item
   */
  private open(index: number): void {
    const item = this.container.querySelector(`[data-index="${index}"]`);
    if (!item) return;

    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content') as HTMLElement;
    const contentInner = content?.querySelector('.accordion-content-inner') as HTMLElement;

    if (!content || !contentInner) return;

    item.classList.add('is-open');
    header?.setAttribute('aria-expanded', 'true');
    this.openIndices.add(index);

    // Calcular altura real
    const height = contentInner.scrollHeight;

    // Animar abertura
    content.style.maxHeight = `${height}px`;
    content.style.opacity = '1';

    // Remover max-height após animação para permitir conteúdo dinâmico
    setTimeout(() => {
      if (item.classList.contains('is-open')) {
        content.style.maxHeight = 'none';
      }
    }, this.options.animationDuration || 300);
  }

  /**
   * Fecha um item
   */
  private close(index: number): void {
    const item = this.container.querySelector(`[data-index="${index}"]`);
    if (!item) return;

    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content') as HTMLElement;
    const contentInner = content?.querySelector('.accordion-content-inner') as HTMLElement;

    if (!content || !contentInner) return;

    // Definir altura atual antes de fechar
    content.style.maxHeight = `${contentInner.scrollHeight}px`;

    // Forçar reflow
    void content.offsetHeight;

    // Animar fechamento
    content.style.maxHeight = '0';
    content.style.opacity = '0';

    setTimeout(() => {
      item.classList.remove('is-open');
      header?.setAttribute('aria-expanded', 'false');
      this.openIndices.delete(index);
    }, this.options.animationDuration || 300);
  }

  /**
   * Abre todos os items
   */
  openAll(): void {
    this.items.forEach((_, index) => {
      if (!this.openIndices.has(index)) {
        this.open(index);
      }
    });
  }

  /**
   * Fecha todos os items
   */
  closeAll(): void {
    Array.from(this.openIndices).forEach(index => this.close(index));
  }

  /**
   * Retorna o elemento container
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Método estático para criar accordion facilmente
   */
  static create(items: AccordionItem[], options?: AccordionOptions): HTMLElement {
    const accordion = new Accordion(items, options);
    return accordion.getElement();
  }

  /**
   * Inicializa todos os accordions em um container
   */
  static initAll(_container: HTMLElement): void {
    // Método placeholder - accordions são auto-inicializados quando criados
    // Este método existe para manter consistência na API
  }
}

