import type { Discipline } from '@/types';
import { dataService } from '@/services';
import { 
  nextFrame, 
  staggerAnimation, 
  fadeInUp, 
  createRipple,
  DURATIONS 
} from '@/utils/animations';
import { TransitionProgressBar } from '@/utils/pageTransitions';
import { LoadingButton } from '@/components/LoadingStates';
import './Modal.css';

/**
 * Componente Modal
 */
export class Modal {
  private backdrop: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private content: HTMLElement | null = null;
  private closeBtn: HTMLElement | null = null;
  private activeCard: HTMLElement | null = null;

  /**
   * Inicializa o modal
   */
  init(): void {
    this.backdrop = document.querySelector('.modal-backdrop');
    this.container = document.querySelector('.modal-container');
    this.content = document.querySelector('.modal-content-inner');
    this.closeBtn = document.querySelector('.modal-close-btn');

    this.closeBtn?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());
  }

  /**
   * Abre o modal com dados de uma disciplina
   */
  open(id: string, discipline: Discipline, triggerElement: HTMLElement): void {
    if (!this.container || !this.content || !this.backdrop) return;

    this.activeCard = triggerElement;
    const startRect = triggerElement.getBoundingClientRect();

    // Calcular estatísticas do curso
    const totalModules = discipline.syllabus.length;
    const estimatedHours = totalModules * 2; // 2h por módulo (estimativa)
    const completedModules = Math.floor((totalModules * discipline.progress) / 100);

    // Verificar pré-requisitos
    const prerequisites = discipline.prerequisites.length > 0;
    const allDisciplines = dataService.getAllDisciplines();
    const prerequisitesHtml = prerequisites
      ? `
      <div class="modal-section prerequisites-section stagger-3">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Pré-requisitos
        </h3>
        <div class="prerequisites-list">
          ${discipline.prerequisites
            .map((prereqId) => {
              const prereq = allDisciplines[prereqId];
              return prereq
                ? `<span class="prerequisite-tag">${prereq.title}</span>`
                : `<span class="prerequisite-tag">${prereqId}</span>`;
            })
            .join('')}
        </div>
      </div>
    `
      : '';

    // Preview do primeiro módulo
    const firstModule = discipline.syllabus[0] || 'Introdução ao curso';

    // Criar conteúdo do modal MELHORADO
    this.content.innerHTML = `
      <div class="modal-header">
        <div class="modal-header-content">
          <h2 class="modal-title-animated">${discipline.title}</h2>
          <p class="modal-description stagger-1">${discipline.description}</p>
          <div class="modal-meta stagger-2">
            <span class="modal-period">Período ${discipline.period}</span>
            <span class="modal-progress-badge">${discipline.progress}% Concluído</span>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div class="modal-main-content">
          <!-- Preview do Curso -->
          <div class="modal-section course-preview stagger-1">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Visão Geral
            </h3>
            <div class="course-stats">
              <div class="stat-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <div class="stat-info">
                  <div class="stat-value">${totalModules}</div>
                  <div class="stat-label">Módulos</div>
                </div>
              </div>
              <div class="stat-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <div class="stat-info">
                  <div class="stat-value">~${estimatedHours}h</div>
                  <div class="stat-label">Duração</div>
                </div>
              </div>
              <div class="stat-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <div class="stat-info">
                  <div class="stat-value">${completedModules}/${totalModules}</div>
                  <div class="stat-label">Completos</div>
                </div>
              </div>
            </div>
            
            <!-- Próximo Módulo -->
            <div class="next-module-preview">
              <div class="next-module-badge">Próximo Módulo</div>
              <div class="next-module-title">${firstModule}</div>
              <div class="next-module-meta">
                <span class="module-duration">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  ~2h
                </span>
              </div>
            </div>
            
            <!-- Recursos do Curso -->
            <div class="course-resources">
              <div class="resource-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Vídeos
              </div>
              <div class="resource-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Docs
              </div>
              <div class="resource-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                Código
              </div>
              <div class="resource-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                Exercícios
              </div>
            </div>
          </div>

          <!-- Conteúdo do Curso -->
          <div class="modal-section stagger-2">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Conteúdo do Curso
            </h3>
            <ul class="syllabus-list">${discipline.syllabus
              .map((item, index) => `<li class="syllabus-item"><span class="syllabus-number">${index + 1}</span><span>${item}</span></li>`)
              .join('')}</ul>
          </div>

          ${prerequisitesHtml}
        </div>

        <div class="modal-sidebar">
          <!-- Progress Card -->
          <div class="modal-progress-card stagger-1">
            <h3>Seu Progresso</h3>
            <div class="progress-visual">
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle class="progress-circle-bg" cx="50" cy="50" r="45" stroke-width="8" fill="none"></circle>
                <circle class="progress-circle-fg" cx="50" cy="50" r="45" stroke-width="8" fill="none" stroke-dasharray="283" stroke-dashoffset="283"></circle>
              </svg>
              <div class="progress-percentage">${discipline.progress}%</div>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${discipline.progress}%"></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions stagger-2">
            <h3>Ações</h3>
            <div class="modal-actions-buttons">
              <button class="btn-start-course shimmer-button pulse-button" data-action="start-course">
                <span class="btn-shimmer"></span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Começar Curso
              </button>
              <button class="btn-secondary" data-action="view-docs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Ver Documentação
              </button>
              <button class="btn-secondary" data-action="download-material">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                </svg>
                Baixar Material
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Garantir que o conteúdo esteja visível
    this.content.style.opacity = '1';

    // Configurar event listeners
    this.setupActionButtons(id);
    this.setupRippleEffect();

    // FLIP animation
    this.container.classList.add('no-transition');
    this.container.style.left = `${startRect.left}px`;
    this.container.style.top = `${startRect.top}px`;
    this.container.style.width = `${startRect.width}px`;
    this.container.style.height = `${startRect.height}px`;

    this.backdrop.classList.add('visible');
    triggerElement.style.opacity = '0';
    document.body.classList.add('modal-open');

    // Animar para posição final
    nextFrame().then(() => {
      if (!this.container) return;
      this.container.classList.remove('no-transition');
      this.container.classList.add('visible');

      this.container.style.left = '5vw';
      this.container.style.top = '5vh';
      this.container.style.width = '90vw';
      this.container.style.height = '90vh';

      // Stagger animations nos elementos internos
      setTimeout(() => {
        this.animateModalContent();
        
        // Animar progresso circular
        const progressCircle = this.container?.querySelector('.progress-circle-fg') as HTMLElement;
        if (progressCircle) {
          const offset = 283 - (283 * discipline.progress) / 100;
          progressCircle.style.strokeDashoffset = String(offset);
        }
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('modal-opened'));
      }, 300);
    });
  }

  /**
   * Configura ripple effect nos botões
   */
  private setupRippleEffect(): void {
    const buttons = this.content?.querySelectorAll('button');
    buttons?.forEach((button) => {
      button.addEventListener('click', (e) => {
        createRipple(e as MouseEvent, button as HTMLElement);
      });
    });
  }

  /**
   * Anima elementos do modal com stagger
   */
  private animateModalContent(): void {
    if (!this.container) return;

    const staggerElements = Array.from(
      this.container.querySelectorAll<HTMLElement>('.stagger-1, .stagger-2, .stagger-3, .syllabus-item')
    );

    staggerAnimation(
      staggerElements,
      (el) => fadeInUp(el, DURATIONS.medium, 30),
      80
    );
  }

  /**
   * Fecha o modal
   */
  close(): void {
    if (!this.activeCard || !this.container || !this.backdrop) return;

    const startRect = this.activeCard.getBoundingClientRect();
    this.container.style.left = `${startRect.left}px`;
    this.container.style.top = `${startRect.top}px`;
    this.container.style.width = `${startRect.width}px`;
    this.container.style.height = `${startRect.height}px`;

    this.backdrop.classList.remove('visible');
    if (this.content) {
      this.content.style.opacity = '0';
    }
    document.body.classList.remove('modal-open');

    this.container.addEventListener(
      'transitionend',
      () => {
        this.container?.classList.remove('visible');
        this.activeCard!.style.opacity = '1';
        this.activeCard = null;
        
        // Disparar evento para atualizar cursor
        window.dispatchEvent(new CustomEvent('modal-closed'));
      },
      { once: true }
    );
  }

  /**
   * Configura os botões de ação do modal
   */
  private setupActionButtons(disciplineId: string): void {
    const buttons = this.content?.querySelectorAll('[data-action]');
    buttons?.forEach((button) => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = button.getAttribute('data-action');
        await this.handleAction(action || '', disciplineId);
      });
    });
  }

  /**
   * Manipula ações dos botões
   */
  private async handleAction(action: string, disciplineId: string): Promise<void> {
    const discipline = dataService.getDiscipline(disciplineId);
    if (!discipline) return;

    switch (action) {
      case 'start-course': {
        // Encontrar o botão que foi clicado
        const startButton = this.content?.querySelector('.btn-start-course') as HTMLButtonElement;
        
        if (!startButton) {
          console.error('❌ Botão "Começar Curso" não encontrado!');
          return;
        }

        // Criar loading button e progress bar
        const loadingBtn = new LoadingButton(startButton);
        const progressBar = new TransitionProgressBar();

        try {
          console.log('🚀 Iniciando curso:', discipline.title);
          
          // Iniciar loading
          loadingBtn.start('Carregando...');
          progressBar.start();
          
          // Aguardar um pouco
          await new Promise(resolve => setTimeout(resolve, 300));
          
          console.log('📦 Importando módulo...');
          // Importar módulo de conteúdo
          const module = await import('@/components/DisciplineContent/DisciplineContent');
          
          if (!module || !module.DisciplineContent) {
            throw new Error('Módulo DisciplineContent não encontrado');
          }
          
          console.log('✅ Módulo importado');
          
          const content = module.DisciplineContent.getInstance();
          console.log('📋 Instância obtida');
          
          // Renderizar
          console.log('🎨 Renderizando...');
          content.init();
          await content.render(discipline, disciplineId);
          
          // Completar progress
          progressBar.complete();
          
          // Aguardar DOM
          await new Promise(resolve => requestAnimationFrame(resolve));
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Mostrar
          console.log('👁️ Mostrando...');
          
          // Fechar modal diretamente (sem animação para o card)
          if (this.container && this.backdrop) {
            this.container.style.opacity = '0';
            this.container.style.transform = 'scale(0.95)';
            this.backdrop.classList.remove('visible');
            document.body.classList.remove('modal-open');
            
            setTimeout(() => {
              if (this.container && this.content) {
                this.container.style.display = 'none';
                if (this.activeCard) {
                  this.activeCard.style.opacity = '1';
                }
              }
            }, 300);
          }
          
          content.show();
          
          console.log('✨ Sucesso!');
          
        } catch (error) {
          console.error('❌ ERRO:', error);
          console.error('Stack:', (error as Error).stack);
          alert(`Erro: ${(error as Error).message}`);
        } finally {
          // SEMPRE limpar
          console.log('🧹 Limpando...');
          try {
            loadingBtn.stop();
            progressBar.destroy();
            console.log('✅ Limpo');
          } catch (e) {
            console.error('❌ Erro na limpeza:', e);
            // Force reset
            startButton.disabled = false;
            startButton.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Começar Curso
            `;
          }
        }
        break;
      }
      case 'view-docs':
        console.log('Ver documentação:', disciplineId);
        break;
      case 'download-material':
        console.log('Baixar material:', disciplineId);
        break;
      case 'view-progress':
        console.log('Ver progresso detalhado:', disciplineId);
        break;
    }
  }

  /**
   * Retorna o modal para ser usado por outros componentes
   */
  static getInstance(): Modal {
    return modalInstance;
  }
}

// Singleton instance
const modalInstance = new Modal();

