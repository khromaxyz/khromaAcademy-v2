import { Chart, registerables } from 'chart.js';

// Registrar todos os componentes do Chart.js
Chart.register(...registerables);

/**
 * Serviço para criar gráficos com Chart.js
 */
class ChartService {
  private charts: Map<string, Chart> = new Map();

  /**
   * Cria um gráfico Chart.js
   */
  create(canvas: HTMLCanvasElement, config: any): Chart {
    const chartId = `chart-${Date.now()}-${Math.random()}`;
    
    // Configuração padrão com tema escuro
    const defaultConfig = {
      ...config,
      options: {
        ...config.options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...config.options?.plugins,
          legend: {
            labels: {
              color: '#ffffff',
              font: { family: 'Inter, sans-serif' },
            },
            ...config.options?.plugins?.legend,
          },
        },
        scales: {
          ...config.options?.scales,
          x: {
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#ffffff' },
            ...config.options?.scales?.x,
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.1)' },
            ticks: { color: '#ffffff' },
            ...config.options?.scales?.y,
          },
        },
      },
    };

    const chart = new Chart(canvas, defaultConfig);
    this.charts.set(chartId, chart);
    return chart;
  }

  /**
   * Processa todos os elementos com atributo data-chart
   */
  processAll(container: HTMLElement): void {
    const chartElements = container.querySelectorAll('[data-chart]');

    chartElements.forEach((el) => {
      try {
        const configAttr = el.getAttribute('data-chart');
        if (!configAttr) return;

        const config = JSON.parse(configAttr);
        
        const canvas = document.createElement('canvas');
        canvas.style.maxHeight = '400px';
        el.appendChild(canvas);

        this.create(canvas, config);
      } catch (error) {
        console.error('Erro ao processar gráfico Chart.js:', error);
        (el as HTMLElement).innerHTML = `
          <div class="chart-error">
            <strong>⚠️ Erro ao carregar gráfico</strong>
            <p>Não foi possível processar a configuração do gráfico.</p>
          </div>
        `;
      }
    });
  }

  /**
   * Destrói um gráfico específico
   */
  destroy(chartId: string): void {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.destroy();
      this.charts.delete(chartId);
    }
  }

  /**
   * Destrói todos os gráficos
   */
  destroyAll(): void {
    this.charts.forEach((chart) => chart.destroy());
    this.charts.clear();
  }
}

export const chartService = new ChartService();

