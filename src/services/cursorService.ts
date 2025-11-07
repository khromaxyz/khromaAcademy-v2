import type { CursorType, CursorConfig } from '@/types/cursor';

const STORAGE_KEY_TYPE = 'khroma-cursor-type';
const STORAGE_KEY_ENABLED = 'khroma-cursor-enabled';

const CURSOR_SELECTORS = [
  '.link',
  'a',
  'button',
  '.discipline-card',
  '.graph-node',
  '.discipline-item',
  '.btn-primary',
  '.btn-secondary',
  '.btn-danger',
  '.btn-tertiary',
  '.btn-start-course',
  '.btn-icon',
  '.theme-btn-enhanced',
  '.cursor-option',
  '.toggle-switch-input',
  '.view-btn',
  '.view-toggle',
  '.logo',
  '#settings-close-btn',
  '.settings-btn',
  '.modal-close-btn',
  '.modal-container button',
  '.modal-container .btn-primary',
  '.modal-container .btn-secondary',
  '.modal-container .btn-tertiary',
  '.modal-container .btn-start-course',
  '.discipline-sidebar .nav-item',
  '.discipline-sidebar button',
  '.sidebar-close-btn',
  '.admin-close-btn',
  '.admin-panel button',
  'input[type="text"]',
  'input[type="number"]',
  'textarea',
  'select',
];

/**
 * Serviço para gerenciamento do cursor customizado
 */
export class CursorService {
  private cursorElement: HTMLElement | null = null;
  private enabled = true;
  private type: CursorType = 'classic';
  private moveHandler: ((e: MouseEvent) => void) | null = null;
  private enterHandler: (() => void) | null = null;
  private leaveHandler: (() => void) | null = null;
  private observer: MutationObserver | null = null;

  /**
   * Inicializa o serviço de cursor
   */
  init(): void {
    this.cursorElement = document.querySelector('.cursor');
    if (!this.cursorElement) return;

    this.loadConfig();
    this.updateCursor();
  }

  /**
   * Carrega configurações do localStorage
   */
  loadConfig(): CursorConfig {
    const savedType = localStorage.getItem(STORAGE_KEY_TYPE);
    const savedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED);

    this.type = (savedType as CursorType) || 'classic';
    this.enabled = savedEnabled !== 'false';

    return {
      type: this.type,
      enabled: this.enabled,
    };
  }

  /**
   * Atualiza o cursor baseado nas configurações
   */
  updateCursor(): void {
    if (!this.cursorElement) return;

    if (window.matchMedia('(pointer: fine)').matches && this.enabled) {
      this.setupCursor();
    } else {
      this.disableCursor();
    }
  }

  /**
   * Configura o cursor customizado
   */
  private setupCursor(): void {
    if (!this.cursorElement) return;

    // Remover handlers antigos
    this.removeHandlers();

    // Configurar cursor
    this.cursorElement.className = `cursor cursor-${this.type}`;
    this.cursorElement.style.display = 'block';
    document.body.classList.remove('cursor-disabled');
    document.body.style.cursor = 'none';

    // Criar handlers
    this.moveHandler = (e: MouseEvent) => {
      if (this.cursorElement) {
        this.cursorElement.setAttribute(
          'style',
          `top: ${e.pageY - window.scrollY}px; left: ${e.pageX}px; display: block;`
        );
      }
    };

    this.enterHandler = () => {
      if (this.cursorElement) {
        this.cursorElement.classList.remove('hidden');
      }
    };

    this.leaveHandler = () => {
      // Não esconder o cursor quando sair do body
      // Isso mantém o cursor visível mesmo quando o modal está aberto
    };

    // Adicionar listeners
    document.addEventListener('mousemove', this.moveHandler);
    document.addEventListener('mouseenter', this.enterHandler);
    document.addEventListener('mouseleave', this.leaveHandler);

    // Atualizar targets do cursor
    this.updateCursorTargets();

    // Observar mudanças no DOM
    this.observer = new MutationObserver(() => {
      this.updateCursorTargets();
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Atualiza os elementos que devem reagir ao cursor (público para uso externo)
   */
  public updateCursorTargets(): void {
    if (!this.cursorElement) return;

    CURSOR_SELECTORS.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((el) => {
          if (!el.hasAttribute('data-cursor-listener')) {
            el.setAttribute('data-cursor-listener', 'true');
            el.addEventListener('mouseenter', () => {
              this.cursorElement?.classList.remove('hidden');
              this.cursorElement?.classList.add('grow');
            });
            el.addEventListener('mouseleave', () => {
              this.cursorElement?.classList.remove('grow');
            });
          }
        });
      } catch (error) {
        // Ignorar erros de seletores inválidos
        console.warn('Erro ao aplicar cursor a seletor:', selector, error);
      }
    });

    // Também aplicar a todos os botões e links dinamicamente
    document.querySelectorAll('button:not([data-cursor-listener]), a:not([data-cursor-listener])').forEach((el) => {
      el.setAttribute('data-cursor-listener', 'true');
      el.addEventListener('mouseenter', () => {
        this.cursorElement?.classList.remove('hidden');
        this.cursorElement?.classList.add('grow');
      });
      el.addEventListener('mouseleave', () => {
        this.cursorElement?.classList.remove('grow');
      });
    });
  }

  /**
   * Remove handlers do cursor
   */
  private removeHandlers(): void {
    if (this.moveHandler) {
      document.removeEventListener('mousemove', this.moveHandler);
      this.moveHandler = null;
    }
    if (this.enterHandler) {
      document.removeEventListener('mouseenter', this.enterHandler);
      this.enterHandler = null;
    }
    if (this.leaveHandler) {
      document.removeEventListener('mouseleave', this.leaveHandler);
      this.leaveHandler = null;
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Desabilita o cursor customizado
   */
  disableCursor(): void {
    if (this.cursorElement) {
      this.cursorElement.style.display = 'none';
    }
    document.body.classList.add('cursor-disabled');
    document.body.style.cursor = 'auto';
    this.removeHandlers();
  }

  /**
   * Define o tipo de cursor
   */
  setType(type: CursorType): void {
    this.type = type;
    this.updateCursor();
    this.saveConfig();
  }

  /**
   * Habilita ou desabilita o cursor
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.updateCursor();
    this.saveConfig();
  }

  /**
   * Toggle do cursor
   */
  toggle(): void {
    this.setEnabled(!this.enabled);
  }

  /**
   * Salva configurações no localStorage
   */
  saveConfig(): void {
    localStorage.setItem(STORAGE_KEY_TYPE, this.type);
    localStorage.setItem(STORAGE_KEY_ENABLED, String(this.enabled));
  }

  /**
   * Retorna configuração atual
   */
  getConfig(): CursorConfig {
    return {
      type: this.type,
      enabled: this.enabled,
    };
  }

  /**
   * Limpa recursos ao destruir o serviço
   */
  destroy(): void {
    this.removeHandlers();
  }
}

// Singleton instance
export const cursorService = new CursorService();

