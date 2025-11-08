/**
 * Router - Sistema de roteamento simples com transições animadas
 */

export type PageId = 'home' | 'cursos' | 'trilhas' | 'comunidade';

export interface Page {
  id: PageId;
  title: string;
  element: HTMLElement | null;
  onEnter?: () => void;
  onLeave?: () => void;
}

export interface RouterOptions {
  defaultPage?: PageId;
  transitionDuration?: number;
  onNavigate?: (pageId: PageId) => void;
}

/**
 * Classe Router para gerenciar navegação entre páginas
 */
export class Router {
  private pages: Map<PageId, Page> = new Map();
  private currentPageId: PageId;
  private options: RouterOptions;
  private isTransitioning: boolean = false;

  constructor(options: RouterOptions = {}) {
    this.options = {
      defaultPage: 'home',
      transitionDuration: 400,
      ...options
    };
    
    this.currentPageId = this.options.defaultPage!;
    this.setupPages();
    this.setupHashListener();
    this.handleInitialRoute();
  }

  /**
   * Configura as páginas
   */
  private setupPages(): void {
    // Página Home
    const heroSection = document.querySelector('.hero') as HTMLElement;
    const disciplinesSection = document.querySelector('.disciplines') as HTMLElement;
    
    this.pages.set('home', {
      id: 'home',
      title: 'Home - Khroma Academy',
      element: null, // Home é composta por hero + disciplines
      onEnter: () => {
        heroSection?.classList.remove('hidden');
        disciplinesSection?.classList.remove('hidden');
      },
      onLeave: () => {
        heroSection?.classList.add('hidden');
      }
    });

    // Página Cursos (mesma view de disciplinas)
    this.pages.set('cursos', {
      id: 'cursos',
      title: 'Cursos - Khroma Academy',
      element: disciplinesSection,
      onEnter: () => {
        heroSection?.classList.add('hidden');
        disciplinesSection?.classList.remove('hidden');
      }
    });

    // Página Trilhas (placeholder)
    let trilhasPage = document.getElementById('trilhas-page');
    if (!trilhasPage) {
      trilhasPage = this.createPlaceholderPage('trilhas', 'Trilhas de Aprendizado', 
        'Explore trilhas personalizadas de aprendizado. Em breve!');
    }
    
    this.pages.set('trilhas', {
      id: 'trilhas',
      title: 'Trilhas - Khroma Academy',
      element: trilhasPage,
      onEnter: () => {
        heroSection?.classList.add('hidden');
        disciplinesSection?.classList.add('hidden');
        trilhasPage?.classList.remove('hidden');
      },
      onLeave: () => {
        trilhasPage?.classList.add('hidden');
      }
    });

    // Página Comunidade (placeholder)
    let comunidadePage = document.getElementById('comunidade-page');
    if (!comunidadePage) {
      comunidadePage = this.createPlaceholderPage('comunidade', 'Comunidade', 
        'Conecte-se com outros estudantes. Em breve!');
    }
    
    this.pages.set('comunidade', {
      id: 'comunidade',
      title: 'Comunidade - Khroma Academy',
      element: comunidadePage,
      onEnter: () => {
        heroSection?.classList.add('hidden');
        disciplinesSection?.classList.add('hidden');
        comunidadePage?.classList.remove('hidden');
      },
      onLeave: () => {
        comunidadePage?.classList.add('hidden');
      }
    });
  }

