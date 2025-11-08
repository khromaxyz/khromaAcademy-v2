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

  /**
   * Inicializa o painel administrativo
   */
  init(): void {
    this.panel = document.getElementById('admin-panel');
    this.form = document.getElementById('discipline-form');
    this.formElement = document.getElementById('discipline-form-element') as HTMLFormElement;

    this.setupEventListeners();
    this.refreshDisciplinesList();
  }

  /**
   * Abre o painel administrativo
   */
  open(): void {
    this.panel?.classList.add('visible');
  }

  /**
   * Configura os event listeners
   */
  private setupEventListeners(): void {
    // Fechar painel
    document.getElementById('admin-close-btn')?.addEventListener('click', () => {
      this.panel?.classList.remove('visible');
      this.closeForm();
    });

    // Adicionar nova disciplina
    document.getElementById('btn-add-discipline')?.addEventListener('click', () => {
      this.editingId = null;
      this.openForm();
    });

    // Cancelar formulário
    document.getElementById('btn-cancel-form')?.addEventListener('click', () => {
      this.closeForm();
    });

    // Adicionar item ao syllabus
    document.getElementById('btn-add-syllabus')?.addEventListener('click', () => {
      this.addSyllabusInput();
    });

    // Salvar disciplina
    this.formElement?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveDiscipline();
    });

    // Exportar JSON
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const dataStr = dataService.exportAsJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'disciplinas.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Importar JSON
    document.getElementById('btn-import-json')?.addEventListener('click', () => {
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
            } catch (error) {
              alert(`Erro ao importar JSON: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    });
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
    const syllabusInputs = document.getElementById('syllabus-inputs');
    if (syllabusInputs) syllabusInputs.innerHTML = '';
    this.addSyllabusInput();
    this.form?.classList.add('visible');
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
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'syllabus-item';
    div.innerHTML = `
      <input type="text" value="${value}" placeholder="Tópico do syllabus">
      <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
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

    const discipline: Discipline = {
      code: (formData.get('code') as string) || id.toUpperCase(),
      title: formData.get('title') as string,
      period: period,
      description: formData.get('description') as string,
      color: formData.get('color') as string,
      progress: parseInt(formData.get('progress') as string, 10),
      position: {
        x: parseInt(formData.get('positionX') as string, 10) || 50,
        y: parseInt(formData.get('positionY') as string, 10) || 50,
      },
      prerequisites: Array.from(
        (document.getElementById('discipline-prerequisites') as HTMLSelectElement).selectedOptions
      ).map((option) => option.value),
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
    (document.getElementById('discipline-color') as HTMLInputElement).value = discipline.color;
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
      discipline.syllabus.forEach((item) => this.addSyllabusInput(item));
    }

    this.updatePrerequisitesSelect();
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
    const list = document.getElementById('disciplines-list');
    if (!list) return;

    list.innerHTML = '';
    const disciplines = dataService.getAllDisciplines();

    Object.entries(disciplines).forEach(([id, discipline]) => {
      const item = document.createElement('div');
      item.className = 'discipline-item';
      item.innerHTML = `
        <div class="discipline-item-info">
          <h3>${discipline.title}</h3>
          <p>Período: ${discipline.period} | Progresso: ${discipline.progress}%</p>
        </div>
        <div class="discipline-item-actions">
          <button class="btn-secondary" data-edit-id="${id}">Editar</button>
          <button class="btn-danger" data-delete-id="${id}">Excluir</button>
        </div>
      `;

      // Event listeners
      item.querySelector('[data-edit-id]')?.addEventListener('click', () => {
        this.editDiscipline(id);
      });
      item.querySelector('[data-delete-id]')?.addEventListener('click', () => {
        this.deleteDiscipline(id);
      });

      list.appendChild(item);
    });
  }

  /**
   * Atualiza o select de pré-requisitos
   */
  private updatePrerequisitesSelect(): void {
    const select = document.getElementById('discipline-prerequisites') as HTMLSelectElement;
    if (!select) return;

    select.innerHTML = '';
    const disciplines = dataService.getAllDisciplines();

    Object.entries(disciplines).forEach(([id, discipline]) => {
      // Não incluir a disciplina atual como pré-requisito de si mesma
      if (this.editingId && id === this.editingId) return;

      const option = document.createElement('option');
      option.value = id;
      option.textContent = discipline.title;

      // Marcar como selecionado se for pré-requisito
      if (
        this.editingId &&
        dataService.getDiscipline(this.editingId)?.prerequisites.includes(id)
      ) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  }
}

