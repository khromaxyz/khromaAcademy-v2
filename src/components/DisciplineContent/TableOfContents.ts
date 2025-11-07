/**
 * Table of Contents Component
 * ToC com scroll spy e smooth scrolling
 */

import './TableOfContents.css';
import { smoothScrollTo } from '@/utils/animations';
import { ScrollSpy } from '@/utils/intersectionObserver';

export interface ToCItem {
  id: string;
  title: string;
  level: number;
}

export interface ToCOptions {
  title?: string;
  className?: string;
  selector?: string;
}

/**
 * Classe TableOfContents
 */
export class TableOfContents {
  private container: HTMLElement;
  private items: ToCItem[];
  private options: ToCOptions;
  private scrollSpy: ScrollSpy | null = null;

  constructor(items: ToCItem[], options: ToCOptions = {}) {
    this.items = items;
    this.options = {
      title: 'Nesta Página',
      ...options
    };
    this.container = this.create();
  }

  /**
   * Cria o ToC
   */
  private create(): HTMLElement {
    const toc = document.createElement('aside');
    toc.className = `table-of-contents ${this.options.className || ''}`.trim();
    toc.setAttribute('role', 'navigation');

    toc.innerHTML = `
      <div class="toc-header">
        <h3 class="toc-title">${this.options.title}</h3>
      </div>
      <nav class="toc-nav">
        <ul class="toc-list">
          ${this.items.map(item => this.renderItem(item)).join('')}
        </ul>
      </nav>
    `;

    this.setupLinks();
    return toc;
  }

  /**
   * Renderiza um item
   */
  private renderItem(item: ToCItem): string {
    return `
      <li class="toc-item toc-item-level-${item.level}">
        <a href="#${item.id}" class="toc-link" data-id="${item.id}">
          ${item.title}
        </a>
      </li>
    `;
  }

  /**
   * Configura links
   */
  private setupLinks(): void {
    const links = this.container.querySelectorAll('.toc-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) {
          const target = document.getElementById(id);
          if (target) {
            smoothScrollTo(target, 100);
          }
        }
      });
    });
  }

  /**
   * Inicializa scroll spy
   */
  initScrollSpy(): void {
    const selector = this.items.map(item => `#${item.id}`).join(', ');
    this.scrollSpy = new ScrollSpy(selector, '.toc-link', 'active');
  }

  /**
   * Retorna elemento
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Destroy
   */
  destroy(): void {
    this.scrollSpy?.destroy();
  }

  /**
   * Método estático para criar ToC automaticamente
   */
  static fromHeadings(selector = 'h2, h3', options?: ToCOptions): TableOfContents {
    const headings = document.querySelectorAll<HTMLHeadingElement>(selector);
    const items: ToCItem[] = Array.from(headings).map(heading => ({
      id: heading.id || '',
      title: heading.textContent || '',
      level: parseInt(heading.tagName.substring(1))
    })).filter(item => item.id);

    return new TableOfContents(items, options);
  }

  static create(items: ToCItem[], options?: ToCOptions): HTMLElement {
    const toc = new TableOfContents(items, options);
    return toc.getElement();
  }
}

