import type { CursorType, CursorConfig } from '@/types/cursor';

const STORAGE_KEY_TYPE = 'khroma-cursor-type';
const STORAGE_KEY_ENABLED = 'khroma-cursor-enabled';

const CURSOR_SELECTORS = [
  '.link',
  'a',
  'button',
  '.chroma-card-wrapper',
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
    // enabled é true por padrão, só é false se explicitamente salvo como 'false'
    this.enabled = savedEnabled !== 'false';

    console.log('📥 [CursorService] Configuração carregada do localStorage:', {
      savedType,
      savedEnabled,
      type: this.type,
      enabled: this.enabled
    });

    return {
      type: this.type,
      enabled: this.enabled,
    };
  }

  /**
   * Atualiza o cursor baseado nas configurações
   */
  updateCursor(): void {
    console.log('🔄 [CursorService] Atualizando cursor...');
    
    if (!this.cursorElement) {
      this.cursorElement = document.querySelector('.cursor');
      console.log('🔍 [CursorService] Elemento do cursor:', !!this.cursorElement);
    }

    const config = this.getConfig();
    console.log('📊 [CursorService] Configuração atual:', config);
    console.log('📊 [CursorService] Pointer fine:', window.matchMedia('(pointer: fine)').matches);

    if (window.matchMedia('(pointer: fine)').matches && this.enabled) {
      console.log('✅ [CursorService] Aplicando cursor personalizado');
      this.setupCursor();
    } else {
      console.log('❌ [CursorService] Aplicando cursor padrão');
      this.disableCursor();
    }
  }

  /**
   * Configura o cursor customizado
   */
  private setupCursor(): void {
    console.log('🔧 [CursorService] Configurando cursor personalizado...');
    
    if (!this.cursorElement) {
      this.cursorElement = document.querySelector('.cursor');
      if (!this.cursorElement) {
        console.error('❌ [CursorService] Elemento do cursor não encontrado!');
        return;
      }
    }

    // Remover handlers antigos
    this.removeHandlers();
    console.log('🔧 [CursorService] Handlers antigos removidos');

    // Remover classe de desabilitado e estilo de cursor padrão
    document.body.classList.remove('cursor-disabled');
    const disabledStyle = document.getElementById('cursor-disabled-style');
    if (disabledStyle) {
      disabledStyle.remove();
      console.log('🗑️ [CursorService] Estilo de cursor desabilitado removido');
    }
    
    // Configurar cursor
    this.cursorElement.className = `cursor cursor-${this.type}`;
    this.cursorElement.classList.remove('hidden');
    this.cursorElement.style.display = 'block';
    document.body.style.cursor = 'none';
    document.documentElement.style.cursor = 'none';
    
    console.log('🎨 [CursorService] Cursor configurado com tipo:', this.type);

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
    console.log('🔴 [CursorService] Desabilitando cursor personalizado...');
    
    // Esconder cursor customizado completamente
    if (this.cursorElement) {
      this.cursorElement.style.display = 'none';
      this.cursorElement.classList.add('hidden');
      console.log('👁️ [CursorService] Cursor element escondido');
    }
    
    // Remover handlers
    this.removeHandlers();
    console.log('🔧 [CursorService] Handlers removidos');
    
    // Adicionar classe para desabilitar cursor customizado
    document.body.classList.add('cursor-disabled');
    
    // Remover cursor: none e garantir cursor padrão do sistema
    document.body.style.cursor = '';
    document.documentElement.style.cursor = '';
    console.log('🖱️ [CursorService] Cursor padrão restaurado no body e html');
    
    // Remover cursor: none de todos os elementos que possam ter sido afetados
    document.querySelectorAll('*').forEach((el) => {
      if (el instanceof HTMLElement) {
        if (el.style.cursor === 'none') {
          el.style.cursor = '';
        }
      }
    });
    
    // Forçar cursor padrão em TODOS os elementos com estilo dinâmico
    let style = document.getElementById('cursor-disabled-style') as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = 'cursor-disabled-style';
      document.head.appendChild(style);
      console.log('📝 [CursorService] Estilo de cursor desabilitado criado');
    }
    
    style.textContent = `
      body.cursor-disabled,
      body.cursor-disabled * {
        cursor: auto !important;
      }
      body.cursor-disabled button,
      body.cursor-disabled a,
      body.cursor-disabled .link,
      body.cursor-disabled input,
      body.cursor-disabled textarea,
      body.cursor-disabled select,
      body.cursor-disabled [role="button"],
      body.cursor-disabled .toggle-switch-input {
        cursor: pointer !important;
      }
    `;
    
    console.log('✅ [CursorService] Cursor personalizado DESABILITADO - usando cursor padrão do Windows');
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
    console.log('🔧 [CursorService] setEnabled chamado com:', enabled);
    
    // Atualizar estado interno
    const wasEnabled = this.enabled;
    this.enabled = enabled;
    
    console.log('📊 [CursorService] Estado anterior:', wasEnabled);
    console.log('📊 [CursorService] Estado novo:', this.enabled);
    
    // Garantir que o elemento do cursor existe
    if (!this.cursorElement) {
      this.cursorElement = document.querySelector('.cursor');
      console.log('🔍 [CursorService] Elemento do cursor encontrado:', !!this.cursorElement);
    }
    
    // Aplicar mudanças imediatamente
    if (window.matchMedia('(pointer: fine)').matches && this.enabled) {
      console.log('✅ [CursorService] Habilitando cursor personalizado...');
      this.setupCursor();
      console.log('✅ [CursorService] Cursor personalizado HABILITADO');
    } else {
      console.log('❌ [CursorService] Desabilitando cursor personalizado - usando cursor padrão...');
      this.disableCursor();
      console.log('❌ [CursorService] Cursor personalizado DESABILITADO');
    }
    
    // Salvar no localStorage após atualizar
    this.saveConfig();
    console.log('💾 [CursorService] Configuração salva no localStorage');
    
    // Verificar se foi salvo corretamente
    const savedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED);
    console.log('🔍 [CursorService] Verificação localStorage:', savedEnabled, '===', String(this.enabled));
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
    console.log('💾 [CursorService] Configuração salva:', {
      type: this.type,
      enabled: this.enabled,
      storageType: localStorage.getItem(STORAGE_KEY_TYPE),
      storageEnabled: localStorage.getItem(STORAGE_KEY_ENABLED)
    });
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

