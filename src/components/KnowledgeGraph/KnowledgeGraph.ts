import type { Discipline } from '@/types';

/**
 * Componente KnowledgeGraph
 */
export class KnowledgeGraph {
  private svg: SVGElement | null = null;
  private container: HTMLElement | null = null;
  private graphWrapper: HTMLElement | null = null;
  private allDisciplines: Record<string, Discipline> = {};
  private activePeriods: Set<number | string> = new Set();
  private prerequisiteDepths: Map<string, number> = new Map();
  
  // Zoom e Pan
  private scale: number = 1;
  private translateX: number = 0;
  private translateY: number = 0;
  private isPanning: boolean = false;
  private startX: number = 0;
  private startY: number = 0;

  /**
   * Inicializa o grafo
   */
  init(): void {
    this.container = document.querySelector('.knowledge-graph');
    this.svg = document.querySelector('.knowledge-graph-svg');
    this.graphWrapper = document.querySelector('.graph-wrapper');
    
    // Se não existir wrapper, criar
    if (!this.graphWrapper && this.container) {
      this.createGraphWrapper();
    }
    
    this.setupZoomAndPan();
    this.renderZoomControls();
  }

  /**
   * Cria o wrapper interno para o grafo
   */
  private createGraphWrapper(): void {
    if (!this.container || !this.svg) return;

    // Criar wrapper
    this.graphWrapper = document.createElement('div');
    this.graphWrapper.className = 'graph-wrapper';
    
    // Mover SVG para dentro do wrapper
    this.container.insertBefore(this.graphWrapper, this.svg);
    this.graphWrapper.appendChild(this.svg);
  }

  /**
   * Renderiza controles de zoom
   */
  private renderZoomControls(): void {
    if (!this.container) return;

    const existingControls = this.container.querySelector('.zoom-controls');
    if (existingControls) return;

    const controls = document.createElement('div');
    controls.className = 'zoom-controls';
    controls.innerHTML = `
      <button class="zoom-btn zoom-in" title="Zoom In (Scroll Up)">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
        </svg>
      </button>
      <button class="zoom-btn zoom-reset" title="Reset (Double Click)">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z"/>
        </svg>
      </button>
      <button class="zoom-btn zoom-out" title="Zoom Out (Scroll Down)">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M19,13H5V11H19V13Z"/>
        </svg>
      </button>
      <div class="zoom-indicator">${Math.round(this.scale * 100)}%</div>
    `;

    this.container.appendChild(controls);

    // Event listeners
    controls.querySelector('.zoom-in')?.addEventListener('click', () => {
      this.scale = Math.min(3, this.scale * 1.2);
      this.applyTransform();
      this.updateZoomIndicator();
    });

    controls.querySelector('.zoom-out')?.addEventListener('click', () => {
      this.scale = Math.max(0.3, this.scale * 0.8);
      this.applyTransform();
      this.updateZoomIndicator();
    });

    controls.querySelector('.zoom-reset')?.addEventListener('click', () => {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.applyTransform();
      this.updateZoomIndicator();
    });
  }

  /**
   * Atualiza indicador de zoom
   */
  private updateZoomIndicator(): void {
    const indicator = this.container?.querySelector('.zoom-indicator');
    if (indicator) {
      indicator.textContent = `${Math.round(this.scale * 100)}%`;
    }
  }

