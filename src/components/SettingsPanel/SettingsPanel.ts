import type { CursorType } from '@/types';
import { cursorService, themeService } from '@/services';
import './SettingsPanel.css';

/**
 * Componente SettingsPanel
 */
export class SettingsPanel {
  private headerInstance: any = null;

  /**
   * Define a instância do Header para usar openSettings
   */
  setHeaderInstance(header: any): void {
    this.headerInstance = header;
  }
  /**
   * Inicializa o painel de configurações
   */
  init(): void {
    this.initDarkModeToggle();
    this.initCursorToggle();
    this.initCursorOptions();
    this.initAdminButton();
  }

  /**
   * Abre o painel de configurações
   */
  open(): void {
    // Usar o método openSettings do Header se disponível
    if (this.headerInstance && typeof this.headerInstance.openSettings === 'function') {
      this.headerInstance.openSettings();
    } else {
      // Fallback: abrir diretamente o painel
      const settingsPanel = document.querySelector('.settings-panel');
      if (settingsPanel) {
        settingsPanel.classList.add('visible');
      }
    }
  }

  /**
   * Inicializa o toggle de modo escuro
   */
  public initDarkModeToggle(): void {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;

    const currentTheme = themeService.getCurrentTheme();
    const isDarkMode = currentTheme === 'dark';
    toggle.classList.toggle('active', isDarkMode);

    toggle.addEventListener('click', () => {
      const isCurrentlyDark = toggle.classList.contains('active');
      const newTheme = isCurrentlyDark ? 'light' : 'dark';
      
      themeService.applyTheme(newTheme);
      themeService.saveTheme();
      toggle.classList.toggle('active', newTheme === 'dark');
      
      // Atualizar o texto do toggle no header se existir
      const headerThemeToggle = document.getElementById('theme-toggle-btn');
      if (headerThemeToggle) {
        const themeText = headerThemeToggle.querySelector('.theme-toggle-text');
        if (themeText) {
          themeText.textContent = newTheme === 'dark' ? 'Dark' : 'Light';
        }
        // Atualizar o índice do tema no Header
        if (this.headerInstance && typeof this.headerInstance.updateThemeIndex === 'function') {
          const themeIndex = newTheme === 'dark' ? 0 : 1;
          this.headerInstance.updateThemeIndex(themeIndex);
        }
      }
    });
  }

  /**
   * Inicializa o toggle do cursor
   */
  public initCursorToggle(): void {
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      const toggle = document.getElementById('cursor-enabled-toggle');
      if (!toggle) {
        console.error('Toggle cursor-enabled-toggle não encontrado após timeout');
        return;
      }

      // Remover todos os listeners antigos clonando o elemento
      const parent = toggle.parentNode;
      if (!parent) return;

      const newToggle = toggle.cloneNode(true) as HTMLElement;
      newToggle.id = 'cursor-enabled-toggle';
      parent.replaceChild(newToggle, toggle);

      // Atualizar estado inicial baseado no cursorService
      const config = cursorService.getConfig();
      if (config.enabled) {
        newToggle.classList.add('active');
      } else {
        newToggle.classList.remove('active');
      }

      // Função para atualizar o estado visual
      const updateToggleState = () => {
        const currentConfig = cursorService.getConfig();
        if (currentConfig.enabled) {
          newToggle.classList.add('active');
        } else {
          newToggle.classList.remove('active');
        }
      };

      // Adicionar listener de forma mais robusta
      const handleToggle = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Obter estado atual ANTES de fazer toggle
        const wasEnabled = cursorService.getConfig().enabled;
        const newState = !wasEnabled;
        
        // Fazer o toggle diretamente
        cursorService.setEnabled(newState);
        
        // Atualizar visual imediatamente
        if (newState) {
          newToggle.classList.add('active');
        } else {
          newToggle.classList.remove('active');
        }
        
        console.log('Cursor toggle:', newState ? 'habilitado' : 'desabilitado');
      };

      // Adicionar listener com capture phase para pegar antes de outros handlers
      newToggle.addEventListener('click', handleToggle, true);
      
      // Também adicionar mousedown como backup
      newToggle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleToggle(e);
      }, true);
      
      // Adicionar no container pai também para garantir
      const toggleContainer = newToggle.closest('.toggle-switch');
      if (toggleContainer) {
        const containerHandler = (e: Event) => {
          const target = e.target as HTMLElement;
          if (target === newToggle || newToggle.contains(target)) {
            handleToggle(e);
          }
        };
        toggleContainer.addEventListener('click', containerHandler, true);
      }
      
      // Garantir que o elemento seja clicável
      newToggle.style.pointerEvents = 'auto';
      newToggle.style.cursor = 'pointer';
    }, 150);
  }

  /**
   * Inicializa as opções de cursor
   */
  public initCursorOptions(): void {
    const options = document.querySelectorAll('.cursor-option');
    const config = cursorService.getConfig();

    options.forEach((option) => {
      const cursorType = option.getAttribute('data-cursor') as CursorType;
      if (cursorType === config.type) {
        option.classList.add('active');
      }

      option.addEventListener('click', () => {
        options.forEach((opt) => opt.classList.remove('active'));
        option.classList.add('active');
        cursorService.setType(cursorType);
      });
    });
  }

  /**
   * Inicializa o botão de admin
   */
  private initAdminButton(): void {
    const btn = document.getElementById('btn-admin-settings');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const adminPanel = document.getElementById('admin-panel');
      const settingsPanel = document.querySelector('.settings-panel');
      if (adminPanel && settingsPanel) {
        settingsPanel.classList.remove('visible');
        adminPanel.classList.add('visible');
      }
    });
  }
}

