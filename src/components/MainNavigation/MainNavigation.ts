/**
 * MainNavigation Component
 * Menu lateral ultra-moderno minimalista inspirado em Apple/Vercel
 */

import './MainNavigation.css';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  action?: () => void;
  badge?: number;
  isToggle?: boolean;
  shortcut?: string;
}

export interface MainNavigationOptions {
  collapsed?: boolean;
  onNavigate?: (itemId: string) => void;
  onToggle?: (collapsed: boolean) => void;
  onSearch?: () => void;
}

/**
 * Classe MainNavigation - Menu lateral principal ultra-moderno
 */
export class MainNavigation {
  private container: HTMLElement;
  private isCollapsed: boolean = false;
  private activeItemId: string = 'home';
  private options: MainNavigationOptions;
  private items: NavigationItem[];

  constructor(options: MainNavigationOptions = {}) {
    this.options = options;
    this.isCollapsed = options.collapsed || false;
    
    // Definir itens do menu - design minimalista dark
    this.items = [
      {
        id: 'home',
        label: 'Home',
        icon: this.getHomeIcon(),
        shortcut: '⌘H',
      },
      {
        id: 'meus-cursos',
        label: 'Meus Cursos',
        icon: this.getMyCorsosIcon(),
        shortcut: '⌘M',
      },
      {
        id: 'cursos',
        label: 'Explorar',
        icon: this.getCoursesIcon(),
        shortcut: '⌘E',
      },
      {
        id: 'trilhas',
        label: 'Trilhas',
        icon: this.getPathsIcon(),
        shortcut: '⌘T',
      },
      {
        id: 'agentes',
        label: 'Agentes',
        icon: this.getAgentsIcon(),
        shortcut: '⌘A',
      },
      {
        id: 'toggle',
        label: 'Recolher',
        icon: this.getToggleIcon(),
        isToggle: true,
        action: () => this.toggle(),
      },
      {
        id: 'configuracoes',
        label: 'Configurações',
        icon: this.getSettingsIcon(),
        shortcut: '⌘,',
      },
    ];

    this.container = this.create();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.loadState();
  }

  /**
   * Cria o elemento do menu - Design Ultra-Moderno Minimalista
   */
  private create(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = `main-navigation ${this.isCollapsed ? 'collapsed' : ''}`;
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Navegação principal');

    // Items do menu
    const menuItems = document.createElement('div');
    menuItems.className = 'nav-items';
    
    this.items.forEach(item => {
      if (item.isToggle) {
        // Separador sutil antes do toggle
        const separator = document.createElement('div');
        separator.className = 'nav-separator';
        menuItems.appendChild(separator);
      }
      
      menuItems.appendChild(this.createMenuItem(item));
    });

    // Footer minimalista com perfil
    const footer = document.createElement('div');
    footer.className = 'nav-footer';
    footer.innerHTML = `
      <div class="user-profile">
        <div class="user-avatar">
          <img src="data:image/svg+xml,%3Csvg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='20' fill='%2300FF66'/%3E%3Cpath d='M20 20c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6zm0 2c-4 0-12 2-12 6v2h24v-2c0-4-8-6-12-6z' fill='%230a0a0a'/%3E%3C/svg%3E" alt="User" />
        </div>
        <div class="user-info">
          <div class="user-name">Dark</div>
          <div class="user-status">
            <span class="status-dot"></span>
            <span>Online</span>
          </div>
        </div>
      </div>
    `;

    // Montar estrutura
    nav.appendChild(menuItems);
    nav.appendChild(footer);

    return nav;
  }

  /**
   * Cria um item do menu - Design minimalista com shortcuts
   */
  private createMenuItem(item: NavigationItem): HTMLElement {
    const menuItem = document.createElement('button');
    menuItem.className = `nav-item ${item.id === this.activeItemId ? 'active' : ''}`;
    menuItem.dataset.itemId = item.id;
    menuItem.setAttribute('role', 'button');
    menuItem.setAttribute('aria-label', item.label);
    
    if (item.id === this.activeItemId) {
      menuItem.setAttribute('aria-current', 'page');
    }

    const shortcutHtml = ''; // Shortcuts removidos
    const badgeHtml = item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : '';

    menuItem.innerHTML = `
      <div class="nav-item-content">
        <div class="nav-item-icon">${item.icon}</div>
        <span class="nav-item-label">${item.label}</span>
        ${badgeHtml}
        ${shortcutHtml}
      </div>
      <div class="nav-item-indicator"></div>
      <div class="nav-item-tooltip">
        <span>${item.label}</span>
      </div>
    `;

    // Event listener
    menuItem.addEventListener('click', (e) => {
      e.preventDefault();
      // Evita que o clique borbulhe até listeners globais (ex.: fechar settings ao clicar fora)
      e.stopPropagation();
      this.handleItemClick(item, menuItem);
    });

    // Hover animation com spring physics
    menuItem.addEventListener('mouseenter', () => {
      this.animateItemHover(menuItem, true);
    });

    menuItem.addEventListener('mouseleave', () => {
      this.animateItemHover(menuItem, false);
    });

    return menuItem;
  }

