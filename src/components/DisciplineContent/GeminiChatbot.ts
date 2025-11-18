import { geminiService } from '@/services/geminiService';
import { markdownService } from '@/services/markdownService';
import { mermaidService } from '@/services/mermaidService';
import { latexService } from '@/services/latexService';
import { getIcon } from '@/utils/iconLoader';
import './GeminiChatbot.css';

/**
 * Interface para mensagens do chat
 */
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  images?: Array<{ dataUrl: string; mimeType: string }>;
  timestamp: Date;
  isError?: boolean;
  tokenCount?: number;
  messageIndex?: number; // Índice da mensagem no array para rerun
}

/**
 * Componente GeminiChatbot - Chatbot integrado com Google Gemini
 */
export class GeminiChatbot {
  private container: HTMLElement | null = null;
  private messages: ChatMessage[] = [];
  private isProcessing: boolean = false;
  private conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = [];
  private isMinimized: boolean = false;
  private currentWidth: number = 260; // Largura padrão (mesma do TOC)
  private minWidth: number = 200;
  private maxWidth: number = 600;
  private isResizing: boolean = false;
  private attachedImages: Array<{ file: File; dataUrl: string; mimeType: string }> = [];
  private systemInstructionConfig: { includeCurrentPage: boolean } = { includeCurrentPage: false };
  private currentPersona: 'default' | 'tutor' | 'professor' | 'amigo' = 'default';
  private isNearBottom: boolean = true;
  private scrollToBottomBtn: HTMLElement | null = null;
  private chatHistory: Array<{ id: string; title: string; messages: ChatMessage[]; conversationHistory: any[]; timestamp: number }> = [];
  private currentChatId: string | null = null;
  private readonly STORAGE_KEY = 'gemini-chatbot-history';
  private openTabs: Array<{ id: string; title: string }> = [];
  private tokenCounts: Map<string, number> = new Map(); // Armazena tokens por chatId

