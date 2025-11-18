import type { CursorType } from '@/types';
import { cursorService, themeService, geminiService } from '@/services';
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
    this.initModelSelect();
    // Admin button é tratado por event delegation, não precisa de init separado
    
    // Re-inicializar quando o painel for aberto
    const settingsPanel = document.querySelector('.settings-panel');
    if (settingsPanel) {
      const observer = new MutationObserver(() => {
        if (settingsPanel.classList.contains('visible')) {
          console.log('👁️ [SettingsPanel] Painel aberto - atualizando toggles e modelo...');
          setTimeout(() => {
            this.updateToggleStates();
            this.initModelSelect(); // Re-inicializar o select de modelo também
            // Reconfigurar listeners avançados após inicializar o modelo
            this.setupAdvancedConfigListeners();
            
            // Garantir que as configurações avançadas sejam atualizadas
            const currentModel = geminiService.getModel();
            const currentConfig = geminiService.getGenerationConfig();
            this.updateAdvancedConfigUI(currentConfig, currentModel);
          }, 150);
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
      } else if (toggleId === 'config-enableGoogleSearch-toggle') {
        this.handleEnableGoogleSearchToggle(toggleElement);
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
    
    // Enable Google Search toggle
    const enableGoogleSearchToggle = document.getElementById('config-enableGoogleSearch-toggle');
    if (enableGoogleSearchToggle) {
      const config = geminiService.getGenerationConfig();
      // Padrão é false (desativado) se não estiver definido
      const isEnabled = config.enableGoogleSearch === true;
      enableGoogleSearchToggle.classList.toggle('active', isEnabled);
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
   * Handler para Enable Google Search toggle
   */
  private handleEnableGoogleSearchToggle(toggle: HTMLElement): void {
    const isActive = toggle.classList.contains('active');
    const newState = !isActive;
    
    // Atualizar classe active
    toggle.classList.toggle('active', newState);
    
    // Atualizar configuração
    const config = geminiService.getGenerationConfig();
    config.enableGoogleSearch = newState;
    
    geminiService.setGenerationConfig(config);
    
    console.log('✅ [EnableGoogleSearchToggle] Toggle clicado - Novo estado:', newState ? 'ON' : 'OFF');
    console.log('🔍 [EnableGoogleSearchToggle] Google Search (embasamento) agora está:', newState ? 'HABILITADO' : 'DESABILITADO');
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

  /**
   * Inicializa a seleção de modelo
   */
  public initModelSelect(): void {
    // Buscar TODOS os elementos com o ID (pode haver múltiplos: painel flutuante e página)
    const modelSelects = document.querySelectorAll('#gemini-model-select') as NodeListOf<HTMLSelectElement>;
    
    if (modelSelects.length === 0) {
      console.warn('⚠️ [SettingsPanel] Select de modelo não encontrado');
      return;
    }

    console.log(`🔍 [SettingsPanel] Encontrados ${modelSelects.length} select(s) de modelo`);

    // Garantir que o modelo está atualizado do localStorage
    geminiService.loadModelFromStorage();
    
    // Carregar modelo atual
    const currentModel = geminiService.getModel();
    console.log(`🔍 [SettingsPanel] Modelo atual do localStorage: ${currentModel}`);

    // Handler para mudança de modelo (reutilizável)
    const handleModelChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const selectedModel = target.value;
      console.log(`🔄 [SettingsPanel] ========== EVENTO CHANGE DETECTADO! ==========`);
      console.log(`🔄 [SettingsPanel] Modelo selecionado: ${selectedModel}`);
      
      // Salvar modelo imediatamente
      console.log(`💾 [SettingsPanel] Chamando geminiService.setModel(${selectedModel})...`);
      geminiService.setModel(selectedModel);
      
      // Verificar se foi salvo corretamente
      const savedInStorage = localStorage.getItem('gemini-chatbot-model');
      console.log(`🔍 [SettingsPanel] Modelo no localStorage após salvar: "${savedInStorage}"`);
      console.log(`🔍 [SettingsPanel] Comparação: "${savedInStorage}" === "${selectedModel}" = ${savedInStorage === selectedModel}`);
      
      // Garantir que foi salvo corretamente
      geminiService.loadModelFromStorage();
      const savedModel = geminiService.getModel();
      console.log(`✅ [SettingsPanel] Modelo confirmado via getModel(): ${savedModel}`);
      console.log(`✅ [SettingsPanel] Esperado: ${selectedModel}`);
      
      if (savedModel !== selectedModel) {
        console.error(`❌ [SettingsPanel] ERRO: Modelo não foi salvo corretamente! Tentando novamente...`);
        // Tentar salvar novamente
        geminiService.setModel(selectedModel);
        const retrySaved = geminiService.getModel();
        console.log(`🔄 [SettingsPanel] Após retry: ${retrySaved}`);
      } else {
        console.log(`✅ [SettingsPanel] Modelo salvo e confirmado com sucesso!`);
      }
      
      // Atualizar todos os selects para o mesmo valor (sincronizar)
      const allSelects = document.querySelectorAll('#gemini-model-select') as NodeListOf<HTMLSelectElement>;
      allSelects.forEach(select => {
        if (select.value !== selectedModel) {
          select.value = selectedModel;
          console.log(`🔄 [SettingsPanel] Select sincronizado para: ${selectedModel}`);
        }
      });
      
      // Atualizar UI das configurações avançadas
      const currentConfig = geminiService.getGenerationConfig();
      
      // Usar setTimeout para garantir que o DOM esteja atualizado
      setTimeout(() => {
        this.updateAdvancedConfigUI(currentConfig, selectedModel);
        // Reconfigurar listeners para atualizar limites
        this.setupAdvancedConfigListeners();
      }, 50);
      
      console.log(`✅ [SettingsPanel] ========== Modelo atualizado com sucesso para: ${selectedModel} ==========`);
    };

    // Configurar cada select encontrado
    modelSelects.forEach((modelSelect, index) => {
      console.log(`⚙️ [SettingsPanel] Configurando select ${index + 1}/${modelSelects.length}`);
      
      // Definir valor atual ANTES de clonar
      modelSelect.value = currentModel;
      console.log(`✅ [SettingsPanel] Select ${index + 1} definido para: ${currentModel}`);

      // Remover listeners antigos (se houver) clonando o elemento
      const newSelect = modelSelect.cloneNode(true) as HTMLSelectElement;
      modelSelect.parentNode?.replaceChild(newSelect, modelSelect);

      // Adicionar novo listener
      newSelect.addEventListener('change', handleModelChange);
      console.log(`✅ [SettingsPanel] Event listener adicionado ao select ${index + 1}`);
    });

    // Carregar configurações atuais
    const config = geminiService.getGenerationConfig();
    console.log(`🔍 [SettingsPanel] Configurações atuais:`, config);
    
    // SEMPRE mostrar as opções avançadas quando inicializar
    // Usar setTimeout para garantir que o DOM esteja completamente renderizado
    setTimeout(() => {
      this.updateAdvancedConfigUI(config, currentModel);
      // Event listeners para configurações avançadas
      this.setupAdvancedConfigListeners();
    }, 100);
  }

  /**
   * Configura listeners para configurações avançadas
   */
  private setupAdvancedConfigListeners(): void {
    // Configurações com range slider
    const rangeConfigs = [
      { id: 'config-temperature', key: 'temperature', format: (v: number) => v.toFixed(1) },
      { id: 'config-topP', key: 'topP', format: (v: number) => v.toFixed(2) },
      { id: 'config-topK', key: 'topK', format: (v: number) => v.toString() },
    ];

    rangeConfigs.forEach(({ id, key, format }) => {
      // Buscar TODOS os elementos (pode haver múltiplos: painel flutuante e página)
      const inputs = document.querySelectorAll(`#${id}`) as NodeListOf<HTMLInputElement>;
      const valueDisplays = document.querySelectorAll(`#${id}-value`) as NodeListOf<HTMLElement>;
      
      inputs.forEach((input, index) => {
        const valueDisplay = valueDisplays[index];
        if (input && valueDisplay) {
          // Remover listeners antigos clonando elemento
          const newInput = input.cloneNode(true) as HTMLInputElement;
          input.parentNode?.replaceChild(newInput, input);
          
          // Atualizar display ao mudar
          newInput.addEventListener('input', () => {
            const value = parseFloat(newInput.value);
            valueDisplay.textContent = format(value);
            
            // Salvar configuração
            const config = geminiService.getGenerationConfig();
            (config as any)[key] = value;
            
            geminiService.setGenerationConfig(config);
            console.log(`⚙️ [SettingsPanel] ${key} atualizado para: ${(config as any)[key]}`);
          });
        }
      });
    });

    // Configuração especial para maxOutputTokens (com number input e range)
    // Buscar TODOS os elementos (pode haver múltiplos)
    const maxOutputTokensNumbers = document.querySelectorAll('#config-maxOutputTokens') as NodeListOf<HTMLInputElement>;
    const maxOutputTokensRanges = document.querySelectorAll('#config-maxOutputTokens-range') as NodeListOf<HTMLInputElement>;
    const maxOutputTokensValues = document.querySelectorAll('#config-maxOutputTokens-value') as NodeListOf<HTMLElement>;
    const maxOutputTokensDescs = document.querySelectorAll('#maxOutputTokens-desc') as NodeListOf<HTMLElement>;
    
    console.log(`🔍 [SettingsPanel] Encontrados ${maxOutputTokensNumbers.length} elementos maxOutputTokens`);
    
    // Todos os modelos suportam até 65536 tokens
    const maxLimit = 65536;
    
    // Configurar cada conjunto de elementos
    maxOutputTokensNumbers.forEach((maxOutputTokensNumber, index) => {
      const maxOutputTokensRange = maxOutputTokensRanges[index];
      const maxOutputTokensValue = maxOutputTokensValues[index];
      const maxOutputTokensDesc = maxOutputTokensDescs[index];
      
      if (maxOutputTokensNumber && maxOutputTokensRange && maxOutputTokensValue) {
        console.log(`✅ [SettingsPanel] Configurando maxOutputTokens conjunto ${index + 1}`);
        
        // Remover listeners antigos clonando elementos
        const newNumberInput = maxOutputTokensNumber.cloneNode(true) as HTMLInputElement;
        const newRangeInput = maxOutputTokensRange.cloneNode(true) as HTMLInputElement;
        maxOutputTokensNumber.parentNode?.replaceChild(newNumberInput, maxOutputTokensNumber);
        maxOutputTokensRange.parentNode?.replaceChild(newRangeInput, maxOutputTokensRange);
        
        // Atualizar limites dos inputs
        newNumberInput.max = maxLimit.toString();
        newRangeInput.max = maxLimit.toString();
        
        // Atualizar descrição
        if (maxOutputTokensDesc) {
          maxOutputTokensDesc.textContent = `Máximo de tokens na resposta (1-${maxLimit.toLocaleString('pt-BR')})`;
        }
        
        const updateValue = (val: number, source: 'number' | 'range') => {
          const clamped = Math.max(1, Math.min(maxLimit, val));
          
          // Atualizar apenas o elemento que não foi a fonte da mudança
          if (source === 'number') {
            newRangeInput.value = clamped.toString();
          } else {
            newNumberInput.value = clamped.toString();
          }
          
          // Sempre atualizar o display e o valor do range
          maxOutputTokensValue.textContent = clamped.toString();
          
          // Salvar configuração
          const config = geminiService.getGenerationConfig();
          (config as any).maxOutputTokens = clamped;
          geminiService.setGenerationConfig(config);
          console.log(`⚙️ [SettingsPanel] maxOutputTokens atualizado para: ${clamped} (fonte: ${source})`);
        };

        // Listener para input numérico
        newNumberInput.addEventListener('input', () => {
          const value = parseInt(newNumberInput.value) || 8192;
          updateValue(value, 'number');
        });

        // Listener para range slider - input (em tempo real durante o arraste)
        newRangeInput.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          const value = parseInt(target.value) || 8192;
          console.log(`🎚️ [SettingsPanel] Range slider mudou para: ${value}`);
          updateValue(value, 'range');
        });
        
        // Listener adicional para mudança no range (quando soltar)
        newRangeInput.addEventListener('change', () => {
          const value = parseInt(newRangeInput.value) || 8192;
          updateValue(value, 'range');
        });
      }
    });

    // Listener para imageSize (select)
    const imageSizeSelects = document.querySelectorAll('#config-imageSize') as NodeListOf<HTMLSelectElement>;
    imageSizeSelects.forEach((imageSizeSelect) => {
      // Remover listeners antigos
      const newSelect = imageSizeSelect.cloneNode(true) as HTMLSelectElement;
      imageSizeSelect.parentNode?.replaceChild(newSelect, imageSizeSelect);
      
      newSelect.addEventListener('change', () => {
        const value = newSelect.value;
        const config = geminiService.getGenerationConfig();
        (config as any).imageSize = value;
        geminiService.setGenerationConfig(config);
        console.log(`🖼️ [SettingsPanel] ImageSize atualizado para: ${value}`);
      });
    });
  }

  /**
   * Atualiza UI das configurações avançadas
   */
  public updateAdvancedConfigUI(config: any, model: string): void {
    console.log(`🔍 [SettingsPanel] updateAdvancedConfigUI chamado - Modelo: ${model}`);
    
    // Buscar TODOS os elementos (pode haver múltiplos: painel flutuante e página)
    const advancedConfigs = document.querySelectorAll('#model-advanced-config');
    const imageSizeRows = document.querySelectorAll('#config-image-size-row');
    
    if (advancedConfigs.length === 0) {
      console.warn('⚠️ [SettingsPanel] Elemento model-advanced-config não encontrado');
      return;
    }

    console.log(`🔍 [SettingsPanel] Encontrados ${advancedConfigs.length} elementos de configuração avançada`);

    // Determinar quais modelos suportam thinking
    const isGemini25Pro = model === 'gemini-2.5-pro';
    const isFlashLatest = model === 'gemini-flash-latest';
    const isFlashLiteLatest = model === 'gemini-flash-lite-latest';
    const supportsThinking = isGemini25Pro || isFlashLatest || isFlashLiteLatest;
    
    console.log(`🔍 [SettingsPanel] Modelo: ${model}, Suporta Thinking: ${supportsThinking}, É 2.5 Pro: ${isGemini25Pro}, É Flash Latest: ${isFlashLatest}, É Flash Lite Latest: ${isFlashLiteLatest}`);
    
    // Atualizar cada instância encontrada
    advancedConfigs.forEach((advancedConfig) => {
      // SEMPRE mostrar as configurações avançadas
      (advancedConfig as HTMLElement).style.display = 'block';
    });
    
    // Mostrar/ocultar Image Size (apenas para Gemini 2.5 Pro)
    imageSizeRows.forEach((imageSizeRow) => {
      (imageSizeRow as HTMLElement).style.display = isGemini25Pro ? 'block' : 'none';
      console.log(`🔍 [SettingsPanel] Image Size Row - Mostrar: ${isGemini25Pro}`);
    });

    // Atualizar valores dos inputs de range
    const rangeInputs = {
      'config-temperature': { value: config.temperature ?? 1.0, format: (v: number) => v.toFixed(1) },
      'config-topP': { value: config.topP ?? 0.95, format: (v: number) => v.toFixed(2) },
      'config-topK': { value: config.topK ?? 40, format: (v: number) => v.toString() },
    };

    Object.entries(rangeInputs).forEach(([id, { value, format }]) => {
      const input = document.getElementById(id) as HTMLInputElement;
      const valueDisplay = document.getElementById(`${id}-value`) as HTMLElement;
      
      if (input) {
        input.value = value.toString();
      }
      if (valueDisplay) {
        valueDisplay.textContent = format(Number(value));
      }
    });

    // Atualizar maxOutputTokens (number input + range)
    const maxOutputTokensValue = config.maxOutputTokens ?? 8192;
    const maxOutputTokensNumber = document.getElementById('config-maxOutputTokens') as HTMLInputElement;
    const maxOutputTokensRange = document.getElementById('config-maxOutputTokens-range') as HTMLInputElement;
    const maxOutputTokensDisplay = document.getElementById('config-maxOutputTokens-value') as HTMLElement;
    const maxOutputTokensDesc = document.getElementById('maxOutputTokens-desc') as HTMLElement;
    
    // Determinar limite baseado no modelo
    const maxLimit = 65536; // Todos os modelos suportam até 65536 tokens
    
    if (maxOutputTokensNumber) {
      maxOutputTokensNumber.max = maxLimit.toString();
      maxOutputTokensNumber.value = Math.min(maxOutputTokensValue, maxLimit).toString();
    }
    if (maxOutputTokensRange) {
      maxOutputTokensRange.max = maxLimit.toString();
      maxOutputTokensRange.value = Math.min(maxOutputTokensValue, maxLimit).toString();
    }
    if (maxOutputTokensDisplay) {
      maxOutputTokensDisplay.textContent = Math.min(maxOutputTokensValue, maxLimit).toString();
    }
    if (maxOutputTokensDesc) {
      maxOutputTokensDesc.textContent = `Máximo de tokens na resposta (1-${maxLimit.toLocaleString('pt-BR')})`;
    }

    // Atualizar select de imageSize
    const imageSizeSelect = document.getElementById('config-imageSize') as HTMLSelectElement;
    if (imageSizeSelect) {
      imageSizeSelect.value = config.imageSize ?? '1K';
    }

    console.log(`✅ [SettingsPanel] Configurações avançadas exibidas para modelo: ${model}`);
  }
}
