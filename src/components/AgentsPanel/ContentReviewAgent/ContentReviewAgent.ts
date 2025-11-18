/**
 * Content Review Agent Component
 * Permite revisar disciplinas existentes adicionando elementos interativos
 */

import './ContentReviewAgent.css';
import { geminiService } from '@/services/geminiService';
import { dataService } from '@/services/dataService';
import { exportDisciplineToMarkdown, syncDisciplineWithFile } from '@/services/disciplineExportService';
import { detectDisciplineType, getRecommendedLibraries, getRecommendedLibrariesWithInfo, getDisciplineTypeLabel } from '@/utils/disciplineTypeDetector';
import type { ReviewHistoryItem } from '@/types/agent';
import { ReviewStep } from '@/types/agent';
import type { Discipline } from '@/types/discipline';

interface DebugInfo {
  step: string;
  systemInstruction: string;
  prompt: string;
  response: string;
  timestamp: string;
}

interface ReviewSessionMetrics {
  step: string;
  subModuleTitle: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  duration: number; // em milissegundos
  timestamp: string;
}

interface ReviewMetrics {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalDuration: number; // em milissegundos
  moduleCount: number;
  subModuleCount: number;
  disciplineType: string;
  sessions: ReviewSessionMetrics[];
}

export class ContentReviewAgent {
  private container: HTMLElement | null = null;
  private selectedDisciplineId: string | null = null;
  private userPrompt: string = '';
  private currentStep: ReviewStep = ReviewStep.IDLE;
  private reviewedDiscipline: Discipline | null = null;
  private reviewedDisciplineId: string | null = null;
  private debugInfo: DebugInfo[] = [];
  private analyzedContent: Record<string, string> = {}; // Armazena conteúdo analisado com placeholders por submódulo
  private analysisLogs: Array<{ subModuleId: string; subModuleTitle: string; systemInstruction: string; prompt: string; response: string }> = [];
  private reviewMetrics: ReviewMetrics = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalDuration: 0,
    moduleCount: 0,
    subModuleCount: 0,
    disciplineType: 'general',
    sessions: [],
  };

  constructor() {
    // Inicialização
  }

  /**
   * Cria o elemento do agente
   */
  create(): HTMLElement {
    const agentContainer = document.createElement('div');
    agentContainer.className = 'content-review-agent';
    agentContainer.innerHTML = this.render();

    this.container = agentContainer;
    this.setupEventListeners();
    this.loadDisciplinesList();

    return agentContainer;
  }

  /**
   * Renderiza o HTML do agente
   */
  private render(): string {
    return `
      <div class="review-agent-header">
        <div class="review-agent-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8"></path>
            <polyline points="18 2 22 6 18 10"></polyline>
            <line x1="22" y1="6" x2="12" y2="6"></line>
          </svg>
          <h2>Revisão Interativa</h2>
        </div>
        <p class="review-agent-description">
          Revise disciplinas existentes adicionando elementos interativos, visuais e didáticos para melhorar a experiência de aprendizado.
        </p>
      </div>

      <div class="review-agent-content">
        <!-- Discipline Selection Section -->
        <div class="review-selection-section">
          <label class="review-selection-label">Selecione uma Disciplina</label>
          <select class="review-discipline-select" id="review-discipline-select">
            <option value="">Carregando disciplinas...</option>
          </select>
          <div class="review-discipline-info" id="review-discipline-info" style="display: none;">
            <div class="review-discipline-details">
              <span class="review-discipline-type" id="review-discipline-type"></span>
              <span class="review-discipline-stats" id="review-discipline-stats"></span>
            </div>
            <div class="review-discipline-libraries" id="review-discipline-libraries"></div>
          </div>
        </div>

        <!-- Prompt Section -->
        <div class="review-prompt-section">
          <label class="review-prompt-label">
            Prompt Opcional
            <span class="review-prompt-hint">(Instruções adicionais para personalizar a revisão)</span>
          </label>
          <textarea
            id="review-user-prompt"
            class="review-prompt-input"
            placeholder="Ex: Adicione mais quizzes, foque em visualizações 3D, use animações para processos..."
            rows="4"
          ></textarea>
        </div>

        <!-- Analysis Button -->
        <button class="review-start-btn" id="review-analyze-btn" disabled>
          <span class="btn-text">Analisar</span>
          <span class="btn-loader" style="display: none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
          </span>
        </button>

        <!-- Analysis Results Section -->
        <div class="review-analysis-section" id="review-analysis-section" style="display: none;">
          <div class="review-analysis-header">
            <h3>Análise Concluída</h3>
            <p class="review-analysis-subtitle">Revise os logs abaixo e confirme para prosseguir com a implementação</p>
          </div>
          
          <!-- Logs Section -->
          <div class="review-logs-section" id="review-logs-section">
            <!-- Logs serão inseridos aqui dinamicamente -->
          </div>

          <!-- Confirm Button -->
          <div class="review-confirm-actions">
            <button class="review-confirm-btn" id="review-confirm-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Confirmar e Implementar
            </button>
            <button class="review-cancel-btn" id="review-cancel-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Cancelar
            </button>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="review-progress-section" id="review-progress-section" style="display: none;">
          <div class="review-progress-steps">
            <div class="progress-step" data-step="loading">
              <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <div class="step-content">
                <span class="step-title">Carregando Disciplina</span>
                <span class="step-description">Preparando para revisão...</span>
              </div>
            </div>
            <div class="progress-step" data-step="detecting">
              <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <div class="step-content">
                <span class="step-title">Detectando Tipo</span>
                <span class="step-description" id="detecting-step-description">Identificando tipo de disciplina...</span>
              </div>
            </div>
            <div class="progress-step" data-step="analyzing">
              <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="18 2 22 6 18 10"></polyline>
                  <line x1="22" y1="6" x2="12" y2="6"></line>
                </svg>
              </div>
              <div class="step-content">
                <span class="step-title">Analisando Conteúdo</span>
                <span class="step-description" id="analyzing-step-description">Identificando oportunidades para elementos interativos...</span>
              </div>
            </div>
            <div class="progress-step" data-step="reviewing">
              <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="18 2 22 6 18 10"></polyline>
                  <line x1="22" y1="6" x2="12" y2="6"></line>
                </svg>
              </div>
              <div class="step-content">
                <span class="step-title">Implementando Elementos</span>
                <span class="step-description" id="reviewing-step-description">Implementando elementos interativos...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Result Section -->
        <div class="review-result-section" id="review-result-section" style="display: none;">
          <div class="review-result-header">
            <h3>Revisão Concluída com Sucesso!</h3>
            <p class="review-result-subtitle" id="review-result-subtitle"></p>
          </div>
          <div class="review-result-actions">
            <button class="review-save-btn" id="review-save-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Salvar Disciplina Revisada
            </button>
            <button class="review-export-md-btn" id="review-export-md-btn" title="Exportar como Markdown e sincronizar automaticamente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Exportar MD
            </button>
            <button class="review-preview-btn" id="review-preview-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Visualizar
            </button>
          </div>
        </div>

        <!-- Error Section -->
        <div class="review-error-section" id="review-error-section" style="display: none;">
          <div class="review-error-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Erro na Revisão</h3>
            <p class="review-error-message" id="review-error-message"></p>
            <button class="review-retry-btn" id="review-retry-btn">Tentar Novamente</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Configura event listeners
   */
  private setupEventListeners(): void {
    if (!this.container) return;

    // Select de disciplina
    const disciplineSelect = this.container.querySelector('#review-discipline-select') as HTMLSelectElement;
    if (disciplineSelect) {
      disciplineSelect.addEventListener('change', (e) => {
        const disciplineId = (e.target as HTMLSelectElement).value;
        this.handleDisciplineSelection(disciplineId);
      });
    }

    // Textarea de prompt
    const promptInput = this.container.querySelector('#review-user-prompt') as HTMLTextAreaElement;
    if (promptInput) {
      promptInput.addEventListener('input', (e) => {
        this.userPrompt = (e.target as HTMLTextAreaElement).value;
      });
    }

    // Botão de analisar
    const analyzeBtn = this.container.querySelector('#review-analyze-btn') as HTMLButtonElement;
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.handleAnalyze());
    }

    // Botão de confirmar
    const confirmBtn = this.container.querySelector('#review-confirm-btn') as HTMLButtonElement;
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.handleConfirmAndImplement());
    }

    // Botão de cancelar análise
    const cancelBtn = this.container.querySelector('#review-cancel-btn') as HTMLButtonElement;
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancelAnalysis());
    }

    // Botão de salvar
    const saveBtn = this.container.querySelector('#review-save-btn') as HTMLButtonElement;
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        await this.handleSave();
      });
    }

    // Botão de exportar MD
    const exportMdBtn = this.container.querySelector('#review-export-md-btn') as HTMLButtonElement;
    if (exportMdBtn) {
      exportMdBtn.addEventListener('click', async () => {
        await this.handleExportMarkdown();
      });
    }

    // Botão de visualizar
    const previewBtn = this.container.querySelector('#review-preview-btn') as HTMLButtonElement;
    if (previewBtn) {
      previewBtn.addEventListener('click', () => this.handlePreview());
    }

    // Botão de retry
    const retryBtn = this.container.querySelector('#review-retry-btn') as HTMLButtonElement;
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.hideError();
        if (this.selectedDisciplineId) {
          // Se houver análise prévia, tentar implementar; senão, analisar
          if (Object.keys(this.analyzedContent).length > 0) {
            this.handleConfirmAndImplement();
          } else {
            this.handleAnalyze();
          }
        }
      });
    }
  }

  /**
   * Carrega lista de disciplinas disponíveis
   */
  private async loadDisciplinesList(): Promise<void> {
    if (!this.container) return;

    const select = this.container.querySelector('#review-discipline-select') as HTMLSelectElement;
    if (!select) return;

    try {
      await dataService.loadDisciplines();
      const disciplines = dataService.getAllDisciplines();

      if (Object.keys(disciplines).length === 0) {
        select.innerHTML = '<option value="">Nenhuma disciplina encontrada</option>';
        return;
      }

      select.innerHTML = '<option value="">Selecione uma disciplina...</option>';
      
      Object.entries(disciplines).forEach(([id, discipline]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${discipline.code} - ${discipline.title}`;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
      select.innerHTML = '<option value="">Erro ao carregar disciplinas</option>';
    }
  }

  /**
   * Carrega informações atualizadas das bibliotecas
   */
  private async loadLibrariesInfo(disciplineType: string): Promise<void> {
    const librariesElement = this.container?.querySelector('#review-libraries-list') as HTMLElement;
    if (!librariesElement) return;

    try {
      const librariesInfo = await getRecommendedLibrariesWithInfo(disciplineType as any, true);
      
      librariesElement.innerHTML = librariesInfo.map(lib => {
        const versionBadge = lib.version ? `<span class="review-library-version">v${lib.version}</span>` : '';
        const statusClass = lib.exists ? 'exists' : 'unavailable';
        const statusIcon = lib.exists ? '✓' : '⚠';
        const tooltip = lib.reason ? ` title="${lib.reason}"` : '';
        
        return `
          <span class="review-library-tag ${statusClass}"${tooltip}>
            <span class="review-library-name">${lib.name}</span>
            ${versionBadge}
            <span class="review-library-status" title="${lib.exists ? 'Disponível' : 'Não disponível'}">${statusIcon}</span>
          </span>
        `;
      }).join('');
    } catch (error) {
      console.warn('⚠️ [ContentReviewAgent] Erro ao carregar informações de bibliotecas:', error);
      // Manter lista básica em caso de erro
    }
  }

  /**
   * Manipula seleção de disciplina
   */
  private handleDisciplineSelection(disciplineId: string): void {
    this.selectedDisciplineId = disciplineId || null;
    this.hideError();
    this.hideResult();

    const analyzeBtn = this.container?.querySelector('#review-analyze-btn') as HTMLButtonElement;
    if (analyzeBtn) {
      analyzeBtn.disabled = !disciplineId;
    }

    if (!disciplineId) {
      const infoSection = this.container?.querySelector('#review-discipline-info') as HTMLElement;
      if (infoSection) {
        infoSection.style.display = 'none';
      }
      return;
    }

    const discipline = dataService.getDiscipline(disciplineId);
    if (!discipline) {
      console.error('Disciplina não encontrada:', disciplineId);
      return;
    }

    // Detectar tipo e mostrar informações
    const disciplineType = detectDisciplineType(discipline.title, discipline.description || '');
    const typeLabel = getDisciplineTypeLabel(disciplineType);
    
    // Carregar bibliotecas com informações atualizadas (assíncrono)
    this.loadLibrariesInfo(disciplineType);

    const infoSection = this.container?.querySelector('#review-discipline-info') as HTMLElement;
    const typeElement = this.container?.querySelector('#review-discipline-type') as HTMLElement;
    const statsElement = this.container?.querySelector('#review-discipline-stats') as HTMLElement;
    const librariesElement = this.container?.querySelector('#review-discipline-libraries') as HTMLElement;

    if (infoSection) {
      infoSection.style.display = 'block';
    }

    if (typeElement) {
      typeElement.textContent = `Tipo: ${typeLabel}`;
    }

    if (statsElement) {
      const moduleCount = discipline.modules?.length || 0;
      const subModuleCount = discipline.modules?.reduce((sum, m) => sum + (m.subModules?.length || 0), 0) || 0;
      statsElement.textContent = `${moduleCount} módulo(s), ${subModuleCount} submódulo(s)`;
    }

    // Mostrar bibliotecas básicas primeiro (síncrono)
    const recommendedLibraries = getRecommendedLibraries(disciplineType);
    if (librariesElement) {
      librariesElement.innerHTML = `
        <div class="review-libraries-label">Bibliotecas Recomendadas:</div>
        <div class="review-libraries-list" id="review-libraries-list">
          ${recommendedLibraries.map(lib => `<span class="review-library-tag">${lib}<span class="review-library-loading">...</span></span>`).join('')}
        </div>
      `;
    }
  }

  /**
   * Classifica tipo de erro para mensagem apropriada
   */
  private classifyError(error: unknown): { type: string; message: string; retryable: boolean } {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = errorMessage.toLowerCase();

    // Erro de API/sobrecarga
    if (errorString.includes('overloaded') || errorString.includes('resource exhausted') || 
        errorString.includes('quota') || errorString.includes('rate limit')) {
      return {
        type: 'api_overload',
        message: 'O serviço de IA está temporariamente sobrecarregado. Por favor, tente novamente em alguns instantes.',
        retryable: true,
      };
    }

    // Erro de API key
    if (errorString.includes('api key') || errorString.includes('authentication') || 
        errorString.includes('unauthorized') || errorString.includes('403')) {
      return {
        type: 'api_key',
        message: 'Erro de autenticação: Verifique se a API key do Gemini está configurada corretamente nas configurações.',
        retryable: false,
      };
    }

    // Erro de rede
    if (errorString.includes('network') || errorString.includes('fetch') || 
        errorString.includes('connection') || errorString.includes('timeout')) {
      return {
        type: 'network',
        message: 'Erro de conexão: Verifique sua conexão com a internet e tente novamente.',
        retryable: true,
      };
    }

    // Erro de validação
    if (errorString.includes('não encontrada') || errorString.includes('não possui') || 
        errorString.includes('invalid') || errorString.includes('validation')) {
      return {
        type: 'validation',
        message: errorMessage,
        retryable: false,
      };
    }

    // Erro genérico
    return {
      type: 'unknown',
      message: errorMessage || 'Erro desconhecido ao revisar disciplina.',
      retryable: true,
    };
  }

  /**
   * Aguarda um tempo específico
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manipula cancelamento da análise
   */
  private handleCancelAnalysis(): void {
    this.hideAnalysisSection();
    this.analyzedContent = {};
    this.analysisLogs = [];
  }

  /**
   * Mostra seção de análise
   */
  private showAnalysisSection(): void {
    if (!this.container) return;
    const analysisSection = this.container.querySelector('#review-analysis-section');
    if (analysisSection) {
      (analysisSection as HTMLElement).style.display = 'block';
    }
  }

  /**
   * Esconde seção de análise
   */
  private hideAnalysisSection(): void {
    if (!this.container) return;
    const analysisSection = this.container.querySelector('#review-analysis-section');
    if (analysisSection) {
      (analysisSection as HTMLElement).style.display = 'none';
    }
  }

  /**
   * Renderiza logs de análise
   */
  private renderAnalysisLogs(): void {
    if (!this.container) return;
    const logsSection = this.container.querySelector('#review-logs-section');
    if (!logsSection) return;

    if (this.analysisLogs.length === 0) {
      logsSection.innerHTML = '<p>Nenhum log disponível</p>';
      return;
    }

    logsSection.innerHTML = this.analysisLogs.map((log, index) => {
      return `
        <div class="review-log-item">
          <div class="review-log-header">
            <h4>Submódulo ${index + 1}: ${log.subModuleTitle}</h4>
            <button class="review-log-toggle" data-log-index="${index}" aria-expanded="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          </div>
          <div class="review-log-content" data-log-content="${index}" style="display: block;">
            <div class="review-log-section">
              <h5>System Instruction</h5>
              <pre class="review-log-code">${this.escapeHtml(log.systemInstruction)}</pre>
            </div>
            <div class="review-log-section">
              <h5>Prompt</h5>
              <pre class="review-log-code">${this.escapeHtml(log.prompt)}</pre>
            </div>
            <div class="review-log-section">
              <h5>Resposta (Primeiros 2000 caracteres)</h5>
              <pre class="review-log-code">${this.escapeHtml(log.response.substring(0, 2000))}${log.response.length > 2000 ? '\n\n... (truncado)' : ''}</pre>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Configurar toggles
    logsSection.querySelectorAll('.review-log-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const logIndex = (e.currentTarget as HTMLElement).getAttribute('data-log-index');
        if (logIndex === null) return;
        const content = logsSection.querySelector(`[data-log-content="${logIndex}"]`) as HTMLElement;
        const isExpanded = (e.currentTarget as HTMLElement).getAttribute('aria-expanded') === 'true';
        
        if (content) {
          content.style.display = isExpanded ? 'none' : 'block';
          (e.currentTarget as HTMLElement).setAttribute('aria-expanded', String(!isExpanded));
          const svg = (e.currentTarget as HTMLElement).querySelector('svg') as SVGElement;
          if (svg) {
            svg.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
          }
        }
      });
    });
  }

  /**
   * Escapa HTML para exibição segura
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Manipula análise da disciplina (etapa 1)
   */
  private async handleAnalyze(): Promise<void> {
    if (!this.selectedDisciplineId || !this.container) return;

    this.hideError();
    this.hideResult();
    this.hideAnalysisSection();
    this.showProgress();
    this.currentStep = ReviewStep.LOADING_DISCIPLINE;

    try {
      // Carregar disciplina
      const discipline = dataService.getDiscipline(this.selectedDisciplineId);
      if (!discipline) {
        throw new Error('Disciplina não encontrada');
      }

      // Detectar tipo
      this.updateProgressStep(ReviewStep.DETECTING_TYPE);
      const disciplineType = detectDisciplineType(discipline.title, discipline.description || '');
      const typeLabel = getDisciplineTypeLabel(disciplineType);
      
      const detectingDesc = this.container.querySelector('#detecting-step-description');
      if (detectingDesc) {
        detectingDesc.textContent = `Tipo detectado: ${typeLabel}`;
      }

      // Reset dados de análise
      this.analyzedContent = {};
      this.analysisLogs = [];
      this.reviewMetrics.disciplineType = disciplineType;
      this.reviewMetrics.moduleCount = discipline.modules?.length || 0;
      this.reviewMetrics.subModuleCount = discipline.modules?.reduce((sum, m) => sum + (m.subModules?.length || 0), 0) || 0;

      // Analisar cada submódulo
      this.updateProgressStep(ReviewStep.REVIEWING_CONTENT); // Reutilizando step para análise
      await this.analyzeDiscipline(discipline, disciplineType);

      // Complete
      this.currentStep = ReviewStep.COMPLETED;
      this.hideProgress();
      this.showAnalysisSection();
      this.renderAnalysisLogs();

    } catch (error) {
      const errorInfo = this.classifyError(error);
      console.error('❌ [ContentReviewAgent] Erro ao analisar disciplina:', {
        error,
        type: errorInfo.type,
        message: errorInfo.message,
        retryable: errorInfo.retryable,
        timestamp: new Date().toISOString(),
      });

      this.currentStep = ReviewStep.ERROR;
      this.hideProgress();
      this.showError(errorInfo.message, errorInfo.retryable);
    }
  }

  /**
   * Analisa a disciplina completa (etapa 1 - apenas análise com placeholders)
   */
  private async analyzeDiscipline(discipline: Discipline, disciplineType: string): Promise<void> {
    if (!discipline.modules || discipline.modules.length === 0) {
      throw new Error('Disciplina não possui módulos para analisar');
    }

    // Array para acumular contexto progressivo dos submódulos analisados
    const previousSubModulesContext: Array<{ title: string; content: string }> = [];

    // Contar total de submódulos
    const totalSubModules = discipline.modules.reduce((sum, m) => sum + (m.subModules?.length || 0), 0);
    let currentSubModule = 0;

    // Analisar cada submódulo
    for (const module of discipline.modules) {
      if (!module.subModules) continue;

      for (const subModule of module.subModules) {
        currentSubModule++;
        
        // Atualizar descrição do progresso
        const analyzingDesc = this.container?.querySelector('#analyzing-step-description');
        if (analyzingDesc) {
          analyzingDesc.textContent = `Analisando ${currentSubModule} de ${totalSubModules} submódulos: ${subModule.title}...`;
        }

        try {
          // Obter conteúdo atual do submódulo
          const currentContent = discipline.subModuleContent?.[subModule.id] || subModule.content || '';
          
          if (!currentContent.trim()) {
            console.warn(`⚠️ [ContentReviewAgent] Submódulo "${subModule.title}" não possui conteúdo para analisar`);
            this.analyzedContent[subModule.id] = currentContent;
            continue;
          }

          // Passar contexto progressivo dos submódulos anteriores analisados
          const contextToPass = previousSubModulesContext.length > 0 
            ? [...previousSubModulesContext] 
            : undefined;

          // Analisar submódulo
          const sessionStartTime = Date.now();
          const result = await geminiService.analyzeSubModuleContent(
            {
              disciplineTitle: discipline.title,
              disciplineType,
              moduleTitle: module.title,
              moduleDescription: module.description,
              subModuleTitle: subModule.title,
              subModuleDescription: subModule.description,
              currentContent,
              userPrompt: this.userPrompt || undefined,
              previousSubModulesContext: contextToPass,
            },
            (systemInstruction, prompt, response) => {
              // Armazenar logs
              this.analysisLogs.push({
                subModuleId: subModule.id,
                subModuleTitle: subModule.title,
                systemInstruction,
                prompt,
                response,
              });
            }
          );

          const sessionDuration = Date.now() - sessionStartTime;
          this.analyzedContent[subModule.id] = result.content;

          // Registrar métricas da sessão
          const sessionMetrics: ReviewSessionMetrics = {
            step: `analyze-${subModule.id}`,
            subModuleTitle: subModule.title,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            totalTokens: result.totalTokens,
            duration: sessionDuration,
            timestamp: new Date().toISOString(),
          };
          this.reviewMetrics.sessions.push(sessionMetrics);

          // Acumular totais
          if (result.inputTokens) this.reviewMetrics.totalInputTokens += result.inputTokens;
          if (result.outputTokens) this.reviewMetrics.totalOutputTokens += result.outputTokens;
          if (result.totalTokens) this.reviewMetrics.totalTokens += result.totalTokens;
          this.reviewMetrics.totalDuration += sessionDuration;

          // Adicionar o conteúdo analisado ao contexto progressivo
          previousSubModulesContext.push({
            title: subModule.title,
            content: result.content,
          });

          console.log(`✅ [ContentReviewAgent] Submódulo "${subModule.title}" analisado com sucesso`);
        } catch (error) {
          const errorInfo = this.classifyError(error);
          console.error(`❌ [ContentReviewAgent] Erro ao analisar submódulo "${subModule.title}":`, {
            error: error instanceof Error ? error.message : String(error),
            type: errorInfo.type,
            subModuleId: subModule.id,
            timestamp: new Date().toISOString(),
          });

          // Em caso de erro, manter conteúdo original
          this.analyzedContent[subModule.id] = discipline.subModuleContent?.[subModule.id] || subModule.content || '';
          
          // Se for erro não retryable, interromper análise
          if (!errorInfo.retryable) {
            throw error;
          }

          // Continuar com próximo submódulo se for erro retryable
          console.warn(`⚠️ [ContentReviewAgent] Continuando análise apesar do erro no submódulo "${subModule.title}"`);
        }
      }
    }
  }

  /**
   * Manipula confirmação e início da implementação (etapa 2)
   */
  private async handleConfirmAndImplement(): Promise<void> {
    if (!this.selectedDisciplineId || !this.container) return;

    this.hideAnalysisSection();
    this.hideError();
    this.hideResult();
    this.showProgress();
    this.currentStep = ReviewStep.LOADING_DISCIPLINE;

    try {
      // Carregar disciplina
      const discipline = dataService.getDiscipline(this.selectedDisciplineId);
      if (!discipline) {
        throw new Error('Disciplina não encontrada');
      }

      // Detectar tipo
      this.updateProgressStep(ReviewStep.DETECTING_TYPE);
      const disciplineType = detectDisciplineType(discipline.title, discipline.description || '');
      const typeLabel = getDisciplineTypeLabel(disciplineType);
      
      const detectingDesc = this.container.querySelector('#detecting-step-description');
      if (detectingDesc) {
        detectingDesc.textContent = `Tipo detectado: ${typeLabel}`;
      }

      // Reset métricas para implementação
      this.reviewMetrics = {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        totalDuration: 0,
        moduleCount: this.reviewMetrics.moduleCount,
        subModuleCount: this.reviewMetrics.subModuleCount,
        disciplineType,
        sessions: [],
      };

      // Implementar elementos interativos (etapa 2 - futura)
      this.updateProgressStep(ReviewStep.REVIEWING_CONTENT);
      await this.reviewDiscipline(discipline, disciplineType);

      // Complete
      this.currentStep = ReviewStep.COMPLETED;
      this.hideProgress();
      this.showResult(discipline.title);
      this.showMetricsDashboard();

    } catch (error) {
      const errorInfo = this.classifyError(error);
      console.error('❌ [ContentReviewAgent] Erro ao implementar elementos:', {
        error,
        type: errorInfo.type,
        message: errorInfo.message,
        retryable: errorInfo.retryable,
        timestamp: new Date().toISOString(),
      });

      this.currentStep = ReviewStep.ERROR;
      this.hideProgress();
      this.showError(errorInfo.message, errorInfo.retryable);
    }
  }

  /**
   * Manipula início da revisão (método antigo - mantido para compatibilidade)
   */
  private async handleStartReview(): Promise<void> {
    if (!this.selectedDisciplineId || !this.container) return;

    this.hideError();
    this.hideResult();
    this.showProgress();
    this.currentStep = ReviewStep.LOADING_DISCIPLINE;

    try {
      // Carregar disciplina
      const discipline = dataService.getDiscipline(this.selectedDisciplineId);
      if (!discipline) {
        throw new Error('Disciplina não encontrada');
      }

      // Detectar tipo
      this.updateProgressStep(ReviewStep.DETECTING_TYPE);
      const disciplineType = detectDisciplineType(discipline.title, discipline.description || '');
      const typeLabel = getDisciplineTypeLabel(disciplineType);
      
      const detectingDesc = this.container.querySelector('#detecting-step-description');
      if (detectingDesc) {
        detectingDesc.textContent = `Tipo detectado: ${typeLabel}`;
      }

      this.reviewMetrics.disciplineType = disciplineType;
      this.reviewMetrics.moduleCount = discipline.modules?.length || 0;
      this.reviewMetrics.subModuleCount = discipline.modules?.reduce((sum, m) => sum + (m.subModules?.length || 0), 0) || 0;

      // Reset métricas
      this.reviewMetrics = {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        totalDuration: 0,
        moduleCount: this.reviewMetrics.moduleCount,
        subModuleCount: this.reviewMetrics.subModuleCount,
        disciplineType,
        sessions: [],
      };

      // Iniciar revisão de conteúdo
      this.updateProgressStep(ReviewStep.REVIEWING_CONTENT);
      await this.reviewDiscipline(discipline, disciplineType);

      // Complete
      this.currentStep = ReviewStep.COMPLETED;
      this.hideProgress();
      this.showResult(discipline.title);
      this.showMetricsDashboard();

    } catch (error) {
      const errorInfo = this.classifyError(error);
      console.error('❌ [ContentReviewAgent] Erro ao revisar disciplina:', {
        error,
        type: errorInfo.type,
        message: errorInfo.message,
        retryable: errorInfo.retryable,
        timestamp: new Date().toISOString(),
      });

      this.currentStep = ReviewStep.ERROR;
      this.hideProgress();
      this.showError(errorInfo.message, errorInfo.retryable);
    }
  }

  /**
   * Revisa a disciplina completa
   */
  private async reviewDiscipline(discipline: Discipline, disciplineType: string): Promise<void> {
    if (!discipline.modules || discipline.modules.length === 0) {
      throw new Error('Disciplina não possui módulos para revisar');
    }

    // Array para acumular contexto progressivo dos submódulos revisados
    const previousSubModulesContext: Array<{ title: string; content: string }> = [];
    const updatedSubModuleContent: Record<string, string> = {};

    // Contar total de submódulos
    const totalSubModules = discipline.modules.reduce((sum, m) => sum + (m.subModules?.length || 0), 0);
    let currentSubModule = 0;

    // Revisar cada submódulo
    for (const module of discipline.modules) {
      if (!module.subModules) continue;

      for (const subModule of module.subModules) {
        currentSubModule++;
        
        // Atualizar descrição do progresso
        this.updateReviewingStepDescription(
          `Revisando ${currentSubModule} de ${totalSubModules} submódulos: ${subModule.title}...`
        );

        try {
          // Obter conteúdo: se houver análise prévia (com placeholders), usar ela; senão, usar conteúdo original
          const analyzedContent = this.analyzedContent[subModule.id];
          const currentContent = analyzedContent || discipline.subModuleContent?.[subModule.id] || subModule.content || '';
          
          if (!currentContent.trim()) {
            console.warn(`⚠️ [ContentReviewAgent] Submódulo "${subModule.title}" não possui conteúdo para revisar`);
            updatedSubModuleContent[subModule.id] = currentContent;
            continue;
          }

          // Passar contexto progressivo dos submódulos anteriores revisados
          const contextToPass = previousSubModulesContext.length > 0 
            ? [...previousSubModulesContext] 
            : undefined;

          // Retry com backoff exponencial para revisão de submódulo
          let lastError: Error | null = null;
          let result = null;
          const maxRetries = 3;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              const sessionStartTime = Date.now();
              result = await geminiService.reviewSubModuleContent(
                {
                  disciplineTitle: discipline.title,
                  disciplineType,
                  moduleTitle: module.title,
                  moduleDescription: module.description,
                  subModuleTitle: subModule.title,
                  subModuleDescription: subModule.description,
                  currentContent,
                  userPrompt: this.userPrompt || undefined,
                  previousSubModulesContext: contextToPass,
                },
                (systemInstruction, prompt, response) => {
                  // Store debug info for each submodule
                  this.debugInfo.push({
                    step: `review-${subModule.id}`,
                    systemInstruction: systemInstruction,
                    prompt: prompt,
                    response: response.substring(0, 500) + (response.length > 500 ? '...' : ''),
                    timestamp: new Date().toISOString(),
                  });
                }
              );

              const sessionDuration = Date.now() - sessionStartTime;
              updatedSubModuleContent[subModule.id] = result.content;

              // Registrar métricas da sessão
              const sessionMetrics: ReviewSessionMetrics = {
                step: `review-${subModule.id}`,
                subModuleTitle: subModule.title,
                inputTokens: result.inputTokens,
                outputTokens: result.outputTokens,
                totalTokens: result.totalTokens,
                duration: sessionDuration,
                timestamp: new Date().toISOString(),
              };
              this.reviewMetrics.sessions.push(sessionMetrics);

              // Acumular totais
              if (result.inputTokens) this.reviewMetrics.totalInputTokens += result.inputTokens;
              if (result.outputTokens) this.reviewMetrics.totalOutputTokens += result.outputTokens;
              if (result.totalTokens) this.reviewMetrics.totalTokens += result.totalTokens;
              this.reviewMetrics.totalDuration += sessionDuration;

              // Adicionar o conteúdo revisado ao contexto progressivo
              previousSubModulesContext.push({
                title: subModule.title,
                content: result.content,
              });

              console.log(`✅ [ContentReviewAgent] Submódulo "${subModule.title}" revisado com sucesso (tentativa ${attempt}/${maxRetries})`);
              console.log(`✅ [ContentReviewAgent] Contexto progressivo: ${previousSubModulesContext.length} submódulo(s) revisado(s)`);
              
              break; // Sucesso, sair do loop de retry
            } catch (error) {
              lastError = error instanceof Error ? error : new Error(String(error));
              const errorInfo = this.classifyError(error);

              console.warn(`⚠️ [ContentReviewAgent] Erro ao revisar submódulo "${subModule.title}" (tentativa ${attempt}/${maxRetries}):`, {
                error: lastError.message,
                type: errorInfo.type,
                retryable: errorInfo.retryable,
              });

              // Se não for retryable ou última tentativa, lançar erro
              if (!errorInfo.retryable || attempt === maxRetries) {
                throw lastError;
              }

              // Backoff exponencial: 2s, 4s, 8s
              const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
              console.log(`⏳ [ContentReviewAgent] Aguardando ${waitTime}ms antes de tentar novamente...`);
              
              // Atualizar descrição do progresso
              this.updateReviewingStepDescription(
                `Revisando ${currentSubModule} de ${totalSubModules} submódulos: ${subModule.title}... (Tentativa ${attempt + 1}/${maxRetries})`
              );

              await this.wait(waitTime);
            }
          }

          if (!result) {
            throw lastError || new Error('Falha ao revisar submódulo após múltiplas tentativas');
          }
        } catch (error) {
          const errorInfo = this.classifyError(error);
          console.error(`❌ [ContentReviewAgent] Erro final ao revisar submódulo "${subModule.title}":`, {
            error: error instanceof Error ? error.message : String(error),
            type: errorInfo.type,
            subModuleId: subModule.id,
            timestamp: new Date().toISOString(),
          });

          // Em caso de erro, manter conteúdo original
          updatedSubModuleContent[subModule.id] = discipline.subModuleContent?.[subModule.id] || subModule.content || '';
          
          // Registrar sessão com erro
          this.reviewMetrics.sessions.push({
            step: `review-${subModule.id}`,
            subModuleTitle: subModule.title,
            duration: 0,
            timestamp: new Date().toISOString(),
          });

          // Se for erro não retryable, interromper revisão
          if (!errorInfo.retryable) {
            throw error;
          }

          // Continuar com próximo submódulo se for erro retryable mas já esgotou tentativas
          console.warn(`⚠️ [ContentReviewAgent] Continuando revisão apesar do erro no submódulo "${subModule.title}"`);
        }
      }
    }

    // Criar disciplina revisada
    this.reviewedDiscipline = {
      ...discipline,
      subModuleContent: {
        ...discipline.subModuleContent,
        ...updatedSubModuleContent,
      },
      modules: discipline.modules.map(m => ({
        ...m,
        subModules: m.subModules?.map(sm => ({
          ...sm,
          content: updatedSubModuleContent[sm.id] || sm.content,
          contentGeneratedAt: updatedSubModuleContent[sm.id] ? new Date().toISOString() : sm.contentGeneratedAt,
        })) || [],
      })),
    };

    this.reviewedDisciplineId = this.selectedDisciplineId;
  }

  /**
   * Atualiza passo do progresso
   */
  private updateProgressStep(step: ReviewStep): void {
    this.currentStep = step;
    if (!this.container) return;

    const steps = this.container.querySelectorAll('.progress-step');
    steps.forEach((stepEl) => {
      const stepData = stepEl.getAttribute('data-step');
      if (stepData === step) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }
    });
  }

  /**
   * Atualiza descrição do passo de revisão
   */
  private updateReviewingStepDescription(description: string): void {
    if (!this.container) return;
    const descElement = this.container.querySelector('#reviewing-step-description');
    if (descElement) {
      descElement.textContent = description;
    }
  }

  /**
   * Mostra seção de progresso
   */
  private showProgress(): void {
    if (!this.container) return;
    const progressSection = this.container.querySelector('#review-progress-section');
    if (progressSection) {
      (progressSection as HTMLElement).style.display = 'block';
    }
  }

  /**
   * Esconde seção de progresso
   */
  private hideProgress(): void {
    if (!this.container) return;
    const progressSection = this.container.querySelector('#review-progress-section');
    if (progressSection) {
      (progressSection as HTMLElement).style.display = 'none';
    }
  }

  /**
   * Mostra seção de resultado
   */
  private showResult(title: string): void {
    if (!this.container) return;
    const resultSection = this.container.querySelector('#review-result-section');
    const subtitle = this.container.querySelector('#review-result-subtitle');
    if (resultSection) (resultSection as HTMLElement).style.display = 'block';
    if (subtitle) subtitle.textContent = `"${title}" foi revisada e está pronta para ser salva.`;
  }

  /**
   * Esconde seção de resultado
   */
  private hideResult(): void {
    if (!this.container) return;
    const resultSection = this.container.querySelector('#review-result-section');
    if (resultSection) (resultSection as HTMLElement).style.display = 'none';
  }

  /**
   * Mostra seção de erro
   */
  private showError(message: string, retryable: boolean = true): void {
    if (!this.container) return;
    const errorSection = this.container.querySelector('#review-error-section');
    const errorMessage = this.container.querySelector('#review-error-message');
    const retryBtn = this.container.querySelector('#review-retry-btn') as HTMLButtonElement;
    
    if (errorSection) (errorSection as HTMLElement).style.display = 'block';
    if (errorMessage) errorMessage.textContent = message;
    if (retryBtn) {
      retryBtn.style.display = retryable ? 'flex' : 'none';
      retryBtn.disabled = !retryable;
    }
  }

  /**
   * Esconde seção de erro
   */
  private hideError(): void {
    if (!this.container) return;
    const errorSection = this.container.querySelector('#review-error-section');
    if (errorSection) (errorSection as HTMLElement).style.display = 'none';
  }

  /**
   * Exibe dashboard de métricas após revisão
   */
  private showMetricsDashboard(): void {
    if (!this.container) return;

    // Remover dashboard anterior se existir
    const existingDashboard = this.container.querySelector('#review-metrics-dashboard');
    if (existingDashboard) {
      existingDashboard.remove();
    }

    // Criar elemento do dashboard
    const dashboard = document.createElement('div');
    dashboard.id = 'review-metrics-dashboard';
    dashboard.className = 'review-metrics-dashboard';
    
    const formatDuration = (ms: number): string => {
      if (ms < 1000) return `${ms}ms`;
      const seconds = Math.floor(ms / 1000);
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    };

    const formatNumber = (num: number): string => {
      return num.toLocaleString('pt-BR');
    };

    const typeLabel = getDisciplineTypeLabel(this.reviewMetrics.disciplineType as any);

    dashboard.innerHTML = `
      <div class="review-metrics-header">
        <button class="review-metrics-toggle" id="review-metrics-toggle" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
          <h3>📊 Métricas de Revisão</h3>
        </button>
      </div>
      <div class="review-metrics-content" id="review-metrics-content" style="display: block;">
        <!-- Resumo Rápido -->
        <div class="review-metrics-summary">
          <div class="review-metric-card highlight">
            <div class="review-metric-icon">📚</div>
            <div class="review-metric-info">
              <div class="review-metric-label">Tipo</div>
              <div class="review-metric-value">${typeLabel}</div>
            </div>
          </div>
          <div class="review-metric-card highlight">
            <div class="review-metric-icon">📄</div>
            <div class="review-metric-info">
              <div class="review-metric-label">Submódulos Revisados</div>
              <div class="review-metric-value">${this.reviewMetrics.subModuleCount}</div>
            </div>
          </div>
          <div class="review-metric-card highlight">
            <div class="review-metric-icon">⏱️</div>
            <div class="review-metric-info">
              <div class="review-metric-label">Tempo Total</div>
              <div class="review-metric-value">${formatDuration(this.reviewMetrics.totalDuration)}</div>
            </div>
          </div>
        </div>

        <!-- Seção de Tokens -->
        <div class="review-metrics-section">
          <div class="review-metrics-section-header">
            <h4>💎 Uso de Tokens</h4>
            <button class="review-metrics-section-toggle" data-section="tokens">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          </div>
          <div class="review-metrics-section-content" id="review-metrics-tokens" data-expanded="true">
            <div class="review-metrics-tokens-grid">
              <div class="review-metric-card">
                <div class="review-metric-label">Input Tokens</div>
                <div class="review-metric-value large">${formatNumber(this.reviewMetrics.totalInputTokens)}</div>
                <div class="review-metric-progress">
                  <div class="review-metric-progress-bar" style="width: ${this.reviewMetrics.totalTokens > 0 ? (this.reviewMetrics.totalInputTokens / this.reviewMetrics.totalTokens * 100) : 0}%"></div>
                </div>
              </div>
              <div class="review-metric-card">
                <div class="review-metric-label">Output Tokens</div>
                <div class="review-metric-value large">${formatNumber(this.reviewMetrics.totalOutputTokens)}</div>
                <div class="review-metric-progress">
                  <div class="review-metric-progress-bar output" style="width: ${this.reviewMetrics.totalTokens > 0 ? (this.reviewMetrics.totalOutputTokens / this.reviewMetrics.totalTokens * 100) : 0}%"></div>
                </div>
              </div>
              <div class="review-metric-card">
                <div class="review-metric-label">Total</div>
                <div class="review-metric-value large">${formatNumber(this.reviewMetrics.totalTokens)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seção de Detalhes -->
        <div class="review-metrics-section">
          <div class="review-metrics-section-header">
            <h4>📋 Detalhes por Sessão</h4>
            <button class="review-metrics-section-toggle" data-section="details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          </div>
          <div class="review-metrics-section-content" id="review-metrics-details" data-expanded="true">
            <div class="review-metrics-table-wrapper">
              <table class="review-metrics-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Submódulo</th>
                    <th>Input Tokens</th>
                    <th>Output Tokens</th>
                    <th>Total Tokens</th>
                    <th>Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.reviewMetrics.sessions.map((session, index) => `
                    <tr>
                      <td class="review-metrics-index">${index + 1}</td>
                      <td class="review-metrics-submodule">${session.subModuleTitle}</td>
                      <td>${session.inputTokens ? formatNumber(session.inputTokens) : '<span class="review-metrics-na">N/A</span>'}</td>
                      <td>${session.outputTokens ? formatNumber(session.outputTokens) : '<span class="review-metrics-na">N/A</span>'}</td>
                      <td><strong>${session.totalTokens ? formatNumber(session.totalTokens) : '<span class="review-metrics-na">N/A</span>'}</strong></td>
                      <td>${formatDuration(session.duration)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Inserir após a seção de resultado
    const resultSection = this.container.querySelector('#review-result-section');
    if (resultSection && resultSection.parentNode) {
      resultSection.parentNode.insertBefore(dashboard, resultSection.nextSibling);
    } else {
      this.container.appendChild(dashboard);
    }

    // Configurar eventos de toggle
    this.setupMetricsDashboardEvents();
  }

  /**
   * Configura eventos do dashboard de métricas
   */
  private setupMetricsDashboardEvents(): void {
    if (!this.container) return;

    // Toggle principal
    const mainToggle = this.container.querySelector('#review-metrics-toggle');
    const mainContent = this.container.querySelector('#review-metrics-content');
    
    if (mainToggle && mainContent) {
      // Inicializar como expandido
      mainToggle.setAttribute('aria-expanded', 'true');
      (mainToggle.querySelector('svg') as SVGElement).style.transform = 'rotate(90deg)';
      
      mainToggle.addEventListener('click', () => {
        const isExpanded = mainToggle.getAttribute('aria-expanded') === 'true';
        mainToggle.setAttribute('aria-expanded', String(!isExpanded));
        (mainContent as HTMLElement).style.display = isExpanded ? 'none' : 'block';
        (mainToggle.querySelector('svg') as SVGElement).style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
      });
    }

    // Toggles de seções
    const sectionToggles = this.container.querySelectorAll('.review-metrics-section-toggle');
    sectionToggles.forEach(toggle => {
      const sectionId = toggle.getAttribute('data-section');
      if (!sectionId) return;
      
      const sectionContent = this.container?.querySelector(`#review-metrics-${sectionId}`);
      if (!sectionContent) return;

      // Inicializar como expandido
      sectionContent.setAttribute('data-expanded', 'true');
      (toggle.querySelector('svg') as SVGElement).style.transform = 'rotate(180deg)';
      
      toggle.addEventListener('click', () => {
        const isExpanded = sectionContent.getAttribute('data-expanded') === 'true';
        sectionContent.setAttribute('data-expanded', String(!isExpanded));
        (sectionContent as HTMLElement).style.display = isExpanded ? 'none' : 'block';
        (toggle.querySelector('svg') as SVGElement).style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      });
    });
  }

  /**
   * Manipula salvamento da disciplina revisada
   */
  private async handleSave(): Promise<void> {
    if (!this.reviewedDiscipline || !this.reviewedDisciplineId) return;

    // Salvar disciplina revisada
    dataService.saveDiscipline(this.reviewedDisciplineId, this.reviewedDiscipline);

    // Salvar no histórico
    const historyItem: ReviewHistoryItem = {
      id: `review-${Date.now()}`,
      disciplineId: this.reviewedDisciplineId,
      disciplineTitle: this.reviewedDiscipline.title,
      disciplineType: this.reviewMetrics.disciplineType,
      userPrompt: this.userPrompt || undefined,
      createdAt: new Date().toISOString(),
      metrics: {
        totalSubModules: this.reviewMetrics.subModuleCount,
        totalInputTokens: this.reviewMetrics.totalInputTokens,
        totalOutputTokens: this.reviewMetrics.totalOutputTokens,
        totalDuration: this.reviewMetrics.totalDuration,
      },
    };

    // Salvar histórico (similar ao PDFToDocsAgent)
    const historyKey = 'khroma-agents-history';
    const history = JSON.parse(localStorage.getItem(historyKey) || '{"contentReview":[]}');
    if (!history.contentReview) {
      history.contentReview = [];
    }
    history.contentReview.unshift(historyItem);
    // Manter apenas os últimos 50 itens
    history.contentReview = history.contentReview.slice(0, 50);
    localStorage.setItem(historyKey, JSON.stringify(history));

    // Exportar automaticamente para MD
    try {
      const fileHandle = await syncDisciplineWithFile(this.reviewedDisciplineId, this.reviewedDiscipline);
      
      if (fileHandle) {
        alert(`✅ Disciplina "${this.reviewedDiscipline.title}" salva e exportada para Markdown!\n\nO arquivo foi salvo e será sincronizado automaticamente quando você editá-lo.`);
        this.setupFileSync(fileHandle, this.reviewedDisciplineId);
      } else {
        await exportDisciplineToMarkdown(this.reviewedDiscipline, this.reviewedDisciplineId);
        alert(`✅ Disciplina "${this.reviewedDiscipline.title}" salva e exportada para Markdown!\n\nArquivo baixado. Para sincronização automática, use um navegador compatível (Chrome/Edge).`);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      await exportDisciplineToMarkdown(this.reviewedDiscipline, this.reviewedDisciplineId);
      alert(`✅ Disciplina "${this.reviewedDiscipline.title}" salva e exportada para Markdown!\n\nArquivo baixado.`);
    }
  }

  /**
   * Manipula visualização da disciplina revisada
   */
  private handlePreview(): void {
    if (!this.reviewedDisciplineId) return;
    
    // Navegar para a disciplina (similar ao PDFToDocsAgent)
    window.location.hash = `#discipline/${this.reviewedDisciplineId}`;
  }
}

