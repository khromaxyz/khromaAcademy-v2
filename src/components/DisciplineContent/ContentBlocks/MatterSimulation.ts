import Matter from 'matter-js';

/**
 * Interface para configuração de simulação Matter.js
 */
interface MatterConfig {
  type?: 'gravity' | 'pendulum' | 'collision' | 'stack' | 'custom';
  width?: number;
  height?: number;
  gravity?: { x: number; y: number };
  showControls?: boolean;
}

/**
 * Componente para simulações de física com Matter.js
 */
export class MatterSimulation {
  private engine: Matter.Engine;
  private render: Matter.Render;
  private runner: Matter.Runner;
  private container: HTMLElement;
  private config: MatterConfig;

  constructor(container: HTMLElement, config: MatterConfig = {}) {
    this.container = container;
    this.config = {
      type: config.type || 'gravity',
      width: config.width || container.clientWidth || 800,
      height: config.height || 500,
      gravity: config.gravity || { x: 0, y: 1 },
      showControls: config.showControls !== false,
    };

    // Criar engine
    this.engine = Matter.Engine.create();
    this.engine.world.gravity.x = this.config.gravity!.x;
    this.engine.world.gravity.y = this.config.gravity!.y;

    // Criar renderer
    this.render = Matter.Render.create({
      element: container,
      engine: this.engine,
      options: {
        width: this.config.width!,
        height: this.config.height!,
        wireframes: false,
        background: 'transparent',
      },
    });

    // Aplicar estilos ao canvas
    const canvas = this.render.canvas;
    canvas.style.borderRadius = '12px';
    canvas.style.border = '2px solid rgba(255,255,255,0.1)';

    // Criar runner
    this.runner = Matter.Runner.create();

    // Criar simulação baseada no tipo
    this.createSimulation(this.config.type!);

    // Iniciar renderização
    Matter.Render.run(this.render);
    Matter.Runner.run(this.runner, this.engine);

    // Adicionar controles se habilitado
    if (this.config.showControls) {
      this.addControls();
    }
  }

  /**
   * Cria simulação baseada no tipo
   */
  private createSimulation(type: string): void {
    const { width, height } = this.config;

    // Paredes
    const wallOptions = {
      isStatic: true,
      render: { fillStyle: 'rgba(255,255,255,0.1)' },
    };

    const ground = Matter.Bodies.rectangle(width! / 2, height! - 10, width!, 20, wallOptions);
    const leftWall = Matter.Bodies.rectangle(10, height! / 2, 20, height!, wallOptions);
    const rightWall = Matter.Bodies.rectangle(
      width! - 10,
      height! / 2,
      20,
      height!,
      wallOptions
    );

    Matter.World.add(this.engine.world, [ground, leftWall, rightWall]);

    switch (type) {
      case 'gravity':
        this.createGravitySimulation();
        break;
      case 'pendulum':
        this.createPendulumSimulation();
        break;
      case 'collision':
        this.createCollisionSimulation();
        break;
      case 'stack':
        this.createStackSimulation();
        break;
    }
  }

  /**
   * Simulação de gravidade com objetos caindo
   */
  private createGravitySimulation(): void {
    const { width, height } = this.config;
    const colors = ['#41ff41', '#41ffff', '#ff41ff', '#ffff41', '#ff4141'];

    // Criar objetos de formas variadas
    for (let i = 0; i < 10; i++) {
      const x = width! * (0.2 + Math.random() * 0.6);
      const y = height! * (0.1 + Math.random() * 0.3);
      const size = 20 + Math.random() * 30;
      const color = colors[Math.floor(Math.random() * colors.length)];

      let body;
      const shape = Math.floor(Math.random() * 3);

      if (shape === 0) {
        // Círculo
        body = Matter.Bodies.circle(x, y, size / 2, {
          restitution: 0.8,
          render: { fillStyle: color },
        });
      } else if (shape === 1) {
        // Quadrado
        body = Matter.Bodies.rectangle(x, y, size, size, {
          restitution: 0.6,
          render: { fillStyle: color },
        });
      } else {
        // Polígono
        body = Matter.Bodies.polygon(x, y, 6, size / 2, {
          restitution: 0.7,
          render: { fillStyle: color },
        });
      }

      Matter.World.add(this.engine.world, body);
    }
  }

  /**
   * Simulação de pêndulo
   */
  private createPendulumSimulation(): void {
    const { width, height } = this.config;

    // Ponto fixo
    const anchor = Matter.Bodies.circle(width! / 2, 50, 5, {
      isStatic: true,
      render: { fillStyle: '#ffffff' },
    });

    // Bob do pêndulo
    const bob = Matter.Bodies.circle(width! / 2, height! / 2, 30, {
      density: 0.005,
      render: { fillStyle: '#41ff41' },
    });

    // Corda (constraint)
    const rope = Matter.Constraint.create({
      bodyA: anchor,
      bodyB: bob,
      length: height! / 2 - 50,
      stiffness: 0.9,
      render: { strokeStyle: '#ffffff', lineWidth: 2 },
    });

    Matter.World.add(this.engine.world, [anchor, bob, rope]);

    // Dar impulso inicial
    Matter.Body.setVelocity(bob, { x: 5, y: 0 });
  }

