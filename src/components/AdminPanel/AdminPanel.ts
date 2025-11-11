import { dataService } from '@/services';
import { createId } from '@/utils';
import type { Discipline } from '@/types';
import './AdminPanel.css';

/**
 * Componente AdminPanel
 */
export class AdminPanel {
  private panel: HTMLElement | null = null;
  private form: HTMLElement | null = null;
  private formElement: HTMLFormElement | null = null;
  private editingId: string | null = null;
  private readonly allowedColors = ['#41FF41', '#4141FF', '#FF41FF', '#41FFFF', '#F2FF41', '#FF4141'];
  private colorPickerInitialized = false;

  /**
   * Inicializa o painel administrativo
   */
  init(): void {
    console.log('🔧 [AdminPanel] Inicializando...');
    this.panel = document.getElementById('admin-panel');
    this.form = document.getElementById('discipline-form');
    this.formElement = document.getElementById('discipline-form-element') as HTMLFormElement;

    if (!this.panel) {
      console.error('❌ [AdminPanel] Elemento #admin-panel não encontrado!');
      return;
    }

    console.log('✅ [AdminPanel] Elementos encontrados:', {
      panel: !!this.panel,
      form: !!this.form,
      formElement: !!this.formElement
    });

    // Configurar event delegation (igual aos toggles)
    this.setupEventDelegation();
    
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
    if (!this.form) {
      this.form = document.getElementById('discipline-form');
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
      
      // Verificar se o clique foi dentro do admin panel
      const clickedInAdminPanel = target.closest('#admin-panel');
      if (!clickedInAdminPanel) {
        return; // Clique fora do painel, ignorar
      }
      
      // Verificar se painel está visível
      const adminPanel = document.getElementById('admin-panel');
      if (!adminPanel || !adminPanel.classList.contains('visible')) {
        return; // Painel não está aberto, ignorar
      }
      
      console.log('🖱️ [AdminPanel] Clique detectado no admin panel:', target.id, target.className);
      
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
      
      // Cancelar formulário
      if (target.id === 'btn-cancel-form' || target.closest('#btn-cancel-form')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Cancelar" clicado');
        this.closeForm();
        return;
      }
      
      // Adicionar item ao syllabus
      if (target.id === 'btn-add-syllabus' || target.closest('#btn-add-syllabus')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ [AdminPanel] Botão "Adicionar Syllabus" clicado');
        this.addSyllabusInput();
        return;
      }
      
      // Remover item do syllabus
      const removeSyllabusBtn = target.closest('.btn-remove');
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
   * Abre o formulário
   */
  private openForm(): void {
    const title = document.getElementById('form-title');
    if (title) {
      title.textContent = this.editingId ? 'Editar Disciplina' : 'Adicionar Nova Disciplina';
    }
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
    
    this.form?.classList.add('visible');
    
    // ADICIONAR INPUT IMEDIATAMENTE - Múltiplas tentativas para garantir
    this.addSyllabusInput();
    
    // Garantir que o syllabus seja adicionado após o formulário estar visível
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
   * Fecha o formulário
   */
  private closeForm(): void {
    this.form?.classList.remove('visible');
    this.editingId = null;
  }

  /**
   * Adiciona um input de syllabus
   */
  private addSyllabusInput(value = ''): void {
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
    
    // Garantir que o input seja visível e interativo - FORÇAR COM ESTILOS INLINE
    input.style.cssText = `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      width: 100% !important;
      min-width: 200px !important;
      padding: 12px !important;
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 8px !important;
      color: #ffffff !important;
      font-size: 1rem !important;
      font-family: inherit !important;
      box-sizing: border-box !important;
      cursor: text !important;
      flex: 1 !important;
    `;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', 'Remover item');
    
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

    const discipline: Discipline = {
      code: (formData.get('code') as string) || id.toUpperCase(),
      title: formData.get('title') as string,
      period: period,
      description: formData.get('description') as string,
      color: color,
      progress: parseInt(formData.get('progress') as string, 10),
      position: {
        x: parseInt(formData.get('positionX') as string, 10) || 50,
        y: parseInt(formData.get('positionY') as string, 10) || 50,
      },
      prerequisites: this.getSelectedPrerequisites(),
      syllabus: syllabus,
      icon:
        (formData.get('icon') as string) ||
        `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="40" fill="none" stroke="${formData.get('color')}" stroke-width="10"/></svg>`,
    };

    // Se estiver editando e o ID mudou, remove o antigo
    if (this.editingId && this.editingId !== id) {
      dataService.deleteDiscipline(this.editingId);
    }

    dataService.saveDiscipline(id, discipline);
    this.closeForm();
    this.refreshDisciplinesList();
    this.updatePrerequisitesSelect();

    // Disparar evento customizado para atualizar a UI
    window.dispatchEvent(new CustomEvent('disciplines-updated'));
  }

  /**
   * Edita uma disciplina
   */
  editDiscipline(id: string): void {
    const discipline = dataService.getDiscipline(id);
    if (!discipline) return;

    this.editingId = id;
    const title = document.getElementById('form-title');
    if (title) title.textContent = 'Editar Disciplina';

    const idInput = document.getElementById('discipline-id') as HTMLInputElement;
    if (idInput) idInput.value = id;

    (document.getElementById('discipline-title') as HTMLInputElement).value = discipline.title;
    (document.getElementById('discipline-period') as HTMLInputElement).value = String(discipline.period);
    (document.getElementById('discipline-description') as HTMLTextAreaElement).value =
      discipline.description;
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
    (document.getElementById('discipline-progress') as HTMLInputElement).value = String(
      discipline.progress
    );
    (document.getElementById('discipline-position-x') as HTMLInputElement).value = String(
      discipline.position.x
    );
    (document.getElementById('discipline-position-y') as HTMLInputElement).value = String(
      discipline.position.y
    );
    (document.getElementById('discipline-icon') as HTMLTextAreaElement).value =
      discipline.icon || '';

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

    this.updatePrerequisitesSelect();
    this.initColorPicker();
    this.form?.classList.add('visible');
    this.form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      item.innerHTML = `
        <div class="discipline-item-info">
          <h3>${this.escapeHtml(discipline.title)}</h3>
          <p>Período: ${this.escapeHtml(String(discipline.period))} | Progresso: ${discipline.progress}%</p>
        </div>
        <div class="discipline-item-actions">
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
  private initColorPicker(): void {
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
  private updatePrerequisitesSelect(): void {
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
}
