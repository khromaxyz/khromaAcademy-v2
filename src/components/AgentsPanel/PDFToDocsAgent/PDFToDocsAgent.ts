/**
 * PDF to Docs Agent Component
 * Permite upload de PDF, prompt opcional e geração de disciplina
 */

import './PDFToDocsAgent.css';
import { geminiService } from '@/services/geminiService';
import { dataService } from '@/services/dataService';
import { createId } from '@/utils/idGenerator';
import { exportDisciplineToMarkdown, syncDisciplineWithFile } from '@/services/disciplineExportService';
import type { AgentHistoryItem } from '@/types/agent';
import { GenerationStep } from '@/types/agent';
import type { Discipline } from '@/types/discipline';

interface DebugInfo {
  step: string;
  systemInstruction: string;
  prompt: string;
  response: string;
  timestamp: string;
}

interface SessionMetrics {
  step: string;
  subModuleTitle: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  duration: number; // em milissegundos
  timestamp: string;
}

interface GenerationMetrics {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalDuration: number; // em milissegundos
  moduleCount: number;
  subModuleCount: number;
  sessions: SessionMetrics[];
}

export class PDFToDocsAgent {
  private container: HTMLElement | null = null;
  private pdfFile: File | null = null;
  private userPrompt: string = '';
  private currentStep: GenerationStep = GenerationStep.IDLE;
  private generatedDiscipline: Discipline | null = null;
  private generatedDisciplineId: string | null = null;
  private debugInfo: DebugInfo[] = [];
  private generationMetrics: GenerationMetrics = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalDuration: 0,
    moduleCount: 0,
    subModuleCount: 0,
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
    agentContainer.className = 'pdf-to-docs-agent';
    agentContainer.innerHTML = this.render();

    this.container = agentContainer;
    this.setupEventListeners();

