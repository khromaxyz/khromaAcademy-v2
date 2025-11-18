/**
 * Serviço para renderização LaTeX usando KaTeX auto-render
 * Garante renderização perfeita igual ao arquivo de teste
 * 
 * IMPORTANTE: Este serviço processa TODAS as fórmulas LaTeX no HTML,
 * mesmo que já tenham sido processadas anteriormente (remove e reprocessa)
 */

// Importar KaTeX e auto-render
import katex from 'katex';
// @ts-ignore - auto-render não tem tipos TypeScript oficiais, mas funciona
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - auto-render não tem tipos
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs';

/**
 * Configuração do auto-render (igual ao teste)
 * Configuração otimizada para renderização perfeita
 */
const AUTO_RENDER_OPTIONS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
  ],
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  output: 'html' as const,
  fleqn: false,
  leqno: false,
  // Ignorar elementos já processados pelo KaTeX
  ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
  // Ignorar classes específicas se necessário
  ignoredClasses: [],
  // Processar também dentro de elementos específicos
  errorCallback: (msg: string, err: Error) => {
    console.warn('⚠️ [LatexService] Erro ao renderizar fórmula LaTeX:', msg, err);
  },
};

class LatexService {
  /**
   * Remove fórmulas LaTeX já processadas (elementos .katex) e restaura o texto original
   * Isso permite reprocessar fórmulas que podem ter sido processadas incorretamente
   */
  private unprocessLatex(element: HTMLElement): void {
    // Encontrar todos os elementos .katex que foram processados
    const katexElements = Array.from(element.querySelectorAll('.katex'));
    
    katexElements.forEach((katexEl) => {
      try {
        // Tentar extrair o texto LaTeX original do elemento
        const textNode = katexEl.textContent || '';
        
        // Se o elemento tem um atributo data-original, usar ele
        const original = katexEl.getAttribute('data-original-latex');
        const latexToRestore = original || textNode;
        
        if (latexToRestore) {
          // Determinar se é display ou inline baseado na classe
          const displayMode = katexEl.classList.contains('katex-display') || 
                             katexEl.parentElement?.classList.contains('katex-display');
          const delimiter = displayMode ? '$$' : '$';
          
          // Restaurar o texto original com delimitadores
          // Criar um nó de texto temporário para substituir
          const textNodeElement = document.createTextNode(`${delimiter}${latexToRestore}${delimiter}`);
          katexEl.parentNode?.replaceChild(textNodeElement, katexEl);
        }
      } catch (error) {
        // Se houver erro ao desprocessar, apenas remover o elemento
        console.warn('⚠️ [LatexService] Erro ao desprocessar elemento LaTeX:', error);
        katexEl.remove();
      }
    });
  }

  /**
   * Renderiza fórmulas LaTeX em um elemento HTML
   * Usa auto-render do KaTeX para garantir renderização perfeita
   * Remove e reprocessa fórmulas já processadas para garantir correção
   */
  render(element: HTMLElement): void {
    if (!element) {
      console.warn('⚠️ [LatexService] Elemento não fornecido para renderização LaTeX');
      return;
    }

    try {
      // Verificar se KaTeX está disponível
      if (typeof katex === 'undefined' || typeof renderMathInElement === 'undefined') {
        console.error('❌ [LatexService] KaTeX ou auto-render não está disponível!');
        return;
      }

      // Primeiro, remover fórmulas já processadas incorretamente
      // Isso garante que fórmulas malformadas sejam reprocessadas
      this.unprocessLatex(element);

      // Renderizar fórmulas usando auto-render
      // O auto-render vai processar TODAS as fórmulas encontradas
      renderMathInElement(element, AUTO_RENDER_OPTIONS);
      
      console.log('✅ [LatexService] Fórmulas LaTeX processadas com sucesso');
    } catch (error) {
      console.error('❌ [LatexService] Erro ao renderizar LaTeX:', error);
    }
  }

  /**
   * Renderiza uma fórmula LaTeX específica e retorna o HTML
   * Usado para renderização programática de fórmulas individuais
   */
  renderToString(latex: string, displayMode: boolean = false): string {
    try {
      if (typeof katex === 'undefined') {
        console.error('❌ [LatexService] KaTeX não está disponível!');
        return latex;
      }

      // Remover delimitadores se presentes
      let cleanLatex = latex.trim();
      if (cleanLatex.startsWith('$$') && cleanLatex.endsWith('$$')) {
        cleanLatex = cleanLatex.slice(2, -2).trim();
        displayMode = true;
      } else if (cleanLatex.startsWith('$') && cleanLatex.endsWith('$')) {
        cleanLatex = cleanLatex.slice(1, -1).trim();
        displayMode = false;
      }

      return katex.renderToString(cleanLatex, {
        throwOnError: false,
        errorColor: '#cc0000',
        displayMode,
        strict: false,
        output: 'html',
        fleqn: false,
        leqno: false,
      });
    } catch (error) {
      console.error('❌ [LatexService] Erro ao renderizar fórmula:', error);
      return latex;
    }
  }

  /**
   * Verifica se uma string contém fórmulas LaTeX
   */
  containsLatex(text: string): boolean {
    const latexPatterns = [
      /\$\$[\s\S]*?\$\$/, // Display math
      /\$[^$\n]+\$/, // Inline math
      /\\\[[\s\S]*?\\\]/, // Display math (LaTeX style)
      /\\\([\s\S]*?\\\)/, // Inline math (LaTeX style)
    ];

    return latexPatterns.some(pattern => pattern.test(text));
  }
}

// Singleton instance
export const latexService = new LatexService();

