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
   * Cria o elemento do menu - Design Elite com Chroma Glow
   */
  private create(): HTMLElement {
    const aside = document.createElement('aside');
    aside.id = 'sidebar';
    aside.className = `main-navigation ${this.isCollapsed ? 'collapsed' : ''}`;
    aside.setAttribute('role', 'navigation');
    aside.setAttribute('aria-label', 'Navegação principal');
    aside.setAttribute('data-state', this.isCollapsed ? 'collapsed' : 'expanded');

    // 1. Header / Logo
    const header = document.createElement('div');
    header.className = 'nav-header';
    header.innerHTML = `
      <div class="logo-container">
        <div class="logo-icon">
          <span class="logo-letter">K</span>
        </div>
        <div class="logo-text">
          <h1 class="logo-glitch">KHROMA</h1>
          <span class="logo-subtitle">Academy</span>
        </div>
      </div>
      <button id="collapse-btn" class="collapse-btn" aria-label="Recolher menu">
        <svg viewBox="0 0 256 256" fill="currentColor" class="collapse-icon" id="collapse-icon">
          <polyline points="160 208 80 128 160 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
        </svg>
      </button>
    `;

    // 2. Navigation Menu
    const navMenu = document.createElement('div');
    navMenu.className = 'nav-menu';

    // Seção: PLATAFORMA
    const plataformaSection = this.createSection('Plataforma', [
      { id: 'home', label: 'Dashboard', icon: this.getHomeIcon() },
      { id: 'meus-cursos', label: 'Cursos', icon: this.getMyCorsosIcon() },
      { id: 'cursos', label: 'Projetos', icon: this.getCoursesIcon(), badge: 3 },
      { id: 'trilhas', label: 'Mentoria', icon: this.getPathsIcon() },
    ]);
    navMenu.appendChild(plataformaSection);

    // Seção: SOCIAL (itens adicionais para corresponder ao design)
    const socialSection = this.createSection('Social', [
      { id: 'mensagens', label: 'Mensagens', icon: this.getMessagesIcon(), hasNotification: true },
      { id: 'forum', label: 'Fórum Global', icon: this.getForumIcon() },
      { id: 'eventos', label: 'Eventos Chroma', icon: this.getEventsIcon() },
    ]);
    navMenu.appendChild(socialSection);

    // Seção: CONFIGURAÇÕES
    const configSection = this.createSection('Configurações', [
      { id: 'analytics', label: 'Analytics', icon: this.getAnalyticsIcon() },
      { id: 'configuracoes', label: 'Ajustes', icon: this.getSettingsIcon() },
    ]);
    navMenu.appendChild(configSection);

    // Card Pro Plan (visível apenas quando expandido)
    const proPlanCard = document.createElement('div');
    proPlanCard.className = 'pro-plan-card';
    proPlanCard.innerHTML = `
      <div class="pro-plan-glow"></div>
      <h4 class="pro-plan-title">Pro Plan</h4>
      <p class="pro-plan-description">Desbloqueie todo o poder RGB.</p>
      <button class="pro-plan-button">Upgrade Now</button>
    `;
    navMenu.appendChild(proPlanCard);

    // 3. Footer / Profile
    const footer = document.createElement('div');
    footer.className = 'nav-footer';
    footer.innerHTML = `
      <div class="user-profile">
        <div class="user-avatar">
          <img src="https://i.pravatar.cc/150?img=15" alt="User Avatar" />
          <span class="user-status-dot"></span>
        </div>
        <div class="user-info">
          <span class="user-name">Neo Anderson</span>
          <span class="user-role">Student • Lv. 42</span>
        </div>
        <button class="user-logout" aria-label="Sair">
          <i class="logout-icon"></i>
        </button>
      </div>
    `;

    // Montar estrutura
    aside.appendChild(header);
    aside.appendChild(navMenu);
    aside.appendChild(footer);

    return aside;
  }

  /**
   * Cria uma seção do menu
   */
  private createSection(title: string, items: Array<{ id: string; label: string; icon: string; badge?: number; hasNotification?: boolean }>): HTMLElement {
    const section = document.createElement('div');
    section.className = 'nav-section';

    const titleEl = document.createElement('h3');
    titleEl.className = 'nav-section-title';
    titleEl.textContent = title;
    section.appendChild(titleEl);

    const list = document.createElement('ul');
    list.className = 'nav-section-list';

    items.forEach(item => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#';
      link.className = `chroma-item ${item.id === this.activeItemId ? 'active' : ''}`;
      link.dataset.itemId = item.id;
      link.setAttribute('role', 'button');
      link.setAttribute('aria-label', item.label);

      if (item.id === this.activeItemId) {
        link.setAttribute('aria-current', 'page');
      }

      link.innerHTML = `
        <i class="nav-item-icon">${item.icon}</i>
        <span class="nav-item-label">${item.label}</span>
        ${item.badge ? `<div class="nav-item-badge">${item.badge}</div>` : ''}
        ${item.hasNotification ? `<span class="nav-item-notification"></span>` : ''}
        <span class="nav-tooltip">${item.label}</span>
      `;

      // Event listener
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Criar NavigationItem para compatibilidade
        const navItem: NavigationItem = {
          id: item.id,
          label: item.label,
          icon: item.icon,
        };
        
        this.handleItemClick(navItem, link);
      });

      listItem.appendChild(link);
      list.appendChild(listItem);
    });

    section.appendChild(list);
    return section;
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
  private handleItemClick(item: NavigationItem | { id: string; label: string; icon: string }, element: HTMLElement): void {
    // Animação de click sutil
    this.createClickAnimation(element);

    // Executar ação customizada (se for NavigationItem completo)
    if ('action' in item && item.action) {
      item.action();
      return;
    }

    // Navegação normal
    if (!('isToggle' in item && item.isToggle)) {
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
    const items = this.container.querySelectorAll('.chroma-item');
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
    this.container.setAttribute('data-state', this.isCollapsed ? 'collapsed' : 'expanded');
    document.body.classList.toggle('nav-collapsed', this.isCollapsed);
    
    // Atualizar ícone do botão collapse
    const collapseIcon = this.container.querySelector('#collapse-icon') as HTMLElement;
    if (collapseIcon) {
      if (this.isCollapsed) {
        collapseIcon.style.transform = 'rotate(180deg)';
      } else {
        collapseIcon.style.transform = 'rotate(0deg)';
      }
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
    // Botão de collapse
    const collapseBtn = this.container.querySelector('#collapse-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        this.toggle();
      });
    }

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
    const items = Array.from(this.container.querySelectorAll('.chroma-item')) as HTMLElement[];
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
    // squares-four (Dashboard)
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <rect x="40" y="40" width="72" height="72" rx="8"/>
        <rect x="144" y="40" width="72" height="72" rx="8"/>
        <rect x="40" y="144" width="72" height="72" rx="8"/>
        <rect x="144" y="144" width="72" height="72" rx="8"/>
      </svg>
    `;
  }

  private getMyCorsosIcon(): string {
    // graduation-cap
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <path d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a127.75,127.75,0,0,0,52.58-11.13,8,8,0,0,0,5.49-7.79V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM180,152.18a127.75,127.75,0,0,1-52,9.82c-43.27,0-68.72-18.08-84.47-33.65V123.41L128,140l84.47-16.6v5.14A127.75,127.75,0,0,1,180,152.18ZM128,120,16.81,96,128,72,239.19,96Z"/>
      </svg>
    `;
  }

  private getCoursesIcon(): string {
    // kanban (Projetos)
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <rect x="40" y="40" width="48" height="176" rx="8"/>
        <rect x="104" y="40" width="48" height="176" rx="8"/>
        <rect x="168" y="40" width="48" height="176" rx="8"/>
      </svg>
    `;
  }

  private getPathsIcon(): string {
    // users-three (Mentoria)
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <circle cx="80" cy="104" r="40"/>
        <path d="M24,200a60,60,0,0,1,112,0"/>
        <circle cx="176" cy="112" r="40"/>
        <path d="M16,200a64,64,0,0,1,128,0"/>
        <circle cx="176" cy="144" r="32"/>
        <path d="M32,200a56,56,0,0,1,112,0"/>
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
    // caret-left (para o botão de collapse)
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <polyline points="160 208 80 128 160 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
      </svg>
    `;
  }

  private getSettingsIcon(): string {
    // gear-six (Ajustes)
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <circle cx="128" cy="128" r="44"/>
        <path d="M197.43,169.61a83.27,83.27,0,0,0,4.57-9.61l16.24-7.23a103.88,103.88,0,0,0,0-49.54L202,96a83.27,83.27,0,0,0-4.57-9.61l7.23-16.24a103.88,103.88,0,0,0-49.54,0L150,79.43A83.27,83.27,0,0,0,140.39,75L133.16,58.76a103.88,103.88,0,0,0-49.54,0L75,70.39A83.27,83.27,0,0,0,65.39,75L58.16,58.76a103.88,103.88,0,0,0,0,49.54L65.39,120a83.27,83.27,0,0,0,4.57,9.61L58.76,145.85a103.88,103.88,0,0,0,49.54,0L115,150.39a83.27,83.27,0,0,0,9.61,4.57l7.23,16.24a103.88,103.88,0,0,0,49.54,0L188.39,169.61A83.27,83.27,0,0,0,197.43,169.61ZM128,152a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z"/>
      </svg>
    `;
  }

  private getMessagesIcon(): string {
    // chat-circle-dots
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,21.24,21.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81l-3.27-1.09L40,216l12.85-40.67-1.09-3.27A88,88,0,1,1,128,216ZM140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM92,128a12,12,0,1,1-12-12A12,12,0,0,1,92,128Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,188,128Z"/>
      </svg>
    `;
  }

  private getForumIcon(): string {
    // globe-hemisphere-west
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,16a87.48,87.48,0,0,1,44.07,11.8L128,88.24,83.93,51.8A87.48,87.48,0,0,1,128,40ZM40,128a87.61,87.61,0,0,1,3.33-23.61L88,128H40Zm16,0a87.48,87.48,0,0,1,11.8-44.07L128,88.24V128H56Zm72,72a87.48,87.48,0,0,1-44.07-11.8L128,167.76V128h72v72Zm16,0V128h72a87.61,87.61,0,0,1-3.33,23.61L168,128Zm0-16h43.93L128,88.24V184Zm16-95.76L212.67,88.4A87.48,87.48,0,0,1,200,40Zm56,56a87.48,87.48,0,0,1-11.8,44.07L168,167.76V128h88Z"/>
      </svg>
    `;
  }

  private getEventsIcon(): string {
    // calendar-star
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <rect x="40" y="40" width="176" height="176" rx="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
        <line x1="176" y1="24" x2="176" y2="56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
        <line x1="80" y1="24" x2="80" y2="56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
        <line x1="40" y1="88" x2="216" y2="88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
        <path d="M168,144a20,20,0,1,1-20-20A20,20,0,0,1,168,144Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
        <path d="M184,176a40,40,0,0,1-72,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
      </svg>
    `;
  }

  private getAnalyticsIcon(): string {
    // chart-line-up
    return `
      <svg viewBox="0 0 256 256" fill="currentColor">
        <polyline points="232 208 232 136 184 136" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
        <polyline points="24 48 120 144 160 104 232 176" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
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

