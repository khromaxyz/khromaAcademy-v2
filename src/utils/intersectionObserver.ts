/**
 * Intersection Observer Utilities
 * Sistema para animações lazy/on-scroll com performance otimizada
 */

export interface IntersectionObserverConfig {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  onEnter?: (element: HTMLElement) => void;
  onExit?: (element: HTMLElement) => void;
  animationClass?: string;
}

/**
 * Cria um observer para animações ao scroll
 */
export function createScrollAnimationObserver(
  config: IntersectionObserverConfig = {}
): IntersectionObserver {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    onEnter,
    onExit,
    animationClass = 'is-visible'
  } = config;

  const observedElements = new WeakSet<Element>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;

        if (entry.isIntersecting) {
          // Elemento entrou na viewport
          element.classList.add(animationClass);
          onEnter?.(element);

          if (triggerOnce) {
            observer.unobserve(element);
            observedElements.add(element);
          }
        } else if (!triggerOnce && observedElements.has(element)) {
          // Elemento saiu da viewport (apenas se não for triggerOnce)
          element.classList.remove(animationClass);
          onExit?.(element);
        }
      });
    },
    {
      threshold,
      rootMargin
    }
  );

  return observer;
}

/**
 * Observa elementos para animação ao scroll
 */
export function observeElements(
  selector: string | HTMLElement[],
  config: IntersectionObserverConfig = {}
): IntersectionObserver {
  const observer = createScrollAnimationObserver(config);

  const elements = typeof selector === 'string'
    ? Array.from(document.querySelectorAll<HTMLElement>(selector))
    : selector;

  elements.forEach((element) => {
    observer.observe(element);
  });

  return observer;
}

/**
 * Anima elementos com stagger ao scroll
 */
export function observeElementsWithStagger(
  selector: string | HTMLElement[],
  config: IntersectionObserverConfig & { staggerDelay?: number } = {}
): IntersectionObserver {
  const { staggerDelay = 100, ...observerConfig } = config;

  const elements = typeof selector === 'string'
    ? Array.from(document.querySelectorAll<HTMLElement>(selector))
    : selector;

  // Adicionar delay incremental a cada elemento
  elements.forEach((element, index) => {
    element.style.transitionDelay = `${index * staggerDelay}ms`;
  });

  return observeElements(elements, observerConfig);
}

/**
 * Observer para lazy loading de imagens
 */
export function createImageLazyLoader(
  config: { rootMargin?: string } = {}
): IntersectionObserver {
  const { rootMargin = '50px' } = config;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    },
    { rootMargin }
  );

  return observer;
}

/**
 * Observa imagens para lazy loading
 */
export function lazyLoadImages(selector = 'img[data-src]'): IntersectionObserver {
  const observer = createImageLazyLoader();
  const images = document.querySelectorAll<HTMLImageElement>(selector);

  images.forEach((img) => {
    observer.observe(img);
  });

  return observer;
}

/**
 * Observer para parallax ao scroll
 */
export function createParallaxObserver(
  speed = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const scrolled = window.pageYOffset;
          const rate = scrolled * speed;

          if (direction === 'vertical') {
            element.style.transform = `translateY(${rate}px)`;
          } else {
            element.style.transform = `translateX(${rate}px)`;
          }
        }
      });
    },
    { threshold: 0 }
  );

  return observer;
}

/**
 * Scroll spy para navegação
 */
export class ScrollSpy {
  private observer: IntersectionObserver;
  private activeClass: string;
  private navLinks: Map<string, HTMLElement>;

  constructor(
    sectionsSelector: string,
    navSelector: string,
    activeClass = 'active'
  ) {
    this.activeClass = activeClass;
    this.navLinks = new Map();

    // Mapear links de navegação
    const navElements = document.querySelectorAll<HTMLElement>(navSelector);
    navElements.forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        this.navLinks.set(href.replace('#', ''), link);
      }
    });

    // Criar observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('id');
          if (!id) return;

          const navLink = this.navLinks.get(id);
          if (!navLink) return;

          if (entry.isIntersecting) {
            // Remover active de todos
            this.navLinks.forEach((link) => {
              link.classList.remove(this.activeClass);
            });
            // Adicionar active no atual
            navLink.classList.add(this.activeClass);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
      }
    );

    // Observar seções
    const sections = document.querySelectorAll<HTMLElement>(sectionsSelector);
    sections.forEach((section) => {
      this.observer.observe(section);
    });
  }

  destroy(): void {
    this.observer.disconnect();
    this.navLinks.clear();
  }
}

/**
 * Reveal on scroll - anima elementos quando aparecem na tela
 */
export class RevealOnScroll {
  private observer: IntersectionObserver;
  private elements: Set<HTMLElement>;

  constructor(
    selector: string,
    config: IntersectionObserverConfig = {}
  ) {
    this.elements = new Set();
    
    const {
      threshold = 0.15,
      rootMargin = '0px',
      triggerOnce = true,
      animationClass = 'revealed'
    } = config;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          
          if (entry.isIntersecting) {
            element.classList.add(animationClass);
            this.elements.add(element);
            
            if (triggerOnce) {
              this.observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            element.classList.remove(animationClass);
          }
        });
      },
      { threshold, rootMargin }
    );

    this.observe(selector);
  }

  observe(selector: string): void {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((el) => {
      this.observer.observe(el);
    });
  }

  destroy(): void {
    this.observer.disconnect();
    this.elements.clear();
  }

  disconnect(): void {
    this.destroy();
  }
}

/**
 * Progress indicator baseado em scroll
 */
export class ScrollProgressIndicator {
  private element: HTMLElement;
  private target: HTMLElement | null;

  constructor(
    indicatorSelector: string,
    targetSelector?: string
  ) {
    const indicator = document.querySelector<HTMLElement>(indicatorSelector);
    if (!indicator) {
      throw new Error(`Indicator element not found: ${indicatorSelector}`);
    }

    this.element = indicator;
    this.target = targetSelector
      ? document.querySelector<HTMLElement>(targetSelector)
      : document.documentElement;

    this.init();
  }

  private init(): void {
    window.addEventListener('scroll', this.updateProgress.bind(this), { passive: true });
    this.updateProgress();
  }

  private updateProgress(): void {
    if (!this.target) return;

    const scrollTop = window.pageYOffset;
    const docHeight = this.target.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    this.element.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
  }

  destroy(): void {
    window.removeEventListener('scroll', this.updateProgress.bind(this));
  }
}

