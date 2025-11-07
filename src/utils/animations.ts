/**
 * Biblioteca de Animações e Transições - Khroma Academy
 * Sistema completo de animações para interfaces modernas
 */

/**
 * Configurações de easing customizados
 */
export const EASINGS = {
  // Standard easings
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Material Design easings
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  // Spring physics
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  springGentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  
  // Custom
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} as const;

/**
 * Durações padrão
 */
export const DURATIONS: Record<string, number> = {
  instant: 0,
  fast: 150,
  normal: 300,
  medium: 500,
  slow: 700,
  slower: 1000
};

/**
 * Força um reflow do navegador
 */
export function forceReflow(element: HTMLElement): void {
  void element.offsetHeight;
}

/**
 * Aguarda o próximo frame de animação
 */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

/**
 * Aguarda múltiplos frames
 */
export function waitFrames(frames: number): Promise<void> {
  return new Promise((resolve) => {
    let count = 0;
    const tick = () => {
      count++;
      if (count >= frames) {
        resolve();
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
}

/**
 * Executa uma animação de fade in
 */
export function fadeIn(
  element: HTMLElement, 
  duration = DURATIONS.normal,
  easing = EASINGS.easeOut
): Promise<void> {
  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ${easing}`;
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      setTimeout(() => resolve(), duration);
    });
  });
}

/**
 * Executa uma animação de fade out
 */
export function fadeOut(
  element: HTMLElement, 
  duration = DURATIONS.normal,
  easing = EASINGS.easeIn
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms ${easing}`;
    element.style.opacity = '0';
    setTimeout(() => resolve(), duration);
  });
}

/**
 * Fade in com movimento para cima
 */
export function fadeInUp(
  element: HTMLElement,
  duration = DURATIONS.normal,
  distance = 40,
  easing = EASINGS.spring
): Promise<void> {
  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.transform = `translateY(${distance}px)`;
    element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      setTimeout(() => resolve(), duration);
    });
  });
}

/**
 * Fade in com movimento para baixo
 */
export function fadeInDown(
  element: HTMLElement,
  duration = DURATIONS.normal,
  distance = 40,
  easing = EASINGS.spring
): Promise<void> {
  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.transform = `translateY(-${distance}px)`;
    element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      setTimeout(() => resolve(), duration);
    });
  });
}

/**
 * Fade in com escala
 */
export function fadeInScale(
  element: HTMLElement,
  duration = DURATIONS.normal,
  fromScale = 0.9,
  easing = EASINGS.spring
): Promise<void> {
  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.transform = `scale(${fromScale})`;
    element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
      setTimeout(() => resolve(), duration);
    });
  });
}

/**
 * Slide in da direita
 */
export function slideInRight(
  element: HTMLElement,
  duration = DURATIONS.normal,
  distance = 100,
  easing = EASINGS.spring
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transform = `translateX(${distance}px)`;
    element.style.transition = `transform ${duration}ms ${easing}`;
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateX(0)';
      setTimeout(() => resolve(), duration);
    });
  });
}

/**
 * Slide in da esquerda
 */
export function slideInLeft(
  element: HTMLElement,
  duration = DURATIONS.normal,
  distance = 100,
  easing = EASINGS.spring
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transform = `translateX(-${distance}px)`;
    element.style.transition = `transform ${duration}ms ${easing}`;
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateX(0)';
      setTimeout(() => resolve(), duration);
    });
  });
}

/**
 * Animação stagger para múltiplos elementos
 */
export async function staggerAnimation(
  elements: HTMLElement[],
  animationFn: (el: HTMLElement, index: number) => Promise<void>,
  delayBetween = 50
): Promise<void> {
  for (let i = 0; i < elements.length; i++) {
    animationFn(elements[i], i);
    if (i < elements.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetween));
    }
  }
}

/**
 * Parallax effect
 */
export function parallax(
  element: HTMLElement,
  speed = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
): () => void {
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * speed;
    
    if (direction === 'vertical') {
      element.style.transform = `translateY(${rate}px)`;
    } else {
      element.style.transform = `translateX(${rate}px)`;
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Return cleanup function
  return () => window.removeEventListener('scroll', handleScroll);
}

/**
 * Ripple effect ao clicar
 */
export function createRipple(event: MouseEvent, element: HTMLElement): void {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.add('ripple-effect');
  
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

/**
 * Shimmer effect (loading skeleton)
 */
export function addShimmerEffect(element: HTMLElement): void {
  element.classList.add('shimmer-effect');
}

export function removeShimmerEffect(element: HTMLElement): void {
  element.classList.remove('shimmer-effect');
}

/**
 * Smooth scroll para elemento
 */
export function smoothScrollTo(
  target: HTMLElement | string,
  offset = 0,
  duration = DURATIONS.slow
): Promise<void> {
  return new Promise((resolve) => {
    const targetElement = typeof target === 'string' 
      ? document.querySelector<HTMLElement>(target)
      : target;
    
    if (!targetElement) {
      resolve();
      return;
    }
    
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;
    
    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      window.scrollTo(0, startPosition + distance * easeInOutCubic);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(animation);
  });
}

/**
 * Pulse animation
 */
export function pulse(element: HTMLElement, duration = 1000): void {
  element.style.animation = `pulse ${duration}ms ease-in-out`;
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
}

/**
 * Shake animation
 */
export function shake(element: HTMLElement, duration = 500): void {
  element.style.animation = `shake ${duration}ms ease-in-out`;
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
}

/**
 * Debounce function para performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function para performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