  /**
   * Configura zoom e pan
   */
  private setupZoomAndPan(): void {
    if (!this.container) return;

    // Zoom com scroll
    this.container.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.scale *= delta;
      this.scale = Math.max(0.3, Math.min(3, this.scale));
      this.applyTransform();
      this.updateZoomIndicator();
    });

    // Pan com mouse drag
    this.container.addEventListener('mousedown', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('graph-node') || 
          target.closest('.graph-node') ||
          target.closest('.zoom-controls')) {
        return;
      }
      this.isPanning = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
      this.container!.style.cursor = 'grabbing';
    });

    this.container.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isPanning) return;
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.applyTransform();
    });

    this.container.addEventListener('mouseup', () => {
      this.isPanning = false;
      this.container!.style.cursor = 'grab';
    });

    this.container.addEventListener('mouseleave', () => {
      this.isPanning = false;
      this.container!.style.cursor = 'grab';
    });

    // Reset com duplo clique
    this.container.addEventListener('dblclick', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('graph-node') || target.closest('.graph-node')) {
        return;
      }
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.applyTransform();
      this.updateZoomIndicator();
    });

    this.container.style.cursor = 'grab';
  }

  /**
   * Aplica transformação de zoom/pan
   */
  private applyTransform(): void {
    if (!this.graphWrapper) return;
    
    // Aplicar transformação apenas no wrapper (move tudo junto)
    this.graphWrapper.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    this.graphWrapper.style.transformOrigin = '0 0';
  }

  /**
   * Renderiza o grafo com todas as disciplinas
   */
  render(disciplines: Record<string, Discipline>): void {
    if (!this.container || !this.svg) return;

    this.allDisciplines = disciplines;
    
    // Garantir que o wrapper existe
    if (!this.graphWrapper) {
      this.createGraphWrapper();
    }
    
    // Inicializar todos os períodos como ativos
    if (this.activePeriods.size === 0) {
      Object.values(disciplines).forEach((d) => {
        if (typeof d.period === 'number' || d.period === 'Demo') {
          this.activePeriods.add(d.period);
        }
      });
    }

    // Renderizar filtros
    this.renderFilters();

    // Filtrar disciplinas
    const filteredDisciplines = this.getFilteredDisciplines();

    // Limpar nós existentes
    const existingNodes = this.graphWrapper?.querySelectorAll('.graph-node') || [];
    existingNodes.forEach((node) => node.remove());

    // Renderizar nós dentro do wrapper
    Object.entries(filteredDisciplines).forEach(([id, discipline]) => {
      const node = document.createElement('div');
      node.className = 'graph-node link';
      node.setAttribute('data-id', id);
      node.setAttribute('data-period', String(discipline.period));
      node.setAttribute('data-code', discipline.code);
      node.style.left = `${discipline.position.x}%`;
      node.style.top = `${discipline.position.y}%`;
      
      // Conteúdo do nó
      node.innerHTML = `
        <div class="node-code">${discipline.code}</div>
        <div class="node-title">${discipline.title}</div>
        ${typeof discipline.period === 'number' ? `<div class="node-period">P${discipline.period}</div>` : ''}
      `;
      
      this.graphWrapper?.appendChild(node);
    });

    // Renderizar linhas (pré-requisitos)
    this.renderLines(filteredDisciplines);

    // Adicionar interatividade
    this.attachInteractivity();
  }

  /**
   * Renderiza os filtros por período
   */
  private renderFilters(): void {
    // Verificar se já existe container de filtros
    let filtersContainer = document.querySelector('.filters-container') as HTMLElement;
    
    if (!filtersContainer) {
      filtersContainer = document.createElement('div');
      filtersContainer.className = 'filters-container';
      this.container?.parentElement?.insertBefore(filtersContainer, this.container);
    }

    // Obter períodos únicos
    const periods = new Set<number | string>();
    Object.values(this.allDisciplines).forEach((d) => {
      periods.add(d.period);
    });

    const sortedPeriods = Array.from(periods).sort((a, b) => {
      if (a === 'Demo') return 1;
      if (b === 'Demo') return -1;
      return Number(a) - Number(b);
    });

    // Contar disciplinas
    const visibleCount = Object.keys(this.getFilteredDisciplines()).length;
    const totalCount = Object.keys(this.allDisciplines).length;

    filtersContainer.innerHTML = `
      <div class="filters-header">
        <h3>Filtrar por Período</h3>
        <div class="filters-counter">${visibleCount} de ${totalCount} disciplinas</div>
      </div>
      <div class="filters-buttons">
        ${sortedPeriods
          .map((period) => {
            const isActive = this.activePeriods.has(period);
            const count = Object.values(this.allDisciplines).filter((d) => d.period === period).length;
            const label = period === 'Demo' ? 'Demo' : `${period}º Período`;
            return `
              <button 
                class="filter-btn ${isActive ? 'active' : ''}" 
                data-period="${period}"
              >
                ${label}
                <span class="filter-count">(${count})</span>
              </button>
            `;
          })
          .join('')}
      </div>
      <div class="filters-actions">
        <button class="filter-action-btn" data-action="all">Mostrar Todas</button>
        <button class="filter-action-btn" data-action="clear">Limpar Filtros</button>
      </div>
    `;

    // Adicionar event listeners
    filtersContainer.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const period = (e.currentTarget as HTMLElement).dataset.period;
        if (period) {
          this.togglePeriodFilter(period === 'Demo' ? 'Demo' : Number(period));
        }
      });
    });

    filtersContainer.querySelectorAll('.filter-action-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        if (action === 'all') {
          this.showAllPeriods();
        } else if (action === 'clear') {
          this.clearFilters();
        }
      });
    });
  }

  /**
   * Alterna o filtro de um período
   */
  private togglePeriodFilter(period: number | string): void {
    if (this.activePeriods.has(period)) {
      this.activePeriods.delete(period);
    } else {
      this.activePeriods.add(period);
    }
    this.render(this.allDisciplines);
  }

  /**
   * Mostra todas as disciplinas
   */
  private showAllPeriods(): void {
    this.activePeriods.clear();
    Object.values(this.allDisciplines).forEach((d) => {
      this.activePeriods.add(d.period);
    });
    this.render(this.allDisciplines);
  }

  /**
   * Limpa todos os filtros
   */
  private clearFilters(): void {
    this.activePeriods.clear();
    this.render(this.allDisciplines);
  }

  /**
   * Retorna disciplinas filtradas baseado nos períodos ativos
   */
  private getFilteredDisciplines(): Record<string, Discipline> {
    if (this.activePeriods.size === 0) {
      return {};
    }

    const filtered: Record<string, Discipline> = {};
    Object.entries(this.allDisciplines).forEach(([id, discipline]) => {
      if (this.activePeriods.has(discipline.period)) {
        filtered[id] = discipline;
      }
    });
    return filtered;
  }

  /**
   * Renderiza linhas de pré-requisitos
   */
  private renderLines(disciplines: Record<string, Discipline>): void {
    if (!this.svg) return;

    this.svg.innerHTML = '';
    Object.entries(disciplines).forEach(([id, discipline]) => {
      discipline.prerequisites.forEach((prereqCode) => {
        // Encontrar disciplina pré-requisito pelo código
        const prereqEntry = Object.entries(this.allDisciplines).find(
          ([, d]) => d.code === prereqCode
        );

        if (prereqEntry) {
          const [prereqId, prereq] = prereqEntry;
          
          // Só renderizar se ambas as disciplinas estão visíveis
          if (disciplines[prereqId]) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'graph-line');
            line.setAttribute('data-from', prereqId);
            line.setAttribute('data-to', id);
            line.setAttribute('x1', `${prereq.position.x}%`);
            line.setAttribute('y1', `${prereq.position.y}%`);
            line.setAttribute('x2', `${discipline.position.x}%`);
            line.setAttribute('y2', `${discipline.position.y}%`);
            this.svg?.appendChild(line);
          }
        }
      });
    });
  }

  /**
   * Calcula profundidade de pré-requisitos usando BFS
   */
  private calculatePrerequisiteDepth(disciplineCode: string): Map<string, number> {
    const depths = new Map<string, number>();
    const queue: Array<{ code: string; depth: number }> = [{ code: disciplineCode, depth: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current.code)) continue;
      visited.add(current.code);

      if (current.depth > 0) {
        depths.set(current.code, current.depth);
      }

      // Encontrar disciplina pelo código
      const discipline = Object.values(this.allDisciplines).find((d) => d.code === current.code);
      
      if (discipline && discipline.prerequisites) {
        discipline.prerequisites.forEach((prereqCode) => {
          if (!visited.has(prereqCode)) {
            queue.push({ code: prereqCode, depth: current.depth + 1 });
          }
        });
      }
    }

    return depths;
  }

  /**
   * Adiciona interatividade aos nós do grafo
   */
  private attachInteractivity(): void {
    const nodes = document.querySelectorAll('.graph-node');
    const lines = document.querySelectorAll('.graph-line');

    nodes.forEach((node) => {
      const nodeId = node.getAttribute('data-id');
      const nodeCode = node.getAttribute('data-code');
      if (!nodeId) return;

      node.addEventListener('mouseenter', () => {
        // Calcular profundidade de pré-requisitos
        if (nodeCode) {
          this.prerequisiteDepths = this.calculatePrerequisiteDepth(nodeCode);
        }

        // Destacar nó atual
        node.classList.add('highlighted');

        // Destacar pré-requisitos com efeito degradê
        nodes.forEach((n) => {
          const nCode = n.getAttribute('data-code');
          if (nCode && this.prerequisiteDepths.has(nCode)) {
            const depth = this.prerequisiteDepths.get(nCode)!;
            n.classList.add('prerequisite');
            n.setAttribute('data-depth', String(depth));
          }
        });

        // Destacar linhas conectadas
        lines.forEach((line) => {
          const fromId = line.getAttribute('data-from');
          const toId = line.getAttribute('data-to');
          
          if (toId === nodeId || fromId === nodeId) {
            line.classList.add('highlighted');
            
            // Adicionar profundidade às linhas também
            if (fromId) {
              const fromNode = document.querySelector(`[data-id="${fromId}"]`);
              const fromCode = fromNode?.getAttribute('data-code');
              if (fromCode && this.prerequisiteDepths.has(fromCode)) {
                const depth = this.prerequisiteDepths.get(fromCode)!;
                line.setAttribute('data-depth', String(depth));
              }
            }
          }
        });
      });

      node.addEventListener('mouseleave', () => {
        node.classList.remove('highlighted');
        nodes.forEach((n) => {
          n.classList.remove('prerequisite');
          n.removeAttribute('data-depth');
        });
        lines.forEach((line) => {
          line.classList.remove('highlighted');
          line.removeAttribute('data-depth');
        });
        this.prerequisiteDepths.clear();
      });
    });
  }
}

