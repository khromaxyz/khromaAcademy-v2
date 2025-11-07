/**
 * Page Transitions System
 * Sistema de transições de página com View Transitions API e fallback
 */

import { DURATIONS, EASINGS, fadeOut, fadeIn, nextFrame } from './animations';

/**
 * Verifica se o navegador suporta View Transitions API
 */
export function supportsViewTransitions(): boolean {
  return 'startViewTransition' in document;
}

/**
 * Executa uma transição de página usando View Transitions API (se disponível)
 */
export async function transitionPage(
  updateCallback: () => Promise<void> | void
): Promise<void> {
  // @ts-ignore - View Transitions API ainda não está nos tipos do TS
  if (supportsViewTransitions() && document.startViewTransition) {
    // @ts-ignore
    const transition = document.startViewTransition(async () => {
      await updateCallback();
    });
    
    try {
      await transition.finished;
    } catch (e) {
      // Transição foi cancelada ou houve erro
      console.warn('View transition cancelled or failed:', e);
    }
  } else {
    // Fallback para navegadores sem suporte
    await updateCallback();
  }
}

/**
 * Transição com fade personalizado
 */
export async function transitionWithFade(
  fromElement: HTMLElement,
  toElement: HTMLElement,
  duration = DURATIONS.medium
): Promise<void> {
  // Fade out elemento antigo
  await fadeOut(fromElement, duration);
  
  // Esconder antigo
  fromElement.style.display = 'none';
  
  // Mostrar novo
  toElement.style.display = 'block';
  toElement.style.opacity = '0';
  
  // Fade in elemento novo
  await fadeIn(toElement, duration);
}

/**
 * Transição com slide
 */
export async function transitionWithSlide(
  fromElement: HTMLElement,
  toElement: HTMLElement,
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  duration = DURATIONS.medium
): Promise<void> {
  const directionMap = {
    left: { from: 'translateX(0)', to: 'translateX(-100%)', enter: 'translateX(100%)' },
    right: { from: 'translateX(0)', to: 'translateX(100%)', enter: 'translateX(-100%)' },
    up: { from: 'translateY(0)', to: 'translateY(-100%)', enter: 'translateY(100%)' },
    down: { from: 'translateY(0)', to: 'translateY(100%)', enter: 'translateY(-100%)' }
  };

  const transforms = directionMap[direction];

  // Preparar elemento novo
  toElement.style.display = 'block';
  toElement.style.position = 'absolute';
  toElement.style.inset = '0';
  toElement.style.transform = transforms.enter;
  toElement.style.transition = `transform ${duration}ms ${EASINGS.spring}`;

  // Animar elemento antigo saindo
  fromElement.style.transition = `transform ${duration}ms ${EASINGS.spring}`;
  fromElement.style.transform = transforms.to;

  // Animar elemento novo entrando
  await nextFrame();
  toElement.style.transform = 'translate(0)';

  // Aguardar conclusão
  await new Promise(resolve => setTimeout(resolve, duration));

  // Cleanup
  fromElement.style.display = 'none';
  toElement.style.position = '';
  toElement.style.inset = '';
}

/**
 * Transição de morphing entre elementos
 */
export async function morphTransition(
  fromElement: HTMLElement,
  toElement: HTMLElement,
  duration = DURATIONS.medium
): Promise<void> {
  const fromRect = fromElement.getBoundingClientRect();
  const toRect = toElement.getBoundingClientRect();

  // Posicionar elemento de destino na posição de origem
  toElement.style.position = 'fixed';
  toElement.style.top = `${fromRect.top}px`;
  toElement.style.left = `${fromRect.left}px`;
  toElement.style.width = `${fromRect.width}px`;
  toElement.style.height = `${fromRect.height}px`;
  toElement.style.opacity = '0';
  toElement.style.transition = `all ${duration}ms ${EASINGS.spring}`;
  toElement.style.display = 'block';

  // Esconder elemento de origem
  fromElement.style.opacity = '0';

  await nextFrame();

  // Animar para posição final
  toElement.style.top = `${toRect.top}px`;
  toElement.style.left = `${toRect.left}px`;
  toElement.style.width = `${toRect.width}px`;
  toElement.style.height = `${toRect.height}px`;
  toElement.style.opacity = '1';

  await new Promise(resolve => setTimeout(resolve, duration));

  // Cleanup
  toElement.style.position = '';
  toElement.style.top = '';
  toElement.style.left = '';
  toElement.style.width = '';
  toElement.style.height = '';
  fromElement.style.display = 'none';
}

/**
 * Transição com scale and fade
 */
