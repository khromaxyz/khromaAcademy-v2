import mermaid from 'mermaid';

/**
 * Serviço para renderizar diagramas Mermaid
 */
class MermaidService {
  private initialized = false;

  /**
   * Inicializa o Mermaid.js com configurações padrão
   */
  init(): void {
    if (!this.initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#41ff41',
          primaryTextColor: '#fff',
          primaryBorderColor: '#41ff41',
          lineColor: '#41ff41',
          secondaryColor: '#ff41ff',
          tertiaryColor: '#41ffff',
          background: '#0a0a0a',
          mainBkg: '#1a1a1a',
          secondBkg: '#2a2a2a',
          darkMode: true,
        },
      });
      this.initialized = true;
    }
  }

  /**
   * Renderiza todos os diagramas Mermaid dentro de um elemento
   * @param element - Elemento HTML que contém os blocos de código Mermaid
   */
  async render(element: HTMLElement): Promise<void> {
    this.init();
    const mermaidElements = element.querySelectorAll('.language-mermaid');

    for (let i = 0; i < mermaidElements.length; i++) {
      const el = mermaidElements[i] as HTMLElement;
      const code = el.textContent || '';
      const id = `mermaid-${Date.now()}-${i}`;

      try {
        const { svg } = await mermaid.render(id, code);
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-diagram';
        wrapper.innerHTML = svg;
        
        // Substituir o elemento <pre> inteiro pelo diagrama renderizado
        const preElement = el.closest('pre');
        if (preElement) {
          preElement.replaceWith(wrapper);
        } else {
          el.parentElement?.replaceWith(wrapper);
        }
      } catch (error) {
        console.error('Erro ao renderizar diagrama Mermaid:', error);
        // Manter o código original em caso de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mermaid-error';
        errorDiv.innerHTML = `<strong>Erro ao renderizar diagrama:</strong> ${error}`;
        el.parentElement?.insertAdjacentElement('afterend', errorDiv);
      }
    }
  }
}

export const mermaidService = new MermaidService();