  /**
   * Anima hover do item com spring physics
   */
  private animateItemHover(element: HTMLElement, entering: boolean): void {
    if (entering) {
      element.style.transform = 'translateX(4px)';
      element.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    } else {
      element.style.transform = 'translateX(0)';
      element.style.transition = 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)';
    }
  }

  /**
   * Manipula clique em item do menu
   */
  private handleItemClick(item: NavigationItem, element: HTMLElement): void {
    // Animação de click sutil
    this.createClickAnimation(element);

    // Executar ação customizada
    if (item.action) {
      item.action();
      return;
    }

    // Navegação normal
    if (!item.isToggle) {
      this.setActive(item.id);
      this.options.onNavigate?.(item.id);
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('navigation-change', {
        detail: { itemId: item.id }
      }));
    }
  }

  /**
   * Cria animação de click minimalista
   */
  private createClickAnimation(element: HTMLElement): void {
    element.style.transform = 'scale(0.96)';
    element.style.transition = 'transform 0.1s ease-out';
    
    setTimeout(() => {
      element.style.transform = '';
      element.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 100);
  }

  /**
   * Define item ativo
   */
  setActive(itemId: string): void {
    this.activeItemId = itemId;
    
    // Atualizar UI
    const items = this.container.querySelectorAll('.nav-item');
    items.forEach(item => {
      const id = item.getAttribute('data-item-id');
      if (id === itemId) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      }
    });

    this.saveState();
  }

  /**
   * Toggle menu (expandir/colapsar)
   */
  toggle(): void {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
    document.body.classList.toggle('nav-collapsed', this.isCollapsed);
    
    // Atualizar label do botão toggle
    const toggleItem = this.container.querySelector('[data-item-id="toggle"] .nav-item-label');
    if (toggleItem) {
      toggleItem.textContent = this.isCollapsed ? 'Expandir' : 'Recolher';
    }

    this.options.onToggle?.(this.isCollapsed);
    this.saveState();

    // Disparar evento
    window.dispatchEvent(new CustomEvent('navigation-toggle', {
      detail: { collapsed: this.isCollapsed }
    }));
  }

  /**
   * Expande o menu
   */
  expand(): void {
    if (this.isCollapsed) {
      this.toggle();
    }
  }

  /**
   * Colapsa o menu
   */
  collapse(): void {
    if (!this.isCollapsed) {
      this.toggle();
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });

    // Hover para expandir temporariamente em modo colapsado
    let hoverTimeout: number;
    this.container.addEventListener('mouseenter', () => {
      if (this.isCollapsed) {
        hoverTimeout = window.setTimeout(() => {
          this.container.classList.add('hover-expanded');
        }, 300);
      }
    });

    this.container.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      this.container.classList.remove('hover-expanded');
    });

    // Mobile: botão hamburger (se existir)
    this.setupMobileMenu();
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Verificar se está em um input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Mostrar helper de atalhos com "?"
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.showShortcutsHelper();
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (!modKey) return;

      const shortcuts: { [key: string]: string } = {
        'h': 'home',
        'm': 'meus-cursos',
        'e': 'cursos',
        't': 'trilhas',
        'a': 'agentes',
        'c': 'comunidade',
        ',': 'configuracoes',
      };

      const itemId = shortcuts[e.key.toLowerCase()];
      if (itemId) {
        e.preventDefault();
        const item = this.items.find(i => i.id === itemId);
        if (item) {
          this.setActive(itemId);
          this.options.onNavigate?.(itemId);
        }
      }
    });
  }

  /**
   * Mostra helper de atalhos de teclado
   */
  private showShortcutsHelper(): void {
    // Remover helper existente se houver
    const existing = document.getElementById('keyboard-shortcuts-helper');
    if (existing) {
      existing.remove();
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? '⌘' : 'Ctrl';

    const helper = document.createElement('div');
    helper.id = 'keyboard-shortcuts-helper';
    helper.className = 'keyboard-shortcuts-helper';
    helper.setAttribute('role', 'dialog');
    helper.setAttribute('aria-label', 'Atalhos de teclado');
    helper.setAttribute('aria-modal', 'true');

    helper.innerHTML = `
      <div class="shortcuts-overlay"></div>
      <div class="shortcuts-modal">
        <div class="shortcuts-header">
          <h3>Atalhos de Teclado</h3>
          <button class="shortcuts-close" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="shortcuts-content">
          <div class="shortcuts-section">
            <h4>Navegação</h4>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>H</kbd></span>
              <span class="shortcut-desc">Home</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>M</kbd></span>
              <span class="shortcut-desc">Meus Cursos</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>E</kbd></span>
              <span class="shortcut-desc">Explorar Cursos</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>T</kbd></span>
              <span class="shortcut-desc">Trilhas</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>A</kbd></span>
              <span class="shortcut-desc">Agentes</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>C</kbd></span>
              <span class="shortcut-desc">Comunidade</span>
            </div>
          </div>
          <div class="shortcuts-section">
            <h4>Busca & Comandos</h4>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>K</kbd></span>
              <span class="shortcut-desc">Busca Global</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>,</kbd></span>
              <span class="shortcut-desc">Configurações</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>?</kbd></span>
              <span class="shortcut-desc">Mostrar Atalhos</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Esc</kbd></span>
              <span class="shortcut-desc">Fechar</span>
            </div>
          </div>
          <div class="shortcuts-section">
            <h4>Menu Lateral</h4>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>↑</kbd> <kbd>↓</kbd></span>
              <span class="shortcut-desc">Navegar Itens</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Home</kbd> <kbd>End</kbd></span>
              <span class="shortcut-desc">Primeiro/Último Item</span>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-keys"><kbd>Enter</kbd></span>
              <span class="shortcut-desc">Selecionar</span>
            </div>
          </div>
        </div>
        <div class="shortcuts-footer">
          <p>Pressione <kbd>?</kbd> para mostrar/ocultar este painel</p>
        </div>
      </div>
    `;

    document.body.appendChild(helper);

    // Adicionar estilos
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-shortcuts-helper {
        position: fixed;
        inset: 0;
        z-index: calc(var(--z-modal) + 10);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
      }

      .shortcuts-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
      }

      .shortcuts-modal {
        position: relative;
        width: min(700px, calc(100vw - 32px));
        max-height: calc(100vh - 64px);
        background: var(--palette-bg-dark);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
        animation: slideUpScale 0.3s var(--spring-smooth);
      }

      @keyframes slideUpScale {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .shortcuts-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-l);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .shortcuts-header h3 {
        font-family: var(--font-heading);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-white);
        margin: 0;
      }

      .shortcuts-close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: var(--color-grey);
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .shortcuts-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-white);
      }

      .shortcuts-close svg {
        width: 20px;
        height: 20px;
      }

      .shortcuts-content {
        padding: var(--space-l);
        max-height: 60vh;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-l);
      }

      .shortcuts-section h4 {
        font-family: var(--font-heading);
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-grey);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 var(--space-m) 0;
      }

      .shortcut-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-s) 0;
        gap: var(--space-m);
      }

      .shortcut-keys {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }

      .shortcut-keys kbd {
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        font-family: var(--font-heading);
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--color-white);
      }

      .shortcut-desc {
        font-size: 0.9rem;
        color: var(--color-light-grey);
        text-align: right;
      }

      .shortcuts-footer {
        padding: var(--space-m) var(--space-l);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.2);
      }

      .shortcuts-footer p {
        font-size: 0.85rem;
        color: var(--color-grey);
        margin: 0;
        text-align: center;
      }

      .shortcuts-footer kbd {
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 3px;
        font-family: var(--font-heading);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-white);
      }
    `;
    document.head.appendChild(style);

    // Event listeners
    const closeBtn = helper.querySelector('.shortcuts-close');
    const overlay = helper.querySelector('.shortcuts-overlay');
    
    const closeHelper = () => helper.remove();
    
    closeBtn?.addEventListener('click', closeHelper);
    overlay?.addEventListener('click', closeHelper);
    
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeHelper();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }

  /**
   * Navegação por teclado
   */
  private handleKeyboardNavigation(e: KeyboardEvent): void {
    const items = Array.from(this.container.querySelectorAll('.nav-item')) as HTMLElement[];
    const currentIndex = items.findIndex(item => item === document.activeElement);

    switch (e.key) {
      case 'Escape':
        if (!this.isCollapsed) {
          this.collapse();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          items[currentIndex + 1].focus();
        } else {
          items[0].focus();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex - 1].focus();
        } else {
          items[items.length - 1].focus();
        }
        break;

      case 'Home':
        e.preventDefault();
        items[0].focus();
        break;

      case 'End':
        e.preventDefault();
        items[items.length - 1].focus();
        break;
    }
  }

  /**
   * Setup menu mobile com suporte a gestos
   */
  private setupMobileMenu(): void {
    // Criar botão hamburger para mobile se não existir
    if (window.innerWidth <= 768) {
      let hamburger = document.getElementById('mobile-menu-toggle');
      
      if (!hamburger) {
        hamburger = document.createElement('button');
        hamburger.id = 'mobile-menu-toggle';
        hamburger.className = 'mobile-menu-toggle';
        hamburger.setAttribute('aria-label', 'Abrir menu');
        hamburger.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        `;
        document.body.appendChild(hamburger);
      }

      hamburger.addEventListener('click', () => {
        this.openMobileMenu();
      });

      // Fechar ao clicar fora
      document.addEventListener('click', (e) => {
        if (
          this.container.classList.contains('mobile-open') &&
          !this.container.contains(e.target as Node) &&
          !hamburger!.contains(e.target as Node)
        ) {
          this.closeMobileMenu();
        }
      });
    }

    // Setup gestos de swipe
    this.setupSwipeGestures();
  }

  /**
   * Abre menu mobile
   */
  private openMobileMenu(): void {
    this.container.classList.add('mobile-open');
    document.body.classList.add('nav-mobile-open');
  }

  /**
   * Fecha menu mobile
   */
  private closeMobileMenu(): void {
    this.container.classList.remove('mobile-open');
    document.body.classList.remove('nav-mobile-open');
  }

  /**
   * Setup gestos de swipe para mobile
   */
  private setupSwipeGestures(): void {
    if (window.innerWidth > 768) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    // Touch start
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      
      // Se começar da borda esquerda, habilitar swipe
      if (touchStartX < 20 && !this.container.classList.contains('mobile-open')) {
        isSwiping = true;
      }
    }, { passive: true });

    // Touch move (para feedback visual)
    document.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      
      const currentX = e.touches[0].clientX;
      const diff = currentX - touchStartX;
      
      if (diff > 0 && diff < 280) {
        this.container.style.transform = `translateX(-${100 - (diff / 280) * 100}%)`;
      }
    }, { passive: true });

    // Touch end
    document.addEventListener('touchend', (e) => {
      if (!isSwiping) {
        // Swipe para fechar se menu estiver aberto
        if (this.container.classList.contains('mobile-open')) {
          touchEndX = e.changedTouches[0].clientX;
          touchEndY = e.changedTouches[0].clientY;
          
          const diffX = touchStartX - touchEndX;
          const diffY = Math.abs(touchStartY - touchEndY);
          
          // Swipe left para fechar
          if (diffX > 50 && diffY < 100) {
            this.closeMobileMenu();
          }
        }
        return;
      }

      touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;

      // Reset transform
      this.container.style.transform = '';
      
      // Se swipe foi mais de 50% do menu, abrir
      if (diff > 140) {
        this.openMobileMenu();
      }

      isSwiping = false;
    }, { passive: true });

    // Swipe do menu para fechar
    this.container.addEventListener('touchstart', (e) => {
      if (this.container.classList.contains('mobile-open')) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
  }

  /**
   * Salva estado no localStorage
   */
  private saveState(): void {
    localStorage.setItem('nav-collapsed', String(this.isCollapsed));
    localStorage.setItem('nav-active', this.activeItemId);
  }

  /**
   * Carrega estado do localStorage
   */
  private loadState(): void {
    const collapsed = localStorage.getItem('nav-collapsed');
    const active = localStorage.getItem('nav-active');

    if (collapsed === 'true' && !this.isCollapsed) {
      this.toggle();
    }

    if (active && active !== this.activeItemId) {
      this.setActive(active);
    }
  }

  /**
   * Atualiza badge de um item
   */
  updateBadge(itemId: string, count: number): void {
    const item = this.container.querySelector(`[data-item-id="${itemId}"]`);
    if (!item) return;

    let badge = item.querySelector('.nav-item-badge') as HTMLElement;
    
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-item-badge';
        item.appendChild(badge);
      }
      badge.textContent = String(count);
      badge.classList.add('pulse');
      setTimeout(() => badge.classList.remove('pulse'), 600);
    } else if (badge) {
      badge.remove();
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
    this.container.remove();
  }

  // Ícones SVG - Design Minimalista
  private getHomeIcon(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    `;
  }

  private getMyCorsosIcon(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    `;
  }

  private getCoursesIcon(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    `;
  }

  private getPathsIcon(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
      </svg>
    `;
  }

  private getAgentsIcon(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    `;
  }

  private getToggleIcon(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18l-6-6 6-6"></path>
        <path d="M15 18l-6-6 6-6"></path>
      </svg>
    `;
  }

  private getSettingsIcon(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    `;
  }

  /**
   * Método estático para criar instância
   */
  static create(options?: MainNavigationOptions): MainNavigation {
    return new MainNavigation(options);
  }
}