  /**
   * Cria e retorna o elemento HTML do chatbot
   */
  create(): HTMLElement {
    const chatbot = document.createElement('div');
    chatbot.className = 'gemini-chatbot';
    chatbot.id = 'gemini-chatbot';

    chatbot.innerHTML = `
      <div class="chatbot-resize-handle" id="chatbot-resize-handle" aria-label="Redimensionar chatbot"></div>
      <!-- Header restaurado -->
      <div class="chatbot-header">
        <div class="chatbot-header-title">
          <h3>soph.ia</h3>
          <span class="chatbot-status-badge" id="chatbot-status-badge" style="display: none;" aria-label="Status da API"></span>
        </div>
        <div class="chatbot-tabs-container" id="chatbot-tabs-container">
          <!-- Abas serão inseridas aqui dinamicamente -->
        </div>
        <div class="chatbot-header-actions">
          <button 
            id="chatbot-new-chat-btn" 
            class="chatbot-header-btn"
            aria-label="Novo chat"
            title="Novo chat"
            type="button"
          >
            ${getIcon('plus', { size: 16 })}
          </button>
          <button 
            id="chatbot-history-btn" 
            class="chatbot-header-btn"
            aria-label="Histórico"
            title="Histórico"
            type="button"
          >
            ${getIcon('clock', { size: 16 })}
          </button>
          <button 
            id="chatbot-settings-btn" 
            class="chatbot-header-btn"
            aria-label="Configurações"
            title="Configurações"
            type="button"
          >
            ${getIcon('settings', { size: 16 })}
          </button>
          <button 
            id="chatbot-minimize-btn" 
            class="chatbot-minimize-btn chatbot-header-btn"
            aria-label="${this.isMinimized ? 'Maximizar chatbot' : 'Minimizar chatbot'}"
            title="${this.isMinimized ? 'Maximizar chatbot' : 'Minimizar chatbot'}"
            type="button"
          >
            ${getIcon(this.isMinimized ? 'chevron-right' : 'chevron-left', { size: 16 })}
          </button>
        </div>
      </div>
      <div class="chatbot-content" id="chatbot-content">
        <div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite" aria-label="Mensagens do chat">
          <div class="chatbot-welcome" role="status">
            <div class="chatbot-icebreakers">
              ${this.getAllIcebreakers().map((icebreaker, index) => {
                const emojis = ['📄', '🎯', '💡', '🚀'];
                return `
                <button 
                  class="chatbot-icebreaker-btn" 
                  data-icebreaker="${index}"
                  data-emoji="${emojis[index]}"
                  type="button"
                  aria-label="${icebreaker}"
                >
                  ${icebreaker}
                </button>
              `;
              }).join('')}
            </div>
          </div>
        </div>
        <button 
          id="chatbot-scroll-to-bottom-btn" 
          class="chatbot-scroll-to-bottom-btn"
          aria-label="Voltar ao final"
          title="Voltar ao final"
          type="button"
          style="display: none;"
        >
          ${getIcon('chevron-down', { size: 20 })}
        </button>
        <div class="chatbot-input-container">
          <div class="chatbot-images-preview" id="chatbot-images-preview" style="display: none;"></div>
          <input 
            type="file" 
            id="chatbot-image-input" 
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            multiple
            style="display: none;"
            aria-label="Selecionar imagens para anexar"
          />
          <div class="chatbot-input-wrapper">
            <input 
              type="text" 
              id="chatbot-input" 
              class="chatbot-input" 
              placeholder="Digite sua mensagem..."
              aria-label="Campo de entrada de mensagem"
              aria-describedby="chatbot-input-help"
            />
            <span id="chatbot-input-help" class="sr-only">Pressione Enter para enviar ou clique no botão de envio</span>
            <div class="chatbot-input-actions">
              <div class="chatbot-menu-wrapper">
              <button 
                  id="chatbot-menu-btn" 
                  class="chatbot-menu-btn"
                  aria-label="Abrir menu"
                type="button"
                  title="Abrir menu"
              >
                  ${getIcon('plus', { size: 18 })}
              </button>
                <div class="chatbot-main-menu" id="chatbot-main-menu" style="display: none;">
                  <button 
                    class="chatbot-menu-option"
                    data-action="images"
                    type="button"
                  >
                    <span class="chatbot-menu-option-icon">🖼️</span>
                    <div class="chatbot-menu-option-content">
                      <span class="chatbot-menu-option-name">Imagens</span>
                      <span class="chatbot-menu-option-desc">Anexar imagens</span>
                    </div>
                  </button>
                  <button 
                    class="chatbot-menu-option"
                    data-action="personas"
                    type="button"
                  >
                    <span class="chatbot-menu-option-icon">👤</span>
                    <div class="chatbot-menu-option-content">
                      <span class="chatbot-menu-option-name">Personas</span>
                      <span class="chatbot-menu-option-desc">Escolher estilo de resposta</span>
                    </div>
                    <span class="chatbot-menu-option-arrow">›</span>
                  </button>
                </div>
                <div class="chatbot-personas-menu" id="chatbot-personas-menu" style="display: none;">
                  <button 
                    class="chatbot-menu-option chatbot-menu-option-back"
                    data-action="back"
                    type="button"
                  >
                    <span class="chatbot-menu-option-icon">←</span>
                    <div class="chatbot-menu-option-content">
                      <span class="chatbot-menu-option-name">Voltar</span>
                    </div>
                  </button>
                  <button 
                    class="chatbot-persona-option ${this.currentPersona === 'default' ? 'active' : ''}"
                    data-persona="default"
                    type="button"
                  >
                    <span class="chatbot-persona-option-icon">💬</span>
                    <div class="chatbot-persona-option-content">
                      <span class="chatbot-persona-option-name">Padrão</span>
                      <span class="chatbot-persona-option-desc">Assistente versátil</span>
                    </div>
                  </button>
                  <button 
                    class="chatbot-persona-option ${this.currentPersona === 'tutor' ? 'active' : ''}"
                    data-persona="tutor"
                    type="button"
                  >
                    <span class="chatbot-persona-option-icon">📚</span>
                    <div class="chatbot-persona-option-content">
                      <span class="chatbot-persona-option-name">Tutor Didático</span>
                      <span class="chatbot-persona-option-desc">Explicações claras e acessíveis</span>
                    </div>
                  </button>
                  <button 
                    class="chatbot-persona-option ${this.currentPersona === 'professor' ? 'active' : ''}"
                    data-persona="professor"
                    type="button"
                  >
                    <span class="chatbot-persona-option-icon">🎓</span>
                    <div class="chatbot-persona-option-content">
                      <span class="chatbot-persona-option-name">Professor Formal</span>
                      <span class="chatbot-persona-option-desc">Linguagem formal e rigor matemático</span>
                    </div>
                  </button>
                  <button 
                    class="chatbot-persona-option ${this.currentPersona === 'amigo' ? 'active' : ''}"
                    data-persona="amigo"
                    type="button"
                  >
                    <span class="chatbot-persona-option-icon">🤝</span>
                    <div class="chatbot-persona-option-content">
                      <span class="chatbot-persona-option-name">Amigo</span>
                      <span class="chatbot-persona-option-desc">Tom casual e descontraído</span>
                    </div>
                  </button>
                </div>
              </div>
              <button 
                id="chatbot-send-btn" 
                class="chatbot-send-btn"
                aria-label="Enviar mensagem"
                type="submit"
              >
                ${getIcon('arrow-right', { size: 18 })}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Aplicar largura inicial
    chatbot.style.width = `${this.currentWidth}px`;
    chatbot.style.minWidth = `${this.minWidth}px`;
    chatbot.style.maxWidth = `${this.maxWidth}px`;

    this.container = chatbot;
    
    // Inicializar ícones Lucide após inserir no DOM
    // Usar setTimeout para garantir que o elemento esteja no DOM antes de inicializar
    const initIcons = () => {
      if (typeof lucide !== 'undefined' && chatbot.parentElement) {
        try {
          lucide.createIcons({
            baseElement: chatbot
          });
        } catch (error) {
          console.warn('Erro ao inicializar ícones Lucide:', error);
        }
      } else if (typeof lucide !== 'undefined') {
        // Se ainda não estiver no DOM, tentar novamente
        setTimeout(initIcons, 50);
      }
    };
    
    // Tentar inicializar imediatamente e também após um delay
    requestAnimationFrame(() => {
      initIcons();
    });
    
    this.setupEventListeners();
    this.setupResize();
    this.setupMinimize();
    this.setupSettingsButton();
    this.setupNewChatButton();
    this.setupHistoryButton();
    this.setupPersonaMenu();
    this.loadChatHistory();
    this.createScrollToBottomButton();
    this.setupScrollListener();
    this.setupIcebreakers();
    // Atualizar status da API após criar o elemento
    this.updateApiKeyStatus();
    // Criar aba inicial se não houver
    if (this.openTabs.length === 0 && !this.currentChatId) {
      this.currentChatId = `chat-${Date.now()}`;
      this.addTab(this.currentChatId, 'Nova conversa');
    }
    return chatbot;
  }

  /**
   * Retorna todas as mensagens de quebra-gelo
   */
  private getAllIcebreakers(): string[] {
    return [
      "Me resuma o conteúdo dessa página",
      "Quais são os principais tópicos abordados aqui?",
      "Explique os conceitos mais importantes desta página",
      "Como posso aplicar o conteúdo desta página na prática?"
    ];
  }

  /**
   * Retorna uma mensagem de quebra-gelo aleatória (mantido para compatibilidade)
   */
  private getRandomIcebreaker(): string {
    const icebreakers = this.getAllIcebreakers();
    const randomIndex = Math.floor(Math.random() * icebreakers.length);
    return icebreakers[randomIndex];
  }

  /**
   * Configura os event listeners
   */
  private setupEventListeners(): void {
    const input = this.container?.querySelector('#chatbot-input') as HTMLInputElement;
    const sendBtn = this.container?.querySelector('#chatbot-send-btn') as HTMLButtonElement;

    if (!input || !sendBtn) return;

    // Verificar e atualizar estado da API key
    this.updateApiKeyStatus();

    // Enviar ao clicar no botão
    sendBtn.addEventListener('click', () => this.handleSendMessage());

    // Enviar ao pressionar Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
      // Suporte a Shift+Enter para nova linha (se necessário no futuro)
      if (e.key === 'Enter' && e.shiftKey) {
        // Permitir quebra de linha
      }
    });

    // Focar no input quando o componente for criado
    setTimeout(() => input.focus(), 100);
  }

  /**
   * Configura o menu de seleção de personas e imagens
   */
  private setupPersonaMenu(): void {
    const menuBtn = this.container?.querySelector('#chatbot-menu-btn') as HTMLButtonElement;
    const mainMenu = this.container?.querySelector('#chatbot-main-menu') as HTMLElement;
    const personasMenu = this.container?.querySelector('#chatbot-personas-menu') as HTMLElement;
    const imageInput = this.container?.querySelector('#chatbot-image-input') as HTMLInputElement;
    const menuOptions = this.container?.querySelectorAll('.chatbot-menu-option') as NodeListOf<HTMLButtonElement>;
    const personaOptions = this.container?.querySelectorAll('.chatbot-persona-option') as NodeListOf<HTMLButtonElement>;

    if (!menuBtn || !mainMenu || !personasMenu) return;

    // Toggle do menu principal ao clicar no botão
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = mainMenu.style.display !== 'none' || personasMenu.style.display !== 'none';
      if (isVisible) {
        this.closeAllMenus();
      } else {
        this.openMainMenu();
      }
    });

    // Fechar menus ao clicar fora
    document.addEventListener('click', (e) => {
      if (
        !mainMenu.contains(e.target as Node) && 
        !personasMenu.contains(e.target as Node) && 
        !menuBtn.contains(e.target as Node)
      ) {
        this.closeAllMenus();
      }
    });

    // Ações do menu principal
    menuOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = option.getAttribute('data-action');
        
        if (action === 'images') {
          if (imageInput) {
        imageInput.click();
          }
          this.closeAllMenus();
        } else if (action === 'personas') {
          this.openPersonasMenu();
        } else if (action === 'back') {
          this.openMainMenu();
        }
      });
    });

    // Selecionar persona
    personaOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const persona = option.getAttribute('data-persona') as 'default' | 'tutor' | 'professor' | 'amigo';
        if (persona) {
          this.selectPersona(persona);
          this.closeAllMenus();
        }
      });
    });

    // Handler para seleção de imagens
    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          this.handleImageUpload(Array.from(files));
        }
        imageInput.value = '';
      });
    }

    // Suporte para colar imagens (Ctrl+V / Cmd+V)
    if (this.container) {
      this.container.addEventListener('paste', (e) => this.handlePaste(e));
    }
  }

  /**
   * Abre o menu principal
   */
  private openMainMenu(): void {
    const mainMenu = this.container?.querySelector('#chatbot-main-menu') as HTMLElement;
    const personasMenu = this.container?.querySelector('#chatbot-personas-menu') as HTMLElement;
    
    if (!mainMenu) return;
    
    personasMenu.style.display = 'none';
    mainMenu.style.display = 'block';
    this.adjustMenuPosition(mainMenu);
  }

  /**
   * Abre o menu de personas
   */
  private openPersonasMenu(): void {
    const mainMenu = this.container?.querySelector('#chatbot-main-menu') as HTMLElement;
    const personasMenu = this.container?.querySelector('#chatbot-personas-menu') as HTMLElement;
    
    if (!personasMenu) return;
    
    mainMenu.style.display = 'none';
    personasMenu.style.display = 'block';
    this.adjustMenuPosition(personasMenu);
  }

  /**
   * Fecha todos os menus
   */
  private closeAllMenus(): void {
    const mainMenu = this.container?.querySelector('#chatbot-main-menu') as HTMLElement;
    const personasMenu = this.container?.querySelector('#chatbot-personas-menu') as HTMLElement;
    
    if (mainMenu) mainMenu.style.display = 'none';
    if (personasMenu) personasMenu.style.display = 'none';
  }

  /**
   * Ajusta a posição do menu baseado na posição do chatbot na tela
   */
  private adjustMenuPosition(menu: HTMLElement): void {
    if (!this.container || !menu) return;

    const menuBtn = this.container.querySelector('#chatbot-menu-btn') as HTMLElement;
    if (!menuBtn) return;

    const btnRect = menuBtn.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // Verificar se o chatbot está na direita da tela
    // Se o botão está na metade direita da tela, abrir menu para a esquerda
    const isOnRightSide = btnRect.left > viewportWidth / 2;
    
    if (isOnRightSide) {
      // Abrir para a esquerda (alinhar à direita do botão)
      menu.style.left = 'auto';
      menu.style.right = '0';
    } else {
      // Abrir para a direita (alinhar à esquerda do botão)
      menu.style.left = '0';
      menu.style.right = 'auto';
    }
  }

  /**
   * Seleciona uma persona e atualiza a interface
   */
  private selectPersona(persona: 'default' | 'tutor' | 'professor' | 'amigo'): void {
    this.currentPersona = persona;
    
    // Atualizar classes active nas opções
    const personaOptions = this.container?.querySelectorAll('.chatbot-persona-option') as NodeListOf<HTMLButtonElement>;
    personaOptions.forEach(option => {
      const optionPersona = option.getAttribute('data-persona');
      if (optionPersona === persona) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  /**
   * Configura os quebra-gelos clicáveis
   */
  private setupIcebreakers(): void {
    const icebreakerButtons = this.container?.querySelectorAll('.chatbot-icebreaker-btn') as NodeListOf<HTMLButtonElement>;
    if (!icebreakerButtons || icebreakerButtons.length === 0) return;

    icebreakerButtons.forEach((button) => {
      // Remover listeners anteriores para evitar duplicação
      const newButton = button.cloneNode(true) as HTMLButtonElement;
      button.parentNode?.replaceChild(newButton, button);
      
      newButton.addEventListener('click', () => {
        // Pegar a mensagem do data-attribute ou do texto (removendo emoji se presente)
        const icebreakerIndex = newButton.getAttribute('data-icebreaker');
        const icebreakers = this.getAllIcebreakers();
        const message = icebreakerIndex !== null 
          ? icebreakers[parseInt(icebreakerIndex)] 
          : newButton.textContent?.replace('💡', '').trim() || '';
        
        if (message) {
          // Remover os quebra-gelos
          const welcome = this.container?.querySelector('.chatbot-welcome') as HTMLElement;
          if (welcome) {
            welcome.remove();
          }
          // Preencher o input e enviar a mensagem
          const input = this.container?.querySelector('#chatbot-input') as HTMLInputElement;
          if (input) {
            input.value = message;
            this.handleSendMessage();
          }
        }
      });
    });
  }

  /**
   * Configura o botão de novo chat
   */
  private setupNewChatButton(): void {
    const newChatBtn = this.container?.querySelector('#chatbot-new-chat-btn') as HTMLButtonElement;
    if (!newChatBtn) return;

    newChatBtn.addEventListener('click', () => {
      this.createNewChat();
    });
  }

  /**
   * Configura o botão de histórico
   */
  private setupHistoryButton(): void {
    const historyBtn = this.container?.querySelector('#chatbot-history-btn') as HTMLButtonElement;
    if (!historyBtn) return;

    historyBtn.addEventListener('click', () => {
      this.showHistoryModal();
    });
  }

  /**
   * Configura o botão de configurações
   */
  private setupSettingsButton(): void {
    const settingsBtn = this.container?.querySelector('#chatbot-settings-btn') as HTMLButtonElement;
    if (!settingsBtn) return;

    settingsBtn.addEventListener('click', () => {
      this.showSettingsModal();
    });
  }

  /**
   * Atualiza o estado da API key e habilita/desabilita o input
   */
  private updateApiKeyStatus(): void {
    const input = this.container?.querySelector('#chatbot-input') as HTMLInputElement;
    const sendBtn = this.container?.querySelector('#chatbot-send-btn') as HTMLButtonElement;
    const menuBtn = this.container?.querySelector('#chatbot-menu-btn') as HTMLButtonElement;
    const statusBadge = this.container?.querySelector('#chatbot-status-badge') as HTMLElement;

    if (!input || !sendBtn) return;

    const isConfigured = geminiService.isConfigured();

    if (isConfigured) {
      input.disabled = false;
      sendBtn.disabled = false;
      if (menuBtn) menuBtn.disabled = false;
      if (statusBadge) {
        statusBadge.style.display = 'none';
        statusBadge.setAttribute('aria-label', 'API configurada');
      }
    } else {
      input.disabled = true;
      sendBtn.disabled = true;
      if (menuBtn) menuBtn.disabled = true;
      if (statusBadge) {
        statusBadge.style.display = 'inline-flex';
        statusBadge.textContent = 'API não configurada';
        statusBadge.setAttribute('aria-label', 'API não configurada');
        statusBadge.className = 'chatbot-warning';
      }
    }
  }

  /**
   * Obtém o texto de status da API key
   */
  private getApiKeyStatusText(): string {
    const status = geminiService.getApiKeyStatus();
    if (status.configured) {
      if (status.source === 'env') {
        return '✅ API key configurada (variável de ambiente)';
      } else {
        return '✅ API key configurada (localStorage)';
      }
    } else {
      return '⚠️ API key não configurada. Configure para usar o chatbot.';
    }
  }

  /**
   * Manipula o envio de mensagem
   */
  private async handleSendMessage(): Promise<void> {
    // Verificar API key antes de processar
    this.updateApiKeyStatus();
    
    const input = this.container?.querySelector('#chatbot-input') as HTMLInputElement;
    const sendBtn = this.container?.querySelector('#chatbot-send-btn') as HTMLButtonElement;
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;

    if (!input || !sendBtn || !messagesContainer || this.isProcessing) return;

    // Verificar se está configurado
    if (!geminiService.isConfigured()) {
      this.addMessage('assistant', 'Erro: API key do Gemini não está configurada. Por favor, reinicie o servidor de desenvolvimento após configurar a variável de ambiente VITE_GEMINI_API_KEY.', true);
      return;
    }

    const message = input.value.trim();
    
    // Verificar se há mensagem ou imagens para enviar
    if (!message && this.attachedImages.length === 0) return;

    // Preparar imagens para envio (remover prefixo data:image/...;base64,)
    const imagesForApi = this.attachedImages.map(img => {
      // Remover o prefixo data:image/...;base64, do dataUrl
      const base64Data = img.dataUrl.includes(',') 
        ? img.dataUrl.split(',')[1] 
        : img.dataUrl;
      
      return {
        mimeType: img.mimeType,
        data: base64Data,
      };
    });

    // Preparar imagens para exibição (manter dataUrl completo)
    const imagesForDisplay = this.attachedImages.map(img => ({
      dataUrl: img.dataUrl,
      mimeType: img.mimeType,
    }));

    // Limpar input e imagens anexadas
    input.value = '';
    this.attachedImages = [];
    this.updateImagesPreview();
    
    input.disabled = true;
    sendBtn.disabled = true;
    this.isProcessing = true;

    // Adicionar mensagem do usuário com imagens
    this.addMessage('user', message || '(imagem)', false, imagesForDisplay);
    this.scrollToBottom(true); // Forçar scroll quando usuário envia mensagem

    // Remover mensagem de boas-vindas se existir
    const welcome = messagesContainer.querySelector('.chatbot-welcome');
    if (welcome) {
      welcome.remove();
    }

    try {
      // Mostrar indicador de loading
      const loadingId = this.showLoading();

      // Carregar system instruction se configurado
      const systemInstruction = await this.loadSystemInstruction(message || '');

      // Enviar para Gemini (com imagens e system instruction se houver)
      const response = await geminiService.sendMessage(
        message || '',
        imagesForApi.length > 0 ? imagesForApi : undefined,
        this.conversationHistory,
        systemInstruction || undefined
      );

      // Remover loading
      this.hideLoading(loadingId);

      // Estimar tokens (aproximação: ~4 caracteres por token)
      const estimatedTokens = Math.ceil(response.length / 4);

      // Adicionar resposta do assistente com índice para rerun
      const messageIndex = this.messages.length;
      this.addMessage('assistant', response, false, undefined, false, estimatedTokens, messageIndex);

      // Construir partes da mensagem do usuário para o histórico
      const userParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      if (message.trim()) {
        userParts.push({ text: message });
      }
      if (imagesForApi.length > 0) {
        for (const img of imagesForApi) {
          userParts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data,
            },
          });
        }
      }

      // Atualizar histórico de conversa
      this.conversationHistory.push(
        { role: 'user', parts: userParts },
        { role: 'model', parts: [{ text: response }] }
      );

      // Criar ID de chat se não existir
      if (!this.currentChatId) {
        this.currentChatId = `chat-${Date.now()}`;
        this.addTab(this.currentChatId, 'Nova conversa');
      }

      // Salvar chat automaticamente após cada mensagem (atualiza título da aba também)
      this.saveCurrentChat();
      
      // Atualizar barra de progresso de tokens
      if (this.currentChatId) {
        this.updateTabs().catch(err => console.error('Erro ao atualizar abas:', err));
      }

      // Forçar scroll quando a resposta do assistente chegar (independente da posição)
      this.scrollToBottom(true);
    } catch (error) {
      // Remover loading se ainda estiver visível
      const loading = messagesContainer.querySelector('.chatbot-loading');
      if (loading) {
        loading.remove();
      }

      // Mostrar erro
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao comunicar com o Gemini';
      this.addMessage('assistant', `Erro: ${errorMessage}`, true);
      // Forçar scroll quando houver erro (independente da posição)
      this.scrollToBottom(true);
      
      // Anunciar erro para leitores de tela
      if (messagesContainer) {
        messagesContainer.setAttribute('aria-live', 'assertive');
        setTimeout(() => {
          messagesContainer.setAttribute('aria-live', 'polite');
        }, 1000);
      }
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      this.isProcessing = false;
      input.focus();
    }
  }

  /**
   * Manipula o upload de imagens
   */
  private async handleImageUpload(files: File[]): Promise<void> {
    const MAX_IMAGES = 4;
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    // Verificar limite de imagens
    if (this.attachedImages.length + files.length > MAX_IMAGES) {
      this.addMessage('assistant', `Erro: Você pode anexar no máximo ${MAX_IMAGES} imagens por mensagem.`, true);
      return;
    }

    for (const file of files) {
      // Validar tipo
      if (!ALLOWED_TYPES.includes(file.type)) {
        this.addMessage('assistant', `Erro: O arquivo "${file.name}" não é um tipo de imagem suportado. Use JPG, PNG, GIF ou WEBP.`, true);
        continue;
      }

      // Validar tamanho
      if (file.size > MAX_SIZE_BYTES) {
        this.addMessage('assistant', `Erro: A imagem "${file.name}" é muito grande. Tamanho máximo: ${MAX_SIZE_MB}MB.`, true);
        continue;
      }

      // Converter para base64
      try {
        const dataUrl = await this.convertFileToBase64(file);
        const mimeType = file.type;

        // Adicionar à lista de imagens anexadas
        this.attachedImages.push({ file, dataUrl, mimeType });

        // Atualizar preview
        this.updateImagesPreview();
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        this.addMessage('assistant', `Erro ao processar a imagem "${file.name}".`, true);
      }
    }
  }

  /**
   * Converte um arquivo para base64
   */
  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erro ao converter arquivo para base64'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Atualiza o preview de imagens anexadas
   */
  private updateImagesPreview(): void {
    const previewContainer = this.container?.querySelector('#chatbot-images-preview') as HTMLElement;
    if (!previewContainer) return;

    if (this.attachedImages.length === 0) {
      previewContainer.style.display = 'none';
      previewContainer.innerHTML = '';
      return;
    }

    previewContainer.style.display = 'flex';
    previewContainer.innerHTML = this.attachedImages
      .map((image, index) => `
        <div class="chatbot-image-preview" data-index="${index}">
          <img src="${image.dataUrl}" alt="Preview da imagem ${index + 1}" />
          <button 
            class="chatbot-image-remove" 
            aria-label="Remover imagem ${index + 1}"
            data-index="${index}"
            type="button"
          >
            ${getIcon('x', { size: 14 })}
          </button>
        </div>
      `)
      .join('');

    // Adicionar listeners para botões de remover
    previewContainer.querySelectorAll('.chatbot-image-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).getAttribute('data-index') || '0');
        this.removeImage(index);
      });
    });
  }

  /**
   * Remove uma imagem da lista de anexos
   */
  private removeImage(index: number): void {
    if (index >= 0 && index < this.attachedImages.length) {
      this.attachedImages.splice(index, 1);
      this.updateImagesPreview();
    }
  }

  /**
   * Manipula o evento de colar (Ctrl+V / Cmd+V)
   */
  private async handlePaste(e: ClipboardEvent): Promise<void> {
    // Verificar se a API está configurada
    if (!geminiService.isConfigured()) {
      return;
    }

    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Verificar se há arquivos de imagem no clipboard
    const items = Array.from(clipboardData.items);
    const imageFiles: File[] = [];

    for (const item of items) {
      // Verificar se é uma imagem
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    // Se houver imagens, processá-las
    if (imageFiles.length > 0) {
      e.preventDefault(); // Prevenir o comportamento padrão de colar
      await this.handleImageUpload(imageFiles);
    }
  }

  /**
   * Adiciona uma mensagem ao chat
   */
  private addMessage(role: 'user' | 'assistant', content: string, isError: boolean = false, images?: Array<{ dataUrl: string; mimeType: string }>, skipPush: boolean = false, tokenCount?: number, messageIndex?: number): void {
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (!messagesContainer) return;

    const message: ChatMessage = {
      role,
      content,
      isError,
      images,
      timestamp: new Date(),
      tokenCount,
      messageIndex: messageIndex !== undefined ? messageIndex : this.messages.length,
    };

    if (!skipPush) {
      this.messages.push(message);
    }

    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message chatbot-message-${role} ${isError ? 'chatbot-message-error' : ''}`;
    messageEl.setAttribute('role', 'article');
    messageEl.setAttribute('aria-label', `${role === 'user' ? 'Mensagem do usuário' : 'Resposta do assistente'}`);
    if (role === 'assistant' && messageIndex !== undefined) {
      messageEl.setAttribute('data-message-index', messageIndex.toString());
    }
    
    // Construir HTML das imagens se houver
    const imagesHtml = images && images.length > 0
      ? `<div class="chatbot-message-images">
          ${images.map(img => `<img src="${img.dataUrl}" alt="Imagem anexada" class="chatbot-message-image" />`).join('')}
        </div>`
      : '';

    // Footer com opções para mensagens do assistente
    const footerHtml = role === 'assistant' && !isError
      ? `
        <div class="chatbot-message-footer">
          <div class="chatbot-message-meta">
            <span class="chatbot-message-time">${this.formatTime(message.timestamp)}</span>
            ${tokenCount ? `<span class="chatbot-message-tokens">${tokenCount.toLocaleString('pt-BR')} tokens</span>` : ''}
          </div>
          <button 
            class="chatbot-message-rerun-btn" 
            data-message-index="${messageIndex !== undefined ? messageIndex : ''}"
            aria-label="Rodar mensagem novamente"
            title="Rodar mensagem novamente"
            type="button"
          >
            ${getIcon('refresh-cw', { size: 16 })}
          </button>
        </div>
      `
      : `
        <div class="chatbot-message-time" aria-label="Horário da mensagem">
          ${this.formatTime(message.timestamp)}
        </div>
      `;

    messageEl.innerHTML = `
      ${imagesHtml}
      <div class="chatbot-message-content" role="text">
        ${this.formatMessage(content)}
      </div>
      ${footerHtml}
    `;

    messagesContainer.appendChild(messageEl);

    // Adicionar event listener para botão de rerun
    if (role === 'assistant' && !isError) {
      const rerunBtn = messageEl.querySelector('.chatbot-message-rerun-btn') as HTMLButtonElement;
      if (rerunBtn && messageIndex !== undefined) {
        rerunBtn.addEventListener('click', () => {
          this.rerunMessage(messageIndex);
        });
      }
    }

    // Inicializar ícones Lucide
    if (typeof lucide !== 'undefined') {
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            lucide.createIcons({ baseElement: messageEl });
          } catch (error) {
            console.warn('Erro ao inicializar ícones Lucide na mensagem:', error);
          }
        }, 50);
      });
    }

    // Processar LaTeX e diagramas Mermaid para mensagens do assistente (após inserção no DOM)
    if (role === 'assistant' && !isError) {
      requestAnimationFrame(() => {
        setTimeout(async () => {
          try {
            const messageContent = messageEl.querySelector('.chatbot-message-content') as HTMLElement;
            if (messageContent) {
              // Renderizar LaTeX primeiro (pode afetar layout)
              latexService.render(messageContent);
              
              // Depois processar Mermaid
              await mermaidService.render(messageContent);
            }
          } catch (error) {
            console.warn('Erro ao processar LaTeX/Mermaid:', error);
          }
        }, 100);
      });
    }
  }

  /**
   * Rerun uma mensagem (re-envia a última mensagem do usuário antes dessa resposta)
   */
  private async rerunMessage(messageIndex: number): Promise<void> {
    // Encontrar a mensagem do assistente
    const assistantMessage = this.messages[messageIndex];
    if (!assistantMessage || assistantMessage.role !== 'assistant') return;

    // Encontrar a última mensagem do usuário antes dessa resposta
    let userMessageIndex = -1;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (this.messages[i].role === 'user') {
        userMessageIndex = i;
        break;
      }
    }

    if (userMessageIndex === -1) return;

    const userMessage = this.messages[userMessageIndex];
    
    // Remover todas as mensagens a partir da mensagem do usuário (incluindo a mensagem do usuário e a resposta do assistente)
    this.messages = this.messages.slice(0, userMessageIndex);
    
    // Remover do histórico de conversa também (remover a última entrada do usuário e do assistente)
    // O histórico tem formato: [user, model, user, model, ...]
    // Precisamos remover os últimos 2 itens (user e model)
    if (this.conversationHistory.length >= 2) {
      this.conversationHistory = this.conversationHistory.slice(0, -2);
    } else if (this.conversationHistory.length === 1) {
      this.conversationHistory = [];
    }

    // Re-renderizar mensagens
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      this.messages.forEach((msg, idx) => {
        this.addMessage(msg.role, msg.content, msg.isError, msg.images, true, msg.tokenCount, idx);
      });
    }

    // Re-enviar a mensagem
    const input = this.container?.querySelector('#chatbot-input') as HTMLInputElement;
    if (input) {
      input.value = userMessage.content;
      await this.handleSendMessage();
      
      // Atualizar barra de progresso de tokens após rerun
      if (this.currentChatId) {
        this.updateTabs().catch(err => console.error('Erro ao atualizar abas:', err));
      }
    }
  }

  /**
   * Formata a mensagem usando MarkdownService completo (suporte a Markdown, LaTeX e Mermaid)
   */
  private formatMessage(content: string): string {
    try {
      return markdownService.render(content);
    } catch (error) {
      console.error('Erro ao renderizar markdown:', error);
      // Fallback: escapar HTML básico
      const escapeHtml = (text: string) => {
        const map: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
      };
      return escapeHtml(content).replace(/\n/g, '<br>');
    }
  }

  /**
   * Simula efeito de digitação progressiva para uma mensagem
   */
  private async simulateTypingMessage(content: string, messageEl: HTMLElement, contentEl: HTMLElement): Promise<void> {
    const words = content.split(/(\s+)/);
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += words[i];
      // Renderizar markdown incrementalmente
      const rendered = this.formatMessage(currentText);
      contentEl.innerHTML = rendered;
      
      // Pequeno delay entre palavras para efeito de digitação
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    // Após digitação completa, processar Mermaid e LaTeX
    requestAnimationFrame(() => {
      setTimeout(async () => {
        try {
          // Renderizar LaTeX primeiro (pode afetar layout)
          latexService.render(contentEl);
          
          // Depois processar Mermaid
          await mermaidService.render(contentEl);
        } catch (error) {
          console.warn('Erro ao processar diagramas Mermaid após digitação:', error);
        }
      }, 100);
    });
  }

  /**
   * Manipula o teste de debug (simula mensagem com exemplos de markdown, LaTeX e Mermaid)
   */
  private async handleDebugTest(): Promise<void> {
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (!messagesContainer) return;

    // Remover mensagem de boas-vindas se existir
    const welcome = messagesContainer.querySelector('.chatbot-welcome');
    if (welcome) {
      welcome.remove();
    }

    // Conteúdo de teste com exemplos de markdown, LaTeX e Mermaid
    const testContent = `# Teste de Renderização

Este é um teste completo de renderização de **Markdown**, LaTeX e Mermaid.

## Exemplos de Markdown

### Listas

Lista não ordenada:
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

Lista ordenada:
1. Primeiro item
2. Segundo item
3. Terceiro item

### Código

Código inline: \`console.log('Hello World')\`

Bloco de código:

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

### Tabela

| Estrutura | Busca | Inserção | Remoção | Uso |
|-----------|-------|----------|---------|-----|
| Array | $O(n)$ | $O(1)$ | $O(n)$ | Lista simples |
| Hash Table | $O(1)$ | $O(1)$ | $O(1)$ | Busca rápida |
| Árvore Binária | $O(\\log n)$ | $O(\\log n)$ | $O(\\log n)$ | Dados ordenados |

## Exemplos de LaTeX

### LaTeX Inline

A famosa equação de Einstein: $E = mc^2$

A fórmula quadrática: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

### LaTeX em Bloco

Integral de Gauss:

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

Equação de Schrödinger:

$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$

## Exemplo de Diagrama Mermaid

\`\`\`mermaid
flowchart TD
    A[Início] --> B{n <= 1?}
    B -->|Sim| C[Retornar n]
    B -->|Não| D[Calcular fib n-1]
    D --> E[Calcular fib n-2]
    E --> F[Somar resultados]
    F --> G[Retornar soma]
    C --> H[Fim]
    G --> H
\`\`\`

---

✅ Todos os elementos foram renderizados corretamente!`;

    // Criar elemento de mensagem
    const messageEl = document.createElement('div');
    messageEl.className = 'chatbot-message chatbot-message-assistant';
    messageEl.setAttribute('role', 'article');
    messageEl.setAttribute('aria-label', 'Mensagem de teste do assistente');

    const contentEl = document.createElement('div');
    contentEl.className = 'chatbot-message-content';
    contentEl.setAttribute('role', 'text');

    const footerHtml = `
      <div class="chatbot-message-footer">
        <div class="chatbot-message-meta">
          <span class="chatbot-message-time">${this.formatTime(new Date())}</span>
          <span class="chatbot-message-tokens">Mensagem de teste</span>
        </div>
      </div>
    `;

    messageEl.appendChild(contentEl);
    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = footerHtml;
    messageEl.appendChild(footerDiv.firstElementChild as HTMLElement);

    messagesContainer.appendChild(messageEl);
    this.scrollToBottom(true);

    // Simular digitação progressiva
    await this.simulateTypingMessage(testContent, messageEl, contentEl);
  }

  /**
   * Formata o timestamp
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Mostra indicador de loading
   */
  private showLoading(): string {
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (!messagesContainer) return '';

    const loadingId = `loading-${Date.now()}`;
    const loadingEl = document.createElement('div');
    loadingEl.className = 'chatbot-loading';
    loadingEl.id = loadingId;
    loadingEl.innerHTML = `
      <div class="chatbot-loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

    messagesContainer.appendChild(loadingEl);
    // Scroll inteligente - só faz scroll se estiver próximo do final
    this.scrollToBottom();
    return loadingId;
  }

  /**
   * Remove indicador de loading
   */
  private hideLoading(loadingId: string): void {
    const loading = this.container?.querySelector(`#${loadingId}`) as HTMLElement;
    if (loading) {
      loading.remove();
    }
  }

  /**
   * Scroll para o final das mensagens (inteligente - só faz scroll se estiver próximo do final)
   */
  private scrollToBottom(force: boolean = false): void {
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (!messagesContainer) return;

    // Se for forçado (ex: usuário enviou mensagem), sempre fazer scroll
    if (force) {
      this.isNearBottom = true;
      requestAnimationFrame(() => {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      });
      return;
    }

    // Se não for forçado, só fazer scroll se estiver próximo do final
    if (this.isNearBottom) {
      requestAnimationFrame(() => {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }

  /**
   * Verifica se o usuário está próximo do final (dentro de 100px)
   */
  private checkIfNearBottom(): boolean {
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (!messagesContainer) return true;

    const scrollTop = messagesContainer.scrollTop;
    const scrollHeight = messagesContainer.scrollHeight;
    const clientHeight = messagesContainer.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    return distanceFromBottom < 100;
  }

  /**
   * Cria e configura o botão de scroll para o final
   */
  private createScrollToBottomButton(): void {
    this.scrollToBottomBtn = this.container?.querySelector('#chatbot-scroll-to-bottom-btn') as HTMLElement;
    if (!this.scrollToBottomBtn) return;

    this.scrollToBottomBtn.addEventListener('click', () => this.handleScrollToBottom());
  }

  /**
   * Manipula o clique no botão de scroll para o final
   */
  private handleScrollToBottom(): void {
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (!messagesContainer) return;

    this.isNearBottom = true;
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  /**
   * Configura o listener de scroll para detectar posição e mostrar/ocultar botão
   */
  private setupScrollListener(): void {
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (!messagesContainer || !this.scrollToBottomBtn) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      // Usar requestAnimationFrame para throttling
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        this.isNearBottom = this.checkIfNearBottom();

        // Mostrar/ocultar botão baseado na posição
        if (this.isNearBottom) {
          this.scrollToBottomBtn?.style.setProperty('display', 'none');
        } else {
          this.scrollToBottomBtn?.style.setProperty('display', 'flex');
        }
      });
    };

    messagesContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // Verificar posição inicial
    handleScroll();
  }

  /**
   * Calcula o total de tokens para um chat específico
   * Inclui TUDO: conversationHistory + systemInstruction
   */
  private async calculateTotalTokens(chatId: string): Promise<number> {
    try {
      // Se for o chat atual, usar o contexto atual
      if (this.currentChatId === chatId) {
        // Carregar system instruction se configurado
        const systemInstruction = await this.loadSystemInstruction('');
        
        // Calcular tokens do contexto completo atual
        const totalTokens = await geminiService.countTokens(
          this.conversationHistory,
          systemInstruction || undefined
        );
        
        // Armazenar no cache
        this.tokenCounts.set(chatId, totalTokens);
        return totalTokens;
      }

      // Buscar o chat no histórico
      const chat = this.chatHistory.find(c => c.id === chatId);
      
      if (!chat) {
        // Se não encontrou, retornar 0 ou valor do cache
        return this.tokenCounts.get(chatId) || 0;
      }

      // Carregar system instruction se configurado (para o chat específico)
      // Nota: systemInstruction pode variar, então vamos tentar carregar
      const systemInstruction = await this.loadSystemInstruction('');
      
      // Calcular tokens do contexto completo do chat
      const totalTokens = await geminiService.countTokens(
        chat.conversationHistory,
        systemInstruction || undefined
      );
      
      // Armazenar no cache
      this.tokenCounts.set(chatId, totalTokens);
      return totalTokens;
    } catch (error) {
      console.error('Erro ao calcular tokens:', error);
      // Retornar valor do cache se houver erro
      return this.tokenCounts.get(chatId) || 0;
    }
  }

  /**
   * Limpa o histórico de conversa
   */
  clearHistory(): void {
    this.messages = [];
    this.conversationHistory = [];
    this.attachedImages = [];
    this.updateImagesPreview();
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="chatbot-welcome" role="status">
          <div class="chatbot-icebreakers">
            ${this.getAllIcebreakers().map((icebreaker, index) => {
              const emojis = ['📄', '🎯', '💡', '🚀'];
              return `
              <button 
                class="chatbot-icebreaker-btn" 
                data-icebreaker="${index}"
                data-emoji="${emojis[index]}"
                type="button"
                aria-label="${icebreaker}"
              >
                ${icebreaker}
              </button>
            `;
            }).join('')}
          </div>
        </div>
      `;
      // Reconfigurar os event listeners dos quebra-gelos
      this.setupIcebreakers();
    }
  }

  /**
   * Configura o redimensionamento por arraste
   */
  private setupResize(): void {
    const handle = this.container?.querySelector('#chatbot-resize-handle') as HTMLElement;
    if (!handle || !this.container) {
      console.warn('⚠️ Handle de resize ou container não encontrado');
      return;
    }

    // Encontrar docs-toc de forma mais robusta
    const findDocsToc = (): HTMLElement | null => {
      let element: HTMLElement | null = this.container;
      while (element && element.parentElement) {
        if (element.classList.contains('docs-toc')) {
          return element;
        }
        element = element.parentElement;
      }
      // Fallback: buscar no documento
      return document.querySelector('.docs-toc') as HTMLElement;
    };

    const docsToc = findDocsToc();
    const docsContentWrapper = docsToc?.parentElement as HTMLElement | null;

    if (!docsToc) {
      console.warn('⚠️ Container docs-toc não encontrado');
      return;
    }

    let startX = 0;
    let startWidth = 0;
    let rafId: number | null = null;

    const startResize = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.isResizing = true;
      startX = e.clientX;
      startWidth = docsToc.offsetWidth || this.currentWidth;
      
      // Adicionar classes para feedback visual e otimização
      handle.classList.add('resizing');
      docsToc.classList.add('resizing');
      if (docsContentWrapper) {
        docsContentWrapper.classList.add('resizing');
      }
      
      // Adicionar will-change para otimização
      docsToc.style.setProperty('will-change', 'width', 'important');
      if (docsContentWrapper) {
        docsContentWrapper.style.setProperty('will-change', 'width', 'important');
      }
      
      // Adicionar listeners
      document.addEventListener('mousemove', doResize, { passive: false });
      document.addEventListener('mouseup', stopResize, { passive: true });
      
      // Estilos do body durante resize
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
      handle.style.pointerEvents = 'auto';
    };

    const doResize = (e: MouseEvent) => {
      if (!this.isResizing) return;
      
      e.preventDefault();
      
      // Cancelar RAF anterior se existir
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      
      // Usar RAF para suavidade
      rafId = requestAnimationFrame(() => {
        // Calcular diferença (mouse se moveu para a esquerda = aumentar, direita = diminuir)
        const diff = startX - e.clientX;
        let newWidth = startWidth + diff;
        
        // Limitar entre min e max
        newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth));
        
        // Só atualizar se mudou significativamente (otimização)
        if (Math.abs(newWidth - this.currentWidth) < 0.5) {
          return;
        }
        
        this.currentWidth = newWidth;
        
        // Aplicar largura no docs-toc com !important
        docsToc.style.setProperty('width', `${newWidth}px`, 'important');
        docsToc.style.setProperty('min-width', `${newWidth}px`, 'important');
        docsToc.style.setProperty('max-width', `${newWidth}px`, 'important');
        docsToc.style.setProperty('flex-basis', `${newWidth}px`, 'important');
        
        // Aplicar largura no chatbot (100% do docs-toc)
        if (this.container) {
          this.container.style.width = '100%';
          this.container.style.minWidth = '100%';
          this.container.style.maxWidth = '100%';
        }
      });
    };

    const stopResize = () => {
      if (!this.isResizing) return;
      
      // Cancelar RAF pendente
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      
      this.isResizing = false;
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
      
      // Remover classes de feedback
      handle.classList.remove('resizing');
      docsToc.classList.remove('resizing');
      if (docsContentWrapper) {
        docsContentWrapper.classList.remove('resizing');
      }
      
      // Remover will-change após um delay para permitir transições
      setTimeout(() => {
        docsToc.style.removeProperty('will-change');
        if (docsContentWrapper) {
          docsContentWrapper.style.removeProperty('will-change');
        }
      }, 100);
      
      // Restaurar estilos do body
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
      handle.style.pointerEvents = '';
    };

    handle.addEventListener('mousedown', startResize);
    
    // Prevenir seleção de texto ao arrastar
    handle.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
    
    // Prevenir drag de imagens
    handle.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Configura o botão de minimizar/maximizar
   */
  private setupMinimize(): void {
    const minimizeBtn = this.container?.querySelector('#chatbot-minimize-btn') as HTMLButtonElement;
    if (!minimizeBtn) return;

    minimizeBtn.addEventListener('click', () => {
      this.toggleMinimize();
    });
  }

  /**
   * Alterna entre minimizado e maximizado
   */
  private toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
    const content = this.container?.querySelector('#chatbot-content') as HTMLElement;
    const minimizeBtn = this.container?.querySelector('#chatbot-minimize-btn') as HTMLButtonElement;
    
    if (!content || !minimizeBtn || !this.container) return;

    if (this.isMinimized) {
      this.container.classList.add('chatbot-minimized');
      minimizeBtn.setAttribute('aria-label', 'Maximizar');
      minimizeBtn.setAttribute('title', 'Maximizar');
      minimizeBtn.innerHTML = getIcon('chevron-right', { size: 16 });
    } else {
      this.container.classList.remove('chatbot-minimized');
      minimizeBtn.setAttribute('aria-label', 'Minimizar');
      minimizeBtn.setAttribute('title', 'Minimizar');
      minimizeBtn.innerHTML = getIcon('chevron-left', { size: 16 });
    }
    
    // Reinicializar ícones após atualizar o botão
    if (typeof lucide !== 'undefined') {
      requestAnimationFrame(() => {
        lucide.createIcons({
          baseElement: minimizeBtn
        });
      });
    }
  }

  /**
   * Exibe o modal de configurações
   */
  private showSettingsModal(): void {
    // Verificar se já existe um modal
    let modal = document.querySelector('.chatbot-settings-modal') as HTMLElement;
    let backdrop = document.querySelector('.chatbot-settings-backdrop') as HTMLElement;

    if (!modal) {
      // Criar backdrop
      backdrop = document.createElement('div');
      backdrop.className = 'chatbot-settings-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');

      // Criar modal
      modal = document.createElement('div');
      modal.className = 'chatbot-settings-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'chatbot-settings-title');
      modal.setAttribute('aria-modal', 'true');

      modal.innerHTML = `
        <div class="chatbot-settings-header">
          <h3 id="chatbot-settings-title">Configurações</h3>
          <button 
            class="chatbot-settings-close" 
            aria-label="Fechar configurações"
            type="button"
          >
            ${getIcon('x', { size: 18 })}
          </button>
        </div>
        <div class="chatbot-settings-content">
          <div class="chatbot-settings-section">
            <h4>API Key do Gemini</h4>
            <p class="chatbot-settings-description">Configure sua API key do Google Gemini para usar o chatbot:</p>
            <div class="chatbot-settings-input-wrapper">
              <input 
                type="password" 
                id="chatbot-setting-api-key" 
                class="chatbot-settings-input" 
                placeholder="Digite sua API key do Gemini"
                aria-label="API key do Gemini"
              />
              <button 
                id="chatbot-save-api-key-btn" 
                class="chatbot-settings-save-btn"
                type="button"
                aria-label="Salvar API key"
              >
                ${getIcon('check-circle', { size: 16 })}
                <span>Salvar</span>
              </button>
            </div>
            <p class="chatbot-settings-hint" id="chatbot-api-key-status">
              ${this.getApiKeyStatusText()}
            </p>
          </div>
          <div class="chatbot-settings-section">
            <h4>Modelo do Gemini</h4>
            <p class="chatbot-settings-description">Selecione o modelo do Gemini a ser usado nas conversas:</p>
            <div class="chatbot-settings-select-wrapper">
              <select id="chatbot-setting-model" class="chatbot-settings-select">
                ${geminiService.getAvailableModels().map(model => `
                  <option value="${model}" ${geminiService.getModel() === model ? 'selected' : ''}>
                    ${model}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
          <div class="chatbot-settings-section">
            <h4>Referências</h4>
            <p class="chatbot-settings-description">Selecione quais informações incluir como contexto para o assistente:</p>
            <label class="chatbot-settings-option">
              <input 
                type="checkbox" 
                id="chatbot-setting-current-page"
                ${this.systemInstructionConfig.includeCurrentPage ? 'checked' : ''}
              />
              <span>Conteúdo da página atual</span>
            </label>
          </div>
          <div class="chatbot-settings-section">
            <h4>Debug</h4>
            <p class="chatbot-settings-description">Teste a renderização de Markdown, LaTeX e Mermaid sem consumir tokens da API:</p>
            <button 
              id="chatbot-debug-test-btn" 
              class="chatbot-settings-debug-btn"
              type="button"
            >
              ${getIcon('code', { size: 16 })}
              <span>Testar Renderização</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      document.body.appendChild(modal);

      // Inicializar ícones Lucide no modal
      if (typeof lucide !== 'undefined') {
        requestAnimationFrame(() => {
          lucide.createIcons({
            baseElement: modal
          });
        });
      }

      // Event listeners
      const closeBtn = modal.querySelector('.chatbot-settings-close') as HTMLButtonElement;
      const checkbox = modal.querySelector('#chatbot-setting-current-page') as HTMLInputElement;
      const modelSelect = modal.querySelector('#chatbot-setting-model') as HTMLSelectElement;
      const debugBtn = modal.querySelector('#chatbot-debug-test-btn') as HTMLButtonElement;
      const apiKeyInput = modal.querySelector('#chatbot-setting-api-key') as HTMLInputElement;
      const saveApiKeyBtn = modal.querySelector('#chatbot-save-api-key-btn') as HTMLButtonElement;
      const apiKeyStatus = modal.querySelector('#chatbot-api-key-status') as HTMLElement;

      const closeModal = () => {
        modal.classList.remove('chatbot-settings-modal-open');
        backdrop?.classList.remove('chatbot-settings-backdrop-open');
        backdrop?.setAttribute('aria-hidden', 'true');
        modal.setAttribute('aria-hidden', 'true');
      };

      closeBtn?.addEventListener('click', closeModal);
      backdrop?.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          closeModal();
        }
      });

      checkbox?.addEventListener('change', (e) => {
        this.systemInstructionConfig.includeCurrentPage = (e.target as HTMLInputElement).checked;
      });

      modelSelect?.addEventListener('change', (e) => {
        const selectedModel = (e.target as HTMLSelectElement).value;
        geminiService.setModel(selectedModel);
      });

      debugBtn?.addEventListener('click', () => {
        closeModal();
        this.handleDebugTest();
      });

      // Handler para salvar API key
      const handleSaveApiKey = () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
          geminiService.setApiKey(apiKey);
          apiKeyInput.value = ''; // Limpar campo após salvar
          this.updateApiKeyStatus();
          if (apiKeyStatus) {
            apiKeyStatus.textContent = '✅ API key salva com sucesso!';
            apiKeyStatus.style.color = 'var(--k-rgb-2)';
            setTimeout(() => {
              apiKeyStatus.textContent = this.getApiKeyStatusText();
              apiKeyStatus.style.color = '';
            }, 2000);
          }
        } else {
          // Remover API key se campo estiver vazio
          geminiService.setApiKey('');
          this.updateApiKeyStatus();
          if (apiKeyStatus) {
            apiKeyStatus.textContent = '⚠️ API key removida';
            apiKeyStatus.style.color = 'var(--k-text-warning)';
            setTimeout(() => {
              apiKeyStatus.textContent = this.getApiKeyStatusText();
              apiKeyStatus.style.color = '';
            }, 2000);
          }
        }
      };

      saveApiKeyBtn?.addEventListener('click', handleSaveApiKey);
      apiKeyInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveApiKey();
        }
      });

      // Fechar com ESC
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', handleEsc);
        }
      };
      document.addEventListener('keydown', handleEsc);
    }

    // Atualizar estado do checkbox e select se o modal já existir
    const checkbox = modal.querySelector('#chatbot-setting-current-page') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = this.systemInstructionConfig.includeCurrentPage;
    }

    const modelSelect = modal.querySelector('#chatbot-setting-model') as HTMLSelectElement;
    if (modelSelect) {
      modelSelect.value = geminiService.getModel();
    }

    const apiKeyStatus = modal.querySelector('#chatbot-api-key-status') as HTMLElement;
    if (apiKeyStatus) {
      apiKeyStatus.textContent = this.getApiKeyStatusText();
    }

    // Mostrar modal
    modal.classList.add('chatbot-settings-modal-open');
    backdrop.classList.add('chatbot-settings-backdrop-open');
    backdrop.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-hidden', 'false');

    // Focar no primeiro elemento interativo
    const firstInput = modal.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  /**
   * Obtém o conteúdo da página atual
   */
  private getCurrentPageContent(): string {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
      return '';
    }

    // Extrair texto, removendo HTML mas mantendo estrutura básica
    const text = mainContent.innerText || mainContent.textContent || '';
    
    // Limitar tamanho se necessário (primeiros 10000 caracteres)
    const maxLength = 10000;
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '\n\n[... conteúdo truncado ...]';
    }

    return text;
  }

  /**
   * Carrega e processa o template de system instruction
   */
  private async loadSystemInstruction(userPrompt: string): Promise<string | null> {
    if (!this.systemInstructionConfig.includeCurrentPage) {
      return null;
    }

    try {
      // Determinar qual arquivo de system instruction carregar baseado na persona
      let instructionFile = 'chatbot-personality/gemini-system-instruction.md';
      if (this.currentPersona === 'tutor') {
        instructionFile = 'chatbot-personality/gemini-system-instruction-tutor.md';
      } else if (this.currentPersona === 'professor') {
        instructionFile = 'chatbot-personality/gemini-system-instruction-professor.md';
      } else if (this.currentPersona === 'amigo') {
        instructionFile = 'chatbot-personality/gemini-system-instruction-amigo.md';
      }

      // Carregar template
      const response = await fetch(`/system-instructions/${instructionFile}`);
      if (!response.ok) {
        console.warn(`⚠️ Não foi possível carregar o template de system instruction: ${instructionFile}`);
        return null;
      }

      let template = await response.text();

      // Obter conteúdo da página
      const pageContent = this.getCurrentPageContent();
      
      if (!pageContent) {
        console.warn('⚠️ Nenhum conteúdo da página encontrado');
        return null;
      }

      // Substituir placeholders
      template = template.replace(/\{\{CURRENT_PAGE_CONTENT\}\}/g, pageContent);
      template = template.replace(/\{\{USER_PROMPT\}\}/g, userPrompt);

      return template;
    } catch (error) {
      console.error('Erro ao carregar system instruction:', error);
      return null;
    }
  }

  /**
   * Destrói o componente
   */
  destroy(): void {
    this.messages = [];
    this.conversationHistory = [];
    this.attachedImages = [];
    this.container = null;
    this.isResizing = false;
    
    // Remover modal se existir
    const modal = document.querySelector('.chatbot-settings-modal');
    const backdrop = document.querySelector('.chatbot-settings-backdrop');
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  /**
   * Cria um novo chat
   */
  private createNewChat(): void {
    // Salvar o chat atual antes de criar um novo
    if (this.currentChatId && this.messages.length > 0) {
      this.saveCurrentChat();
    }
    
    // Criar novo chat
    this.currentChatId = `chat-${Date.now()}`;
    this.messages = [];
    this.conversationHistory = [];
    this.attachedImages = [];
    this.updateImagesPreview();
    
    // Adicionar nova aba
    this.addTab(this.currentChatId, 'Nova conversa');
    
    // Limpar interface
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="chatbot-welcome" role="status">
          <div class="chatbot-icebreakers">
            ${this.getAllIcebreakers().map((icebreaker, index) => {
              const emojis = ['📄', '🎯', '💡', '🚀'];
              return `
              <button 
                class="chatbot-icebreaker-btn" 
                data-icebreaker="${index}"
                data-emoji="${emojis[index]}"
                type="button"
                aria-label="${icebreaker}"
              >
                ${icebreaker}
              </button>
            `;
            }).join('')}
          </div>
        </div>
      `;
      this.setupIcebreakers();
    }
  }

  /**
   * Adiciona uma nova aba
   */
  private addTab(chatId: string, title: string): void {
    // Verificar se a aba já existe
    if (this.openTabs.find(tab => tab.id === chatId)) {
      return;
    }
    
    this.openTabs.push({ id: chatId, title: title });
    // Não usar await aqui para não bloquear
    this.updateTabs().catch(err => console.error('Erro ao atualizar abas:', err));
  }

  /**
   * Remove uma aba
   */
  private removeTab(chatId: string): void {
    this.openTabs = this.openTabs.filter(tab => tab.id !== chatId);
    
    // Se a aba fechada era a atual, mudar para outra ou criar nova
    if (this.currentChatId === chatId) {
      if (this.openTabs.length > 0) {
        // Carregar a última aba
        const lastTab = this.openTabs[this.openTabs.length - 1];
        this.loadChat(lastTab.id);
      } else {
        // Criar novo chat se não houver abas
        this.createNewChat();
      }
    }
    
    // Não usar await aqui para não bloquear
    this.updateTabs().catch(err => console.error('Erro ao atualizar abas:', err));
  }

  /**
   * Atualiza as abas no header
   */
  private async updateTabs(): Promise<void> {
    const tabsContainer = this.container?.querySelector('#chatbot-tabs-container') as HTMLElement;
    if (!tabsContainer) return;

    if (this.openTabs.length === 0) {
      tabsContainer.innerHTML = '';
      return;
    }

    // Calcular tokens para a aba ativa
    let activeTabTokens = 0;
    let activeTabPercentage = 0;
    if (this.currentChatId) {
      try {
        activeTabTokens = await this.calculateTotalTokens(this.currentChatId);
        activeTabPercentage = Math.min((activeTabTokens / 1000000) * 100, 100);
      } catch (error) {
        console.error('Erro ao calcular tokens para aba ativa:', error);
      }
    }

    tabsContainer.innerHTML = this.openTabs.map(tab => {
      const isActive = tab.id === this.currentChatId ? 'chatbot-tab-active' : '';
      const showProgress = isActive && this.currentChatId;
      const percentage = showProgress ? activeTabPercentage : 0;
      
      return `
        <div class="chatbot-tab ${isActive}" data-chat-id="${tab.id}">
          <div class="chatbot-tab-content">
            <span class="chatbot-tab-title">${tab.title}</span>
            ${showProgress ? `
              <div class="chatbot-tab-progress-container">
                <div class="chatbot-tab-progress-bar" style="width: ${percentage}%"></div>
              </div>
            ` : ''}
          </div>
          <button 
            class="chatbot-tab-close" 
            data-chat-id="${tab.id}"
            aria-label="Fechar aba"
            type="button"
          >
            ${getIcon('x', { size: 12 })}
          </button>
        </div>
      `;
    }).join('');

    // Event listeners para abas
    const tabs = tabsContainer.querySelectorAll('.chatbot-tab') as NodeListOf<HTMLElement>;
    const closeButtons = tabsContainer.querySelectorAll('.chatbot-tab-close') as NodeListOf<HTMLButtonElement>;

    tabs.forEach(tab => {
      const chatId = tab.getAttribute('data-chat-id');
      if (chatId && !tab.querySelector('.chatbot-tab-close')?.matches(':hover')) {
        tab.addEventListener('click', (e) => {
          // Não mudar de aba se clicar no botão de fechar
          if ((e.target as HTMLElement).closest('.chatbot-tab-close')) {
            return;
          }
          this.loadChat(chatId);
        });
      }
    });

    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = btn.getAttribute('data-chat-id');
        if (chatId) {
          this.removeTab(chatId);
        }
      });
    });

    // Inicializar ícones Lucide
    if (typeof lucide !== 'undefined') {
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            lucide.createIcons({ baseElement: tabsContainer });
          } catch (error) {
            console.warn('Erro ao inicializar ícones Lucide nas abas:', error);
          }
        }, 50);
      });
    }
  }

  /**
   * Salva o chat atual
   */
  private saveCurrentChat(): void {
    if (!this.currentChatId || this.messages.length === 0) return;
    
    const firstUserMessage = this.messages.find(m => m.role === 'user');
    const title = firstUserMessage?.content.substring(0, 50) || 'Nova conversa';
    
    // Atualizar título da aba
    const currentTab = this.openTabs.find(tab => tab.id === this.currentChatId);
    if (currentTab && currentTab.title !== title) {
      currentTab.title = title;
      this.updateTabs().catch(err => console.error('Erro ao atualizar abas:', err));
    }
    
    const chatData = {
      id: this.currentChatId,
      title: title,
      messages: this.messages,
      conversationHistory: this.conversationHistory,
      timestamp: Date.now()
    };
    
    // Encontrar ou criar entrada no histórico
    const existingIndex = this.chatHistory.findIndex(c => c.id === this.currentChatId);
    if (existingIndex >= 0) {
      this.chatHistory[existingIndex] = chatData;
    } else {
      this.chatHistory.unshift(chatData);
    }
    
    // Limitar a 50 chats mais recentes
    if (this.chatHistory.length > 50) {
      this.chatHistory = this.chatHistory.slice(0, 50);
    }
    
    this.saveChatHistory();
  }

  /**
   * Salva o histórico no localStorage
   */
  private saveChatHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.chatHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }

  /**
   * Carrega o histórico do localStorage
   */
  private loadChatHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.chatHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      this.chatHistory = [];
    }
  }

  /**
   * Carrega um chat específico
   */
  private loadChat(chatId: string): void {
    const chat = this.chatHistory.find(c => c.id === chatId);
    if (!chat) {
      // Se não estiver no histórico, pode ser uma aba nova
      const tab = this.openTabs.find(t => t.id === chatId);
      if (tab) {
        this.currentChatId = chatId;
        this.messages = [];
        this.conversationHistory = [];
        this.updateTabs().catch(err => console.error('Erro ao atualizar abas:', err));
        
        // Mostrar quebra-gelos
        const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
        if (messagesContainer) {
          messagesContainer.innerHTML = `
            <div class="chatbot-welcome" role="status">
              <div class="chatbot-icebreakers">
                ${this.getAllIcebreakers().map((icebreaker, index) => {
                  const emojis = ['📄', '🎯', '💡', '🚀'];
                  return `
                  <button 
                    class="chatbot-icebreaker-btn" 
                    data-icebreaker="${index}"
                    data-emoji="${emojis[index]}"
                    type="button"
                    aria-label="${icebreaker}"
                  >
                    ${icebreaker}
                  </button>
                `;
                }).join('')}
              </div>
            </div>
          `;
          this.setupIcebreakers();
        }
        return;
      }
      return;
    }
    
    // Salvar chat atual se houver
    if (this.currentChatId && this.messages.length > 0) {
      this.saveCurrentChat();
    }
    
    // Carregar chat selecionado
    this.currentChatId = chat.id;
    this.messages = chat.messages;
    this.conversationHistory = chat.conversationHistory;
    
    // Adicionar aba se não existir
    if (!this.openTabs.find(tab => tab.id === chatId)) {
      this.addTab(chatId, chat.title);
    }
    
    // Renderizar mensagens
    const messagesContainer = this.container?.querySelector('#chatbot-messages') as HTMLElement;
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      this.messages.forEach((msg, idx) => {
        this.addMessage(msg.role, msg.content, msg.isError, msg.images, true, msg.tokenCount, idx);
      });
      this.scrollToBottom(true);
    }
    
    // Atualizar barra de progresso de tokens
    this.updateTabs().catch(err => console.error('Erro ao atualizar abas:', err));
  }

  /**
   * Mostra o modal de histórico
   */
  private showHistoryModal(): void {
    // Salvar chat atual antes de mostrar histórico
    if (this.currentChatId && this.messages.length > 0) {
      this.saveCurrentChat();
    }
    
    // Verificar se já existe um modal
    let modal = document.querySelector('.chatbot-history-modal') as HTMLElement;
    let backdrop = document.querySelector('.chatbot-history-backdrop') as HTMLElement;

    if (!modal) {
      // Criar backdrop
      backdrop = document.createElement('div');
      backdrop.className = 'chatbot-history-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');

      // Criar modal
      modal = document.createElement('div');
      modal.className = 'chatbot-history-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'chatbot-history-title');
      modal.setAttribute('aria-modal', 'true');

      document.body.appendChild(backdrop);
      document.body.appendChild(modal);
    }

    // Atualizar conteúdo do modal
    const historyList = this.chatHistory.length > 0
      ? this.chatHistory.map(chat => {
          const date = new Date(chat.timestamp);
          const dateStr = date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          const isActive = chat.id === this.currentChatId ? 'chatbot-history-item-active' : '';
          return `
            <div class="chatbot-history-item ${isActive}" data-chat-id="${chat.id}">
              <div class="chatbot-history-item-title">${chat.title}</div>
              <div class="chatbot-history-item-date">${dateStr}</div>
            </div>
          `;
        }).join('')
      : '<div class="chatbot-history-empty">Nenhum histórico disponível</div>';

    modal.innerHTML = `
      <div class="chatbot-history-header">
        <h3 id="chatbot-history-title">Histórico de Conversas</h3>
        <button 
          class="chatbot-history-close" 
          aria-label="Fechar histórico"
          type="button"
        >
          ${getIcon('x', { size: 18 })}
        </button>
      </div>
      <div class="chatbot-history-content">
        <div class="chatbot-history-list">
          ${historyList}
        </div>
      </div>
    `;

    // Event listeners
    const closeBtn = modal.querySelector('.chatbot-history-close') as HTMLButtonElement;
    const items = modal.querySelectorAll('.chatbot-history-item') as NodeListOf<HTMLElement>;
    
    const closeModal = () => {
      modal.classList.remove('chatbot-history-modal-open');
      backdrop.classList.remove('chatbot-history-backdrop-open');
      backdrop.setAttribute('aria-hidden', 'true');
      modal.setAttribute('aria-hidden', 'true');
    };

    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    items.forEach(item => {
      item.addEventListener('click', () => {
        const chatId = item.getAttribute('data-chat-id');
        if (chatId) {
          this.loadChat(chatId);
          closeModal();
        }
      });
    });

    // Fechar com ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Mostrar modal
    modal.classList.add('chatbot-history-modal-open');
    backdrop.classList.add('chatbot-history-backdrop-open');
    backdrop.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-hidden', 'false');

    // Inicializar ícones Lucide
    if (typeof lucide !== 'undefined') {
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            lucide.createIcons({ baseElement: modal });
          } catch (error) {
            console.warn('Erro ao inicializar ícones Lucide no modal de histórico:', error);
          }
        }, 100);
      });
    }
  }
}

