/**
 * Sidebar Component
 * Sidebar moderna com navegação hierárquica e scroll spy
 */

import './Sidebar.css';
import { smoothScrollTo, debounce } from '@/utils/animations';
import { ScrollSpy } from '@/utils/intersectionObserver';

export interface SidebarSection {
  id: string;
  title: string;
  icon?: string;
  items?: SidebarItem[];
  isExpanded?: boolean;
}

export interface SidebarItem {
  id: string;
  title: string;
  href?: string;
  badge?: string | number;
  items?: SidebarItem[];
}

export interface SidebarOptions {
  title?: string;
  searchPlaceholder?: string;
  className?: string;
  collapsible?: boolean;
}

/**
 * Classe Sidebar para navegação lateral
 */
export class Sidebar {
  private container: HTMLElement;
  private sections: SidebarSection[];
  private options: SidebarOptions;
  private searchInput: HTMLInputElement | null = null;
  private scrollSpy: ScrollSpy | null = null;

  constructor(sections: SidebarSection[], options: SidebarOptions = {}) {
    this.sections = sections;
    this.options = {
      title: 'Navegação',
      searchPlaceholder: 'Buscar...',
      collapsible: true,
      ...options
    };
    this.container = this.create();
  }

  /**
   * Cria o elemento sidebar
   */
  private create(): HTMLElement {
    const sidebar = document.createElement('aside');
    sidebar.className = `sidebar ${this.options.className || ''}`.trim();
    sidebar.setAttribute('role', 'navigation');

    // Header
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.innerHTML = `
      <h2 class="sidebar-title">${this.options.title}</h2>
      <button class="sidebar-close-btn" aria-label="Fechar sidebar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    // Search
    const searchContainer = document.createElement('div');
    searchContainer.className = 'sidebar-search';
    searchContainer.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input 
        type="text" 
        class="sidebar-search-input" 
        placeholder="${this.options.searchPlaceholder}"
        aria-label="Buscar na navegação"
      />
    `;

    // Navigation
    const nav = document.createElement('nav');
    nav.className = 'sidebar-nav';
    this.sections.forEach(section => {
      nav.appendChild(this.createSection(section));
    });

    // Mount
    sidebar.appendChild(header);
    sidebar.appendChild(searchContainer);
    sidebar.appendChild(nav);

    // Setup
    this.setupSearch();
    this.setupCloseButton();

    return sidebar;
  }

  /**
   * Cria uma seção da sidebar
   */
  private createSection(section: SidebarSection): HTMLElement {
    const sectionEl = document.createElement('div');
    sectionEl.className = `sidebar-section ${section.isExpanded !== false ? 'is-expanded' : ''}`;
    sectionEl.dataset.sectionId = section.id;

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'sidebar-section-header';
    sectionHeader.innerHTML = `
      ${section.icon ? `<span class="sidebar-section-icon">${section.icon}</span>` : ''}
      <h3 class="sidebar-section-title">${section.title}</h3>
      ${this.options.collapsible && section.items ? `
        <button class="sidebar-section-toggle" aria-label="Expandir/Recolher">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      ` : ''}
    `;

    if (this.options.collapsible && section.items) {
      const toggleBtn = sectionHeader.querySelector('.sidebar-section-toggle');
      toggleBtn?.addEventListener('click', () => this.toggleSection(section.id));
    }

    sectionEl.appendChild(sectionHeader);

    if (section.items && section.items.length > 0) {
      const itemsList = document.createElement('ul');
      itemsList.className = 'sidebar-items';
      section.items.forEach(item => {
        itemsList.appendChild(this.createItem(item));
      });
      sectionEl.appendChild(itemsList);
    }

    return sectionEl;
  }

  /**
   * Cria um item da sidebar
   */
  private createItem(item: SidebarItem, level: number = 0): HTMLElement {
    const li = document.createElement('li');
    li.className = `sidebar-item ${item.items ? 'has-children' : ''}`;
    li.dataset.itemId = item.id;
    li.style.paddingLeft = `${level * 12}px`;

    const link = document.createElement('a');
    link.className = 'sidebar-item-link';
    link.href = item.href || `#${item.id}`;
    link.innerHTML = `
      <span class="sidebar-item-text">${item.title}</span>
      ${item.badge ? `<span class="sidebar-item-badge">${item.badge}</span>` : ''}
    `;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigateToItem(item);
    });

    li.appendChild(link);

    if (item.items && item.items.length > 0) {
      const subList = document.createElement('ul');
      subList.className = 'sidebar-subitems';
      item.items.forEach(subItem => {
        subList.appendChild(this.createItem(subItem, level + 1));
      });
      li.appendChild(subList);
    }

    return li;
  }

  /**
   * Alterna seção
   */
  private toggleSection(sectionId: string): void {
    const section = this.container.querySelector(`[data-section-id="${sectionId}"]`);
    section?.classList.toggle('is-expanded');
  }

  /**
   * Navega para um item
   */
  private navigateToItem(item: SidebarItem): void {
    // Remover active de todos
    this.container.querySelectorAll('.sidebar-item-link').forEach(link => {
      link.classList.remove('active');
    });

    // Adicionar active no clicado
    const link = this.container.querySelector(`[data-item-id="${item.id}"] .sidebar-item-link`);
    link?.classList.add('active');

    // Scroll suave
    if (item.href) {
      const targetId = item.href.replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        smoothScrollTo(target, 80);
      }
    }
  }

  /**
   * Configura busca
   */
  private setupSearch(): void {
    this.searchInput = this.container.querySelector('.sidebar-search-input');
    if (!this.searchInput) return;

    const debouncedSearch = debounce((query: string) => {
      this.filterItems(query);
    }, 300);

    this.searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      debouncedSearch(query);
    });
  }

  /**
   * Filtra items baseado na busca
   */
  private filterItems(query: string): void {
    const lowerQuery = query.toLowerCase().trim();
    const items = this.container.querySelectorAll('.sidebar-item');

    items.forEach(item => {
      const text = item.textContent?.toLowerCase() || '';
      const matches = !lowerQuery || text.includes(lowerQuery);
      
      if (matches) {
        item.classList.remove('hidden');
        // Expandir seção pai se houver match
        const section = item.closest('.sidebar-section');
        section?.classList.add('is-expanded');
      } else {
        item.classList.add('hidden');
      }
    });
  }

  /**
   * Configura botão de fechar
   */
  private setupCloseButton(): void {
    const closeBtn = this.container.querySelector('.sidebar-close-btn');
    closeBtn?.addEventListener('click', () => {
      this.container.classList.add('closed');
      document.body.classList.remove('sidebar-open');
    });
  }

  /**
   * Inicializa scroll spy
   */
  initScrollSpy(sectionsSelector: string): void {
    this.scrollSpy = new ScrollSpy(
      sectionsSelector,
      '.sidebar-item-link',
      'active'
    );
  }

  /**
   * Abre sidebar
   */
  open(): void {
    this.container.classList.remove('closed');
    document.body.classList.add('sidebar-open');
  }

  /**
   * Fecha sidebar
   */
  close(): void {
    this.container.classList.add('closed');
    document.body.classList.remove('sidebar-open');
  }

  /**
   * Toggle sidebar
   */
  toggle(): void {
    if (this.container.classList.contains('closed')) {
      this.open();
    } else {
      this.close();
    }
  }

  /**
   * Retorna o elemento
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
   * Método estático
   */
  static create(sections: SidebarSection[], options?: SidebarOptions): HTMLElement {
    const sidebar = new Sidebar(sections, options);
    return sidebar.getElement();
  }
}

