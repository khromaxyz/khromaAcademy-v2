/**
 * Serviço para processar gráficos Chart.js
 */

import Chart from 'chart.js/auto';

class ChartService {
  /**
   * Processa todos os elementos com atributo data-chart
   */
  processAll(container: HTMLElement): void {
    const chartElements = container.querySelectorAll('[data-chart]');
    
    chartElements.forEach((element) => {
      try {
        const configAttr = element.getAttribute('data-chart');
        if (!configAttr) return;

        const config = JSON.parse(configAttr);
        
        // Limpar conteúdo anterior
        element.innerHTML = '';
        
        const canvas = document.createElement('canvas');
        element.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configurar Chart.js
        const chartConfig: any = {
          type: config.type || 'bar',
          data: config.data || {},
          options: {
            ...config.options,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...config.options?.plugins,
              legend: {
                display: config.options?.legend !== false,
                ...config.options?.legend,
              },
            },
          },
        };

        new Chart(ctx, chartConfig);
      } catch (error) {
        console.error('Erro ao processar gráfico Chart.js:', error);
        (element as HTMLElement).innerHTML = `
          <div class="chart-error" style="padding: 20px; background: rgba(255, 65, 65, 0.1); border: 1px solid rgba(255, 65, 65, 0.3); border-radius: 5px; color: #ff4141;">
            <strong>⚠️ Erro ao carregar gráfico</strong>
            <p>Não foi possível processar a configuração do gráfico.</p>
          </div>
        `;
      }
    });
  }
}

export const chartService = new ChartService();