export async function scaleTransition(
  fromElement: HTMLElement,
  toElement: HTMLElement,
  scaleUp = true,
  duration = DURATIONS.medium
): Promise<void> {
  const fromScale = scaleUp ? 'scale(1)' : 'scale(1)';
  const toScaleOut = scaleUp ? 'scale(1.1)' : 'scale(0.9)';
  const toScaleIn = scaleUp ? 'scale(0.9)' : 'scale(1.1)';

  // Animar saída do elemento antigo
  fromElement.style.transition = `all ${duration}ms ${EASINGS.spring}`;
  fromElement.style.transform = toScaleOut;
  fromElement.style.opacity = '0';

  // Preparar elemento novo
  toElement.style.display = 'block';
  toElement.style.transform = toScaleIn;
  toElement.style.opacity = '0';
  toElement.style.transition = `all ${duration}ms ${EASINGS.spring}`;

  await nextFrame();

  // Animar entrada do elemento novo
  toElement.style.transform = 'scale(1)';
  toElement.style.opacity = '1';

  await new Promise(resolve => setTimeout(resolve, duration));

  // Cleanup
  fromElement.style.display = 'none';
  fromElement.style.transform = fromScale;
}

/**
 * Transição customizada para modal → conteúdo
 */
export async function modalToContentTransition(
  modal: HTMLElement,
  content: HTMLElement,
  triggerButton?: HTMLElement
): Promise<void> {
  const duration = DURATIONS.slow;

  if (supportsViewTransitions()) {
    // Usar View Transitions API
    // @ts-ignore
    await transitionPage(async () => {
      modal.style.display = 'none';
      modal.classList.remove('visible');
      content.style.display = 'block';
      content.classList.add('visible');
    });
  } else {
    // Fallback animado
    
    // Se houver botão trigger, fazer morphing dele
    if (triggerButton) {
      const buttonRect = triggerButton.getBoundingClientRect();
      
      // Criar overlay de transição
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = `${buttonRect.top}px`;
      overlay.style.left = `${buttonRect.left}px`;
      overlay.style.width = `${buttonRect.width}px`;
      overlay.style.height = `${buttonRect.height}px`;
      overlay.style.background = 'var(--gradient-main)';
      overlay.style.borderRadius = 'var(--border-radius)';
      overlay.style.zIndex = '20000';
      overlay.style.transition = `all ${duration}ms ${EASINGS.spring}`;
      overlay.style.pointerEvents = 'none';
      document.body.appendChild(overlay);

      await nextFrame();

      // Expandir para tela cheia
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.borderRadius = '0';

      await new Promise(resolve => setTimeout(resolve, duration / 2));

      // Mostrar conteúdo
      modal.style.display = 'none';
      modal.classList.remove('visible');
      content.style.display = 'block';
      content.style.opacity = '0';

      await nextFrame();

      content.style.transition = `opacity ${duration / 2}ms ${EASINGS.easeOut}`;
      content.style.opacity = '1';
      content.classList.add('visible');

      await new Promise(resolve => setTimeout(resolve, duration / 2));

      // Remover overlay
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    } else {
      // Transição simples
      await scaleTransition(modal, content, true, duration);
    }
  }
}

/**
 * Transição customizada para conteúdo → modal
 */
export async function contentToModalTransition(
  content: HTMLElement,
  modal: HTMLElement
): Promise<void> {
  const duration = DURATIONS.slow;

  if (supportsViewTransitions()) {
    // @ts-ignore
    await transitionPage(async () => {
      content.style.display = 'none';
      content.classList.remove('visible');
      modal.style.display = 'block';
      modal.classList.add('visible');
    });
  } else {
    await scaleTransition(content, modal, false, duration);
  }
}

/**
 * Progress bar durante transição
 */
export class TransitionProgressBar {
  private bar: HTMLElement;
  private container: HTMLElement;

  constructor() {
    // Criar container
    this.container = document.createElement('div');
    this.container.className = 'transition-progress-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 200ms ease;
    `;

    // Criar barra
    this.bar = document.createElement('div');
    this.bar.className = 'transition-progress-bar';
    this.bar.style.cssText = `
      height: 100%;
      width: 0%;
      background: var(--gradient-main);
      background-size: 200% 100%;
      animation: gradientShift 2s ease infinite;
      transition: width 300ms ease-out;
      box-shadow: 0 0 10px rgba(65, 255, 65, 0.5);
    `;

    this.container.appendChild(this.bar);
    document.body.appendChild(this.container);
  }

  start(): void {
    this.container.style.opacity = '1';
    this.bar.style.width = '0%';
    
    // Simular progresso
    setTimeout(() => this.bar.style.width = '30%', 100);
    setTimeout(() => this.bar.style.width = '60%', 300);
    setTimeout(() => this.bar.style.width = '80%', 600);
  }

  complete(): void {
    this.bar.style.width = '100%';
    setTimeout(() => {
      this.container.style.opacity = '0';
      setTimeout(() => this.bar.style.width = '0%', 200);
    }, 200);
  }

  destroy(): void {
    this.container.remove();
  }
}

