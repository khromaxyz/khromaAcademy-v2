import Plotly from 'plotly.js-dist-min';

/**
 * Serviço para criar gráficos científicos com Plotly.js
 */
class PlotlyService {
  /**
   * Renderiza um gráfico Plotly a partir de configuração
   * @param container - Elemento HTML onde o gráfico será renderizado
   * @param data - Dados do gráfico
   * @param layout - Layout do gráfico (opcional)
   */
  render(container: HTMLElement, data: any, layout?: any): void {
    const defaultLayout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: '#ffffff',
        family: 'Inter, system-ui, sans-serif',
      },
      margin: { t: 40, r: 20, b: 40, l: 60 },
      xaxis: {
        gridcolor: 'rgba(255,255,255,0.1)',
        zerolinecolor: 'rgba(255,255,255,0.2)',
      },
      yaxis: {
        gridcolor: 'rgba(255,255,255,0.1)',
        zerolinecolor: 'rgba(255,255,255,0.2)',
      },
      ...layout,
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage'],
    };

    Plotly.newPlot(container, data, defaultLayout, config);
  }

  /**
   * Cria um gráfico de linha
   */
  createLineChart(
    container: HTMLElement,
    x: number[],
    y: number[],
    options: { title?: string; xLabel?: string; yLabel?: string } = {}
  ): void {
    const data = [
      {
        x,
        y,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: '#41ff41', size: 8 },
        line: { color: '#41ff41', width: 2 },
      },
    ];

    const layout = {
      title: options.title || '',
      xaxis: { title: options.xLabel || 'x' },
      yaxis: { title: options.yLabel || 'y' },
    };

    this.render(container, data, layout);
  }

  /**
   * Cria um gráfico de barras
   */
  createBarChart(
    container: HTMLElement,
    x: string[],
    y: number[],
    options: { title?: string; xLabel?: string; yLabel?: string } = {}
  ): void {
    const data = [
      {
        x,
        y,
        type: 'bar',
        marker: { color: '#41ff41' },
      },
    ];

    const layout = {
      title: options.title || '',
      xaxis: { title: options.xLabel || '' },
      yaxis: { title: options.yLabel || '' },
    };

    this.render(container, data, layout);
  }

  /**
   * Cria um gráfico 3D de superfície
   */
  createSurfacePlot(
    container: HTMLElement,
    z: number[][],
    options: { title?: string; colorscale?: string } = {}
  ): void {
    const data = [
      {
        z,
        type: 'surface',
        colorscale: options.colorscale || 'Viridis',
      },
    ];

    const layout = {
      title: options.title || '',
      scene: {
        xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
        yaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
        zaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
      },
    };

    this.render(container, data, layout);
  }

  /**
   * Cria um scatter plot 3D
   */
  create3DScatter(
    container: HTMLElement,
    x: number[],
    y: number[],
    z: number[],
    options: { title?: string; color?: string } = {}
  ): void {
    const data = [
      {
        x,
        y,
        z,
        mode: 'markers',
        type: 'scatter3d',
        marker: {
          size: 5,
          color: options.color || '#41ff41',
        },
      },
    ];

    const layout = {
      title: options.title || '',
      scene: {
        xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
        yaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
        zaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
      },
    };

    this.render(container, data, layout);
  }

  /**
   * Cria um heatmap
   */
  createHeatmap(
    container: HTMLElement,
    z: number[][],
    options: { title?: string; x?: string[]; y?: string[] } = {}
  ): void {
    const data = [
      {
        z,
        x: options.x,
        y: options.y,
        type: 'heatmap',
        colorscale: 'Viridis',
      },
    ];

    const layout = {
      title: options.title || '',
    };

    this.render(container, data, layout);
  }

  /**
   * Processa elementos com atributo data-plotly
   */
  processAll(container: HTMLElement): void {
    const plotlyElements = container.querySelectorAll('[data-plotly]');

    plotlyElements.forEach((el) => {
      try {
        const configAttr = el.getAttribute('data-plotly');
        if (!configAttr) return;

        const config = JSON.parse(configAttr);
        const plotContainer = document.createElement('div');
        plotContainer.className = 'plotly-chart';

        el.appendChild(plotContainer);

        // Renderizar baseado no tipo
        if (config.type === 'line' && config.x && config.y) {
          this.createLineChart(plotContainer, config.x, config.y, config.options || {});
        } else if (config.type === 'bar' && config.x && config.y) {
          this.createBarChart(plotContainer, config.x, config.y, config.options || {});
        } else if (config.type === 'surface' && config.z) {
          this.createSurfacePlot(plotContainer, config.z, config.options || {});
        } else if (config.type === '3dscatter' && config.x && config.y && config.z) {
          this.create3DScatter(
            plotContainer,
            config.x,
            config.y,
            config.z,
            config.options || {}
          );
        } else if (config.type === 'heatmap' && config.z) {
          this.createHeatmap(plotContainer, config.z, config.options || {});
        } else if (config.data && config.layout) {
          // Configuração customizada completa
          this.render(plotContainer, config.data, config.layout);
        }
      } catch (error) {
        console.error('Erro ao processar gráfico Plotly:', error);
        (el as HTMLElement).innerHTML = `
          <div class="plotly-error">
            <strong>⚠️ Erro ao carregar gráfico</strong>
            <p>Não foi possível processar a configuração do gráfico.</p>
          </div>
        `;
      }
    });
  }
}

export const plotlyService = new PlotlyService();

