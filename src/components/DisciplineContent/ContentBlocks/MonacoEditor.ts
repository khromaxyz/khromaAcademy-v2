import * as monaco from 'monaco-editor';

/**
 * Interface para configuração do Monaco Editor
 */
interface MonacoConfig {
  language?: string;
  code?: string;
  theme?: string;
  readOnly?: boolean;
  minimap?: boolean;
  lineNumbers?: boolean;
  height?: number;
}

/**
 * Componente para editor de código interativo com Monaco Editor
 */
export class MonacoEditorBlock {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement, config: MonacoConfig = {}) {
    this.container = container;

    // Configuração padrão
    const defaultCode = config.code || '// Escreva seu código aqui\n';
    const language = config.language || 'javascript';
    const theme = config.theme || 'vs-dark';
    const height = config.height || 400;

    // Criar container para o editor
    const editorContainer = document.createElement('div');
    editorContainer.className = 'monaco-editor-container';
    editorContainer.style.height = `${height}px`;
    editorContainer.style.border = '2px solid rgba(255,255,255,0.1)';
    editorContainer.style.borderRadius = '8px';
    editorContainer.style.overflow = 'hidden';

    container.appendChild(editorContainer);

    // Configurar Monaco Editor
    this.editor = monaco.editor.create(editorContainer, {
      value: defaultCode,
      language: language,
      theme: theme,
      readOnly: config.readOnly || false,
      minimap: {
        enabled: config.minimap !== false,
      },
      lineNumbers: config.lineNumbers !== false ? 'on' : 'off',
      automaticLayout: true,
      fontSize: 14,
      fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
      scrollBeyondLastLine: false,
      roundedSelection: true,
      padding: { top: 10, bottom: 10 },
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      wordWrap: 'on',
    });

    // Adicionar botões de ação se não for read-only
    if (!config.readOnly) {
      this.addActionButtons(container);
    }
  }

  /**
   * Adiciona botões de ação (executar, limpar, copiar)
   */
  private addActionButtons(container: HTMLElement): void {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'monaco-actions';
    buttonContainer.style.cssText = `
      display: flex;
      gap: 0.5em;
      margin-top: 1em;
      justify-content: flex-end;
    `;

    // Botão Executar
    const runBtn = document.createElement('button');
    runBtn.className = 'monaco-btn monaco-btn-primary';
    runBtn.innerHTML = '▶️ Executar';
    runBtn.onclick = () => this.runCode();

    // Botão Limpar
    const clearBtn = document.createElement('button');
    clearBtn.className = 'monaco-btn monaco-btn-secondary';
    clearBtn.innerHTML = '🗑️ Limpar';
    clearBtn.onclick = () => this.clearCode();

    // Botão Copiar
    const copyBtn = document.createElement('button');
    copyBtn.className = 'monaco-btn monaco-btn-secondary';
    copyBtn.innerHTML = '📋 Copiar';
    copyBtn.onclick = () => this.copyCode();

    buttonContainer.appendChild(runBtn);
    buttonContainer.appendChild(clearBtn);
    buttonContainer.appendChild(copyBtn);

    container.appendChild(buttonContainer);

    // Container para output
    const outputContainer = document.createElement('div');
    outputContainer.className = 'monaco-output';
    outputContainer.id = `output-${Date.now()}`;
    outputContainer.style.cssText = `
      margin-top: 1em;
      padding: 1em;
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      border-left: 4px solid #41ff41;
      display: none;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
    `;
    container.appendChild(outputContainer);
  }

  /**
   * Executa o código (apenas JavaScript/TypeScript por enquanto)
   */
  private runCode(): void {
    if (!this.editor) return;

    const code = this.editor.getValue();
    const outputContainer = this.container.querySelector('.monaco-output') as HTMLElement;

    if (!outputContainer) return;

    outputContainer.style.display = 'block';
    outputContainer.innerHTML = '<strong>📤 Output:</strong>\n';

    // Capturar console.log
    const originalLog = console.log;
    const logs: string[] = [];

    console.log = (...args: any[]) => {
      logs.push(args.map((arg) => String(arg)).join(' '));
      originalLog.apply(console, args);
    };

    try {
      // Executar código
      // eslint-disable-next-line no-eval
      const result = eval(code);

      if (logs.length > 0) {
        outputContainer.innerHTML += logs.join('\n');
      }

      if (result !== undefined) {
        outputContainer.innerHTML += `\n\n<strong>↩️ Retorno:</strong> ${String(result)}`;
      }

      outputContainer.style.borderLeftColor = '#41ff41';
    } catch (error: any) {
      outputContainer.innerHTML += `\n<strong style="color: #ff4141">❌ Erro:</strong>\n${error.message}`;
      outputContainer.style.borderLeftColor = '#ff4141';
    } finally {
      // Restaurar console.log
      console.log = originalLog;
    }
  }

  /**
   * Limpa o código do editor
   */
  private clearCode(): void {
    if (!this.editor) return;
    this.editor.setValue('// Escreva seu código aqui\n');

    const outputContainer = this.container.querySelector('.monaco-output') as HTMLElement;
    if (outputContainer) {
      outputContainer.style.display = 'none';
      outputContainer.innerHTML = '';
    }
  }

  /**
   * Copia o código para a área de transferência
   */
  private async copyCode(): Promise<void> {
    if (!this.editor) return;

    const code = this.editor.getValue();

    try {
      await navigator.clipboard.writeText(code);
      // Feedback visual
      const copyBtn = this.container.querySelector(
        '.monaco-btn:nth-child(3)'
      ) as HTMLButtonElement;
      if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅ Copiado!';
        copyBtn.disabled = true;

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.disabled = false;
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao copiar código:', error);
    }
  }

  /**
   * Obtém o valor atual do editor
   */
  getValue(): string {
    return this.editor?.getValue() || '';
  }

  /**
   * Define um novo valor no editor
   */
  setValue(code: string): void {
    this.editor?.setValue(code);
  }

  /**
   * Destroi o editor e libera recursos
   */
  dispose(): void {
    this.editor?.dispose();
    this.editor = null;
  }

  /**
   * Método estático para criar e inicializar um editor
   */
  static create(container: HTMLElement, config: MonacoConfig = {}): MonacoEditorBlock {
    return new MonacoEditorBlock(container, config);
  }

  /**
   * Processa todos os elementos com atributo data-monaco
   */
  static processAll(container: HTMLElement): void {
    const monacoElements = container.querySelectorAll('[data-monaco]');

    monacoElements.forEach((el) => {
      try {
        const configAttr = el.getAttribute('data-monaco');
        if (!configAttr) return;

        const config = JSON.parse(configAttr) as MonacoConfig;
        MonacoEditorBlock.create(el as HTMLElement, config);
      } catch (error) {
        console.error('Erro ao processar Monaco Editor:', error);
        (el as HTMLElement).innerHTML = `
          <div class="monaco-error">
            <strong>⚠️ Erro ao carregar editor</strong>
            <p>Não foi possível processar a configuração do editor.</p>
          </div>
        `;
      }
    });
  }
}