  /**
   * Cria página placeholder
   */
  private createPlaceholderPage(id: string, title: string, description: string): HTMLElement {
    const page = document.createElement('section');
    page.id = `${id}-page`;
    page.className = 'placeholder-page hidden';
    page.innerHTML = `
      <div class="container">
        <div class="placeholder-content">
          <div class="placeholder-icon">
            ${this.getPlaceholderIcon(id)}
          </div>
          <h2 class="placeholder-title">${title}</h2>
          <p class="placeholder-description">${description}</p>
          <div class="placeholder-features">
            <div class="feature-card">
              <div class="feature-icon">✨</div>
              <h3>Em Desenvolvimento</h3>
              <p>Estamos trabalhando para trazer esta funcionalidade em breve</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🚀</div>
              <h3>Recursos Avançados</h3>
              <p>Funcionalidades incríveis estão a caminho</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💡</div>
              <h3>Experiência Única</h3>
              <p>Design moderno e intuitivo para melhor aprendizado</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Adicionar ao DOM
    const main = document.querySelector('main');
    if (main) {
      main.appendChild(page);
    }

    return page;
  }

  /**
   * Retorna ícone para página placeholder
   */
  private getPlaceholderIcon(id: string): string {
    const icons: Record<string, string> = {
      trilhas: `
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="50" cy="50" r="40"/>
          <polygon points="60,35 55,55 35,60 40,40 60,35"/>
        </svg>
      `,
      comunidade: `
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="50" cy="35" r="12"/>
          <path d="M30 70 Q30 50 50 50 Q70 50 70 70"/>
          <circle cx="25" cy="45" r="8"/>
          <circle cx="75" cy="45" r="8"/>
        </svg>
      `
    };

    return icons[id] || '';
  }

  /**
   * Configura listener para mudanças de hash
   */
  private setupHashListener(): void {
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });
  }

  /**
   * Manipula rota inicial
   */
  private handleInitialRoute(): void {
    const hash = window.location.hash.slice(1) as PageId;
    if (hash && this.pages.has(hash)) {
      this.navigateTo(hash, false);
    } else {
      this.navigateTo(this.currentPageId, false);
    }
  }

  /**
   * Manipula mudança de hash
   */
  private handleHashChange(): void {
    const hash = window.location.hash.slice(1) as PageId;
    if (hash && this.pages.has(hash) && hash !== this.currentPageId) {
      this.navigateTo(hash);
    }
  }

  /**
   * Navega para uma página
   */
  async navigateTo(pageId: PageId, animate: boolean = true): Promise<void> {
    if (this.isTransitioning || pageId === this.currentPageId) {
      return;
    }

    const targetPage = this.pages.get(pageId);
    const currentPage = this.pages.get(this.currentPageId);

    if (!targetPage) {
      console.warn(`Página ${pageId} não encontrada`);
      return;
    }

    this.isTransitioning = true;

    // Atualizar hash
    if (window.location.hash !== `#${pageId}`) {
      window.history.pushState(null, '', `#${pageId}`);
    }

    // Atualizar título
    document.title = targetPage.title;

    if (animate) {
      // Transição animada
      await this.performTransition(currentPage, targetPage);
    } else {
      // Transição instantânea
      currentPage?.onLeave?.();
      targetPage.onEnter?.();
    }

    this.currentPageId = pageId;
    this.isTransitioning = false;

    // Callback
    this.options.onNavigate?.(pageId);

    // Disparar evento
    window.dispatchEvent(new CustomEvent('page-change', {
      detail: { pageId }
    }));
  }

  /**
   * Executa transição entre páginas
   */
  private async performTransition(from: Page | undefined, to: Page): Promise<void> {
    const main = document.querySelector('main') as HTMLElement;
    if (!main) return;

    // Fade out
    main.style.opacity = '0';
    main.style.transform = 'translateY(20px)';

    await this.wait(this.options.transitionDuration! / 2);

    // Trocar conteúdo
    from?.onLeave?.();
    to.onEnter?.();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    await this.wait(50);

    // Fade in
    main.style.opacity = '1';
    main.style.transform = 'translateY(0)';

    await this.wait(this.options.transitionDuration! / 2);
  }

  /**
   * Utilitário para esperar
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retorna página atual
   */
  getCurrentPage(): PageId {
    return this.currentPageId;
  }

  /**
   * Verifica se está em transição
   */
  isInTransition(): boolean {
    return this.isTransitioning;
  }

  /**
   * Método estático para criar instância
   */
  static create(options?: RouterOptions): Router {
    return new Router(options);
  }
}

// Adicionar estilos para transições
const style = document.createElement('style');
style.textContent = `
  main {
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hidden {
    display: none !important;
  }

  /* Placeholder page styles */
  .placeholder-page {
    min-height: calc(100vh - 200px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xxl) 0;
  }

  .placeholder-content {
    text-align: center;
    max-width: 1000px;
  }

  .placeholder-icon {
    width: 120px;
    height: 120px;
    margin: 0 auto var(--space-xl);
    color: var(--primary-highlight);
    opacity: 0.8;
    animation: float 3s ease-in-out infinite;
  }

  .placeholder-icon svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 20px rgba(65, 255, 65, 0.3));
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .placeholder-title {
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: var(--space-m);
    background: var(--gradient-main);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 4s ease infinite;
  }

  .placeholder-description {
    font-size: 1.25rem;
    color: var(--color-light-grey);
    margin-bottom: var(--space-xxl);
  }

  .placeholder-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-l);
    margin-top: var(--space-xxl);
  }

  .feature-card {
    padding: var(--space-l);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--border-radius);
    transition: all var(--transition-fast);
  }

  .feature-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(65, 255, 65, 0.3);
    transform: translateY(-4px);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: var(--space-m);
  }

  .feature-card h3 {
    font-size: 1.25rem;
    margin-bottom: var(--space-s);
    color: var(--color-white);
  }

  .feature-card p {
    font-size: 0.95rem;
    color: var(--color-grey);
    line-height: 1.6;
  }
`;
document.head.appendChild(style);

