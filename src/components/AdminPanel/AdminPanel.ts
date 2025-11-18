import { dataService } from '@/services';
import { geminiService } from '@/services/geminiService';
import { exportDisciplineToMarkdown, importDisciplineFromMarkdown, syncDisciplineWithFile } from '@/services/disciplineExportService';
import { createId } from '@/utils';
import type { Discipline } from '@/types';
import { aiAssistant } from './AIAssistant';
import './AdminPanel.css';

/**
 * Componente AdminPanel
 */
export class AdminPanel {
  private panel: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private modalBackdrop: HTMLElement | null = null;
  private formElement: HTMLFormElement | null = null;
  public editingId: string | null = null;
  private readonly allowedColors = ['#41FF41', '#4141FF', '#FF41FF', '#41FFFF', '#F2FF41', '#FF4141'];
  private colorPickerInitialized = false;
  private modules: Array<{ id: string; title: string; description: string; order: number; subModules: Array<{ id: string; title: string; description: string; order: number }> }> = [];

  /**
   * Carrega módulos gerados pela IA (método público para AIAssistant)
   */
  public loadGeneratedModules(modules: Array<{
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
  }>): void {
    if (!modules || modules.length === 0) {
      this.modules = [];
      this.renderModules();
      return;
    }

    this.modules = modules.map(module => ({
      id: module.id,
      title: module.title,
      description: module.description || '',
      order: module.order,
      subModules: module.subModules.map(subModule => ({
        id: subModule.id,
        title: subModule.title,
        description: subModule.description || '',
        order: subModule.order
      }))
    }));

    this.renderModules();
  }

  /**
   * Inicializa o painel administrativo
   */
  init(): void {
    console.log('🔧 [AdminPanel] Inicializando...');
    this.panel = document.getElementById('admin-panel');
    this.modal = document.getElementById('discipline-modal');
    this.modalBackdrop = document.getElementById('discipline-modal-backdrop');
    this.formElement = document.getElementById('discipline-form-element') as HTMLFormElement;

    if (!this.panel) {
      console.error('❌ [AdminPanel] Elemento #admin-panel não encontrado!');
      return;
    }

    console.log('✅ [AdminPanel] Elementos encontrados:', {
      panel: !!this.panel,
      modal: !!this.modal,
      modalBackdrop: !!this.modalBackdrop,
      formElement: !!this.formElement
    });

    // Configurar event delegation (igual aos toggles)
    this.setupEventDelegation();
    
    // Inicializar assistente de IA
    aiAssistant.init();
    
    // Expor instância para acesso externo
    (window as any).adminPanelInstance = this;
    
    console.log('✅ [AdminPanel] Inicialização completa');
    
    // Atualizar lista apenas se o painel já estiver visível
    if (this.panel?.classList.contains('visible')) {
      this.refreshDisciplinesList();
    }
  }

