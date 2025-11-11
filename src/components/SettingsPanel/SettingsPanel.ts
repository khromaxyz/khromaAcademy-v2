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
    console.log('🔧 [SettingsPanel] Inicializando painel de configurações...');
    
    // Usar event delegation no painel inteiro
    this.setupEventDelegation();
    
    // Inicializar estado inicial dos toggles
    this.updateToggleStates();
    
    this.initCursorOptions();
    // Admin button é tratado por event delegation, não precisa de init separado
    
    // Re-inicializar quando o painel for aberto
    const settingsPanel = document.querySelector('.settings-panel');
    if (settingsPanel) {
      const observer = new MutationObserver(() => {
        if (settingsPanel.classList.contains('visible')) {
          console.log('👁️ [SettingsPanel] Painel aberto - atualizando toggles...');
          setTimeout(() => {
            this.updateToggleStates();
          }, 50);
        }
      });
      
      observer.observe(settingsPanel, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  /**
   * Configura event delegation para todos os toggles e botões
   * MÉTODO ÚNICO E SIMPLES - SEM CLONAGEM
   */
  private setupEventDelegation(): void {
    // Usar event delegation no document para capturar TODOS os cliques
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Verificar se clicou no botão de admin
      const adminBtn = target.closest('#btn-admin-settings') as HTMLElement;
      if (adminBtn || target.id === 'btn-admin-settings') {
        e.stopPropagation();
        this.handleAdminButton();
        return;
      }
      
      // Verificar se clicou em um toggle ou no container
      const toggle = target.closest('.toggle-switch-input') as HTMLElement;
      const container = target.closest('.toggle-switch') as HTMLElement;
      
      if (!toggle && !container) return;
      
      // Determinar qual toggle foi clicado
      let toggleElement: HTMLElement | null = null;
      let toggleId: string | null = null;
      
      if (toggle && toggle.id) {
        toggleElement = toggle;
        toggleId = toggle.id;
      } else if (container) {
        toggleElement = container.querySelector('.toggle-switch-input') as HTMLElement;
        toggleId = toggleElement?.id || null;
      }
      
      if (!toggleElement || !toggleId) return;
      
      // Prevenir propagação para não fechar o painel
      e.stopPropagation();
      
      // Processar cada toggle
      if (toggleId === 'dark-mode-toggle') {
        this.handleDarkModeToggle(toggleElement);
      } else if (toggleId === 'cursor-enabled-toggle') {
        this.handleCursorToggle(toggleElement);
      }
    }, { capture: true }); // Usar capture para pegar antes de outros listeners
  }

  /**
   * Atualiza o estado visual inicial de todos os toggles
   */
  public updateToggleStates(): void {
    // Dark mode toggle
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) {
      const currentTheme = themeService.getCurrentTheme();
      const isDarkMode = currentTheme === 'dark';
      darkToggle.classList.toggle('active', isDarkMode);
    }
    
    // Cursor toggle
    const cursorToggle = document.getElementById('cursor-enabled-toggle');
    if (cursorToggle) {
      const config = cursorService.getConfig();
      cursorToggle.classList.toggle('active', config.enabled);
    }
  }

  /**
   * Handler para dark mode toggle
   */
  private handleDarkModeToggle(toggle: HTMLElement): void {
    const isCurrentlyDark = toggle.classList.contains('active');
    const newTheme = isCurrentlyDark ? 'light' : 'dark';
    
    // Atualizar tema
    themeService.applyTheme(newTheme);
    themeService.saveTheme();
    
    // Atualizar classe active
    toggle.classList.toggle('active', newTheme === 'dark');
    
    console.log('✅ [DarkModeToggle] Toggle clicado - Novo tema:', newTheme);
    
    // Atualizar o texto do toggle no header se existir
    const headerThemeToggle = document.getElementById('theme-toggle-btn');
    if (headerThemeToggle) {
      const themeText = headerThemeToggle.querySelector('.theme-toggle-text');
      if (themeText) {
        themeText.textContent = newTheme === 'dark' ? 'Dark' : 'Light';
      }
      if (this.headerInstance && typeof this.headerInstance.updateThemeIndex === 'function') {
        const themeIndex = newTheme === 'dark' ? 0 : 1;
        this.headerInstance.updateThemeIndex(themeIndex);
      }
    }
  }

  /**
   * Handler para cursor toggle
   */
  private handleCursorToggle(toggle: HTMLElement): void {
    const isActive = toggle.classList.contains('active');
    const newState = !isActive;
    
    // Atualizar classe active
    toggle.classList.toggle('active', newState);
    
    // Atualizar serviço
    cursorService.setEnabled(newState);
    
    // Forçar estilo ciano se ativo (substituído verde)
    if (newState) {
      toggle.style.setProperty('background', '#00fff9', 'important');
      toggle.style.setProperty('background-color', '#00fff9', 'important');
      toggle.style.setProperty('border-color', '#00fff9', 'important');
      toggle.style.setProperty('box-shadow', '0 0 20px rgba(0, 255, 249, 0.5)', 'important');
    } else {
      toggle.style.removeProperty('background');
      toggle.style.removeProperty('background-color');
      toggle.style.removeProperty('border-color');
      toggle.style.removeProperty('box-shadow');
    }
    
    console.log('✅ [CursorToggle] Toggle clicado - Novo estado:', newState ? 'ON' : 'OFF');
  }

  /**
   * Abre o painel de configurações
   */
  open(): void {
    if (this.headerInstance && typeof this.headerInstance.openSettings === 'function') {
      this.headerInstance.openSettings();
    } else {
      const settingsPanel = document.querySelector('.settings-panel');
      if (settingsPanel) {
        settingsPanel.classList.add('visible');
      }
    }
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
   * Handler para botão de admin
   * Usa a instância global do AdminPanel
   */
  private handleAdminButton(): void {
    // Fechar painel de configurações
    const settingsPanel = document.querySelector('.settings-panel');
    if (settingsPanel) {
      settingsPanel.classList.remove('visible');
    }
    
    // Abrir painel admin usando a instância global
    const adminPanelInstance = (window as any).adminPanelInstance;
    if (adminPanelInstance && typeof adminPanelInstance.open === 'function') {
      adminPanelInstance.open();
      console.log('✅ [AdminButton] Painel admin aberto via instância global');
    } else {
      // Fallback: abrir diretamente via DOM
      const adminPanel = document.getElementById('admin-panel');
      if (adminPanel) {
        adminPanel.classList.add('visible');
        console.log('✅ [AdminButton] Painel admin aberto via DOM (fallback)');
      } else {
        console.error('❌ [AdminButton] Painel admin não encontrado');
      }
    }
  }

  // Métodos públicos mantidos para compatibilidade (mas não fazem nada agora)
  public initDarkModeToggle(): void {
    // Não faz nada - event delegation cuida disso
  }

  public initCursorToggle(): void {
    // Não faz nada - event delegation cuida disso
  }
}
