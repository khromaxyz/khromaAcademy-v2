import MarkdownIt from 'markdown-it';
// REMOVIDO: markdown-it-katex - vamos usar apenas auto-render do KaTeX para garantir renderização perfeita
import 'katex/dist/katex.min.css';

/**
 * Serviço para renderização de Markdown
 * IMPORTANTE: LaTeX NÃO é processado aqui - use latexService.render() após inserir HTML no DOM
 * Isso garante renderização perfeita usando auto-render do KaTeX (igual ao arquivo de teste)
 */
class MarkdownService {
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: false, // Desabilitado para evitar conflitos com LaTeX (smart quotes podem quebrar fórmulas)
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

    // NÃO usar markdown-it-katex - vamos processar LaTeX separadamente com auto-render
    // Isso evita conflitos e garante renderização perfeita
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
   * Extrai e parseia front matter YAML do markdown
   * Retorna o front matter como objeto e o conteúdo sem o front matter
   */
  parseFrontMatter(markdown: string): { frontMatter: Record<string, any>; content: string } {
    // Regex mais flexível: aceita --- no início, conteúdo YAML, e --- seguido de quebra de linha ou fim
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*(\n|$)([\s\S]*)$/;
    const match = markdown.match(frontMatterRegex);

    if (!match) {
      // Sem front matter, retornar conteúdo original
      return { frontMatter: {}, content: markdown };
    }

    const yamlContent = match[1].trim();
    const content = match[3] || '';

    if (!yamlContent) {
      // Front matter vazio
      return { frontMatter: {}, content };
    }

    try {
      const frontMatter = this.parseYAML(yamlContent);
      return { frontMatter, content };
    } catch (error) {
      console.warn('Erro ao parsear front matter YAML:', error);
      // Em caso de erro, retornar conteúdo sem front matter
      const fallbackContent = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*(\n|$)/, '');
      return { frontMatter: {}, content: fallbackContent };
    }
  }

  /**
   * Parseia YAML simples (suporta apenas key: value básico)
   * Para casos mais complexos, considerar usar biblioteca js-yaml
   */
  private parseYAML(yaml: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = yaml.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Ignorar linhas vazias e comentários
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Procurar padrão key: value
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) {
        continue;
      }

      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();

      // Remover aspas se houver
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      result[key] = value;
    }

    return result;
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