  /**
   * Abre o painel administrativo
   */
  open(): void {
    console.log('🚀 [AdminPanel] Abrindo painel...');
    
    // Garantir que os elementos estejam disponíveis
    if (!this.panel) {
      this.panel = document.getElementById('admin-panel');
    }
    if (!this.modal) {
      this.modal = document.getElementById('discipline-modal');
    }
    if (!this.modalBackdrop) {
      this.modalBackdrop = document.getElementById('discipline-modal-backdrop');
    }
    if (!this.formElement) {
      this.formElement = document.getElementById('discipline-form-element') as HTMLFormElement;
    }
    
    if (!this.panel) {
      console.error('❌ [AdminPanel] Painel não encontrado!');
      return;
    }
    
    // Adicionar classe visible
    this.panel.classList.add('visible');
    console.log('✅ [AdminPanel] Classe visible adicionada');
    
    // Atualizar lista de disciplinas quando o painel abrir
    // Usar requestAnimationFrame para garantir que o DOM esteja pronto
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.refreshDisciplinesList();
        console.log('✅ [AdminPanel] Painel aberto - lista atualizada');
      }, 50);
    });
  }

  /**
   * Configura event delegation para todos os botões do admin panel
   * MÉTODO ROBUSTO - FUNCIONA SEMPRE
   */
  private setupEventDelegation(): void {
    // Usar event delegation no document para capturar TODOS os cliques
    // IMPORTANTE: Usar uma função nomeada para poder remover depois se necessário
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Verificar se o clique foi no modal ou no admin panel
      const clickedInModal = target.closest('#discipline-modal') || target.closest('#discipline-modal-backdrop');
      const clickedInAdminPanel = target.closest('#admin-panel');
      
      // Se clicou no modal, processar eventos do modal
      if (clickedInModal) {
        // Processar eventos do modal (já tratados abaixo)
      } else if (!clickedInAdminPanel) {
        return; // Clique fora do painel e do modal, ignorar
      }
      
      // Verificar se painel está visível (para eventos do painel)
      const adminPanel = document.getElementById('admin-panel');
      if (clickedInAdminPanel && (!adminPanel || !adminPanel.classList.contains('visible'))) {
        return; // Painel não está aberto, ignorar
      }
      
      console.log('🖱️ [AdminPanel] Clique detectado:', target.id, target.className);
      
      // Fechar painel
      if (target.id === 'admin-close-btn' || target.closest('#admin-close-btn')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Fechando painel');
        this.panel?.classList.remove('visible');
        this.closeForm();
        return;
      }
      
      // Nova Disciplina
      if (target.id === 'btn-add-discipline' || target.closest('#btn-add-discipline')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Nova Disciplina" clicado');
        this.editingId = null;
        this.openForm();
        return;
      }

      // Criar com IA
      if (target.id === 'btn-create-with-ai' || target.closest('#btn-create-with-ai')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Criar com IA" clicado');
        aiAssistant.open();
        return;
      }
      
      // Exportar JSON
      if (target.id === 'btn-export-json' || target.closest('#btn-export-json')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Exportar JSON" clicado');
        this.handleExportJSON();
        return;
      }
      
      // Importar JSON
      if (target.id === 'btn-import-json' || target.closest('#btn-import-json')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Importar JSON" clicado');
        this.handleImportJSON();
        return;
      }

      // Exportar MD (todas as disciplinas)
      if (target.id === 'btn-export-md' || target.closest('#btn-export-md')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Exportar MD" clicado');
        this.handleExportAllMarkdown();
        return;
      }

      // Importar MD
      if (target.id === 'btn-import-md' || target.closest('#btn-import-md')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Importar MD" clicado');
        this.handleImportMarkdown();
        return;
      }

      // Exportar MD de disciplina específica
      if (target.hasAttribute('data-export-md-id')) {
        e.preventDefault();
        e.stopPropagation();
        const disciplineId = target.getAttribute('data-export-md-id');
        if (disciplineId) {
          this.handleExportDisciplineMarkdown(disciplineId);
        }
        return;
      }

      // Cancelar formulário / Fechar modal
      if (target.id === 'btn-cancel-form' || target.closest('#btn-cancel-form') ||
          target.id === 'discipline-modal-close' || target.closest('#discipline-modal-close')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Cancelar/Fechar" clicado');
        this.closeForm();
        return;
      }
      
      // Fechar modal ao clicar no backdrop
      if (target.id === 'discipline-modal-backdrop') {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Backdrop clicado');
        this.closeForm();
        return;
      }
      
      // Adicionar item ao syllabus
      const addSyllabusBtn = target.closest('#btn-add-syllabus') || (target.id === 'btn-add-syllabus' ? target : null);
      if (addSyllabusBtn) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Adicionar Syllabus" clicado');
        this.addSyllabusInput();
        return;
      }
      
      // Remover item do syllabus
      const removeSyllabusBtn = target.closest('.btn-remove-syllabus') || target.closest('.btn-remove');
      if (removeSyllabusBtn && removeSyllabusBtn.closest('.syllabus-item')) {
        e.preventDefault();
        e.stopPropagation();
        const syllabusItem = removeSyllabusBtn.closest('.syllabus-item');
        const container = document.getElementById('syllabus-inputs');
        if (syllabusItem && container) {
          syllabusItem.remove();
          console.log('✅ [AdminPanel] Item do syllabus removido');
          
          // Garantir que sempre haja pelo menos um campo vazio
          const remainingItems = container.querySelectorAll('.syllabus-item');
          if (remainingItems.length === 0) {
            this.addSyllabusInput();
          }
        }
        return;
      }
      
      // Botões de editar/excluir na lista
      const editBtn = target.closest('[data-edit-id]');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = editBtn.getAttribute('data-edit-id');
        console.log('✅ [AdminPanel] Botão "Editar" clicado para disciplina:', id);
        if (id) {
          this.editDiscipline(id);
        }
        return;
      }
      
      const deleteBtn = target.closest('[data-delete-id]');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = deleteBtn.getAttribute('data-delete-id');
        console.log('✅ [AdminPanel] Botão "Excluir" clicado para disciplina:', id);
        if (id) {
          this.deleteDiscipline(id);
        }
        return;
      }

      // Ver/Baixar contexto (da lista)
      const viewContextBtn = target.closest('[data-view-context-id]');
      if (viewContextBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = viewContextBtn.getAttribute('data-view-context-id');
        console.log('✅ [AdminPanel] Botão "Ver Contexto" clicado para disciplina:', id);
        if (id) {
          this.handleViewContext(id);
        }
        return;
      }

      // Ver contexto (do formulário)
      if (target.id === 'btn-view-context' || target.closest('#btn-view-context')) {
        e.preventDefault();
        e.stopPropagation();
        const btn = target.closest('#btn-view-context') || target;
        const disciplineId = (btn as HTMLElement).getAttribute('data-discipline-id') || this.editingId;
        if (disciplineId) {
          console.log('✅ [AdminPanel] Botão "Ver Contexto" clicado no formulário');
          this.handleViewContext(disciplineId);
        }
        return;
      }

      // Gerar conteúdo completo (do formulário)
      if (target.id === 'btn-generate-content' || target.closest('#btn-generate-content')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Gerar Conteúdo Completo" clicado');
        this.handleGenerateContent();
        return;
      }
    };
    
    document.addEventListener('click', handleClick, { capture: true });
    
    // Listener para submit do formulário
    if (this.formElement) {
      this.formElement.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('✅ [AdminPanel] Formulário submetido');
        this.saveDiscipline();
      });
    } else {
      console.warn('⚠️ [AdminPanel] formElement não encontrado, listener de submit não será adicionado');
    }
    
    // Listener para fechar modal com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('visible')) {
        this.closeForm();
      }
    });
    
    console.log('✅ [AdminPanel] Event delegation configurado');
  }

  /**
   * Handler para exportar JSON
   */
  private handleExportJSON(): void {
    try {
      const dataStr = dataService.exportAsJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'disciplinas.json';
      a.click();
      URL.revokeObjectURL(url);
      console.log('✅ [AdminPanel] JSON exportado com sucesso');
    } catch (error) {
      console.error('❌ [AdminPanel] Erro ao exportar JSON:', error);
      alert(`Erro ao exportar JSON: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Handler para importar JSON
   */
  private handleImportJSON(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string;
            dataService.importFromJSON(json);
            this.refreshDisciplinesList();
            alert('Disciplinas importadas com sucesso!');
            console.log('✅ [AdminPanel] JSON importado com sucesso');
            // Disparar evento para atualizar UI
            window.dispatchEvent(new CustomEvent('disciplines-updated'));
          } catch (error) {
            console.error('❌ [AdminPanel] Erro ao importar JSON:', error);
            alert(`Erro ao importar JSON: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    console.log('✅ [AdminPanel] Botão "Importar JSON" clicado');
  }

  /**
   * Handler para exportar disciplina específica como Markdown
   */
  private async handleExportDisciplineMarkdown(disciplineId: string): Promise<void> {
    try {
      const discipline = dataService.getDiscipline(disciplineId);
      if (!discipline) {
        alert('Disciplina não encontrada!');
        return;
      }

      // Tentar usar File System Access API para sincronização automática
      const fileHandle = await syncDisciplineWithFile(disciplineId, discipline);
      
      if (fileHandle) {
        alert(`✅ Disciplina "${discipline.title}" exportada para Markdown!\n\nO arquivo foi salvo e será sincronizado automaticamente quando você editá-lo.`);
        // Configurar monitoramento do arquivo
        this.setupFileSync(fileHandle, disciplineId);
      } else {
        // Fallback: download simples
        await exportDisciplineToMarkdown(discipline, disciplineId);
        alert(`✅ Disciplina "${discipline.title}" exportada para Markdown!\n\nArquivo baixado. Para sincronização automática, use um navegador compatível (Chrome/Edge).`);
      }
    } catch (error) {
      console.error('Erro ao exportar disciplina:', error);
      const discipline = dataService.getDiscipline(disciplineId);
      if (discipline) {
        await exportDisciplineToMarkdown(discipline, disciplineId);
        alert(`✅ Disciplina "${discipline.title}" exportada para Markdown!\n\nArquivo baixado.`);
      } else {
        alert('Erro ao exportar disciplina!');
      }
    }
  }

  /**
   * Handler para exportar todas as disciplinas como Markdown
   */
  private async handleExportAllMarkdown(): Promise<void> {
    const disciplines = dataService.getAllDisciplines();
    const disciplineCount = Object.keys(disciplines).length;

    if (disciplineCount === 0) {
      alert('Nenhuma disciplina para exportar!');
      return;
    }

    const confirmMessage = `Deseja exportar todas as ${disciplineCount} disciplina(s) como arquivos Markdown?\n\nCada disciplina será exportada como um arquivo separado.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      let exportedCount = 0;
      let errorCount = 0;

      for (const [id, discipline] of Object.entries(disciplines)) {
        try {
          await exportDisciplineToMarkdown(discipline, id);
          exportedCount++;
          // Pequeno delay entre downloads para evitar bloqueio do navegador
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Erro ao exportar disciplina ${discipline.title}:`, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        alert(`✅ ${exportedCount} disciplina(s) exportada(s) com sucesso!`);
      } else {
        alert(`✅ ${exportedCount} disciplina(s) exportada(s) com sucesso!\n\n⚠️ ${errorCount} erro(s) durante a exportação.`);
      }
    } catch (error) {
      console.error('Erro ao exportar disciplinas:', error);
      alert(`Erro ao exportar disciplinas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Handler para importar Markdown
   */
  private handleImportMarkdown(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown';
    input.multiple = true; // Permitir múltiplos arquivos
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      let importedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const content = await file.text();
          const result = importDisciplineFromMarkdown(content, file.name);

          if (result) {
            // Verificar se já existe disciplina com mesmo ID
            const existing = dataService.getDiscipline(result.disciplineId);
            if (existing) {
              const overwrite = confirm(
                `Disciplina "${result.discipline.title}" (ID: ${result.disciplineId}) já existe.\n\nDeseja sobrescrever?`
              );
              if (!overwrite) {
                continue;
              }
            }

            // Salvar disciplina
            dataService.saveDiscipline(result.disciplineId, result.discipline);
            importedCount++;
            console.log(`✅ [AdminPanel] Disciplina importada: ${result.discipline.title}`);
          } else {
            errorCount++;
            errors.push(file.name);
          }
        } catch (error) {
          console.error(`❌ [AdminPanel] Erro ao importar ${file.name}:`, error);
          errorCount++;
          errors.push(file.name);
        }
      }

      // Atualizar lista
      this.refreshDisciplinesList();
      window.dispatchEvent(new CustomEvent('disciplines-updated'));

      // Mostrar resultado
      if (errorCount === 0) {
        alert(`✅ ${importedCount} disciplina(s) importada(s) com sucesso!`);
      } else {
        alert(
          `✅ ${importedCount} disciplina(s) importada(s) com sucesso!\n\n⚠️ ${errorCount} erro(s):\n${errors.join('\n')}`
        );
      }
    };
    input.click();
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
            this.refreshDisciplinesList();
            console.log(`🔄 [AdminPanel] Disciplina sincronizada automaticamente: ${result.discipline.title}`);
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

    // Armazenar cleanup para uso futuro
    if (!(this as any).fileSyncIntervals) {
      (this as any).fileSyncIntervals = new Map();
    }
    (this as any).fileSyncIntervals.set(disciplineId, syncInterval);
  }

  /**
   * Abre o modal do formulário
   */
  public openForm(): void {
    const title = document.getElementById('form-title');
    if (title) {
      title.textContent = this.editingId ? 'Editar Disciplina' : 'Adicionar Nova Disciplina';
    }
    
    // Só resetar o formulário se não estiver editando
    if (!this.editingId) {
      this.formElement?.reset();
      const idInput = document.getElementById('discipline-id') as HTMLInputElement;
      if (idInput) idInput.value = '';
      
      // Limpar syllabus
      const syllabusInputs = document.getElementById('syllabus-inputs');
      if (syllabusInputs) {
        syllabusInputs.innerHTML = '';
      }
      
      // Resetar cor para padrão
      const colorInput = document.getElementById('discipline-color') as HTMLInputElement;
      if (colorInput) {
        colorInput.value = '#41FF41';
      }
      
      // Limpar busca de pré-requisitos
      const searchInput = document.getElementById('prerequisites-search') as HTMLInputElement;
      if (searchInput) {
        searchInput.value = '';
      }
      
      // Limpar módulos
      this.modules = [];
      this.renderModules();
      
      // Resetar progresso
      const progressRange = document.getElementById('discipline-progress-range') as HTMLInputElement;
      const progressInput = document.getElementById('discipline-progress') as HTMLInputElement;
      const progressDisplay = document.querySelector('.progress-display') as HTMLElement;
      if (progressRange) progressRange.value = '0';
      if (progressInput) progressInput.value = '0';
      if (progressDisplay) progressDisplay.textContent = '0%';
      
      // Resetar código
      const codeInput = document.getElementById('discipline-code') as HTMLInputElement;
      if (codeInput) codeInput.value = '';
      
      // Ocultar botão de ver contexto ao criar nova disciplina
      const viewContextBtn = document.getElementById('btn-view-context');
      if (viewContextBtn) {
        viewContextBtn.style.display = 'none';
        viewContextBtn.removeAttribute('data-discipline-id');
      }

      // Ocultar botão de gerar conteúdo ao criar nova disciplina
      const generateContentBtn = document.getElementById('btn-generate-content');
      if (generateContentBtn) {
        generateContentBtn.style.display = 'none';
      }
    }
    
    // Ativar primeira tab
    const firstTab = document.querySelector('.form-tab[data-tab="basic"]');
    const firstTabContent = document.getElementById('tab-basic');
    if (firstTab && firstTabContent) {
      document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.form-tab-content').forEach(c => c.classList.remove('active'));
      firstTab.classList.add('active');
      firstTabContent.classList.add('active');
    }
    
    // Setup tabs functionality (após modal estar visível)
    setTimeout(() => {
      this.setupTabs();
      this.setupModulesEditor();
      this.setupProgressSync();
    }, 100);
    
    // Mostrar modal e backdrop
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.add('visible');
    }
    if (this.modal) {
      this.modal.classList.add('visible');
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden';
    }
    
    // ADICIONAR INPUT IMEDIATAMENTE - Múltiplas tentativas para garantir
    this.addSyllabusInput();
    
    // Garantir que o syllabus seja adicionado após o modal estar visível
    requestAnimationFrame(() => {
      setTimeout(() => {
        const syllabusContainer = document.getElementById('syllabus-inputs');
        if (syllabusContainer) {
          if (syllabusContainer.children.length === 0) {
            console.log('⚠️ [AdminPanel] Container vazio, adicionando input novamente...');
            this.addSyllabusInput();
          }
        } else {
          console.error('❌ [AdminPanel] Container syllabus-inputs não encontrado após delay!');
        }
      }, 50);
    });
    
    // Mais uma tentativa após um delay maior
    setTimeout(() => {
      const syllabusContainer = document.getElementById('syllabus-inputs');
      if (syllabusContainer && syllabusContainer.children.length === 0) {
        console.log('⚠️ [AdminPanel] Última tentativa de adicionar input...');
        this.addSyllabusInput();
      }
    }, 200);
    
    this.initColorPicker();
    this.updatePrerequisitesSelect();
  }

  /**
   * Fecha o modal do formulário
   */
  private closeForm(): void {
    if (this.modal) {
      this.modal.classList.remove('visible');
    }
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('visible');
    }
    // Restaurar scroll do body
    document.body.style.overflow = '';
    this.editingId = null;
  }

  /**
   * Adiciona um input de syllabus
   */
  public addSyllabusInput(value = ''): void {
    const container = document.getElementById('syllabus-inputs');
    if (!container) {
      console.error('❌ [AdminPanel] Container syllabus-inputs não encontrado!');
      // Tentar encontrar novamente após um pequeno delay
      setTimeout(() => {
        const retryContainer = document.getElementById('syllabus-inputs');
        if (retryContainer) {
          console.log('✅ [AdminPanel] Container encontrado na segunda tentativa!');
          this.addSyllabusInput(value);
        }
      }, 100);
      return;
    }

    console.log('📝 [AdminPanel] Adicionando input de syllabus...', { 
      container: !!container,
      containerVisible: container.offsetWidth > 0,
      value 
    });

    const div = document.createElement('div');
    div.className = 'syllabus-item';
    
    // Garantir que o div seja visível
    div.style.display = 'flex';
    div.style.visibility = 'visible';
    div.style.opacity = '1';
    div.style.width = '100%';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Tópico do syllabus';
    input.setAttribute('name', 'syllabus-item');
    input.setAttribute('autocomplete', 'off');
    
    // Criar botão de remover com ícone SVG circular
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-syllabus';
    removeBtn.setAttribute('aria-label', 'Remover item');
    
    // Adicionar ícone SVG de X dentro do botão (estilizado e circular)
    removeBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    
    div.appendChild(input);
    div.appendChild(removeBtn);
    container.appendChild(div);
    
    // Forçar reflow
    void container.offsetHeight;
    
    console.log('✅ [AdminPanel] Input de syllabus adicionado:', {
      containerChildren: container.children.length,
      inputWidth: input.offsetWidth,
      inputHeight: input.offsetHeight,
      inputDisplay: window.getComputedStyle(input).display,
      inputVisibility: window.getComputedStyle(input).visibility,
      inputOpacity: window.getComputedStyle(input).opacity,
      divDisplay: window.getComputedStyle(div).display
    });
    
    // Focar no input recém-criado
    setTimeout(() => {
      try {
        input.focus();
        input.select();
        console.log('✅ [AdminPanel] Input focado com sucesso');
      } catch (e) {
        console.error('❌ [AdminPanel] Erro ao focar input:', e);
      }
    }, 100);
  }

  /**
   * Salva uma disciplina
   */
  private saveDiscipline(): void {
    if (!this.formElement) return;

    const formData = new FormData(this.formElement);
    const syllabusInputs = document.querySelectorAll('#syllabus-inputs input');
    const syllabus = Array.from(syllabusInputs)
      .map((input) => (input as HTMLInputElement).value.trim())
      .filter((value) => value);

    const idInput = document.getElementById('discipline-id') as HTMLInputElement;
    const id = idInput?.value || createId(formData.get('title') as string);
    
    const periodValue = formData.get('period') as string;
    const period: number | string = isNaN(Number(periodValue)) ? periodValue : Number(periodValue);

    // Validar cor - usar cor padrão se não estiver na lista permitida
    let color = (formData.get('color') as string) || '#41FF41';
    if (!this.allowedColors.includes(color.toUpperCase())) {
      color = '#41FF41';
    }

    // Preservar contexto se estiver editando
    const existingDiscipline = this.editingId ? dataService.getDiscipline(this.editingId) : null;
    
    // Converter módulos para o formato ModuleStructure
    const modulesStructure = this.modules.map(module => ({
      id: module.id,
      title: module.title,
      description: module.description || undefined,
      order: module.order,
      subModules: module.subModules.map(subModule => ({
        id: subModule.id,
        title: subModule.title,
        description: subModule.description || undefined,
        order: subModule.order
      }))
    }));

    const discipline: Discipline = {
      code: (formData.get('code') as string) || id.toUpperCase(),
      title: formData.get('title') as string,
      period: period,
      description: formData.get('description') as string,
      color: color,
      progress: parseInt(formData.get('progress') as string, 10),
      // Manter posição existente ou usar padrão (não editável)
      position: existingDiscipline?.position || { x: 50, y: 50 },
      prerequisites: this.getSelectedPrerequisites(),
      syllabus: syllabus,
      icon:
        (formData.get('icon') as string) ||
        `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="40" fill="none" stroke="${formData.get('color')}" stroke-width="10"/></svg>`,
      // Preservar contexto se existir
      context: existingDiscipline?.context,
      contextGeneratedAt: existingDiscipline?.contextGeneratedAt,
      // Preservar conteúdo de submódulos se existir
      subModuleContent: existingDiscipline?.subModuleContent,
      // Adicionar módulos se houver (preservando conteúdo dos submódulos)
      modules: modulesStructure.length > 0 ? modulesStructure.map(module => {
        // Preservar conteúdo dos submódulos se existir
        if (existingDiscipline?.modules) {
          const existingModule = existingDiscipline.modules.find(m => m.id === module.id);
          if (existingModule) {
            module.subModules = module.subModules.map(subModule => {
              const existingSubModule = existingModule.subModules.find(sm => sm.id === subModule.id);
              if (existingSubModule) {
                return {
                  ...subModule,
                  content: existingSubModule.content,
                  contentGeneratedAt: existingSubModule.contentGeneratedAt,
                };
              }
              return subModule;
            });
          }
        }
        return module;
      }) : undefined,
    };

    // Se estiver editando e o ID mudou, remove o antigo
    if (this.editingId && this.editingId !== id) {
      dataService.deleteDiscipline(this.editingId);
    }

    // Salvar disciplina
    dataService.saveDiscipline(id, discipline);
    console.log(`✅ [AdminPanel] Disciplina salva: ${discipline.title} (ID: ${id})`);
    
    // Fechar formulário
    this.closeForm();
    
    // Atualizar lista
    this.refreshDisciplinesList();
    this.updatePrerequisitesSelect();

    // Disparar evento customizado para atualizar a UI
    window.dispatchEvent(new CustomEvent('disciplines-updated'));
    
    // Forçar recarregamento da UI principal
    const renderAll = (window as any).renderAll;
    if (renderAll && typeof renderAll === 'function') {
      renderAll();
    }
  }

  /**
   * Manipula visualização/download do contexto
   */
  private handleViewContext(id: string): void {
    const discipline = dataService.getDiscipline(id);
    if (!discipline || !discipline.context) {
      alert('Esta disciplina não possui contexto gerado.');
      return;
    }

    // Mostrar opções: ver ou baixar
    const action = confirm(
      `Contexto disponível para "${discipline.title}"\n\n` +
      `Gerado em: ${discipline.contextGeneratedAt ? new Date(discipline.contextGeneratedAt).toLocaleString('pt-BR') : 'Data não disponível'}\n` +
      `Tamanho: ${Math.round(discipline.context.length / 1024)}KB\n\n` +
      `Clique OK para baixar o arquivo.\n` +
      `Clique Cancelar para ver no console.`
    );

    if (action) {
      // Baixar arquivo
      this.downloadContextFile(discipline.context, discipline.title);
    } else {
      // Mostrar no console
      console.log('📄 Contexto da disciplina:', discipline.title);
      console.log('─'.repeat(80));
      console.log(discipline.context);
      console.log('─'.repeat(80));
      alert('Contexto exibido no console do navegador (F12 > Console)');
    }
  }

  /**
   * Faz download do arquivo de contexto
   */
  private downloadContextFile(context: string, disciplineName: string): void {
    try {
      // Criar nome do arquivo
      const sanitizedName = disciplineName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const fileName = `contexto-${sanitizedName}-${Date.now()}.md`;
      
      // Criar blob
      const blob = new Blob([context], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Criar link de download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none'; // Ocultar o link
      document.body.appendChild(a);
      
      // Forçar o download
      a.click();
      
      // Limpar após um pequeno delay para garantir que o download foi iniciado
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
        console.log(`✅ Arquivo de contexto baixado: ${fileName}`);
      }, 200);
    } catch (error) {
      console.error('Erro ao fazer download do arquivo:', error);
      alert(`Erro ao fazer download do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Manipula a geração de conteúdo completo da disciplina
   */
  private async handleGenerateContent(): Promise<void> {
    // Verificar se há uma disciplina sendo editada
    if (!this.editingId) {
      alert('Por favor, selecione uma disciplina para editar antes de gerar o conteúdo.');
      return;
    }

    const discipline = dataService.getDiscipline(this.editingId);
    if (!discipline) {
      alert('Disciplina não encontrada.');
      return;
    }

    // Verificar se o Gemini está configurado
    if (!geminiService.isConfigured()) {
      alert('API key do Gemini não configurada. Configure-a nas configurações do chatbot antes de gerar conteúdo.');
      return;
    }

    // Confirmar ação
    const confirmMessage = `Deseja gerar o conteúdo completo da disciplina "${discipline.title}"?\n\n` +
      `Esta operação pode levar alguns minutos e utilizará a API do Gemini.\n\n` +
      `O conteúdo gerado será salvo e poderá ser usado diretamente pelos alunos.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Mostrar indicador de carregamento
    const generateBtn = document.getElementById('btn-generate-content') as HTMLButtonElement;
    let originalHTML = '';
    if (generateBtn) {
      originalHTML = generateBtn.innerHTML;
      generateBtn.disabled = true;
      generateBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
        Gerando conteúdo...
      `;
    }

    try {
      // Obter disciplinas existentes para contexto
      const allDisciplines = dataService.getAllDisciplines();
      const existingDisciplines = Object.entries(allDisciplines).map(([id, disc]) => ({
        id,
        title: disc.title,
        code: disc.code,
        syllabus: disc.syllabus,
      }));

      // Preparar dados da disciplina
      const disciplineData = {
        id: this.editingId,
        code: discipline.code,
        title: discipline.title,
        period: discipline.period,
        description: discipline.description,
        syllabus: discipline.syllabus,
        modules: discipline.modules,
        prerequisites: discipline.prerequisites,
        context: discipline.context,
        contextGeneratedAt: discipline.contextGeneratedAt,
      };

      console.log('📚 [AdminPanel] Iniciando geração de conteúdo completo...');
      
      // Gerar conteúdo educacional completo
      const content = await geminiService.generateDisciplineContent(
        disciplineData,
        existingDisciplines,
        [] // PDFs podem ser adicionados no futuro
      );

      console.log(`✅ [AdminPanel] Conteúdo gerado com sucesso (${content.length} caracteres)`);

      // Salvar o conteúdo gerado
      // Opção 1: Salvar como arquivo markdown e definir contentPath
      // Opção 2: Salvar no campo context (já existe)
      // Vamos usar uma abordagem híbrida: salvar como arquivo e também no context
      
      // Criar nome do arquivo
      const sanitizedName = discipline.title.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const fileName = `conteudo-${sanitizedName}-${Date.now()}.md`;
      
      // Salvar conteúdo no campo context (para referência)
      const updatedDiscipline: Discipline = {
        ...discipline,
        context: content,
        contextGeneratedAt: new Date().toISOString(),
      };

      // Salvar disciplina atualizada
      dataService.saveDiscipline(this.editingId, updatedDiscipline);
      console.log('✅ [AdminPanel] Conteúdo salvo na disciplina');

      // Oferecer download do arquivo
      const downloadContent = confirm(
        `Conteúdo gerado com sucesso!\n\n` +
        `Tamanho: ${Math.round(content.length / 1024)}KB\n\n` +
        `Deseja fazer o download do arquivo markdown?`
      );

      if (downloadContent) {
        // Fazer download do arquivo
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
          URL.revokeObjectURL(url);
        }, 200);
      }

      // Atualizar botão de ver contexto se necessário
      const viewContextBtn = document.getElementById('btn-view-context');
      if (viewContextBtn) {
        viewContextBtn.style.display = 'inline-flex';
        viewContextBtn.setAttribute('data-discipline-id', this.editingId);
      }

      alert('Conteúdo educacional completo gerado e salvo com sucesso!');
      
    } catch (error) {
      console.error('❌ [AdminPanel] Erro ao gerar conteúdo:', error);
      alert(`Erro ao gerar conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      // Restaurar botão
      if (generateBtn && originalHTML) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalHTML;
      }
    }
  }

  /**
   * Manipula a geração de conteúdo para um submódulo específico
   */
  private async handleGenerateSubModuleContent(moduleId: string, submoduleId: string): Promise<void> {
    if (!this.editingId) {
      alert('Por favor, selecione uma disciplina para editar antes de gerar conteúdo.');
      return;
    }

    const discipline = dataService.getDiscipline(this.editingId);
    if (!discipline) {
      alert('Disciplina não encontrada.');
      return;
    }

    // Encontrar o módulo e submódulo
    const module = discipline.modules?.find(m => m.id === moduleId);
    if (!module) {
      alert('Módulo não encontrado.');
      return;
    }

    const subModule = module.subModules.find(sm => sm.id === submoduleId);
    if (!subModule) {
      alert('Submódulo não encontrado.');
      return;
    }

    // Verificar se o Gemini está configurado
    if (!geminiService.isConfigured()) {
      alert('API key do Gemini não configurada. Configure-a nas configurações do chatbot antes de gerar conteúdo.');
      return;
    }

    // Confirmar ação
    if (!confirm(`Deseja gerar conteúdo para o submódulo "${subModule.title}"?\n\nEsta operação pode levar alguns minutos.`)) {
      return;
    }

    // Mostrar indicador de carregamento
    const btn = document.querySelector(`.submodule-btn.generate-content[data-submodule-id="${submoduleId}"]`) as HTMLButtonElement;
    const originalHTML = btn?.innerHTML || '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
      `;
    }

    try {
      // Obter disciplinas existentes para contexto
      const allDisciplines = dataService.getAllDisciplines();
      const existingDisciplines = Object.entries(allDisciplines).map(([id, disc]) => ({
        id,
        title: disc.title,
        code: disc.code,
        syllabus: disc.syllabus,
      }));

      console.log(`📚 [AdminPanel] Gerando conteúdo para submódulo: ${subModule.title}`);

      // Gerar conteúdo do submódulo
      const content = await geminiService.generateSubModuleContent(
        {
          disciplineId: this.editingId,
          disciplineTitle: discipline.title,
          disciplineCode: discipline.code,
          disciplineDescription: discipline.description,
          moduleTitle: module.title,
          moduleDescription: module.description,
          subModuleTitle: subModule.title,
          subModuleDescription: subModule.description,
          context: discipline.context,
        },
        existingDisciplines
      );

      console.log(`✅ [AdminPanel] Conteúdo gerado com sucesso (${content.length} caracteres)`);

      // Salvar o conteúdo gerado
      const updatedDiscipline: Discipline = {
        ...discipline,
        subModuleContent: {
          ...(discipline.subModuleContent || {}),
          [submoduleId]: content,
        },
      };

      // Atualizar também no objeto do módulo (para manter sincronizado)
      if (updatedDiscipline.modules) {
        const moduleIndex = updatedDiscipline.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex !== -1) {
          const subModuleIndex = updatedDiscipline.modules[moduleIndex].subModules.findIndex(sm => sm.id === submoduleId);
          if (subModuleIndex !== -1) {
            updatedDiscipline.modules[moduleIndex].subModules[subModuleIndex].content = content;
            updatedDiscipline.modules[moduleIndex].subModules[subModuleIndex].contentGeneratedAt = new Date().toISOString();
          }
        }
      }

      // Salvar disciplina atualizada
      dataService.saveDiscipline(this.editingId, updatedDiscipline);
      console.log('✅ [AdminPanel] Conteúdo salvo no submódulo');

      // Atualizar a interface para mostrar que tem conteúdo
      this.renderModules();

      // Disparar evento para atualizar a visualização se estiver aberta
      window.dispatchEvent(new CustomEvent('submodule-content-updated', {
        detail: {
          disciplineId: this.editingId,
          subModuleId: submoduleId,
          moduleId: moduleId
        }
      }));

      // Disparar evento geral de atualização de disciplinas
      window.dispatchEvent(new CustomEvent('disciplines-updated'));

      alert(`✅ Conteúdo gerado com sucesso para "${subModule.title}"!\n\nO conteúdo aparecerá automaticamente na visualização da disciplina.`);
      
    } catch (error) {
      console.error('❌ [AdminPanel] Erro ao gerar conteúdo do submódulo:', error);
      alert(`Erro ao gerar conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      // Restaurar botão
      if (btn && originalHTML) {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }
    }
  }

  /**
   * Edita uma disciplina
   */
  editDiscipline(id: string): void {
    const discipline = dataService.getDiscipline(id);
    if (!discipline) return;

    this.editingId = id;
    
    // Abrir o formulário primeiro (sem resetar, pois editingId está definido)
    this.openForm();
    
    // Preencher os campos após o modal estar aberto e o DOM estar pronto
    setTimeout(() => {
      const title = document.getElementById('form-title');
      if (title) title.textContent = 'Editar Disciplina';

      const idInput = document.getElementById('discipline-id') as HTMLInputElement;
      if (idInput) idInput.value = id;

      const titleInput = document.getElementById('discipline-title') as HTMLInputElement;
      if (titleInput) titleInput.value = discipline.title;

      const periodInput = document.getElementById('discipline-period') as HTMLInputElement;
      if (periodInput) periodInput.value = String(discipline.period);

      const descriptionInput = document.getElementById('discipline-description') as HTMLTextAreaElement;
      if (descriptionInput) descriptionInput.value = discipline.description || '';

      // Validar e definir cor
      let color = discipline.color;
      if (!this.allowedColors.includes(color.toUpperCase())) {
        color = '#41FF41';
      }
      const colorInput = document.getElementById('discipline-color') as HTMLInputElement;
      if (colorInput) {
        colorInput.value = color;
      }
      
      // Inicializar color picker com a cor selecionada
      this.initColorPicker();
      
      const progressInput = document.getElementById('discipline-progress') as HTMLInputElement;
      if (progressInput) {
        progressInput.value = String(discipline.progress);
      }
      
      // Sincronizar range slider com input
      const progressRange = document.getElementById('discipline-progress-range') as HTMLInputElement;
      const progressDisplay = document.querySelector('.progress-display') as HTMLElement;
      if (progressRange) {
        progressRange.value = String(discipline.progress);
      }
      if (progressDisplay) {
        progressDisplay.textContent = `${discipline.progress}%`;
      }

      // Carregar código se existir
      const codeInput = document.getElementById('discipline-code') as HTMLInputElement;
      if (codeInput) {
        codeInput.value = discipline.code || '';
      }

      const iconInput = document.getElementById('discipline-icon') as HTMLTextAreaElement;
      if (iconInput) {
        iconInput.value = discipline.icon || '';
      }

      // Carregar módulos se existirem
      if (discipline.modules && discipline.modules.length > 0) {
        this.modules = discipline.modules.map(module => ({
          id: module.id,
          title: module.title,
          description: module.description || '',
          order: module.order,
          subModules: module.subModules.map(subModule => ({
            id: subModule.id,
            title: subModule.title,
            description: subModule.description || '',
            order: subModule.order
          }))
        }));
        this.renderModules();
      } else {
        this.modules = [];
        this.renderModules();
      }

      // Mostrar/ocultar botão de contexto se houver
      const viewContextBtn = document.getElementById('btn-view-context');
      if (viewContextBtn) {
        if (discipline.context) {
          viewContextBtn.style.display = 'inline-flex';
          viewContextBtn.setAttribute('data-discipline-id', id);
        } else {
          viewContextBtn.style.display = 'none';
          viewContextBtn.removeAttribute('data-discipline-id');
        }
      }

      // Mostrar botão de gerar conteúdo (sempre visível ao editar)
      const generateContentBtn = document.getElementById('btn-generate-content');
      if (generateContentBtn) {
        generateContentBtn.style.display = 'inline-flex';
      }

      // Limpar e adicionar syllabus
      const syllabusInputs = document.getElementById('syllabus-inputs');
      if (syllabusInputs) {
        syllabusInputs.innerHTML = '';
        if (discipline.syllabus && discipline.syllabus.length > 0) {
          discipline.syllabus.forEach((item) => this.addSyllabusInput(item));
        } else {
          // Garantir pelo menos um campo vazio
          this.addSyllabusInput();
        }
      }

      // Atualizar pré-requisitos (deve ser chamado após preencher os dados)
      this.updatePrerequisitesSelect();
    }, 150);
  }

  /**
   * Remove uma disciplina
   */
  deleteDiscipline(id: string): void {
    const discipline = dataService.getDiscipline(id);
    if (!discipline) return;

    if (confirm(`Tem certeza que deseja excluir "${discipline.title}"?`)) {
      dataService.deleteDiscipline(id);
      this.refreshDisciplinesList();
      this.updatePrerequisitesSelect();
      window.dispatchEvent(new CustomEvent('disciplines-updated'));
    }
  }

  /**
   * Atualiza a lista de disciplinas (público para uso externo)
   */
  public refreshDisciplinesList(): void {
    console.log('🔄 [AdminPanel] Atualizando lista de disciplinas...');
    
    const list = document.getElementById('disciplines-list');
    if (!list) {
      console.error('❌ [AdminPanel] Elemento #disciplines-list não encontrado no DOM!');
      // Tentar encontrar novamente
      const adminPanel = document.getElementById('admin-panel');
      if (adminPanel) {
        console.log('🔍 [AdminPanel] Procurando elemento dentro do painel...');
        const foundList = adminPanel.querySelector('#disciplines-list');
        if (foundList) {
          console.log('✅ [AdminPanel] Elemento encontrado via querySelector');
        } else {
          console.error('❌ [AdminPanel] Elemento ainda não encontrado');
        }
      }
      return;
    }

    list.innerHTML = '';
    const disciplines = dataService.getAllDisciplines();
    
    const disciplineCount = Object.keys(disciplines).length;
    console.log('📋 [AdminPanel] Total de disciplinas encontradas:', disciplineCount);
    console.log('📋 [AdminPanel] IDs das disciplinas:', Object.keys(disciplines));

    if (disciplineCount === 0) {
      list.innerHTML = '<p style="text-align: center; color: var(--color-grey); padding: var(--space-xl);">Nenhuma disciplina cadastrada ainda.</p>';
      console.log('ℹ️ [AdminPanel] Nenhuma disciplina para exibir');
      return;
    }

    Object.entries(disciplines).forEach(([id, discipline]) => {
      const item = document.createElement('div');
      item.className = 'discipline-item';
      
      // Extrair ícone SVG ou usar código como fallback
      let iconHtml = '';
      if (discipline.icon && discipline.icon.startsWith('<svg')) {
        iconHtml = discipline.icon.replace(/<svg/g, `<svg style="stroke: ${discipline.color}; width: 24px; height: 24px;"`);
      } else {
        iconHtml = `<div style="color: ${discipline.color}; font-weight: 600; font-size: 0.9rem;">${this.escapeHtml(discipline.code)}</div>`;
      }
      
      const periodLabel = typeof discipline.period === 'number' 
        ? `${discipline.period}º Período` 
        : discipline.period;
      
      item.innerHTML = `
        <div class="discipline-item-header">
          <div class="discipline-item-icon" style="color: ${discipline.color};">
            ${iconHtml}
          </div>
          <div class="discipline-item-info">
            <div class="discipline-code">${this.escapeHtml(discipline.code)}</div>
            <h3>${this.escapeHtml(discipline.title)}</h3>
            <p>${this.escapeHtml(String(periodLabel))}</p>
          </div>
        </div>
        <div class="discipline-item-progress">
          <div class="discipline-item-progress-bar">
            <div class="discipline-item-progress-fill" style="width: ${discipline.progress}%; background: ${discipline.color};"></div>
          </div>
          <span style="font-size: 0.85rem; color: var(--text-secondary); min-width: 40px; text-align: right;">${discipline.progress}%</span>
        </div>
        <div class="discipline-item-actions">
          ${discipline.context ? `<button class="btn-secondary" data-view-context-id="${this.escapeHtml(id)}" title="Ver/Baixar Contexto" style="background: rgba(65, 65, 255, 0.2) !important; border-color: rgba(65, 65, 255, 0.5) !important; color: #4141FF !important;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            Contexto
          </button>` : ''}
          <button class="btn-secondary" data-export-md-id="${this.escapeHtml(id)}" title="Exportar como Markdown" style="background: rgba(65, 255, 65, 0.2) !important; border-color: rgba(65, 255, 65, 0.5) !important; color: #41FF41 !important;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            MD
          </button>
          <button class="btn-secondary" data-edit-id="${this.escapeHtml(id)}">Editar</button>
          <button class="btn-danger" data-delete-id="${this.escapeHtml(id)}">Excluir</button>
        </div>
      `;
      list.appendChild(item);
      console.log(`✅ [AdminPanel] Disciplina adicionada à lista: ${discipline.title} (${id})`);
    });
    
    console.log(`✅ [AdminPanel] Lista de disciplinas atualizada com ${disciplineCount} item(s)`);
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Inicializa o seletor de cores
   */
  public initColorPicker(): void {
    const colorPicker = document.getElementById('discipline-color-picker');
    const hiddenInput = document.getElementById('discipline-color') as HTMLInputElement;
    if (!colorPicker || !hiddenInput) return;

    // Adicionar listener apenas uma vez
    if (!this.colorPickerInitialized) {
      colorPicker.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const colorOption = target.closest('.color-option') as HTMLElement;
        if (!colorOption) return;

        const color = colorOption.getAttribute('data-color');
        if (color && this.allowedColors.includes(color.toUpperCase())) {
          // Remover seleção anterior
          colorPicker.querySelectorAll('.color-option').forEach((btn) => {
            btn.classList.remove('selected');
          });
          // Adicionar seleção atual
          colorOption.classList.add('selected');
          // Atualizar input hidden
          const input = document.getElementById('discipline-color') as HTMLInputElement;
          if (input) {
            input.value = color;
          }
        }
      });
      this.colorPickerInitialized = true;
    }

    // Remover seleção anterior e selecionar cor atual
    colorPicker.querySelectorAll('.color-option').forEach((btn) => {
      btn.classList.remove('selected');
    });

    const currentColor = (hiddenInput.value || '#41FF41').toUpperCase();
    const validColor = this.allowedColors.find(c => c.toUpperCase() === currentColor) || '#41FF41';
    hiddenInput.value = validColor;
    const selectedBtn = colorPicker.querySelector(`[data-color="${validColor}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('selected');
    }
  }

  /**
   * Inicializa o seletor de pré-requisitos com busca
   */
  private initPrerequisitesSelector(): void {
    const searchInput = document.getElementById('prerequisites-search') as HTMLInputElement;
    const dropdown = document.getElementById('prerequisites-dropdown');
    const selectedContainer = document.getElementById('prerequisites-selected');
    const hiddenInput = document.getElementById('discipline-prerequisites') as HTMLInputElement;
    
    if (!searchInput || !dropdown || !selectedContainer || !hiddenInput) return;

    // Limpar estado anterior
    searchInput.value = '';
    dropdown.innerHTML = '';
    selectedContainer.innerHTML = '';
    
    // Obter pré-requisitos já selecionados se estiver editando
    let selectedPrerequisites: string[] = [];
    if (this.editingId) {
      const discipline = dataService.getDiscipline(this.editingId);
      if (discipline) {
        selectedPrerequisites = [...discipline.prerequisites];
      }
    }

    // Função para atualizar dropdown
    const updateDropdown = (searchTerm: string = '') => {
      dropdown.innerHTML = '';
      const disciplines = dataService.getAllDisciplines();
      const term = searchTerm.toLowerCase().trim();
      
      const availableDisciplines = Object.entries(disciplines)
        .filter(([id]) => {
          // Não incluir a disciplina atual
          if (this.editingId && id === this.editingId) return false;
          // Não incluir já selecionadas
          if (selectedPrerequisites.includes(id)) return false;
          // Filtrar por termo de busca
          if (term) {
            const discipline = disciplines[id];
            return (
              discipline.title.toLowerCase().includes(term) ||
              discipline.code.toLowerCase().includes(term) ||
              id.toLowerCase().includes(term)
            );
          }
          return true;
        })
        .slice(0, 10); // Limitar a 10 resultados

      if (availableDisciplines.length === 0) {
        dropdown.innerHTML = '<div class="prerequisites-dropdown-empty">Nenhuma disciplina encontrada</div>';
        dropdown.classList.remove('visible');
        return;
      }

      availableDisciplines.forEach(([id, discipline]) => {
        const item = document.createElement('div');
        item.className = 'prerequisites-dropdown-item';
        item.innerHTML = `
          <input type="checkbox" id="prereq-${id}" data-id="${id}">
          <label for="prereq-${id}">${this.escapeHtml(discipline.title)} (${this.escapeHtml(discipline.code)})</label>
        `;
        
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            handlePrerequisiteToggle(id, checkbox.checked);
          }
        });
        
        dropdown.appendChild(item);
      });

      if (term || availableDisciplines.length > 0) {
        dropdown.classList.add('visible');
      } else {
        dropdown.classList.remove('visible');
      }
    };

    // Função para adicionar/remover pré-requisito
    const handlePrerequisiteToggle = (id: string, add: boolean) => {
      if (add && !selectedPrerequisites.includes(id)) {
        selectedPrerequisites.push(id);
      } else if (!add) {
        selectedPrerequisites = selectedPrerequisites.filter((prereqId) => prereqId !== id);
      }
      updateSelectedTags();
      updateDropdown(searchInput.value);
    };

    // Função para atualizar tags selecionadas
    const updateSelectedTags = () => {
      selectedContainer.innerHTML = '';
      const disciplines = dataService.getAllDisciplines();
      
      selectedPrerequisites.forEach((id) => {
        const discipline = disciplines[id];
        if (!discipline) return;
        
        const tag = document.createElement('div');
        tag.className = 'prerequisite-tag';
        tag.innerHTML = `
          <span>${this.escapeHtml(discipline.title)}</span>
          <button type="button" class="prerequisite-tag-remove" data-id="${id}" aria-label="Remover">×</button>
        `;
        
        const removeBtn = tag.querySelector('.prerequisite-tag-remove');
        removeBtn?.addEventListener('click', () => {
          selectedPrerequisites = selectedPrerequisites.filter((prereqId) => prereqId !== id);
          updateSelectedTags();
          updateDropdown(searchInput.value);
        });
        
        selectedContainer.appendChild(tag);
      });

      // Atualizar input hidden com array JSON
      hiddenInput.value = JSON.stringify(selectedPrerequisites);
    };

    // Event listeners
    searchInput.addEventListener('input', (e) => {
      const term = (e.target as HTMLInputElement).value;
      updateDropdown(term);
    });

    searchInput.addEventListener('focus', () => {
      updateDropdown(searchInput.value);
    });

    // Fechar dropdown ao clicar fora
    const closeDropdownHandler = (e: MouseEvent) => {
      if (!searchInput.contains(e.target as Node) && !dropdown.contains(e.target as Node)) {
        dropdown.classList.remove('visible');
      }
    };
    document.addEventListener('click', closeDropdownHandler);

    // Inicializar tags selecionadas
    updateSelectedTags();
  }

  /**
   * Atualiza o seletor de pré-requisitos (mantido para compatibilidade)
   */
  public updatePrerequisitesSelect(): void {
    this.initPrerequisitesSelector();
  }

  /**
   * Obtém os pré-requisitos selecionados
   */
  private getSelectedPrerequisites(): string[] {
    const hiddenInput = document.getElementById('discipline-prerequisites') as HTMLInputElement;
    if (!hiddenInput || !hiddenInput.value) return [];
    
    try {
      return JSON.parse(hiddenInput.value);
    } catch {
      return [];
    }
  }

  /**
   * Configura a funcionalidade de tabs
   */
  private setupTabs(): void {
    const tabs = document.querySelectorAll('.form-tab');
    // Remover listeners anteriores se existirem
    tabs.forEach(tab => {
      const newTab = tab.cloneNode(true);
      tab.parentNode?.replaceChild(newTab, tab);
    });

    // Adicionar novos listeners
    document.querySelectorAll('.form-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        if (!tabName) return;

        // Remove active de todas as tabs
        document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Remove active de todo conteúdo
        document.querySelectorAll('.form-tab-content').forEach(content => {
          content.classList.remove('active');
        });

        // Ativa o conteúdo correspondente
        const targetContent = document.getElementById(`tab-${tabName}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  /**
   * Configura o editor de módulos e submódulos
   */
  private setupModulesEditor(): void {
    // Handler para adicionar módulo
    const addModuleBtn = document.getElementById('btn-add-module');
    if (addModuleBtn) {
      addModuleBtn.addEventListener('click', () => {
        this.addModule();
      });
    }

    // Event delegation para ações dos módulos
    const modulesList = document.getElementById('modules-list');
    if (modulesList) {
      modulesList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        // Adicionar submódulo
        if (target.closest('.btn-add-submodule')) {
          const moduleId = target.closest('.module-item')?.getAttribute('data-module-id');
          if (moduleId) {
            this.addSubModule(moduleId);
          }
        }

        // Remover módulo
        if (target.closest('.module-btn.danger')) {
          const moduleId = target.closest('.module-item')?.getAttribute('data-module-id');
          if (moduleId && confirm('Tem certeza que deseja remover este módulo e todos os seus submódulos?')) {
            this.removeModule(moduleId);
          }
        }

        // Remover submódulo
        if (target.closest('.submodule-btn.danger')) {
          const submoduleId = target.closest('.submodule-item')?.getAttribute('data-submodule-id');
          const moduleId = target.closest('.module-item')?.getAttribute('data-module-id');
          if (submoduleId && moduleId) {
            this.removeSubModule(moduleId, submoduleId);
          }
        }

        // Gerar conteúdo do submódulo
        if (target.closest('.submodule-btn.generate-content')) {
          const btn = target.closest('.submodule-btn.generate-content') as HTMLElement;
          const moduleId = btn.getAttribute('data-module-id');
          const submoduleId = btn.getAttribute('data-submodule-id');
          if (moduleId && submoduleId) {
            this.handleGenerateSubModuleContent(moduleId, submoduleId);
          }
        }
      });
    }
  }

  /**
   * Adiciona um novo módulo
   */
  private addModule(): void {
    const moduleId = `module-${Date.now()}`;
    const newModule = {
      id: moduleId,
      title: '',
      description: '',
      order: this.modules.length,
      subModules: []
    };
    this.modules.push(newModule);
    this.renderModules();
    
    // Focar no input do título
    setTimeout(() => {
      const titleInput = document.querySelector(`[data-module-id="${moduleId}"] .module-title-input`) as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
      }
    }, 100);
  }

  /**
   * Remove um módulo
   */
  private removeModule(moduleId: string): void {
    this.modules = this.modules.filter(m => m.id !== moduleId);
    // Reordenar
    this.modules.forEach((m, index) => {
      m.order = index;
    });
    this.renderModules();
  }

  /**
   * Adiciona um submódulo a um módulo
   */
  private addSubModule(moduleId: string): void {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module) return;

    const subModuleId = `submodule-${Date.now()}`;
    const newSubModule = {
      id: subModuleId,
      title: '',
      description: '',
      order: module.subModules.length
    };
    module.subModules.push(newSubModule);
    this.renderModules();

    // Focar no input do título
    setTimeout(() => {
      const titleInput = document.querySelector(`[data-submodule-id="${subModuleId}"] .submodule-title-input`) as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
      }
    }, 100);
  }

  /**
   * Remove um submódulo
   */
  private removeSubModule(moduleId: string, subModuleId: string): void {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module) return;

    module.subModules = module.subModules.filter(sm => sm.id !== subModuleId);
    // Reordenar
    module.subModules.forEach((sm, index) => {
      sm.order = index;
    });
    this.renderModules();
  }

  /**
   * Renderiza a lista de módulos
   */
  private renderModules(): void {
    const modulesList = document.getElementById('modules-list');
    if (!modulesList) return;

    if (this.modules.length === 0) {
      modulesList.innerHTML = `
        <div class="modules-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <p>Nenhum módulo adicionado ainda</p>
          <small>Clique em "Adicionar Módulo" para começar</small>
        </div>
      `;
      return;
    }

    modulesList.innerHTML = this.modules
      .sort((a, b) => a.order - b.order)
      .map(module => this.renderModule(module))
      .join('');
    
    // Adicionar listeners de input
    this.modules.forEach(module => {
      // Título do módulo
      const titleInput = document.querySelector(`[data-module-id="${module.id}"] .module-title-input`) as HTMLInputElement;
      if (titleInput) {
        titleInput.addEventListener('input', (e) => {
          module.title = (e.target as HTMLInputElement).value;
        });
      }

      // Descrição do módulo
      const descInput = document.querySelector(`[data-module-id="${module.id}"] .module-description textarea`) as HTMLTextAreaElement;
      if (descInput) {
        descInput.addEventListener('input', (e) => {
          module.description = (e.target as HTMLTextAreaElement).value;
        });
      }

      // Submódulos
      module.subModules.forEach(subModule => {
        const subTitleInput = document.querySelector(`[data-submodule-id="${subModule.id}"] .submodule-title-input`) as HTMLInputElement;
        if (subTitleInput) {
          subTitleInput.addEventListener('input', (e) => {
            subModule.title = (e.target as HTMLInputElement).value;
          });
        }
      });
    });
  }

  /**
   * Renderiza um módulo individual
   */
  private renderModule(module: { id: string; title: string; description: string; order: number; subModules: Array<{ id: string; title: string; description: string; order: number }> }): string {
    const subModulesHtml = module.subModules
      .sort((a, b) => a.order - b.order)
      .map(subModule => {
        // Verificar se já tem conteúdo gerado
        const discipline = this.editingId ? dataService.getDiscipline(this.editingId) : null;
        const hasContent = discipline?.subModuleContent?.[subModule.id] || false;
        
        return `
        <div class="submodule-item" data-submodule-id="${subModule.id}">
          <div class="submodule-drag-handle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="12" r="1"></circle>
              <circle cx="9" cy="5" r="1"></circle>
              <circle cx="9" cy="19" r="1"></circle>
              <circle cx="15" cy="12" r="1"></circle>
              <circle cx="15" cy="5" r="1"></circle>
              <circle cx="15" cy="19" r="1"></circle>
            </svg>
          </div>
          <input type="text" class="submodule-title-input" placeholder="Nome do submódulo" value="${this.escapeHtml(subModule.title)}">
          <div class="submodule-actions">
            <button type="button" class="submodule-btn generate-content" data-module-id="${module.id}" data-submodule-id="${subModule.id}" title="Gerar conteúdo com IA" style="background: rgba(255, 65, 255, 0.2) !important; border-color: rgba(255, 65, 255, 0.5) !important; color: #FF41FF !important; ${hasContent ? 'opacity: 0.6;' : ''}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m9.9 9.9l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m9.9-9.9l2.83-2.83"></path>
              </svg>
              ${hasContent ? '✓' : 'IA'}
            </button>
            <button type="button" class="submodule-btn danger" title="Remover submódulo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
      }).join('');

    return `
      <div class="module-item" data-module-id="${module.id}">
        <div class="module-header">
          <div class="module-drag-handle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="12" r="1"></circle>
              <circle cx="9" cy="5" r="1"></circle>
              <circle cx="9" cy="19" r="1"></circle>
              <circle cx="15" cy="12" r="1"></circle>
              <circle cx="15" cy="5" r="1"></circle>
              <circle cx="15" cy="19" r="1"></circle>
            </svg>
          </div>
          <input type="text" class="module-title-input" placeholder="Nome do módulo" value="${this.escapeHtml(module.title)}">
          <div class="module-actions">
            <button type="button" class="module-btn danger" title="Remover módulo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="module-description">
          <textarea placeholder="Descrição do módulo (opcional)">${this.escapeHtml(module.description)}</textarea>
        </div>
        <div class="submodules-container">
          <div class="submodules-header">
            <h5 style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">Submódulos</h5>
          </div>
          <div class="submodules-list">
            ${subModulesHtml}
          </div>
          <button type="button" class="btn-add-submodule">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Adicionar Submódulo
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Configura sincronização do range slider com input de progresso
   */
  private setupProgressSync(): void {
    const progressRange = document.getElementById('discipline-progress-range') as HTMLInputElement;
    const progressInput = document.getElementById('discipline-progress') as HTMLInputElement;
    const progressDisplay = document.querySelector('.progress-display') as HTMLElement;

    if (progressRange && progressInput && progressDisplay) {
      const updateProgress = (value: number) => {
        progressRange.value = String(value);
        progressInput.value = String(value);
        progressDisplay.textContent = `${value}%`;
      };

      progressRange.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value, 10);
        updateProgress(value);
      });

      progressInput.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value, 10);
        const clampedValue = Math.max(0, Math.min(100, value));
        updateProgress(clampedValue);
      });
    }
  }
}
