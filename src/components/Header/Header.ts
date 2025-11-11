import type { ThemeType } from '@/types';
import { themeService } from '@/services';
import './Header.css';

/**
 * Componente Header - Minimalist Dark Design
 */
export class Header {
  private settingsPanel: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private themeToggleBtn: HTMLElement | null = null;
  private currentThemeIndex: number = 0;
  private themes: ThemeType[] = ['dark', 'light']; // Dark e Light

  /**
   * Inicializa o componente Header
   */
  init(): void {
    this.settingsPanel = document.querySelector('.settings-panel');
    this.searchInput = document.getElementById('header-search-input') as HTMLInputElement;
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');

    // Carregar tema atual
    const currentTheme = themeService.getCurrentTheme();
    this.currentThemeIndex = this.themes.indexOf(currentTheme);
    if (this.currentThemeIndex === -1) this.currentThemeIndex = 0;
    this.updateThemeToggleText();

    this.setupEventListeners();
    this.initThemeButtons();
  }

  /**
   * Configura os event listeners
   */
  private setupEventListeners(): void {
    // Input de busca - abre CommandPalette ao focar ou digitar
    this.searchInput?.addEventListener('focus', () => {
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    });

    this.searchInput?.addEventListener('keydown', (e) => {
      // Se pressionar Cmd/Ctrl + K, abrir command palette
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (modKey && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    });

    // Toggle de tema
    this.themeToggleBtn?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Fechar settings ao clicar fora (mas não se for no toggle ou admin panel)
    // Usar capture: false e verificar DEPOIS do event delegation do SettingsPanel
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Verificar se clicou no admin panel - NÃO fechar settings se estiver no admin
      const adminPanel = document.getElementById('admin-panel');
      if (adminPanel && adminPanel.contains(target)) {
        return; // Clique no admin panel, não fechar settings
      }
      
      // Verificar se clicou em qualquer parte do toggle ou do container
      const isToggle = target.closest('#cursor-enabled-toggle') || 
                       target.closest('.toggle-switch') ||
                       target.closest('#dark-mode-toggle') ||
                       target.id === 'cursor-enabled-toggle' ||
                       target.id === 'dark-mode-toggle' ||
                       target.classList.contains('toggle-switch-input') ||
                       target.classList.contains('toggle-switch-label');
      
      // Não fechar se clicou no toggle
      if (isToggle) {
        return;
      }
      
      if (
        this.settingsPanel &&
        !this.settingsPanel.contains(target) &&
        this.settingsPanel.classList.contains('visible')
      ) {
        this.settingsPanel.classList.remove('visible');
      }
    }, { capture: false }); // Usar capture: false para rodar DEPOIS do SettingsPanel
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
   * Atualiza o ícone do botão de tema
   */
  private updateThemeToggleText(): void {
    const moonIcon = this.themeToggleBtn?.querySelector('.theme-icon-moon') as HTMLElement;
    const sunIcon = this.themeToggleBtn?.querySelector('.theme-icon-sun') as HTMLElement;
    const currentTheme = this.themes[this.currentThemeIndex];
    
    if (moonIcon && sunIcon) {
      if (currentTheme === 'dark') {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
      } else {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
      }
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
      // Re-inicializar toggle do cursor quando abrir o painel
      const settingsPanel = (window as any).settingsPanelInstance;
      if (settingsPanel && typeof settingsPanel.initCursorToggle === 'function') {
        settingsPanel.initCursorToggle();
      }
    }, 100);
  }
}
