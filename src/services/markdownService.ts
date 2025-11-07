import MarkdownIt from 'markdown-it';
import markdownItKatex from 'markdown-it-katex';
import 'katex/dist/katex.min.css';

/**
 * Serviço para renderização de Markdown com suporte a LaTeX
 */
class MarkdownService {
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str, lang) => {
        // Integrar com Prism.js se disponível
        if (typeof window !== 'undefined' && (window as any).Prism) {
          const Prism = (window as any).Prism;
          if (lang && Prism.languages[lang]) {
            try {
              return `<pre class="language-${lang}"><code class="language-${lang}">${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>`;
            } catch (e) {
              console.warn('Erro ao highlight código:', e);
            }
          }
        }
        // Fallback sem highlight
        return `<pre class="language-${lang || 'text'}"><code class="language-${lang || 'text'}">${this.escapeHtml(str)}</code></pre>`;
      },
    });

    // Adicionar plugin KaTeX para renderização de LaTeX
    this.md.use(markdownItKatex, {
      throwOnError: false,
      errorColor: '#cc0000',
    });
  }

  /**
   * Renderiza markdown para HTML
   */
  render(markdown: string): string {
    try {
      return this.md.render(markdown);
    } catch (error) {
      console.error('Erro ao renderizar markdown:', error);
      return `<div class="error">Erro ao renderizar conteúdo</div>`;
    }
  }

  /**
   * Renderiza markdown inline (sem tags de bloco)
   */
  renderInline(markdown: string): string {
    try {
      return this.md.renderInline(markdown);
    } catch (error) {
      console.error('Erro ao renderizar markdown inline:', error);
      return markdown;
    }
  }

  /**
   * Escapa HTML para evitar XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Singleton instance
export const markdownService = new MarkdownService();

