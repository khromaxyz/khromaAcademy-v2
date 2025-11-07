import { Canvas, Circle, Rect, IText } from 'fabric';

/**
 * Interface para configuração do Fabric Canvas
 */
interface FabricConfig {
  width?: number;
  height?: number;
  mode?: 'draw' | 'shapes' | 'free';
  background?: string;
}

/**
 * Componente para desenho interativo com Fabric.js
 */
export class FabricCanvas {
  private canvas: Canvas;
  private container: HTMLElement;

  constructor(container: HTMLElement, config: FabricConfig = {}) {
    this.container = container;
    
    const width = config.width || container.clientWidth || 800;
    const height = config.height || 500;

    // Criar elemento canvas
    const canvasEl = document.createElement('canvas');
    canvasEl.id = `fabric-canvas-${Date.now()}`;
    canvasEl.width = width;
    canvasEl.height = height;
    container.appendChild(canvasEl);

    // Inicializar Fabric canvas
    this.canvas = new Canvas(canvasEl, {
      backgroundColor: config.background || '#1a1a1a',
    });

    this.setupTools();
    
    if (config.mode === 'draw') {
      this.enableDrawing();
    }
  }

  /**
   * Configura ferramentas de desenho
   */
  private setupTools(): void {
    const toolbar = document.createElement('div');
    toolbar.className = 'fabric-toolbar';
    toolbar.style.cssText = `
      display: flex;
      gap: 0.5em;
      margin-top: 1em;
      flex-wrap: wrap;
    `;

    // Botão Desenhar
    const drawBtn = this.createButton('✏️ Desenhar', () => this.enableDrawing());
    
    // Botão Selecionar
    const selectBtn = this.createButton('👆 Selecionar', () => this.disableDrawing());
    
    // Botão Adicionar Círculo
    const circleBtn = this.createButton('⭕ Círculo', () => this.addCircle());
    
    // Botão Adicionar Retângulo
    const rectBtn = this.createButton('⬜ Retângulo', () => this.addRectangle());
    
    // Botão Adicionar Texto
    const textBtn = this.createButton('📝 Texto', () => this.addText());
    
    // Botão Limpar
    const clearBtn = this.createButton('🗑️ Limpar', () => this.clear());
    
    // Seletor de Cor
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#41ff41';
    colorPicker.className = 'fabric-color-picker';
    colorPicker.onchange = (e) => {
      const color = (e.target as HTMLInputElement).value;
      const activeObj = this.canvas.getActiveObject();
      if (activeObj) {
        activeObj.set('fill', color);
        this.canvas.renderAll();
      }
    };

    toolbar.appendChild(drawBtn);
    toolbar.appendChild(selectBtn);
    toolbar.appendChild(circleBtn);
    toolbar.appendChild(rectBtn);
    toolbar.appendChild(textBtn);
    toolbar.appendChild(clearBtn);
    toolbar.appendChild(colorPicker);

    this.container.appendChild(toolbar);
  }

  /**
   * Cria um botão de ferramenta
   */
  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'fabric-btn';
    btn.innerHTML = text;
    btn.onclick = onClick;
    return btn;
  }

  /**
   * Habilita modo de desenho livre
   */
  private enableDrawing(): void {
    this.canvas.isDrawingMode = true;
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = '#41ff41';
      this.canvas.freeDrawingBrush.width = 3;
    }
  }

  /**
   * Desabilita modo de desenho
   */
  private disableDrawing(): void {
    this.canvas.isDrawingMode = false;
  }

  /**
   * Adiciona um círculo
   */
  private addCircle(): void {
    const circle = new Circle({
      radius: 50,
      fill: '#41ff41',
      left: 100,
      top: 100,
    });
    this.canvas.add(circle);
  }

  /**
   * Adiciona um retângulo
   */
  private addRectangle(): void {
    const rect = new Rect({
      width: 100,
      height: 60,
      fill: '#41ffff',
      left: 150,
      top: 150,
    });
    this.canvas.add(rect);
  }

  /**
   * Adiciona texto
   */
  private addText(): void {
    const text = new IText('Clique para editar', {
      left: 100,
      top: 50,
      fontSize: 20,
      fill: '#ffffff',
      fontFamily: 'Inter, sans-serif',
    });
    this.canvas.add(text);
  }

  /**
   * Limpa o canvas
   */
  private clear(): void {
    this.canvas.clear();
    this.canvas.backgroundColor = '#1a1a1a';
    this.canvas.renderAll();
  }

  /**
   * Exporta como imagem
   */
  exportImage(): string {
    return this.canvas.toDataURL({ format: 'png', multiplier: 1 });
  }

  /**
   * Método estático para criar e inicializar um canvas
   */
  static create(container: HTMLElement, config: FabricConfig = {}): FabricCanvas {
    return new FabricCanvas(container, config);
  }

  /**
   * Processa todos os elementos com atributo data-fabric
   */
  static processAll(container: HTMLElement): void {
    const fabricElements = container.querySelectorAll('[data-fabric]');

    fabricElements.forEach((el) => {
      try {
        const configAttr = el.getAttribute('data-fabric');
        if (!configAttr) return;

        const config = JSON.parse(configAttr) as FabricConfig;
        FabricCanvas.create(el as HTMLElement, config);
      } catch (error) {
        console.error('Erro ao processar Fabric Canvas:', error);
        (el as HTMLElement).innerHTML = `
          <div class="fabric-error">
            <strong>⚠️ Erro ao carregar canvas</strong>
            <p>Não foi possível processar a configuração do canvas de desenho.</p>
          </div>
        `;
      }
    });
  }
}

