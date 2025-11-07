import type { ThemeType } from '@/types';
import { themeService } from '@/services';
import './Header.css';

/**
 * Componente Header
 */
export class Header {
  private settingsBtn: HTMLElement | null = null;
  private settingsPanel: HTMLElement | null = null;
  private settingsCloseBtn: HTMLElement | null = null;

  /**
   * Inicializa o componente Header
   */
  init(): void {
    this.settingsBtn = document.querySelector('.settings-btn');
    this.settingsPanel = document.querySelector('.settings-panel');
    this.settingsCloseBtn = document.getElementById('settings-close-btn');

    this.setupEventListeners();
    this.initThemeButtons();
  }

  /**
   * Configura os event listeners
   */
  private setupEventListeners(): void {
    // Abrir/fechar painel de configurações
    this.settingsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.settingsPanel?.classList.toggle('visible');
      if (this.settingsPanel?.classList.contains('visible')) {
        // Re-inicializar botões de tema quando abrir
        setTimeout(() => {
          this.initThemeButtons();
        }, 100);
      }
    });

    // Botão de fechar
    this.settingsCloseBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.settingsPanel?.classList.remove('visible');
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (
        this.settingsPanel &&
        this.settingsBtn &&
        !this.settingsPanel.contains(e.target as Node) &&
        !this.settingsBtn.contains(e.target as Node) &&
        this.settingsPanel.classList.contains('visible')
      ) {
        this.settingsPanel.classList.remove('visible');
      }
    });
  }

  /**
   * Inicializa os botões de tema
   */
  private initThemeButtons(): void {
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

          // Feedback visual
          newButton.style.transform = 'scale(0.9)';
          setTimeout(() => {
            newButton.style.transform = '';
          }, 200);
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
}

