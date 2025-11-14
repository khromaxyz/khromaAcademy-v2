import { geminiService } from '@/services/geminiService';
import { dataService } from '@/services/dataService';
import { createId } from '@/utils';
import type { Discipline } from '@/types';
import './AIAssistant.css';

interface GeneratedStructure {
  modules?: Array<{
    id: string;
    title: string;
    description?: string;
    order: number;
    subModules: Array<{
      id: string;
      title: string;
      description?: string;
      order: number;
    }>;
  }>;
  syllabus: string[];
  prerequisites: string[];
  code: string;
  color: string;
  position: { x: number; y: number };
}

/**
 * Componente AIAssistant - Assistente de IA para criação de disciplinas
 */
export class AIAssistant {
  private modal: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;
  private content: HTMLElement | null = null;
  private currentStep: 'form' | 'loading' | 'preview' | 'editing' = 'form';
  private generatedStructure: GeneratedStructure | null = null;
  private generatedContext: string | null = null; // Armazena o contexto gerado
  private formData: {
    nome: string;
    curso: string;
    periodo: string;
    ementa: string;
    contextoAdicional: string;
    pdfFiles: File[];
    modelo: string;
  } = {
    nome: '',
    curso: '',
    periodo: '',
    ementa: '',
    contextoAdicional: '',
    pdfFiles: [],
    modelo: '',
  };