    return agentContainer;
  }

  /**
   * Renderiza o HTML do agente
   */
  private render(): string {
    return `
      <div class="pdf-agent-header">
        <div class="pdf-agent-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h2>PDF to Docs</h2>
        </div>
        <p class="pdf-agent-description">
          Faça upload de um PDF e deixe a IA analisar e criar uma disciplina completa automaticamente.
        </p>
      </div>

      <div class="pdf-agent-content">
        <!-- Upload Section -->
        <div class="pdf-upload-section">
          <label class="pdf-upload-label">Arquivo PDF</label>
          <div class="pdf-upload-area" id="pdf-upload-area">
            <input type="file" id="pdf-file-input" accept=".pdf" style="display: none;">
            <div class="pdf-upload-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>Clique ou arraste um arquivo PDF aqui</p>
              <span class="pdf-upload-hint">Máximo 20MB</span>
            </div>
            <div class="pdf-file-preview" id="pdf-file-preview" style="display: none;">
              <div class="pdf-file-info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <div class="pdf-file-details">
                  <span class="pdf-file-name" id="pdf-file-name"></span>
                  <span class="pdf-file-size" id="pdf-file-size"></span>
                </div>
                <button class="pdf-file-remove" id="pdf-file-remove" aria-label="Remover arquivo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Prompt Section -->
        <div class="pdf-prompt-section">
          <label class="pdf-prompt-label">
            Prompt Opcional
            <span class="pdf-prompt-hint">(Instruções adicionais para personalizar a geração)</span>
          </label>
          <textarea
            id="pdf-user-prompt"
            class="pdf-prompt-input"
            placeholder="Ex: Foque em exemplos práticos, use linguagem técnica, inclua exercícios..."
            rows="4"
          ></textarea>
        </div>

        <!-- Generate Button -->
        <button class="pdf-generate-btn" id="pdf-generate-btn" disabled>
          <span class="btn-text">Gerar Disciplina</span>
          <span class="btn-loader" style="display: none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
          </span>
        </button>

        <!-- Progress Section -->
        <div class="pdf-progress-section" id="pdf-progress-section" style="display: none;">
          <div class="pdf-progress-steps">
            <div class="progress-step" data-step="analyzing">
              <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="step-content">
                <span class="step-title">Analisando PDF</span>
                <span class="step-description">Extraindo informações do documento...</span>
              </div>
              <button class="step-debug-btn" data-debug-step="analyzing" aria-label="Ver debug" title="Ver prompt e resposta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </button>
            </div>
            <div class="progress-step" data-step="structure">
              <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div class="step-content">
                <span class="step-title">Gerando Estrutura</span>
                <span class="step-description">Criando módulos e tópicos...</span>
              </div>
              <button class="step-debug-btn" data-debug-step="structure" aria-label="Ver debug" title="Ver prompt e resposta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </button>
            </div>
            <div class="progress-step" data-step="content">
              <div class="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div class="step-content">
                <span class="step-title">Gerando Conteúdo</span>
                <span class="step-description" id="content-step-description">Gerando submódulos automaticamente...</span>
              </div>
              <button class="step-debug-btn" data-debug-step="content" aria-label="Ver debug" title="Ver prompt e resposta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Result Section -->
        <div class="pdf-result-section" id="pdf-result-section" style="display: none;">
          <div class="pdf-result-header">
            <h3>Disciplina Gerada com Sucesso!</h3>
            <p class="pdf-result-subtitle" id="pdf-result-subtitle"></p>
          </div>
          <div class="pdf-result-actions">
            <button class="pdf-save-btn" id="pdf-save-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Salvar Disciplina
            </button>
            <button class="pdf-export-md-btn" id="pdf-export-md-btn" title="Exportar como Markdown e sincronizar automaticamente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Exportar MD
            </button>
            <button class="pdf-review-btn" id="pdf-review-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8"></path>
                <polyline points="18 2 22 6 18 10"></polyline>
                <line x1="22" y1="6" x2="12" y2="6"></line>
              </svg>
              Revisar com Elementos Interativos
            </button>
            <button class="pdf-preview-btn" id="pdf-preview-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Visualizar
            </button>
          </div>
        </div>

        <!-- Error Section -->
        <div class="pdf-error-section" id="pdf-error-section" style="display: none;">
          <div class="error-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Erro ao Gerar Disciplina</h3>
            <p class="error-message" id="pdf-error-message"></p>
            <button class="error-retry-btn" id="pdf-error-retry">Tentar Novamente</button>
          </div>
        </div>

        <!-- History Section -->
        <div class="pdf-history-section">
          <div class="pdf-history-header">
            <h3>Histórico</h3>
            <span class="pdf-history-count" id="pdf-history-count">0 itens</span>
          </div>
          <div class="pdf-history-list" id="pdf-history-list">
            <!-- Itens de histórico serão inseridos aqui -->
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

    const fileInput = this.container.querySelector('#pdf-file-input') as HTMLInputElement;
    const uploadArea = this.container.querySelector('#pdf-upload-area');
    const removeBtn = this.container.querySelector('#pdf-file-remove');
    const promptInput = this.container.querySelector('#pdf-user-prompt') as HTMLTextAreaElement;
    const generateBtn = this.container.querySelector('#pdf-generate-btn');
    const saveBtn = this.container.querySelector('#pdf-save-btn');
    const exportMdBtn = this.container.querySelector('#pdf-export-md-btn');
    const reviewBtn = this.container.querySelector('#pdf-review-btn');
    const previewBtn = this.container.querySelector('#pdf-preview-btn');
    const errorRetryBtn = this.container.querySelector('#pdf-error-retry');

    // File input click
    uploadArea?.addEventListener('click', () => {
      fileInput?.click();
    });

    // File input change
    fileInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        this.handleFileSelect(target.files[0]);
      }
    });

    // Drag and drop
    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea?.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const dragEvent = e as DragEvent;
      const files = dragEvent.dataTransfer?.files;
      if (files && files[0] && files[0].type === 'application/pdf') {
        this.handleFileSelect(files[0]);
      }
    });

    // Remove file
    removeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeFile();
    });

    // Prompt input
    promptInput?.addEventListener('input', () => {
      this.userPrompt = promptInput.value;
      this.updateGenerateButton();
    });

    // Generate button
    generateBtn?.addEventListener('click', () => {
      this.handleGenerate();
    });

    // Save button
    saveBtn?.addEventListener('click', async () => {
      await this.handleSave();
    });

    // Export MD button
    exportMdBtn?.addEventListener('click', async () => {
      await this.handleExportMarkdown();
    });

    // Review button
    reviewBtn?.addEventListener('click', () => {
      this.handleReview();
    });

    // Preview button
    previewBtn?.addEventListener('click', () => {
      this.handlePreview();
    });

    // Error retry
    errorRetryBtn?.addEventListener('click', () => {
      this.handleGenerate();
    });

    // Debug buttons
    this.container.querySelectorAll('.step-debug-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const step = (e.currentTarget as HTMLElement).getAttribute('data-debug-step');
        if (step) {
          this.showDebugModal(step);
        }
      });
    });

    // Load history
    this.loadHistory();
  }

  /**
   * Manipula seleção de arquivo
   */
  private handleFileSelect(file: File): void {
    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('O arquivo é muito grande. Máximo permitido: 20MB.');
      return;
    }

    this.pdfFile = file;
    this.updateFilePreview();
    this.updateGenerateButton();
  }

  /**
   * Remove arquivo selecionado
   */
  private removeFile(): void {
    this.pdfFile = null;
    const fileInput = this.container?.querySelector('#pdf-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.updateFilePreview();
    this.updateGenerateButton();
  }

  /**
   * Atualiza preview do arquivo
   */
  private updateFilePreview(): void {
    if (!this.container) return;

    const placeholder = this.container.querySelector('.pdf-upload-placeholder');
    const preview = this.container.querySelector('#pdf-file-preview');
    const fileName = this.container.querySelector('#pdf-file-name');
    const fileSize = this.container.querySelector('#pdf-file-size');

    if (this.pdfFile) {
      placeholder?.setAttribute('style', 'display: none;');
      preview?.setAttribute('style', 'display: block;');
      if (fileName) fileName.textContent = this.pdfFile.name;
      if (fileSize) fileSize.textContent = this.formatFileSize(this.pdfFile.size);
    } else {
      placeholder?.setAttribute('style', 'display: flex;');
      preview?.setAttribute('style', 'display: none;');
    }
  }

  /**
   * Formata tamanho do arquivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Atualiza estado do botão de gerar
   */
  private updateGenerateButton(): void {
    if (!this.container) return;

    const generateBtn = this.container.querySelector('#pdf-generate-btn') as HTMLButtonElement;
    if (generateBtn) {
      generateBtn.disabled = !this.pdfFile || this.currentStep !== GenerationStep.IDLE;
    }
  }

  /**
   * Manipula geração de disciplina
   */
  private async handleGenerate(): Promise<void> {
    if (!this.pdfFile || !this.container) return;

    // Reset states
    this.hideError();
    this.hideResult();
    this.showProgress();
    this.currentStep = GenerationStep.ANALYZING;

    try {
      // Convert PDF to base64
      const pdfBase64 = await this.fileToBase64(this.pdfFile);
      const pdfData = [{
        mimeType: 'application/pdf',
        data: pdfBase64,
      }];

      // Step 1: Analyze PDF and generate structure
      this.updateProgressStep(GenerationStep.GENERATING_STRUCTURE);
      
      const structure = await geminiService.generatePDFStructure(
        this.pdfFile.name,
        this.userPrompt || undefined,
        pdfData,
        (systemInstruction, prompt, response) => {
          // Store debug info
          this.debugInfo.push({
            step: 'structure',
            systemInstruction: systemInstruction,
            prompt: prompt,
            response: response,
            timestamp: new Date().toISOString(),
          });
        }
      );

      // Step 2: Generate content for all submodules automatically
      this.updateProgressStep(GenerationStep.GENERATING_CONTENT);
      const subModuleContent: Record<string, string> = {};

      // Reset métricas
      this.generationMetrics = {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        totalDuration: 0,
        moduleCount: structure.modules.length,
        subModuleCount: 0,
        sessions: [],
      };

      // Contar total de submódulos
      const totalSubModules = structure.modules.reduce((sum, m) => sum + m.subModules.length, 0);
      this.generationMetrics.subModuleCount = totalSubModules;
      let currentSubModule = 0;

      // Array para acumular contexto progressivo dos submódulos anteriores
      const previousSubModulesContext: Array<{ title: string; content: string }> = [];

      // Gerar conteúdo para cada submódulo
      for (const module of structure.modules) {
        for (const subModule of module.subModules) {
          currentSubModule++;
          
          // Atualizar descrição do progresso
          this.updateContentStepDescription(
            `Gerando ${currentSubModule} de ${totalSubModules} submódulos: ${subModule.title}...`
          );

          try {
            // Passar contexto progressivo dos submódulos anteriores (cópia para evitar mutação)
            const contextToPass = previousSubModulesContext.length > 0 
              ? [...previousSubModulesContext] 
              : undefined;

            const sessionStartTime = Date.now();
            const result = await geminiService.generatePDFSubModuleContentWithMetrics(
              {
                moduleTitle: module.title,
                moduleDescription: module.description,
                subModuleTitle: subModule.title,
                subModuleDescription: subModule.description,
                userPrompt: this.userPrompt || undefined,
                previousSubModulesContext: contextToPass,
              },
              pdfData,
              (systemInstruction, prompt, response) => {
                // Store debug info for each submodule
                this.debugInfo.push({
                  step: `content-${subModule.id}`,
                  systemInstruction: systemInstruction,
                  prompt: prompt,
                  response: response.substring(0, 500) + (response.length > 500 ? '...' : ''),
                  timestamp: new Date().toISOString(),
                });
              }
            );

            const sessionDuration = Date.now() - sessionStartTime;
            subModuleContent[subModule.id] = result.content;

            // Registrar métricas da sessão
            const sessionMetrics: SessionMetrics = {
              step: `content-${subModule.id}`,
              subModuleTitle: subModule.title,
              inputTokens: result.inputTokens,
              outputTokens: result.outputTokens,
              totalTokens: result.totalTokens,
              duration: sessionDuration,
              timestamp: new Date().toISOString(),
            };
            this.generationMetrics.sessions.push(sessionMetrics);

            // Acumular totais
            if (result.inputTokens) this.generationMetrics.totalInputTokens += result.inputTokens;
            if (result.outputTokens) this.generationMetrics.totalOutputTokens += result.outputTokens;
            if (result.totalTokens) this.generationMetrics.totalTokens += result.totalTokens;
            this.generationMetrics.totalDuration += sessionDuration;

            // Adicionar o conteúdo gerado ao contexto progressivo para os próximos submódulos
            previousSubModulesContext.push({
              title: subModule.title,
              content: result.content,
            });

            console.log(`✅ Contexto progressivo atualizado: ${previousSubModulesContext.length} submódulo(s) anterior(es) disponível(is) para os próximos`);
          } catch (error) {
            console.error(`Erro ao gerar conteúdo para submódulo ${subModule.id}:`, error);
            subModuleContent[subModule.id] = `# ${subModule.title}\n\nErro ao gerar conteúdo para este submódulo.`;
            
            // Registrar sessão com erro (sem métricas de tokens)
            const sessionDuration = 0;
            this.generationMetrics.sessions.push({
              step: `content-${subModule.id}`,
              subModuleTitle: subModule.title,
              duration: sessionDuration,
              timestamp: new Date().toISOString(),
            });
            this.generationMetrics.totalDuration += sessionDuration;
            
            // Mesmo em caso de erro, adicionar ao contexto para manter a sequência
            previousSubModulesContext.push({
              title: subModule.title,
              content: subModuleContent[subModule.id],
            });
          }
        }
      }

      // Create discipline object
      const disciplineId = createId(structure.code);
      const discipline: Discipline = {
        code: structure.code,
        title: structure.title,
        period: '1º',
        description: structure.description,
        syllabus: structure.modules.flatMap(m => m.subModules.map(sm => sm.title)),
        modules: structure.modules.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          order: m.order,
          subModules: m.subModules.map(sm => ({
            id: sm.id,
            title: sm.title,
            description: sm.description,
            order: sm.order,
            content: subModuleContent[sm.id],
            contentGeneratedAt: subModuleContent[sm.id] ? new Date().toISOString() : undefined,
          })),
        })),
        prerequisites: [],
        progress: 0,
        color: structure.color,
        position: structure.position,
        icon: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="40" fill="none" stroke="${structure.color}" stroke-width="10"/></svg>`,
        subModuleContent: subModuleContent,
      };

      this.generatedDiscipline = discipline;
      this.generatedDisciplineId = disciplineId;

      // Complete
      this.currentStep = GenerationStep.COMPLETED;
      this.hideProgress();
      this.showResult(discipline.title);
      this.showMetricsDashboard();

    } catch (error) {
      console.error('Erro ao gerar disciplina:', error);
      this.currentStep = GenerationStep.ERROR;
      this.hideProgress();
      this.showError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }

  /**
   * Converte arquivo para base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:application/pdf;base64, prefix
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Atualiza descrição do passo de conteúdo
   */
  private updateContentStepDescription(description: string): void {
    if (!this.container) return;
    const descElement = this.container.querySelector('#content-step-description');
    if (descElement) {
      descElement.textContent = description;
    }
  }

  /**
   * Atualiza etapa de progresso
   */
  private updateProgressStep(step: GenerationStep): void {
    if (!this.container) return;

    const steps = this.container.querySelectorAll('.progress-step');
    steps.forEach((stepEl) => {
      const stepData = stepEl.getAttribute('data-step');
      stepEl.classList.remove('active', 'completed');

      if (step === GenerationStep.ANALYZING && stepData === 'analyzing') {
        stepEl.classList.add('active');
      } else if (step === GenerationStep.GENERATING_STRUCTURE && stepData === 'structure') {
        stepEl.classList.add('active');
        this.container?.querySelector('[data-step="analyzing"]')?.classList.add('completed');
      } else if (step === GenerationStep.GENERATING_CONTENT && stepData === 'content') {
        stepEl.classList.add('active');
        this.container?.querySelector('[data-step="structure"]')?.classList.add('completed');
      } else if (step === GenerationStep.COMPLETED) {
        steps.forEach((s) => s.classList.add('completed'));
      }
    });
  }

  /**
   * Mostra seção de progresso
   */
  private showProgress(): void {
    if (!this.container) return;
    const progressSection = this.container.querySelector('#pdf-progress-section');
    if (progressSection) progressSection.setAttribute('style', 'display: block;');
    this.updateProgressStep(GenerationStep.ANALYZING);
  }

  /**
   * Esconde seção de progresso
   */
  private hideProgress(): void {
    if (!this.container) return;
    const progressSection = this.container.querySelector('#pdf-progress-section');
    if (progressSection) progressSection.setAttribute('style', 'display: none;');
  }

  /**
   * Mostra seção de resultado
   */
  private showResult(title: string): void {
    if (!this.container) return;
    const resultSection = this.container.querySelector('#pdf-result-section');
    const subtitle = this.container.querySelector('#pdf-result-subtitle');
    if (resultSection) resultSection.setAttribute('style', 'display: block;');
    if (subtitle) subtitle.textContent = `"${title}" está pronta para ser salva.`;
  }

  /**
   * Esconde seção de resultado
   */
  private hideResult(): void {
    if (!this.container) return;
    const resultSection = this.container.querySelector('#pdf-result-section');
    if (resultSection) resultSection.setAttribute('style', 'display: none;');
  }

  /**
   * Mostra seção de erro
   */
  private showError(message: string): void {
    if (!this.container) return;
    const errorSection = this.container.querySelector('#pdf-error-section');
    const errorMessage = this.container.querySelector('#pdf-error-message');
    if (errorSection) errorSection.setAttribute('style', 'display: block;');
    if (errorMessage) errorMessage.textContent = message;
  }

  /**
   * Esconde seção de erro
   */
  private hideError(): void {
    if (!this.container) return;
    const errorSection = this.container.querySelector('#pdf-error-section');
    if (errorSection) errorSection.setAttribute('style', 'display: none;');
  }

  /**
   * Exibe dashboard de métricas após geração
   */
  private showMetricsDashboard(): void {
    if (!this.container) return;

    // Remover dashboard anterior se existir
    const existingDashboard = this.container.querySelector('#pdf-metrics-dashboard');
    if (existingDashboard) {
      existingDashboard.remove();
    }

    // Criar elemento do dashboard
    const dashboard = document.createElement('div');
    dashboard.id = 'pdf-metrics-dashboard';
    dashboard.className = 'pdf-metrics-dashboard';
    
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

    // Calcular dados para gráficos
    const maxTokens = Math.max(
      ...this.generationMetrics.sessions.map(s => s.totalTokens || 0),
      this.generationMetrics.totalTokens
    );
    const maxDuration = Math.max(
      ...this.generationMetrics.sessions.map(s => s.duration),
      this.generationMetrics.totalDuration
    );

    // Gerar gráfico de tokens por sessão
    const tokensChartHeight = 200;
    const tokensChartWidth = 600;
    const tokensChartBars = this.generationMetrics.sessions.map((session, index) => {
      const height = maxTokens > 0 ? (session.totalTokens || 0) / maxTokens * tokensChartHeight : 0;
      const x = (index * (tokensChartWidth / this.generationMetrics.sessions.length)) + 10;
      const width = (tokensChartWidth / this.generationMetrics.sessions.length) - 20;
      return { x, y: tokensChartHeight - height, width, height, value: session.totalTokens || 0 };
    });

    // Gerar gráfico de tempo por sessão
    const durationChartHeight = 200;
    const durationChartWidth = 600;
    const durationChartBars = this.generationMetrics.sessions.map((session, index) => {
      const height = maxDuration > 0 ? session.duration / maxDuration * durationChartHeight : 0;
      const x = (index * (durationChartWidth / this.generationMetrics.sessions.length)) + 10;
      const width = (durationChartWidth / this.generationMetrics.sessions.length) - 20;
      return { x, y: durationChartHeight - height, width, height, value: session.duration };
    });

    dashboard.innerHTML = `
      <div class="pdf-metrics-header">
        <button class="pdf-metrics-toggle" id="pdf-metrics-toggle" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
          <h3>📊 Métricas de Geração</h3>
        </button>
      </div>
      <div class="pdf-metrics-content" id="pdf-metrics-content" style="display: block;">
        <!-- Resumo Rápido -->
        <div class="pdf-metrics-summary">
          <div class="pdf-metric-card highlight">
            <div class="pdf-metric-icon">📚</div>
            <div class="pdf-metric-info">
              <div class="pdf-metric-label">Módulos</div>
              <div class="pdf-metric-value">${this.generationMetrics.moduleCount}</div>
            </div>
          </div>
          <div class="pdf-metric-card highlight">
            <div class="pdf-metric-icon">📄</div>
            <div class="pdf-metric-info">
              <div class="pdf-metric-label">Submódulos</div>
              <div class="pdf-metric-value">${this.generationMetrics.subModuleCount}</div>
            </div>
          </div>
          <div class="pdf-metric-card highlight">
            <div class="pdf-metric-icon">⏱️</div>
            <div class="pdf-metric-info">
              <div class="pdf-metric-label">Tempo Total</div>
              <div class="pdf-metric-value">${formatDuration(this.generationMetrics.totalDuration)}</div>
            </div>
          </div>
        </div>

        <!-- Seção de Tokens -->
        <div class="pdf-metrics-section">
          <div class="pdf-metrics-section-header">
            <h4>💎 Uso de Tokens</h4>
            <button class="pdf-metrics-section-toggle" data-section="tokens">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          </div>
          <div class="pdf-metrics-section-content" id="pdf-metrics-tokens" data-expanded="true">
            <div class="pdf-metrics-tokens-grid">
              <div class="pdf-metric-card">
                <div class="pdf-metric-label">Input Tokens</div>
                <div class="pdf-metric-value large">${formatNumber(this.generationMetrics.totalInputTokens)}</div>
                <div class="pdf-metric-progress">
                  <div class="pdf-metric-progress-bar" style="width: ${this.generationMetrics.totalTokens > 0 ? (this.generationMetrics.totalInputTokens / this.generationMetrics.totalTokens * 100) : 0}%"></div>
                </div>
              </div>
              <div class="pdf-metric-card">
                <div class="pdf-metric-label">Output Tokens</div>
                <div class="pdf-metric-value large">${formatNumber(this.generationMetrics.totalOutputTokens)}</div>
                <div class="pdf-metric-progress">
                  <div class="pdf-metric-progress-bar output" style="width: ${this.generationMetrics.totalTokens > 0 ? (this.generationMetrics.totalOutputTokens / this.generationMetrics.totalTokens * 100) : 0}%"></div>
                </div>
              </div>
              <div class="pdf-metric-card">
                <div class="pdf-metric-label">Total</div>
                <div class="pdf-metric-value large">${formatNumber(this.generationMetrics.totalTokens)}</div>
              </div>
            </div>
            <div class="pdf-metrics-chart">
              <h5>Tokens por Submódulo</h5>
              <svg class="pdf-chart" viewBox="0 0 ${tokensChartWidth + 40} ${tokensChartHeight + 60}" preserveAspectRatio="xMidYMid meet">
                ${tokensChartBars.map((bar, index) => `
                  <g>
                    <rect x="${bar.x}" y="${bar.y}" width="${bar.width}" height="${bar.height}" 
                          class="pdf-chart-bar" data-value="${bar.value}">
                      <title>${this.generationMetrics.sessions[index].subModuleTitle}: ${formatNumber(bar.value)} tokens</title>
                    </rect>
                    <text x="${bar.x + bar.width / 2}" y="${tokensChartHeight + 20}" 
                          class="pdf-chart-label" text-anchor="middle" transform="rotate(-45 ${bar.x + bar.width / 2} ${tokensChartHeight + 20})">
                      ${index + 1}
                    </text>
                  </g>
                `).join('')}
                <line x1="10" y1="${tokensChartHeight}" x2="${tokensChartWidth + 10}" y2="${tokensChartHeight}" 
                      class="pdf-chart-axis"/>
                <line x1="10" y1="0" x2="10" y2="${tokensChartHeight}" class="pdf-chart-axis"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Seção de Tempo -->
        <div class="pdf-metrics-section">
          <div class="pdf-metrics-section-header">
            <h4>⏱️ Tempo de Processamento</h4>
            <button class="pdf-metrics-section-toggle" data-section="duration">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          </div>
          <div class="pdf-metrics-section-content" id="pdf-metrics-duration" data-expanded="true">
            <div class="pdf-metrics-chart">
              <h5>Tempo por Submódulo</h5>
              <svg class="pdf-chart" viewBox="0 0 ${durationChartWidth + 40} ${durationChartHeight + 60}" preserveAspectRatio="xMidYMid meet">
                ${durationChartBars.map((bar, index) => `
                  <g>
                    <rect x="${bar.x}" y="${bar.y}" width="${bar.width}" height="${bar.height}" 
                          class="pdf-chart-bar duration" data-value="${bar.value}">
                      <title>${this.generationMetrics.sessions[index].subModuleTitle}: ${formatDuration(bar.value)}</title>
                    </rect>
                    <text x="${bar.x + bar.width / 2}" y="${durationChartHeight + 20}" 
                          class="pdf-chart-label" text-anchor="middle" transform="rotate(-45 ${bar.x + bar.width / 2} ${durationChartHeight + 20})">
                      ${index + 1}
                    </text>
                  </g>
                `).join('')}
                <line x1="10" y1="${durationChartHeight}" x2="${durationChartWidth + 10}" y2="${durationChartHeight}" 
                      class="pdf-chart-axis"/>
                <line x1="10" y1="0" x2="10" y2="${durationChartHeight}" class="pdf-chart-axis"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Seção de Detalhes -->
        <div class="pdf-metrics-section">
          <div class="pdf-metrics-section-header">
            <h4>📋 Detalhes por Sessão</h4>
            <button class="pdf-metrics-section-toggle" data-section="details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          </div>
          <div class="pdf-metrics-section-content" id="pdf-metrics-details" data-expanded="true">
            <div class="pdf-metrics-table-wrapper">
              <table class="pdf-metrics-table">
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
                  ${this.generationMetrics.sessions.map((session, index) => `
                    <tr>
                      <td class="pdf-metrics-index">${index + 1}</td>
                      <td class="pdf-metrics-submodule">${session.subModuleTitle}</td>
                      <td>${session.inputTokens ? formatNumber(session.inputTokens) : '<span class="pdf-metrics-na">N/A</span>'}</td>
                      <td>${session.outputTokens ? formatNumber(session.outputTokens) : '<span class="pdf-metrics-na">N/A</span>'}</td>
                      <td><strong>${session.totalTokens ? formatNumber(session.totalTokens) : '<span class="pdf-metrics-na">N/A</span>'}</strong></td>
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
    const resultSection = this.container.querySelector('#pdf-result-section');
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
    const mainToggle = this.container.querySelector('#pdf-metrics-toggle');
    const mainContent = this.container.querySelector('#pdf-metrics-content');
    
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
    const sectionToggles = this.container.querySelectorAll('.pdf-metrics-section-toggle');
    sectionToggles.forEach(toggle => {
      const sectionId = toggle.getAttribute('data-section');
      if (!sectionId) return;
      
      const sectionContent = this.container?.querySelector(`#pdf-metrics-${sectionId}`);
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
   * Manipula salvamento da disciplina
   */
  private async handleSave(): Promise<void> {
    if (!this.generatedDiscipline || !this.generatedDisciplineId || !this.pdfFile) return;

    // Save discipline
    dataService.saveDiscipline(this.generatedDisciplineId, this.generatedDiscipline);

    // Save to history
    const historyItem: AgentHistoryItem = {
      id: createId(`history-${Date.now()}`),
      pdfFileName: this.pdfFile.name,
      pdfFileSize: this.pdfFile.size,
      userPrompt: this.userPrompt || undefined,
      disciplineId: this.generatedDisciplineId,
      disciplineTitle: this.generatedDiscipline.title,
      createdAt: new Date().toISOString(),
    };

    this.addToHistory(historyItem);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('disciplines-updated'));

    // Exportar automaticamente para MD
    try {
      const fileHandle = await syncDisciplineWithFile(this.generatedDisciplineId, this.generatedDiscipline);
      
      if (fileHandle) {
        alert('✅ Disciplina salva e exportada para Markdown!\n\nO arquivo foi salvo e será sincronizado automaticamente quando você editá-lo.');
        this.setupFileSync(fileHandle, this.generatedDisciplineId);
      } else {
        await exportDisciplineToMarkdown(this.generatedDiscipline, this.generatedDisciplineId);
        alert('✅ Disciplina salva e exportada para Markdown!\n\nArquivo baixado. Para sincronização automática, use um navegador compatível (Chrome/Edge).');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      await exportDisciplineToMarkdown(this.generatedDiscipline, this.generatedDisciplineId);
      alert('✅ Disciplina salva e exportada para Markdown!\n\nArquivo baixado.');
    }

    // Reset form
    this.reset();
  }

  /**
   * Manipula exportação para Markdown com sincronização automática
   */
  private async handleExportMarkdown(): Promise<void> {
    if (!this.generatedDiscipline || !this.generatedDisciplineId) return;

    // Primeiro salvar a disciplina
    dataService.saveDiscipline(this.generatedDisciplineId, this.generatedDiscipline);

    try {
      // Tentar usar File System Access API para sincronização automática
      const fileHandle = await syncDisciplineWithFile(this.generatedDisciplineId, this.generatedDiscipline);
      
      if (fileHandle) {
        // Sincronização automática configurada
        alert(`✅ Disciplina salva e exportada para Markdown!\n\nO arquivo foi salvo e será sincronizado automaticamente quando você editá-lo.`);
        
        // Configurar monitoramento do arquivo (polling a cada 2 segundos)
        this.setupFileSync(fileHandle, this.generatedDisciplineId);
      } else {
        // Fallback: download simples
        await exportDisciplineToMarkdown(this.generatedDiscipline, this.generatedDisciplineId);
        alert('✅ Disciplina salva e exportada para Markdown!\n\nArquivo baixado. Para sincronização automática, use um navegador compatível (Chrome/Edge).');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      // Fallback: download simples
      await exportDisciplineToMarkdown(this.generatedDiscipline, this.generatedDisciplineId);
      alert('✅ Disciplina salva e exportada para Markdown!\n\nArquivo baixado.');
    }
  }

  /**
   * Configura sincronização automática do arquivo
   */
  private setupFileSync(fileHandle: FileSystemFileHandle, disciplineId: string): void {
    let lastModified = Date.now();
    let syncInterval: number | null = null;

    const checkFileChanges = async () => {
      try {
        const file = await fileHandle.getFile();
        const fileModified = file.lastModified;

        if (fileModified > lastModified) {
          lastModified = fileModified;
          
          // Ler arquivo e atualizar disciplina
          const { readAndUpdateDisciplineFromFile } = await import('@/services/disciplineExportService');
          const result = await readAndUpdateDisciplineFromFile(fileHandle);
          
          if (result) {
            // Atualizar disciplina
            dataService.saveDiscipline(result.disciplineId, result.discipline);
            window.dispatchEvent(new CustomEvent('disciplines-updated'));
            console.log(`🔄 [PDFToDocsAgent] Disciplina sincronizada automaticamente: ${result.discipline.title}`);
            
            // Atualizar disciplina gerada se for a mesma
            if (result.disciplineId === disciplineId) {
              this.generatedDiscipline = result.discipline;
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar mudanças no arquivo:', error);
        // Parar sincronização se houver erro
        if (syncInterval !== null) {
          clearInterval(syncInterval);
          syncInterval = null;
        }
      }
    };

    // Verificar mudanças a cada 2 segundos
    syncInterval = window.setInterval(checkFileChanges, 2000);

    // Limpar quando o componente for destruído
    const cleanup = () => {
      if (syncInterval !== null) {
        clearInterval(syncInterval);
      }
    };

    // Armazenar cleanup para uso futuro
    (this as any).fileSyncCleanup = cleanup;
  }

  /**
   * Manipula revisão da disciplina
   */
  private handleReview(): void {
    if (!this.generatedDiscipline || !this.generatedDisciplineId) return;

    // Salvar disciplina primeiro se ainda não foi salva
    const existingDiscipline = dataService.getDiscipline(this.generatedDisciplineId);
    if (!existingDiscipline) {
      dataService.saveDiscipline(this.generatedDisciplineId, this.generatedDiscipline);
    }

    // Navegar para o agente de revisão com a disciplina selecionada
    // Usar hash para navegar e passar o ID da disciplina como parâmetro
    window.location.hash = `#agents/content-review?disciplineId=${this.generatedDisciplineId}`;
    
    // Disparar evento customizado para que o AgentsPanel possa abrir o agente automaticamente
    window.dispatchEvent(new CustomEvent('open-review-agent', {
      detail: { disciplineId: this.generatedDisciplineId }
    }));
  }

  /**
   * Manipula preview da disciplina
   */
  private handlePreview(): void {
    if (!this.generatedDisciplineId) return;

    // Navigate to discipline
    const discipline = dataService.getDiscipline(this.generatedDisciplineId);
    if (discipline) {
      // Open discipline in modal
      const modal = (window as any).modalInstance;
      if (modal) {
        const card = document.querySelector(`[data-id="${this.generatedDisciplineId}"]`) as HTMLElement;
        modal.open(this.generatedDisciplineId, discipline, card || document.body);
      } else {
        // Fallback: navigate to explore and open
        window.dispatchEvent(new CustomEvent('navigation-change', {
          detail: { itemId: 'cursos' }
        }));
        setTimeout(() => {
          const card = document.querySelector(`[data-id="${this.generatedDisciplineId}"]`) as HTMLElement;
          if (card) {
            card.click();
          }
        }, 300);
      }
    }
  }

  /**
   * Adiciona item ao histórico
   */
  private addToHistory(item: AgentHistoryItem): void {
    const history = this.getHistory();
    history.pdfToDocs.unshift(item);
    this.saveHistory(history);
    this.loadHistory();
  }

  /**
   * Carrega histórico
   */
  private loadHistory(): void {
    if (!this.container) return;

    const history = this.getHistory();
    const historyList = this.container.querySelector('#pdf-history-list');
    const historyCount = this.container.querySelector('#pdf-history-count');

    if (historyCount) {
      historyCount.textContent = `${history.pdfToDocs.length} ${history.pdfToDocs.length === 1 ? 'item' : 'itens'}`;
    }

    if (historyList) {
      if (history.pdfToDocs.length === 0) {
        historyList.innerHTML = `
          <div class="pdf-history-empty">
            <p>Nenhum histórico ainda</p>
            <span>As disciplinas geradas aparecerão aqui</span>
          </div>
        `;
      } else {
        historyList.innerHTML = history.pdfToDocs.map(item => `
          <div class="pdf-history-item" data-id="${item.id}">
            <div class="history-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="history-item-content">
              <h4>${item.disciplineTitle}</h4>
              <p>${item.pdfFileName}</p>
              <span class="history-item-date">${this.formatDate(item.createdAt)}</span>
            </div>
            <div class="history-item-actions">
              <button class="history-item-view" data-discipline-id="${item.disciplineId}" aria-label="Visualizar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="history-item-delete" data-id="${item.id}" aria-label="Deletar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `).join('');

        // Add event listeners
        historyList.querySelectorAll('.history-item-view').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const disciplineId = (e.currentTarget as HTMLElement).getAttribute('data-discipline-id');
            if (disciplineId) {
              const discipline = dataService.getDiscipline(disciplineId);
              if (discipline) {
                const modal = (window as any).modalInstance;
                if (modal) {
                  const card = document.querySelector(`[data-id="${disciplineId}"]`) as HTMLElement;
                  modal.open(disciplineId, discipline, card || document.body);
                } else {
                  // Fallback: navigate to explore
                  window.dispatchEvent(new CustomEvent('navigation-change', {
                    detail: { itemId: 'cursos' }
                  }));
                  setTimeout(() => {
                    const card = document.querySelector(`[data-id="${disciplineId}"]`) as HTMLElement;
                    if (card) {
                      card.click();
                    }
                  }, 300);
                }
              }
            }
          });
        });

        historyList.querySelectorAll('.history-item-delete').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const itemId = (e.currentTarget as HTMLElement).getAttribute('data-id');
            if (itemId) {
              this.deleteHistoryItem(itemId);
            }
          });
        });
      }
    }
  }

  /**
   * Deleta item do histórico
   */
  private deleteHistoryItem(itemId: string): void {
    const history = this.getHistory();
    history.pdfToDocs = history.pdfToDocs.filter(item => item.id !== itemId);
    this.saveHistory(history);
    this.loadHistory();
  }

  /**
   * Obtém histórico do localStorage
   */
  private getHistory(): { pdfToDocs: AgentHistoryItem[] } {
    try {
      const stored = localStorage.getItem('khroma-agents-history');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          pdfToDocs: Array.isArray(parsed.pdfToDocs) ? parsed.pdfToDocs : []
        };
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
    return { pdfToDocs: [] };
  }

  /**
   * Salva histórico no localStorage
   */
  private saveHistory(history: { pdfToDocs: AgentHistoryItem[] }): void {
    try {
      localStorage.setItem('khroma-agents-history', JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }

  /**
   * Formata data
   */
  private formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Reseta formulário
   */
  private reset(): void {
    this.pdfFile = null;
    this.userPrompt = '';
    this.generatedDiscipline = null;
    this.generatedDisciplineId = null;
    this.currentStep = GenerationStep.IDLE;

    if (this.container) {
      const fileInput = this.container.querySelector('#pdf-file-input') as HTMLInputElement;
      const promptInput = this.container.querySelector('#pdf-user-prompt') as HTMLTextAreaElement;
      if (fileInput) fileInput.value = '';
      if (promptInput) promptInput.value = '';
      this.updateFilePreview();
      this.updateGenerateButton();
      this.hideResult();
      this.hideError();
    }
  }

  /**
   * Retorna o elemento
   */
  getElement(): HTMLElement | null {
    return this.container;
  }

  /**
   * Mostra modal de debug
   */
  private showDebugModal(step: string): void {
    // Encontrar informações de debug para este step
    const debugData = this.debugInfo.filter(d => {
      if (step === 'analyzing') {
        return false; // Analyzing não tem debug ainda
      } else if (step === 'structure') {
        return d.step === 'structure';
      } else if (step === 'content') {
        return d.step.startsWith('content-');
      }
      return false;
    });

    if (debugData.length === 0) {
      alert('Nenhuma informação de debug disponível para este passo ainda.');
      return;
    }

    // Criar modal de debug
    const modal = document.createElement('div');
    modal.className = 'pdf-debug-modal';
    modal.innerHTML = `
      <div class="debug-modal-overlay"></div>
      <div class="debug-modal-content">
        <div class="debug-modal-header">
          <h3>Debug: ${step === 'structure' ? 'Gerando Estrutura' : 'Gerando Conteúdo'}</h3>
          <button class="debug-modal-close" aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="debug-modal-body">
          ${debugData.map((info, index) => `
            <div class="debug-item">
              <div class="debug-item-header">
                <span class="debug-item-title">${step === 'structure' ? 'Estrutura' : `Submódulo ${index + 1}`}</span>
                <span class="debug-item-time">${new Date(info.timestamp).toLocaleTimeString('pt-BR')}</span>
              </div>
              <div class="debug-section">
                <h4>System Instruction:</h4>
                <pre class="debug-code">${this.escapeHtml(info.systemInstruction)}</pre>
              </div>
              <div class="debug-section">
                <h4>Prompt:</h4>
                <pre class="debug-code">${this.escapeHtml(info.prompt)}</pre>
              </div>
              <div class="debug-section">
                <h4>Resposta:</h4>
                <pre class="debug-code">${this.escapeHtml(info.response)}</pre>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const closeBtn = modal.querySelector('.debug-modal-close');
    const overlay = modal.querySelector('.debug-modal-overlay');
    
    const closeModal = () => {
      modal.remove();
    };

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    // ESC para fechar
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
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
   * Destroy
   */
  destroy(): void {
    this.container = null;
    this.debugInfo = [];
  }
}

