/**
 * Agents Panel Component
 * Painel principal que exibe todos os agentes disponíveis
 */

import './AgentsPanel.css';
import { PDFToDocsAgent } from './PDFToDocsAgent/PDFToDocsAgent';
import { ContentReviewAgent } from './ContentReviewAgent/ContentReviewAgent';

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  component?: any; // Componente do agente
}

export class AgentsPanel {
  private container: HTMLElement | null = null;
  private currentAgent: string | null = null;
  private pdfToDocsAgent: PDFToDocsAgent | null = null;
  private contentReviewAgent: ContentReviewAgent | null = null;

  constructor() {
    // Inicialização
  }

  /**
   * Cria o elemento do painel
   */
  create(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'agents-panel';
    panel.innerHTML = this.render();

    this.container = panel;
    this.setupEventListeners();

    return panel;
  }

  /**
   * Renderiza o HTML do painel
   */
  private render(): string {
    return `
      <div class="agents-panel-header">
        <div class="agents-panel-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <h1>Agentes</h1>
        </div>
        <p class="agents-panel-description">
          Use agentes de IA para automatizar tarefas e criar conteúdo educacional de forma inteligente.
        </p>
      </div>

      <div class="agents-panel-content">
        <!-- Agents List -->
        <div class="agents-list" id="agents-list">
          ${this.renderAgentsList()}
        </div>

        <!-- Agent View -->
        <div class="agent-view" id="agent-view" style="display: none;">
          <button class="agent-back-btn" id="agent-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Voltar
          </button>
          <div class="agent-view-content" id="agent-view-content">
            <!-- Conteúdo do agente será inserido aqui -->
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza lista de agentes
   */
  private renderAgentsList(): string {
    const agents: Agent[] = [
      {
        id: 'pdf-to-docs',
        name: 'PDF to Docs',
        description: 'Transforme PDFs em disciplinas completas automaticamente. A IA analisa o documento e cria estrutura, contexto e conteúdo educacional.',
        icon: `
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        `,
      },
      {
        id: 'content-review',
        name: 'Revisão Interativa',
        description: 'Revise disciplinas existentes adicionando elementos interativos, visuais e didáticos. Melhore a experiência de aprendizado com visualizações, animações e quizzes.',
        icon: `
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8"></path>
            <polyline points="18 2 22 6 18 10"></polyline>
            <line x1="22" y1="6" x2="12" y2="6"></line>
          </svg>
        `,
      },
      // Futuros agentes podem ser adicionados aqui
    ];

    return agents.map(agent => `
      <div class="agent-card" data-agent-id="${agent.id}">
        <div class="agent-card-icon">
          ${agent.icon}
        </div>
        <div class="agent-card-content">
          <h3 class="agent-card-name">${agent.name}</h3>
          <p class="agent-card-description">${agent.description}</p>
        </div>
        <div class="agent-card-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    `).join('');
  }

  /**
   * Configura event listeners
   */
  private setupEventListeners(): void {
    if (!this.container) return;

    const agentCards = this.container.querySelectorAll('.agent-card');
    const backBtn = this.container.querySelector('#agent-back-btn');

    // Agent card clicks
    agentCards.forEach(card => {
      card.addEventListener('click', () => {
        const agentId = card.getAttribute('data-agent-id');
        if (agentId) {
          this.openAgent(agentId);
        }
      });
    });

    // Back button
    backBtn?.addEventListener('click', () => {
      this.closeAgent();
    });

    // Event listener para abrir agente de revisão com disciplina pré-selecionada
    window.addEventListener('open-review-agent', ((e: CustomEvent) => {
      const disciplineId = e.detail?.disciplineId;
      if (disciplineId) {
        this.openAgent('content-review', { disciplineId });
      }
    }) as EventListener);

    // Verificar hash na inicialização
    this.checkHashForAgent();
  }

  /**
   * Verifica hash da URL para abrir agente automaticamente
   */
  private checkHashForAgent(): void {
    const hash = window.location.hash;
    const match = hash.match(/#agents\/([^?]+)(?:\?disciplineId=([^&]+))?/);
    if (match) {
      const agentId = match[1];
      const disciplineId = match[2];
      if (agentId === 'content-review' && disciplineId) {
        setTimeout(() => {
          this.openAgent('content-review', { disciplineId });
        }, 100);
      } else if (agentId) {
        setTimeout(() => {
          this.openAgent(agentId);
        }, 100);
      }
    }
  }

  /**
   * Abre um agente específico
   */
  private openAgent(agentId: string, options?: { disciplineId?: string }): void {
    if (!this.container) return;

    const agentsList = this.container.querySelector('#agents-list');
    const agentView = this.container.querySelector('#agent-view');
    const agentViewContent = this.container.querySelector('#agent-view-content');

    if (!agentsList || !agentView || !agentViewContent) return;

    // Hide list, show view
    agentsList.setAttribute('style', 'display: none;');
    agentView.setAttribute('style', 'display: block;');

    // Load agent component
    this.currentAgent = agentId;

    if (agentId === 'pdf-to-docs') {
      if (!this.pdfToDocsAgent) {
        this.pdfToDocsAgent = new PDFToDocsAgent();
      }
      agentViewContent.innerHTML = '';
      agentViewContent.appendChild(this.pdfToDocsAgent.create());
    } else if (agentId === 'content-review') {
      if (!this.contentReviewAgent) {
        this.contentReviewAgent = new ContentReviewAgent();
      }
      agentViewContent.innerHTML = '';
      const agentElement = this.contentReviewAgent.create();
      agentViewContent.appendChild(agentElement);
      
      // Se uma disciplina foi especificada, selecioná-la automaticamente
      if (options?.disciplineId) {
        setTimeout(() => {
          const select = agentElement.querySelector('#review-discipline-select') as HTMLSelectElement;
          if (select) {
            select.value = options.disciplineId;
            select.dispatchEvent(new Event('change'));
          }
        }, 100);
      }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Fecha o agente atual
   */
  private closeAgent(): void {
    if (!this.container) return;

    const agentsList = this.container.querySelector('#agents-list');
    const agentView = this.container.querySelector('#agent-view');

    if (!agentsList || !agentView) return;

    // Show list, hide view
    agentsList.setAttribute('style', 'display: block;');
    agentView.setAttribute('style', 'display: none;');

    this.currentAgent = null;
  }

  /**
   * Retorna o elemento
   */
  getElement(): HTMLElement | null {
    return this.container;
  }

  /**
   * Destroy
   */
  destroy(): void {
    if (this.pdfToDocsAgent) {
      this.pdfToDocsAgent.destroy();
    }
    // ContentReviewAgent não tem método destroy, mas podemos limpar a referência
    this.contentReviewAgent = null;
    this.container = null;
  }
}