  /**
   * Inicializa o assistente
   */
  init(): void {
    this.modal = document.getElementById('ai-assistant-modal');
    this.backdrop = document.getElementById('ai-assistant-modal-backdrop');
    this.content = document.getElementById('ai-assistant-modal-content');

    // Event listeners
    const closeBtn = document.getElementById('ai-assistant-modal-close');
    closeBtn?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('visible')) {
        this.close();
      }
    });
  }

  /**
   * Abre o modal do assistente
   */
  open(): void {
    if (!this.modal || !this.backdrop || !this.content) return;

    // Verificar se a API key está configurada
    if (!geminiService.isConfigured()) {
      alert('⚠️ A API key do Gemini não está configurada. Configure-a nas configurações do chatbot antes de usar o assistente de IA.');
      return;
    }

    this.currentStep = 'form';
    // Obter modelo atual do serviço
    const currentModel = geminiService.getModel();
    const availableModels = geminiService.getAvailableModels();
    
    this.formData = {
      nome: '',
      curso: '',
      periodo: '',
      ementa: '',
      contextoAdicional: '',
      pdfFiles: [],
      modelo: currentModel || availableModels[0] || '',
    };
    this.generatedStructure = null;

    this.renderForm();
    this.modal.classList.add('visible');
    this.backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Fecha o modal
   */
  close(): void {
    if (this.modal) this.modal.classList.remove('visible');
    if (this.backdrop) this.backdrop.classList.remove('visible');
    document.body.style.overflow = '';
    this.currentStep = 'form';
  }

  /**
   * Renderiza o formulário de coleta de informações
   */
  private renderForm(): void {
    if (!this.content) return;

    this.content.innerHTML = `
      <div class="ai-assistant-form">
        <div class="ai-assistant-step-indicator">
          <div class="step active">1. Informações</div>
          <div class="step">2. Geração</div>
          <div class="step">3. Revisão</div>
        </div>

        <form id="ai-assistant-form">
          <div class="form-group">
            <label for="ai-nome">Nome da Disciplina *</label>
            <input type="text" id="ai-nome" name="nome" required placeholder="Ex: Algoritmos e Estruturas de Dados">
          </div>

          <div class="form-group">
            <label for="ai-curso">Curso</label>
            <input type="text" id="ai-curso" name="curso" placeholder="Ex: Ciência da Computação">
          </div>

          <div class="form-group">
            <label for="ai-periodo">Período *</label>
            <input type="text" id="ai-periodo" name="periodo" required placeholder="Ex: 3º, 4º, 5º ou 1º Semestre">
          </div>

          <div class="form-group">
            <label for="ai-ementa">Ementa/Descrição</label>
            <textarea id="ai-ementa" name="ementa" rows="4" placeholder="Descreva brevemente o conteúdo da disciplina..."></textarea>
          </div>

          <div class="form-group">
            <label for="ai-pdfs">Upload de PDFs (opcional)</label>
            <input type="file" id="ai-pdfs" name="pdfs" accept=".pdf" multiple>
            <small style="color: var(--text-secondary); margin-top: var(--space-xs); display: block;">
              Você pode fazer upload de múltiplos PDFs para fornecer contexto adicional
            </small>
            <div id="ai-pdf-preview" class="pdf-preview"></div>
          </div>

          <div class="form-group">
            <label for="ai-contexto">Contexto Adicional (opcional)</label>
            <textarea id="ai-contexto" name="contexto" rows="3" placeholder="Informações extras, objetivos específicos, pré-requisitos conhecidos..."></textarea>
          </div>

          <div class="form-group">
            <label for="ai-modelo">Modelo de IA *</label>
            <select id="ai-modelo" name="modelo" required>
              ${geminiService.getAvailableModels().map(model => `
                <option value="${model}" ${model === this.formData.modelo ? 'selected' : ''}>
                  ${this.getModelDisplayName(model)}
                </option>
              `).join('')}
            </select>
            <small style="color: var(--text-secondary); margin-top: var(--space-xs); display: block;">
              Escolha o modelo de IA que será usado para gerar a estrutura da disciplina
            </small>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" id="ai-cancel-btn">Cancelar</button>
            <button type="submit" class="btn-primary" id="ai-generate-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <path d="M12 2v20M2 12h20"></path>
                <circle cx="12" cy="12" r="5"></circle>
              </svg>
              Gerar Template com IA
            </button>
          </div>
        </form>
      </div>
    `;

    // Event listeners
    const form = document.getElementById('ai-assistant-form') as HTMLFormElement;
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleGenerate();
    });

    const cancelBtn = document.getElementById('ai-cancel-btn');
    cancelBtn?.addEventListener('click', () => this.close());

    const pdfInput = document.getElementById('ai-pdfs') as HTMLInputElement;
    pdfInput?.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        this.handlePDFUpload(Array.from(files));
      }
    });
  }

  /**
   * Manipula upload de PDFs
   */
  private handlePDFUpload(files: File[]): void {
    this.formData.pdfFiles = files;
    const preview = document.getElementById('ai-pdf-preview');
    if (preview) {
      preview.innerHTML = files.map((file, i) => `
        <div class="pdf-preview-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span>${file.name}</span>
          <button type="button" class="pdf-remove-btn" data-index="${i}">×</button>
        </div>
      `).join('');

      // Event listeners para remover PDFs
      preview.querySelectorAll('.pdf-remove-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
          this.formData.pdfFiles.splice(index, 1);
          this.handlePDFUpload(this.formData.pdfFiles);
        });
      });
    }
  }

  /**
   * Converte PDFs para base64 para envio ao Gemini
   */
  private async convertPDFsToBase64(files: File[]): Promise<Array<{ mimeType: string; data: string }>> {
    const pdfs: Array<{ mimeType: string; data: string }> = [];
    
    for (const file of files) {
      try {
        // Verificar se é PDF
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          console.warn(`⚠️ Arquivo ${file.name} não é um PDF, ignorando...`);
          continue;
        }

        // Converter para base64
        const base64 = await this.convertFileToBase64(file);
        // Remover prefixo data:application/pdf;base64, se houver
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
        
        pdfs.push({
          mimeType: 'application/pdf',
          data: base64Data,
        });
        
        console.log(`✅ PDF ${file.name} convertido para base64 (${Math.round(base64Data.length / 1024)}KB)`);
      } catch (error) {
        console.error(`❌ Erro ao processar PDF ${file.name}:`, error);
      }
    }
    
    return pdfs;
  }

  /**
   * Converte um arquivo para base64
   */
  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Manipula a geração do template
   */
  private async handleGenerate(): void {
    if (!this.content) return;

    // Coletar dados do formulário
    const form = document.getElementById('ai-assistant-form') as HTMLFormElement;
    const formData = new FormData(form);
    
    this.formData.nome = (formData.get('nome') as string) || '';
    this.formData.curso = (formData.get('curso') as string) || '';
    this.formData.periodo = (formData.get('periodo') as string) || '';
    this.formData.ementa = (formData.get('ementa') as string) || '';
    this.formData.contextoAdicional = (formData.get('contexto') as string) || '';
    this.formData.modelo = (formData.get('modelo') as string) || geminiService.getModel();

    // Validar campos obrigatórios
    if (!this.formData.nome || !this.formData.periodo || !this.formData.modelo) {
      alert('Por favor, preencha os campos obrigatórios (Nome, Período e Modelo de IA).');
      return;
    }

    // Configurar modelo selecionado ANTES de gerar
    console.log(`⚙️ Configurando modelo: ${this.formData.modelo}`);
    geminiService.setModel(this.formData.modelo);
    
    // Verificar se o modelo foi aplicado corretamente
    const currentModel = geminiService.getModel();
    if (currentModel !== this.formData.modelo) {
      console.warn(`⚠️ Modelo não foi aplicado corretamente. Esperado: ${this.formData.modelo}, Atual: ${currentModel}`);
    } else {
      console.log(`✅ Modelo configurado com sucesso: ${currentModel}`);
    }

    // Mostrar loading
    this.currentStep = 'loading';
    this.renderLoading();

    try {
      // Converter PDFs para base64
      const pdfFiles = await this.convertPDFsToBase64(this.formData.pdfFiles);
      console.log(`📄 Processando ${pdfFiles.length} PDF(s)...`);

      // Obter disciplinas existentes
      const allDisciplines = dataService.getAllDisciplines();
      const existingDisciplines = Object.entries(allDisciplines).map(([id, disc]) => ({
        id,
        title: disc.title,
        code: disc.code,
        syllabus: disc.syllabus,
      }));

      // Gerar estrutura
      console.log(`🤖 Gerando estrutura com modelo: ${geminiService.getModel()}`);
      this.generatedStructure = await geminiService.generateDisciplineStructure(
        {
          nome: this.formData.nome,
          curso: this.formData.curso,
          periodo: this.formData.periodo,
          ementa: this.formData.ementa,
          contextoAdicional: this.formData.contextoAdicional,
        },
        existingDisciplines,
        pdfFiles
      );

      // Mostrar preview
      this.currentStep = 'preview';
      this.renderPreview();
    } catch (error) {
      console.error('Erro ao gerar estrutura:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Mensagem mais amigável para o usuário
      let userMessage = 'Erro ao gerar estrutura da disciplina.';
      
      if (errorMessage.includes('overloaded') || errorMessage.includes('resource exhausted')) {
        userMessage = `⚠️ O modelo de IA está temporariamente sobrecarregado.\n\n` +
          `O sistema tentou novamente automaticamente, mas o modelo ainda está ocupado.\n\n` +
          `Por favor, tente novamente em alguns instantes.`;
      } else if (errorMessage.includes('API key')) {
        userMessage = `❌ Erro de configuração: ${errorMessage}\n\n` +
          `Verifique se a API key do Gemini está configurada corretamente nas configurações.`;
      } else {
        userMessage = `❌ Erro: ${errorMessage}\n\n` +
          `Se o problema persistir, tente novamente ou entre em contato com o suporte.`;
      }
      
      alert(userMessage);
      this.currentStep = 'form';
      this.renderForm();
    }
  }

  /**
   * Renderiza tela de loading
   */
  private renderLoading(): void {
    if (!this.content) return;

    this.content.innerHTML = `
      <div class="ai-assistant-loading">
        <div class="loading-spinner"></div>
        <h3>Gerando estrutura com IA...</h3>
        <p>Aguarde enquanto analisamos as informações e geramos a estrutura da disciplina.</p>
      </div>
    `;
  }

  /**
   * Renderiza preview da estrutura gerada
   */
  private renderPreview(): void {
    if (!this.content || !this.generatedStructure) return;

    const allDisciplines = dataService.getAllDisciplines();
    const prerequisitesNames = this.generatedStructure.prerequisites
      .map(id => {
        const disc = allDisciplines[id];
        return disc ? disc.title : id;
      })
      .join(', ') || 'Nenhum';

    this.content.innerHTML = `
      <div class="ai-assistant-preview">
        <div class="ai-assistant-step-indicator">
          <div class="step completed">1. Informações</div>
          <div class="step completed">2. Geração</div>
          <div class="step active">3. Revisão</div>
        </div>

        <div class="preview-header">
          <h3>Estrutura Gerada</h3>
          <p>Revise a estrutura gerada pela IA e escolha uma ação:</p>
        </div>

        <div class="preview-content">
          <div class="preview-section">
            <h4>Informações Básicas</h4>
            <div class="preview-item">
              <strong>Nome:</strong> ${this.escapeHtml(this.formData.nome)}
            </div>
            <div class="preview-item">
              <strong>Período:</strong> ${this.escapeHtml(this.formData.periodo)}
            </div>
            <div class="preview-item">
              <strong>Código:</strong> ${this.escapeHtml(this.generatedStructure.code)}
            </div>
            <div class="preview-item">
              <strong>Modelo usado:</strong> ${this.getModelDisplayName(this.formData.modelo)}
            </div>
            <div class="preview-item">
              <strong>Cor:</strong> 
              <span class="color-preview" style="background-color: ${this.generatedStructure.color};"></span>
              ${this.generatedStructure.color}
            </div>
          </div>

          ${this.generatedStructure.modules && this.generatedStructure.modules.length > 0 ? `
          <div class="preview-section">
            <h4>Módulos e Submódulos (${this.generatedStructure.modules.length} módulos)</h4>
            <div class="preview-modules">
              ${this.generatedStructure.modules
                .sort((a, b) => a.order - b.order)
                .map(module => `
                <div class="preview-module">
                  <div class="preview-module-header">
                    <strong>${this.escapeHtml(module.title)}</strong>
                    ${module.description ? `<small>${this.escapeHtml(module.description)}</small>` : ''}
                  </div>
                  ${module.subModules && module.subModules.length > 0 ? `
                  <ul class="preview-submodules">
                    ${module.subModules
                      .sort((a, b) => a.order - b.order)
                      .map(subModule => `
                      <li>${this.escapeHtml(subModule.title)}</li>
                    `).join('')}
                  </ul>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          <div class="preview-section">
            <h4>Syllabus (${this.generatedStructure.syllabus.length} tópicos)</h4>
            <ol class="syllabus-preview">
              ${this.generatedStructure.syllabus.map(topic => `
                <li>${this.escapeHtml(topic)}</li>
              `).join('')}
            </ol>
          </div>

          <div class="preview-section">
            <h4>Pré-requisitos Sugeridos</h4>
            <p>${prerequisitesNames}</p>
          </div>

          <div class="preview-section">
            <h4>Posição no Grafo</h4>
            <p>X: ${this.generatedStructure.position.x}%, Y: ${this.generatedStructure.position.y}%</p>
          </div>
        </div>

        <div class="preview-actions">
          <button type="button" class="btn-secondary" id="ai-reject-btn">Rejeitar</button>
          <button type="button" class="btn-secondary" id="ai-edit-btn">Editar Manualmente</button>
          <button type="button" class="btn-secondary" id="ai-modify-btn">Solicitar Alteração</button>
          <button type="button" class="btn-secondary" id="ai-generate-context-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Gerar Contexto Completo
          </button>
          <button type="button" class="btn-primary" id="ai-accept-btn">Aceitar e Salvar</button>
        </div>

        <div id="ai-modify-panel" class="modify-panel" style="display: none;">
          <h4>Solicitar Alteração</h4>
          <textarea id="ai-modify-instruction" rows="3" placeholder="Ex: Adicione mais 2 módulos sobre programação, Remova o módulo de introdução, Reorganize os tópicos em ordem cronológica..."></textarea>
          <div class="modify-actions">
            <button type="button" class="btn-secondary" id="ai-modify-cancel">Cancelar</button>
            <button type="button" class="btn-primary" id="ai-modify-submit">Aplicar Alteração</button>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('ai-reject-btn')?.addEventListener('click', () => {
      this.currentStep = 'form';
      this.renderForm();
    });

    document.getElementById('ai-edit-btn')?.addEventListener('click', () => {
      this.openManualEdit();
    });

    document.getElementById('ai-modify-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('ai-modify-panel');
      if (panel) panel.style.display = 'block';
    });

    document.getElementById('ai-modify-cancel')?.addEventListener('click', () => {
      const panel = document.getElementById('ai-modify-panel');
      if (panel) panel.style.display = 'none';
    });

    document.getElementById('ai-modify-submit')?.addEventListener('click', () => {
      this.handleModifyRequest();
    });

    document.getElementById('ai-accept-btn')?.addEventListener('click', () => {
      this.acceptAndSave();
    });

    document.getElementById('ai-generate-context-btn')?.addEventListener('click', () => {
      this.handleGenerateContext();
    });
  }

  /**
   * Abre o formulário manual para edição
   */
  private openManualEdit(): void {
    // Fechar modal do assistente
    this.close();

    // Abrir formulário manual do AdminPanel
    const adminPanel = (window as any).adminPanelInstance;
    if (adminPanel) {
      // Abrir formulário (editingId deve ser null para nova disciplina)
      adminPanel.editingId = null;
      adminPanel.openForm();

      // Preencher formulário manualmente após um delay para garantir que o DOM esteja pronto
      setTimeout(() => {
        const idInput = document.getElementById('discipline-id') as HTMLInputElement;
        const titleInput = document.getElementById('discipline-title') as HTMLInputElement;
        const periodInput = document.getElementById('discipline-period') as HTMLInputElement;
        const descriptionInput = document.getElementById('discipline-description') as HTMLTextAreaElement;
        const colorInput = document.getElementById('discipline-color') as HTMLInputElement;
        const positionXInput = document.getElementById('discipline-position-x') as HTMLInputElement;
        const positionYInput = document.getElementById('discipline-position-y') as HTMLInputElement;

        if (idInput) idInput.value = createId(this.formData.nome);
        if (titleInput) titleInput.value = this.formData.nome;
        if (periodInput) periodInput.value = this.formData.periodo;
        if (descriptionInput) descriptionInput.value = this.formData.ementa;
        if (colorInput && this.generatedStructure) {
          colorInput.value = this.generatedStructure.color;
          // Atualizar color picker
          if (adminPanel.initColorPicker) {
            adminPanel.initColorPicker();
          }
        }
        if (positionXInput && this.generatedStructure) positionXInput.value = String(this.generatedStructure.position.x);
        if (positionYInput && this.generatedStructure) positionYInput.value = String(this.generatedStructure.position.y);

        // Carregar módulos gerados pela IA
        if (this.generatedStructure && this.generatedStructure.modules && this.generatedStructure.modules.length > 0) {
          if (adminPanel.loadGeneratedModules) {
            adminPanel.loadGeneratedModules(this.generatedStructure.modules);
          }
        }

        // Adicionar syllabus
        if (this.generatedStructure && adminPanel.addSyllabusInput) {
          const syllabusContainer = document.getElementById('syllabus-inputs');
          if (syllabusContainer) {
            syllabusContainer.innerHTML = '';
            this.generatedStructure.syllabus.forEach((topic) => {
              adminPanel.addSyllabusInput(topic);
            });
          }
        }

        // Atualizar pré-requisitos
        if (this.generatedStructure && adminPanel.updatePrerequisitesSelect) {
          setTimeout(() => {
            adminPanel.updatePrerequisitesSelect();
            // Selecionar pré-requisitos
            const hiddenInput = document.getElementById('discipline-prerequisites') as HTMLInputElement;
            if (hiddenInput) {
              hiddenInput.value = JSON.stringify(this.generatedStructure!.prerequisites);
            }
          }, 200);
        }
      }, 300);
    } else {
      console.error('AdminPanel instance not found');
    }
  }

  /**
   * Manipula solicitação de modificação
   */
  private async handleModifyRequest(): void {
    const instructionInput = document.getElementById('ai-modify-instruction') as HTMLTextAreaElement;
    const instruction = instructionInput?.value.trim();

    if (!instruction) {
      alert('Por favor, descreva as alterações desejadas.');
      return;
    }

    if (!this.generatedStructure) return;

    // Mostrar loading
    this.currentStep = 'loading';
    this.renderLoading();

    try {
      // Garantir que o modelo está configurado
      console.log(`⚙️ Usando modelo para modificação: ${this.formData.modelo}`);
      geminiService.setModel(this.formData.modelo);

      // Carregar system instruction
      let systemInstruction = await this.loadSystemInstruction();
      if (!systemInstruction) {
        systemInstruction = `Você é um assistente especializado em criar estruturas de disciplinas acadêmicas.`;
      }

      // Carregar template de prompt de modificação
      let promptTemplate = await this.loadModificationPromptTemplate();
      
      // Se não conseguir carregar, usar padrão
      if (!promptTemplate) {
        promptTemplate = `Modifique a seguinte estrutura de disciplina com base na instrução do usuário:

Estrutura atual:
{{ESTRUTURA_ATUAL}}

Instrução do usuário: {{INSTRUCAO_USUARIO}}

Gere uma nova estrutura seguindo a instrução. Mantenha o formato JSON e retorne apenas o JSON, sem markdown.`;
      }

      // Substituir placeholders no template
      const modifiedPrompt = promptTemplate
        .replace(/\{\{ESTRUTURA_ATUAL\}\}/g, JSON.stringify(this.generatedStructure, null, 2))
        .replace(/\{\{INSTRUCAO_USUARIO\}\}/g, instruction);

      const response = await geminiService.sendMessage(
        modifiedPrompt,
        undefined,
        [],
        systemInstruction
      );
      
      // Tentar extrair JSON
      let jsonStr = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      const availableColors = ['#41FF41', '#4141FF', '#FF41FF', '#41FFFF', '#F2FF41', '#FF4141'];

      // Processar módulos se existirem
      let modules: Array<{
        id: string;
        title: string;
        description?: string;
        order: number;
        subModules: Array<{
          id: string;
          title: string;
          description?: string;
          order: number;
        }>;
      }> | undefined = undefined;

      if (Array.isArray(parsed.modules) && parsed.modules.length > 0) {
        modules = parsed.modules
          .filter((m: any) => m && typeof m === 'object' && typeof m.title === 'string' && m.title.trim())
          .map((m: any, index: number) => ({
            id: typeof m.id === 'string' && m.id.trim() ? m.id : `module-${Date.now()}-${index}`,
            title: m.title.trim(),
            description: typeof m.description === 'string' ? m.description.trim() : undefined,
            order: typeof m.order === 'number' ? m.order : index,
            subModules: Array.isArray(m.subModules)
              ? m.subModules
                  .filter((sm: any) => sm && typeof sm === 'object' && typeof sm.title === 'string' && sm.title.trim())
                  .map((sm: any, smIndex: number) => ({
                    id: typeof sm.id === 'string' && sm.id.trim() ? sm.id : `submodule-${Date.now()}-${index}-${smIndex}`,
                    title: sm.title.trim(),
                    description: typeof sm.description === 'string' ? sm.description.trim() : undefined,
                    order: typeof sm.order === 'number' ? sm.order : smIndex,
                  }))
              : [],
          }))
          .filter((m: any) => m.subModules.length > 0);

        if (modules.length === 0) {
          modules = undefined;
        }
      }

      // Atualizar estrutura
      this.generatedStructure = {
        modules,
        syllabus: Array.isArray(parsed.syllabus) ? parsed.syllabus.filter((t: any) => typeof t === 'string' && t.trim()) : this.generatedStructure.syllabus,
        prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites.filter((p: any) => typeof p === 'string') : this.generatedStructure.prerequisites,
        code: typeof parsed.code === 'string' ? parsed.code.toUpperCase().trim() : this.generatedStructure.code,
        color: typeof parsed.color === 'string' && availableColors.includes(parsed.color.toUpperCase()) 
          ? parsed.color.toUpperCase() 
          : this.generatedStructure.color,
        position: {
          x: typeof parsed.position?.x === 'number' ? Math.max(0, Math.min(100, parsed.position.x)) : this.generatedStructure.position.x,
          y: typeof parsed.position?.y === 'number' ? Math.max(0, Math.min(100, parsed.position.y)) : this.generatedStructure.position.y,
        },
      };

      // Mostrar preview atualizado
      this.currentStep = 'preview';
      this.renderPreview();

      // Ocultar painel de modificação
      const panel = document.getElementById('ai-modify-panel');
      if (panel) panel.style.display = 'none';
      if (instructionInput) instructionInput.value = '';
    } catch (error) {
      console.error('Erro ao modificar estrutura:', error);
      alert(`Erro ao modificar estrutura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      this.currentStep = 'preview';
      this.renderPreview();
    }
  }

  /**
   * Manipula a geração de contexto completo
   */
  private async handleGenerateContext(): void {
    if (!this.generatedStructure) {
      alert('Erro: Estrutura não encontrada. Gere a estrutura primeiro.');
      return;
    }

    // Confirmar ação
    if (!confirm('Isso pode levar alguns minutos. Deseja continuar com a geração do contexto completo?')) {
      return;
    }

    // Mostrar loading
    this.currentStep = 'loading';
    this.renderLoadingWithMessage('Gerando contexto completo com IA...\nIsso pode levar alguns minutos.');

    try {
      // Converter PDFs para base64
      const pdfFiles = await this.convertPDFsToBase64(this.formData.pdfFiles);
      console.log(`📄 Processando ${pdfFiles.length} PDF(s) para contexto...`);

      // Obter disciplinas existentes
      const allDisciplines = dataService.getAllDisciplines();
      const existingDisciplines = Object.entries(allDisciplines).map(([id, disc]) => ({
        id,
        title: disc.title,
        code: disc.code,
        syllabus: disc.syllabus,
      }));

      // Garantir que o modelo está configurado
      geminiService.setModel(this.formData.modelo);

      // Gerar contexto completo
      console.log(`📝 Gerando contexto completo com modelo: ${this.formData.modelo}`);
      const context = await geminiService.generateDisciplineContext(
        {
          nome: this.formData.nome,
          curso: this.formData.curso,
          periodo: this.formData.periodo,
          ementa: this.formData.ementa,
          contextoAdicional: this.formData.contextoAdicional,
        },
        {
          syllabus: this.generatedStructure.syllabus,
          prerequisites: this.generatedStructure.prerequisites,
          code: this.generatedStructure.code,
        },
        existingDisciplines,
        pdfFiles
      );

      // Salvar contexto gerado
      this.generatedContext = context;

      // Fazer download do arquivo
      this.downloadContextFile(context);

      // Mostrar sucesso e voltar ao preview
      alert(`✅ Contexto completo gerado com sucesso!\n\nO arquivo foi baixado automaticamente.\n\nTamanho: ${Math.round(context.length / 1024)}KB\n\nO contexto foi salvo junto com a disciplina.`);
      
      // Voltar ao preview
      this.currentStep = 'preview';
      this.renderPreview();
    } catch (error) {
      console.error('Erro ao gerar contexto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Mensagem mais amigável para o usuário
      let userMessage = 'Erro ao gerar contexto completo da disciplina.';
      
      if (errorMessage.includes('overloaded') || errorMessage.includes('resource exhausted')) {
        userMessage = `⚠️ O modelo de IA está temporariamente sobrecarregado.\n\n` +
          `O sistema tentou novamente automaticamente, mas o modelo ainda está ocupado.\n\n` +
          `Por favor, tente novamente em alguns instantes.`;
      } else if (errorMessage.includes('API key')) {
        userMessage = `❌ Erro de configuração: ${errorMessage}\n\n` +
          `Verifique se a API key do Gemini está configurada corretamente nas configurações.`;
      } else {
        userMessage = `❌ Erro: ${errorMessage}\n\n` +
          `Se o problema persistir, tente novamente ou entre em contato com o suporte.`;
      }
      
      alert(userMessage);
      this.currentStep = 'preview';
      this.renderPreview();
    }
  }

  /**
   * Faz download do arquivo de contexto
   */
  private downloadContextFile(context: string): void {
    try {
      // Criar nome do arquivo
      const fileName = `contexto-${this.formData.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}.md`;
      
      // Criar blob
      const blob = new Blob([context], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Criar link de download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Arquivo de contexto baixado: ${fileName}`);
    } catch (error) {
      console.error('Erro ao fazer download do arquivo:', error);
      throw error;
    }
  }

  /**
   * Renderiza loading com mensagem customizada
   */
  private renderLoadingWithMessage(message: string): void {
    if (!this.content) return;

    const lines = message.split('\n');
    this.content.innerHTML = `
      <div class="ai-assistant-loading">
        <div class="loading-spinner"></div>
        <h3>${this.escapeHtml(lines[0])}</h3>
        ${lines.slice(1).map(line => `<p>${this.escapeHtml(line)}</p>`).join('')}
      </div>
    `;
  }

  /**
   * Aceita e salva a disciplina
   */
  private acceptAndSave(): void {
    if (!this.generatedStructure) return;

    const id = createId(this.formData.nome);
    
    const discipline: Discipline = {
      code: this.generatedStructure.code,
      title: this.formData.nome,
      period: this.formData.periodo,
      description: this.formData.ementa || `Disciplina ${this.formData.nome}`,
      color: this.generatedStructure.color,
      progress: 0,
      position: this.generatedStructure.position,
      prerequisites: this.generatedStructure.prerequisites,
      syllabus: this.generatedStructure.syllabus,
      modules: this.generatedStructure.modules ? this.generatedStructure.modules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        order: m.order,
        subModules: m.subModules.map(sm => ({
          id: sm.id,
          title: sm.title,
          description: sm.description,
          order: sm.order
        }))
      })) : undefined,
      icon: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="40" fill="none" stroke="${this.generatedStructure.color}" stroke-width="10"/></svg>`,
      // Salvar contexto se foi gerado
      context: this.generatedContext || undefined,
      contextGeneratedAt: this.generatedContext ? new Date().toISOString() : undefined,
    };

    // Salvar disciplina
    dataService.saveDiscipline(id, discipline);
    console.log(`✅ [AIAssistant] Disciplina salva: ${discipline.title} (ID: ${id})`);
    
    // Fechar modal
    this.close();

    // Atualizar lista no AdminPanel
    const adminPanel = (window as any).adminPanelInstance;
    if (adminPanel && adminPanel.refreshDisciplinesList) {
      adminPanel.refreshDisciplinesList();
    }

    // Disparar evento
    window.dispatchEvent(new CustomEvent('disciplines-updated'));
    
    // Forçar recarregamento da UI principal
    const renderAll = (window as any).renderAll;
    if (renderAll && typeof renderAll === 'function') {
      renderAll();
    }

    alert(`✅ Disciplina "${discipline.title}" criada com sucesso!`);
  }

  /**
   * Carrega a system instruction do arquivo MD
   */
  private async loadSystemInstruction(): Promise<string | null> {
    try {
      const response = await fetch('/system-instructions/gemini-system-instruction-discipline-creator.md');
      if (!response.ok) {
        console.warn('⚠️ Não foi possível carregar system instruction, usando padrão');
        return null;
      }
      return await response.text();
    } catch (error) {
      console.warn('⚠️ Erro ao carregar system instruction:', error);
      return null;
    }
  }

  /**
   * Carrega o template de prompt de modificação do arquivo principal
   */
  private async loadModificationPromptTemplate(): Promise<string | null> {
    try {
      // Carregar o arquivo principal que contém tudo
      const response = await fetch('/system-instructions/gemini-system-instruction-discipline-creator.md');
      if (!response.ok) {
        console.warn('⚠️ Não foi possível carregar arquivo principal, usando padrão');
        return null;
      }
      const content = await response.text();
      
      // Procurar pelo segundo separador "---" que indica o início do prompt de modificação
      const firstSeparator = content.indexOf('---');
      if (firstSeparator === -1) {
        return null;
      }
      
      const afterFirst = content.substring(firstSeparator + 3);
      const secondSeparator = afterFirst.indexOf('---');
      
      if (secondSeparator === -1) {
        // Não há prompt de modificação
        return null;
      }
      
      // Extrair o prompt de modificação (entre o segundo e terceiro "---")
      const afterSecond = afterFirst.substring(secondSeparator + 3);
      const thirdSeparator = afterSecond.indexOf('---');
      
      let modificationTemplate: string;
      if (thirdSeparator === -1) {
        // Não há terceiro separador, então tudo após o segundo é modificação
        modificationTemplate = afterSecond.trim();
      } else {
        // Há terceiro separador, então modificação está entre segundo e terceiro
        modificationTemplate = afterSecond.substring(0, thirdSeparator).trim();
      }
      
      // Remover o título "## Prompt para Modificação" se existir
      modificationTemplate = modificationTemplate.replace(/^##\s*Prompt\s+para\s+Modificação\s*\n*/i, '').trim();
      
      return modificationTemplate || null;
    } catch (error) {
      console.warn('⚠️ Erro ao carregar template de prompt de modificação:', error);
      return null;
    }
  }

  /**
   * Obtém o nome de exibição do modelo
   */
  private getModelDisplayName(model: string): string {
    const modelNames: Record<string, string> = {
      'gemini-2.5-pro': 'Gemini 2.5 Pro (Mais Poderoso)',
      'gemini-flash-lite-latest': 'Gemini Flash Lite Latest (Rápido)',
      'gemini-flash-lite': 'Gemini Flash Lite (Mais Rápido)',
    };
    return modelNames[model] || model;
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Singleton instance
export const aiAssistant = new AIAssistant();

