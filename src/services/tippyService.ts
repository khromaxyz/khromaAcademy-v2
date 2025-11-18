/**
 * Serviço para processar tooltips Tippy.js
 */

/**
 * Processa todos os elementos com atributo data-tippy
 */
export function processTippyTooltips(container: HTMLElement): void {
  const tippyElements = container.querySelectorAll('[data-tippy]');
  
  if (tippyElements.length === 0) return;

  // Verificar se Tippy está disponível
  if (typeof window === 'undefined' || !(window as any).tippy) {
    console.warn('⚠️ Tippy.js não está disponível. Carregando...');
    loadTippy().then(() => {
      processTippyTooltips(container);
    });
    return;
  }

  const tippy = (window as any).tippy;

  tippyElements.forEach((element) => {
    try {
      const content = element.getAttribute('data-tippy');
      if (!content) return;

      tippy(element as HTMLElement, {
        content,
        theme: 'khroma',
        placement: 'top',
        animation: 'fade',
        duration: [200, 150],
        arrow: true,
        interactive: false,
        allowHTML: false,
      });
    } catch (error) {
      console.error('Erro ao processar tooltip Tippy:', error);
    }
  });
}

/**
 * Carrega Tippy.js dinamicamente
 */
async function loadTippy(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).tippy) {
      resolve();
      return;
    }

    // Carregar CSS primeiro
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/tippy.js@6.3.7/dist/tippy.css';
    document.head.appendChild(link);

    // Carregar JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/tippy.js@6.3.7/dist/tippy.umd.min.js';
    script.onload = () => {
      // Criar tema customizado
      if ((window as any).tippy) {
        (window as any).tippy.setDefaultProps({
          theme: 'khroma',
        });
      }
      resolve();
    };
    script.onerror = () => reject(new Error('Falha ao carregar Tippy.js'));
    document.head.appendChild(script);
  });
}