  /**
   * Simulação de colisões
   */
  private createCollisionSimulation(): void {
    const { width, height } = this.config;

    // Bola da esquerda
    const ball1 = Matter.Bodies.circle(width! * 0.2, height! / 2, 40, {
      restitution: 1,
      density: 0.001,
      render: { fillStyle: '#41ff41' },
    });

    // Bola da direita
    const ball2 = Matter.Bodies.circle(width! * 0.8, height! / 2, 40, {
      restitution: 1,
      density: 0.001,
      render: { fillStyle: '#ff4141' },
    });

    Matter.World.add(this.engine.world, [ball1, ball2]);

    // Dar velocidades opostas
    Matter.Body.setVelocity(ball1, { x: 3, y: 0 });
    Matter.Body.setVelocity(ball2, { x: -3, y: 0 });
  }

  /**
   * Simulação de empilhamento
   */
  private createStackSimulation(): void {
    const { width, height } = this.config;

    // Criar pilha de caixas
    const stack = Matter.Composites.stack(
      width! / 2 - 100,
      height! - 400,
      5,
      8,
      10,
      10,
      (x: number, y: number) => {
        return Matter.Bodies.rectangle(x, y, 40, 40, {
          render: {
            fillStyle: `hsl(${Math.random() * 360}, 70%, 60%)`,
          },
        });
      }
    );

    Matter.World.add(this.engine.world, stack);
  }

  /**
   * Adiciona controles interativos
   */
  private addControls(): void {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'matter-controls';
    controlsContainer.style.cssText = `
      display: flex;
      gap: 0.5em;
      margin-top: 1em;
      justify-content: center;
      flex-wrap: wrap;
    `;

    // Botão Play/Pause
    const playPauseBtn = document.createElement('button');
    playPauseBtn.className = 'matter-btn';
    playPauseBtn.innerHTML = '⏸️ Pausar';
    let isPaused = false;

    playPauseBtn.onclick = () => {
      if (isPaused) {
        Matter.Runner.run(this.runner, this.engine);
        playPauseBtn.innerHTML = '⏸️ Pausar';
      } else {
        Matter.Runner.stop(this.runner);
        playPauseBtn.innerHTML = '▶️ Continuar';
      }
      isPaused = !isPaused;
    };

    // Botão Reset
    const resetBtn = document.createElement('button');
    resetBtn.className = 'matter-btn';
    resetBtn.innerHTML = '🔄 Reiniciar';
    resetBtn.onclick = () => this.reset();

    // Controle de Gravidade
    const gravityControl = document.createElement('div');
    gravityControl.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5em;
    `;

    const gravityLabel = document.createElement('span');
    gravityLabel.textContent = 'Gravidade:';
    gravityLabel.style.fontSize = '0.9em';

    const gravitySlider = document.createElement('input');
    gravitySlider.type = 'range';
    gravitySlider.min = '0';
    gravitySlider.max = '2';
    gravitySlider.step = '0.1';
    gravitySlider.value = String(this.engine.world.gravity.y);
    gravitySlider.style.width = '100px';

    gravitySlider.oninput = (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      this.engine.world.gravity.y = value;
    };

    gravityControl.appendChild(gravityLabel);
    gravityControl.appendChild(gravitySlider);

    controlsContainer.appendChild(playPauseBtn);
    controlsContainer.appendChild(resetBtn);
    controlsContainer.appendChild(gravityControl);

    this.container.appendChild(controlsContainer);
  }

  /**
   * Reinicia a simulação
   */
  private reset(): void {
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
    this.createSimulation(this.config.type!);
  }

  /**
   * Para e limpa a simulação
   */
  cleanup(): void {
    Matter.Render.stop(this.render);
    Matter.Runner.stop(this.runner);
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
    this.render.canvas.remove();
  }

  /**
   * Método estático para criar e inicializar uma simulação
   */
  static create(container: HTMLElement, config: MatterConfig = {}): MatterSimulation {
    return new MatterSimulation(container, config);
  }

  /**
   * Processa todos os elementos com atributo data-matter
   */
  static processAll(container: HTMLElement): void {
    const matterElements = container.querySelectorAll('[data-matter]');

    matterElements.forEach((el) => {
      try {
        const configAttr = el.getAttribute('data-matter');
        if (!configAttr) return;

        const config = JSON.parse(configAttr) as MatterConfig;
        MatterSimulation.create(el as HTMLElement, config);
      } catch (error) {
        console.error('Erro ao processar simulação Matter.js:', error);
        (el as HTMLElement).innerHTML = `
          <div class="matter-error">
            <strong>⚠️ Erro ao carregar simulação</strong>
            <p>Não foi possível processar a configuração da simulação física.</p>
          </div>
        `;
      }
    });
  }
}

