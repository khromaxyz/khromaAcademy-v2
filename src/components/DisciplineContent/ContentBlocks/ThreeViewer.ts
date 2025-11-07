import * as THREE from 'three';

/**
 * Interface para configuração de visualizações 3D
 */
interface ThreeConfig {
  type?: 'cube' | 'sphere' | 'torus' | 'custom';
  color?: string;
  wireframe?: boolean;
  animation?: 'rotate' | 'bounce' | 'pulse' | 'none';
  width?: number;
  height?: number;
}

/**
 * Componente para renderizar visualizações 3D interativas com Three.js
 */
export class ThreeViewer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh: THREE.Mesh;
  private animationId: number | null = null;
  private config: ThreeConfig;

  constructor(container: HTMLElement, config: ThreeConfig = {}) {
    const width = config.width || container.clientWidth || 800;
    const height = config.height || 400;
    const color = config.color || '#41ff41';
    const type = config.type || 'cube';
    
    this.config = {
      type: type,
      color: color,
      wireframe: config.wireframe || false,
      animation: config.animation || 'rotate',
      width: width,
      height: height,
    };

    // Criar cena
    this.scene = new THREE.Scene();

    // Criar câmera
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    this.camera.position.z = 3;

    // Criar renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    // Criar geometria baseada no tipo
    const geometry = this.createGeometry(type);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      wireframe: this.config.wireframe,
      emissive: color,
      emissiveIntensity: 0.2,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    // Adicionar iluminação
    this.setupLights();

    // Adicionar interatividade (rotação com mouse)
    this.setupInteractivity(container);

    // Iniciar animação
    if (this.config.animation !== 'none') {
      this.animate();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Cria a geometria baseada no tipo especificado
   */
  private createGeometry(type: string): THREE.BufferGeometry {
    switch (type) {
      case 'sphere':
        return new THREE.SphereGeometry(1, 32, 32);
      case 'torus':
        return new THREE.TorusGeometry(1, 0.4, 16, 100);
      case 'cube':
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  /**
   * Configura a iluminação da cena
   */
  private setupLights(): void {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Luz pontual
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    this.scene.add(pointLight);

    // Luz direcional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(-10, 10, 5);
    this.scene.add(directionalLight);
  }

  /**
   * Configura interatividade com mouse
   */
  private setupInteractivity(container: HTMLElement): void {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      this.mesh.rotation.y += deltaX * 0.01;
      this.mesh.rotation.x += deltaY * 0.01;

      previousMousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
    });

    container.addEventListener('mouseup', () => {
      isDragging = false;
    });

    container.addEventListener('mouseleave', () => {
      isDragging = false;
    });

    // Suporte para toque (mobile)
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    });

    container.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;

      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      this.mesh.rotation.y += deltaX * 0.01;
      this.mesh.rotation.x += deltaY * 0.01;

      previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      e.preventDefault();
    });

    container.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  /**
   * Loop de animação
   */
  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Aplicar animação baseada no tipo
    switch (this.config.animation) {
      case 'rotate':
        this.mesh.rotation.x += 0.005;
        this.mesh.rotation.y += 0.01;
        break;
      case 'bounce':
        this.mesh.position.y = Math.sin(Date.now() * 0.002) * 0.5;
        this.mesh.rotation.y += 0.01;
        break;
      case 'pulse':
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
        this.mesh.scale.set(scale, scale, scale);
        this.mesh.rotation.y += 0.005;
        break;
    }

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Limpa recursos e para a animação
   */
  cleanup(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    }
  }

  /**
   * Método estático para criar e inicializar um viewer
   */
  static create(container: HTMLElement, config: ThreeConfig = {}): ThreeViewer {
    return new ThreeViewer(container, config);
  }
}

