import cytoscape, { Core, ElementDefinition } from 'cytoscape';

/**
 * Interface para configuração de grafos
 */
interface GraphConfig {
  nodes: Array<{ id: string; label?: string; color?: string }>;
  edges: Array<{
    source: string;
    target: string;
    label?: string;
    weight?: number;
    color?: string;
  }>;
  layout?: 'circle' | 'grid' | 'random' | 'cose' | 'breadthfirst' | 'concentric';
  directed?: boolean;
  interactive?: boolean;
  title?: string;
  description?: string;
}

/**
 * Serviço para visualização de grafos com Cytoscape.js
 */
class CytoscapeService {
  private instances: Map<string, Core> = new Map();

  /**
   * Cria um grafo interativo
   */
  create(container: HTMLElement, config: GraphConfig): Core {
    const instanceId = `graph-${Date.now()}`;

    // Converter nodes e edges para o formato Cytoscape
    const elements: ElementDefinition[] = [
      // Nodes
      ...config.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label || node.id,
        },
        style: node.color
          ? {
              'background-color': node.color,
              'border-color': this.lightenColor(node.color, 20),
            }
          : {},
      })),
      // Edges
      ...config.edges.map((edge) => ({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: edge.label || (edge.weight ? String(edge.weight) : ''),
          weight: edge.weight,
        },
        style: edge.color ? { 'line-color': edge.color } : {},
      })),
    ];

    // Criar instância Cytoscape
    const cy = cytoscape({
      container: container,
      elements: elements,
      layout: {
        name: config.layout || 'cose',
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 50,
      },
      style: this.getDefaultStyle(config.directed || false) as any,
      minZoom: 0.5,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    // Tornar interativo se habilitado
    if (config.interactive !== false) {
      this.makeInteractive(cy);
    }

    this.instances.set(instanceId, cy);
    return cy;
  }

  /**
   * Estilo padrão para grafos
   */
  private getDefaultStyle(directed: boolean) {
    return [
      {
        selector: 'node',
        style: {
          'background-color': '#41ff41',
          'border-color': '#52ff52',
          'border-width': 3,
          label: 'data(label)',
          color: '#ffffff',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '16px',
          'font-weight': 'bold',
          'font-family': 'Inter, sans-serif',
          width: 50,
          height: 50,
          'text-outline-width': 2,
          'text-outline-color': '#000000',
        },
      },
      {
        selector: 'node:active',
        style: {
          'background-color': '#52ff52',
          'border-width': 5,
          'overlay-opacity': 0.2,
        },
      },
      {
        selector: 'node.highlighted',
        style: {
          'background-color': '#ff41ff',
          'border-color': '#ff52ff',
          'border-width': 5,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 3,
          'line-color': '#41ffff',
          'target-arrow-color': '#41ffff',
          'target-arrow-shape': directed ? 'triangle' : 'none',
          'curve-style': 'bezier',
          label: 'data(label)',
          color: '#ffffff',
          'font-size': '14px',
          'font-weight': 'bold',
          'text-outline-width': 2,
          'text-outline-color': '#000000',
          'text-background-color': '#000000',
          'text-background-opacity': 0.7,
          'text-background-padding': '3px',
        },
      },
      {
        selector: 'edge:active',
        style: {
          width: 5,
          'line-color': '#52ffff',
        },
      },
      {
        selector: 'edge.highlighted',
        style: {
          width: 5,
          'line-color': '#ff41ff',
          'target-arrow-color': '#ff41ff',
        },
      },
    ];
  }

  /**
   * Torna o grafo interativo
   */
  private makeInteractive(cy: Core): void {
    // Highlight ao passar o mouse
    cy.on('mouseover', 'node', function (evt) {
      const node = evt.target;
      node.addClass('highlighted');
      // Highlight arestas conectadas
      node.connectedEdges().addClass('highlighted');
    });

    cy.on('mouseout', 'node', function (evt) {
      const node = evt.target;
      node.removeClass('highlighted');
      node.connectedEdges().removeClass('highlighted');
    });

    // Feedback visual ao clicar
    cy.on('tap', 'node', function (evt) {
      const node = evt.target;
      console.log('Nó clicado:', node.data('label'));
    });

    cy.on('tap', 'edge', function (evt) {
      const edge = evt.target;
      console.log(
        'Aresta clicada:',
        edge.data('source'),
        '→',
        edge.data('target'),
        edge.data('weight') ? `(peso: ${edge.data('weight')})` : ''
      );
    });
  }

  /**
   * Clareia uma cor em hexadecimal
   */
  private lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  /**
   * Processa todos os elementos com atributo data-graph
   */
  processAll(container: HTMLElement): void {
    const graphElements = container.querySelectorAll('[data-graph]');

    graphElements.forEach((el) => {
      try {
        const configAttr = el.getAttribute('data-graph');
        if (!configAttr) return;

        const config = JSON.parse(configAttr) as GraphConfig;

        // Criar wrapper para o grafo
        const wrapper = document.createElement('div');
        wrapper.className = 'cytoscape-graph-wrapper';

        // Adicionar título se existir
        if (config.title) {
          const title = document.createElement('h4');
          title.className = 'cytoscape-graph-title';
          title.textContent = config.title;
          wrapper.appendChild(title);
        }

        // Adicionar descrição se existir
        if (config.description) {
          const desc = document.createElement('p');
          desc.className = 'cytoscape-graph-description';
          desc.textContent = config.description;
          wrapper.appendChild(desc);
        }

        // Container do grafo
        const graphContainer = document.createElement('div');
        graphContainer.className = 'cytoscape-graph';
        graphContainer.style.width = '100%';
        graphContainer.style.height = '500px';
        wrapper.appendChild(graphContainer);

        // Controles
        if (config.interactive !== false) {
          const controls = this.createControls(graphContainer, config);
          wrapper.appendChild(controls);
        }

        // Substituir elemento original
        el.replaceWith(wrapper);

        // Criar grafo e armazenar referência
        const cy = this.create(graphContainer, config);
        (graphContainer as any)._cy = cy;
      } catch (error) {
        console.error('Erro ao processar grafo Cytoscape:', error);
        (el as HTMLElement).innerHTML = `
          <div class="cytoscape-error">
            <strong>⚠️ Erro ao carregar grafo</strong>
            <p>Não foi possível processar a configuração do grafo.</p>
          </div>
        `;
      }
    });
  }

  /**
   * Cria controles para o grafo
   */
  private createControls(graphContainer: HTMLElement, config: GraphConfig): HTMLElement {
    const controls = document.createElement('div');
    controls.className = 'cytoscape-controls';

    // Botões de layout
    const layouts = ['circle', 'grid', 'random', 'cose', 'breadthfirst', 'concentric'];
    const layoutButtons = layouts.map((layout) => {
      const btn = document.createElement('button');
      btn.className = 'cytoscape-btn';
      btn.textContent = this.getLayoutName(layout);
      btn.onclick = () => {
        const cy = (graphContainer as any)._cy;
        if (cy) {
          cy.layout({ name: layout, animate: true, animationDuration: 500 }).run();
        }
      };
      return btn;
    });

    // Botão Reset
    const resetBtn = document.createElement('button');
    resetBtn.className = 'cytoscape-btn cytoscape-btn-primary';
    resetBtn.textContent = '🔄 Reset';
    resetBtn.onclick = () => {
      const cy = (graphContainer as any)._cy;
      if (cy) {
        cy.fit(50);
        cy.layout({ name: config.layout || 'cose', animate: true }).run();
      }
    };

    // Adicionar botões
    const layoutGroup = document.createElement('div');
    layoutGroup.className = 'cytoscape-control-group';
    const label = document.createElement('span');
    label.textContent = 'Layout: ';
    label.style.marginRight = '0.5em';
    layoutGroup.appendChild(label);
    layoutButtons.forEach((btn) => layoutGroup.appendChild(btn));

    controls.appendChild(layoutGroup);
    controls.appendChild(resetBtn);

    // Armazenar referência diretamente
    // O Cytoscape não expõe getInstanceByContainer na API pública
    // então vamos armazenar a referência manualmente após a criação

    return controls;
  }

  /**
   * Retorna nome legível do layout
   */
  private getLayoutName(layout: string): string {
    const names: Record<string, string> = {
      circle: '⭕ Círculo',
      grid: '⬜ Grade',
      random: '🎲 Aleatório',
      cose: '🌀 Força',
      breadthfirst: '📊 BFS',
      concentric: '🎯 Concêntrico',
    };
    return names[layout] || layout;
  }

  /**
   * Destrói todas as instâncias
   */
  destroyAll(): void {
    this.instances.forEach((cy) => cy.destroy());
    this.instances.clear();
  }
}

export const cytoscapeService = new CytoscapeService();

