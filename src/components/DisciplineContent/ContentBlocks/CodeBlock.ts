/**
 * CodeBlock Component
 * Componente para exibir código com syntax highlighting e copy button
 */

import './CodeBlock.css';

export interface CodeBlockOptions {
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

/**
 * Classe CodeBlock para exibir código formatado
 */
export class CodeBlock {
  /**
   * Cria um bloco de código
   */
  static create(code: string, options: CodeBlockOptions = {}): HTMLElement {
    const {
      language = 'text',
      filename,
      showLineNumbers = true,
      highlightLines = [],
      className = ''
    } = options;

    const codeBlock = document.createElement('div');
    codeBlock.className = `code-block ${className}`.trim();

    // Header com informações e botão de copiar
    const header = document.createElement('div');
    header.className = 'code-block-header';
    header.innerHTML = `
      <div class="code-block-info">
        ${filename ? `<span class="code-block-filename">${filename}</span>` : ''}
        <span class="code-block-language">${language}</span>
      </div>
      <button class="code-block-copy-btn" title="Copiar código">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copiar
      </button>
    `;

    // Container do código
    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-block-container';

    const pre = document.createElement('pre');
    pre.className = `language-${language}`;

    const codeElement = document.createElement('code');
    codeElement.className = `language-${language}`;

    // Processar linhas
    const lines = code.trim().split('\n');
    const codeContent = lines.map((line, index) => {
      const lineNumber = index + 1;
      const isHighlighted = highlightLines.includes(lineNumber);
      const lineClass = isHighlighted ? 'code-line highlighted' : 'code-line';
      const lineNumberHtml = showLineNumbers
        ? `<span class="line-number">${lineNumber}</span>`
        : '';
      
      return `<div class="${lineClass}">${lineNumberHtml}<span class="line-content">${this.escapeHtml(line)}</span></div>`;
    }).join('');

    codeElement.innerHTML = codeContent;
    pre.appendChild(codeElement);
    codeContainer.appendChild(pre);

    // Montar estrutura
    codeBlock.appendChild(header);
    codeBlock.appendChild(codeContainer);

    // Adicionar funcionalidade de copiar
    this.setupCopyButton(codeBlock, code);

    return codeBlock;
  }

  /**
   * Configura o botão de copiar
   */
  private static setupCopyButton(codeBlock: HTMLElement, code: string): void {
    const copyBtn = codeBlock.querySelector('.code-block-copy-btn') as HTMLButtonElement;
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.trim());
        
        // Feedback visual
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copiado!
        `;
        copyBtn.classList.add('copied');

        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Erro ao copiar código:', err);
        copyBtn.textContent = 'Erro!';
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copiar
          `;
        }, 2000);
      }
    });
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Métodos de conveniência para linguagens comuns
   */
  static javascript(code: string, options?: Omit<CodeBlockOptions, 'language'>): HTMLElement {
    return this.create(code, { ...options, language: 'javascript' });
  }

  static typescript(code: string, options?: Omit<CodeBlockOptions, 'language'>): HTMLElement {
    return this.create(code, { ...options, language: 'typescript' });
  }

  static python(code: string, options?: Omit<CodeBlockOptions, 'language'>): HTMLElement {
    return this.create(code, { ...options, language: 'python' });
  }

  static html(code: string, options?: Omit<CodeBlockOptions, 'language'>): HTMLElement {
    return this.create(code, { ...options, language: 'html' });
  }

  static css(code: string, options?: Omit<CodeBlockOptions, 'language'>): HTMLElement {
    return this.create(code, { ...options, language: 'css' });
  }

  static bash(code: string, options?: Omit<CodeBlockOptions, 'language'>): HTMLElement {
    return this.create(code, { ...options, language: 'bash' });
  }

  /**
   * Inicializa todos os code blocks em um container
   */
  static initAll(_container: HTMLElement): void {
    // Método placeholder - code blocks são auto-inicializados quando criados
    // Este método existe para manter consistência na API
  }
}

