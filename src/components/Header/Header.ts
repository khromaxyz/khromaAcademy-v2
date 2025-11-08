import type { ThemeType } from '@/types';
import { themeService } from '@/services';
import './Header.css';

/**
 * Componente Header - Minimalist Dark Design
 */
export class Header {
  private settingsPanel: HTMLElement | null = null;
  private settingsCloseBtn: HTMLElement | null = null;
  private searchBtn: HTMLElement | null = null;
  private themeToggleBtn: HTMLElement | null = null;
  private viewToggleHeader: HTMLElement | null = null;
  private currentThemeIndex: number = 0;
  private themes: ThemeType[] = ['dark', 'light']; // Dark e Light

  /**
   * Inicializa o componente Header
   */
  init(): void {
    this.settingsPanel = document.querySelector('.settings-panel');
    this.settingsCloseBtn = document.getElementById('settings-close-btn');
    this.searchBtn = document.getElementById('header-search-btn');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.viewToggleHeader = document.querySelector('.view-toggle-header');

    // Carregar tema atual
    const currentTheme = themeService.getCurrentTheme();
    this.currentThemeIndex = this.themes.indexOf(currentTheme);
    if (this.currentThemeIndex === -1) this.currentThemeIndex = 0;
    this.updateThemeToggleText();

    this.setupEventListeners();
    this.initThemeButtons();
    this.initViewToggle();
  }

  /**
   * Configura os event listeners
   */
  private setupEventListeners(): void {
    // Botão de busca - abre CommandPalette
    this.searchBtn?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    });

    // Toggle de tema
    this.themeToggleBtn?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Botão de fechar settings
    this.settingsCloseBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.settingsPanel?.classList.remove('visible');
    });

    // Fechar settings ao clicar fora
    document.addEventListener('click', (e) => {
      if (
        this.settingsPanel &&
        !this.settingsPanel.contains(e.target as Node) &&
        this.settingsPanel.classList.contains('visible')
      ) {
        this.settingsPanel.classList.remove('visible');
      }
    });
  }

  /**
   * Alterna entre temas (dark -> light -> rgb -> dark)
   */
  private toggleTheme(): void {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    const newTheme = this.themes[this.currentThemeIndex];
    
    themeService.applyTheme(newTheme);
    themeService.saveTheme();
    this.updateThemeToggleText();

    // Atualizar toggle nas configurações se existir
    this.updateSettingsToggle(newTheme);

    // Feedback visual
    if (this.themeToggleBtn) {
      this.themeToggleBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (this.themeToggleBtn) {
          this.themeToggleBtn.style.transform = '';
        }
      }, 150);
    }
  }

  /**
   * Atualiza o toggle de dark mode nas configurações
   */
  private updateSettingsToggle(theme: ThemeType): void {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.classList.toggle('active', theme === 'dark');
    }
  }

  /**
   * Atualiza o texto do botão de tema
   */
  private updateThemeToggleText(): void {
    const themeText = this.themeToggleBtn?.querySelector('.theme-toggle-text');
    if (themeText) {
      const themeNames: { [key: string]: string } = {
        'dark': 'Dark',
        'light': 'Light',
        'rgb': 'Dark'
      };
      themeText.textContent = themeNames[this.themes[this.currentThemeIndex]] || 'Dark';
    }
  }

  /**
   * Atualiza o índice do tema (usado pelo SettingsPanel)
   */
  public updateThemeIndex(index: number): void {
    this.currentThemeIndex = index;
    this.updateThemeToggleText();
    // Atualizar toggle nas configurações
    const theme = this.themes[this.currentThemeIndex];
    this.updateSettingsToggle(theme);
  }

  /**
   * Inicializa os botões de tema no painel de configurações
   */
  initThemeButtons(): void {
    const buttons = document.querySelectorAll('.theme-btn-enhanced');

    buttons.forEach((button) => {
      // Remover listeners antigos clonando o botão
      const newButton = button.cloneNode(true) as HTMLElement;
      button.parentNode?.replaceChild(newButton, button);

      // Adicionar novo listener
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const clickedTheme = newButton.getAttribute('data-theme') as ThemeType;

        if (clickedTheme) {
          themeService.applyTheme(clickedTheme);
          themeService.saveTheme();

          // Atualizar índice e texto do toggle
          this.currentThemeIndex = this.themes.indexOf(clickedTheme);
          if (this.currentThemeIndex === -1) this.currentThemeIndex = 0;
          this.updateThemeToggleText();

          // Atualizar active state
          buttons.forEach(btn => btn.classList.remove('active'));
          newButton.classList.add('active');

          // Feedback visual
          newButton.style.transform = 'scale(0.9)';
          setTimeout(() => {
            newButton.style.transform = '';
          }, 200);
        }
      });

      // Marcar como ativo se for o tema atual
      const buttonTheme = newButton.getAttribute('data-theme') as ThemeType;
      if (buttonTheme === themeService.getCurrentTheme()) {
        newButton.classList.add('active');
      }
    });
  }

  /**
   * Inicializa o toggle de visualização no header
   */
  private initViewToggle(): void {
    if (!this.viewToggleHeader) return;

    const buttons = this.viewToggleHeader.querySelectorAll('.view-btn-header');
    
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const view = button.getAttribute('data-view');
        if (view && this.viewToggleHeader) {
          this.viewToggleHeader.setAttribute('data-view', view);
          
          // Disparar evento para atualizar a visualização
          window.dispatchEvent(new CustomEvent('view-toggle-change', {
            detail: { view }
          }));
        }
      });
    });
  }

  /**
   * Retorna o elemento do painel de configurações
   */
  getSettingsPanel(): HTMLElement | null {
    return this.settingsPanel;
  }

  /**
   * Abre o painel de configurações
   */
  openSettings(): void {
    this.settingsPanel?.classList.add('visible');
    setTimeout(() => {
      this.initThemeButtons();
    }, 100);
  }
}
