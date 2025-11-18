/**
 * Serviço para processar animações GSAP
 */

/**
 * Processa todos os elementos com atributo data-gsap
 */
export function processGSAPAnimations(container: HTMLElement): void {
  const gsapElements = container.querySelectorAll('[data-gsap]');
  
  if (gsapElements.length === 0) return;

  // Verificar se GSAP está disponível
  if (typeof window === 'undefined' || !(window as any).gsap) {
    console.warn('⚠️ GSAP não está disponível. Carregando...');
    // Tentar carregar GSAP dinamicamente
    loadGSAP().then(() => {
      processGSAPAnimations(container);
    });
    return;
  }

  const gsap = (window as any).gsap;
  
  gsapElements.forEach((element) => {
    try {
      const configAttr = element.getAttribute('data-gsap');
      if (!configAttr) return;

      const config = JSON.parse(configAttr);
      const el = element as HTMLElement;

      // Criar container para a animação se necessário
      if (!el.querySelector('.gsap-animation-container')) {
        const animationContainer = document.createElement('div');
        animationContainer.className = 'gsap-animation-container';
        el.appendChild(animationContainer);
      }

      // Processar diferentes tipos de animações
      switch (config.animation) {
        case 'sequentialSearch':
        case 'sequentialSearchCustom':
        case 'sequentialSearchTraceSuccess':
        case 'sequentialSearchSortedStop':
        case 'sequentialSearchStopCondition':
        case 'sequentialSearchWorstCase':
          createSequentialSearchAnimation(el, config);
          break;
        case 'binarySearchTrace':
        case 'binarySearchDetailedTrace':
        case 'binarySearchDetailedTraceFail':
        case 'binarySearchBestCase':
        case 'binarySearchEdgeCase':
          createBinarySearchAnimation(el, config);
          break;
        default:
          // Animação genérica
          createGenericAnimation(el, config);
      }
    } catch (error) {
      console.error('Erro ao processar animação GSAP:', error);
      (element as HTMLElement).innerHTML = `
        <div class="gsap-error" style="padding: 20px; background: rgba(255, 65, 65, 0.1); border: 1px solid rgba(255, 65, 65, 0.3); border-radius: 5px; color: #ff4141;">
          <strong>⚠️ Erro ao carregar animação</strong>
          <p>Não foi possível processar a configuração da animação.</p>
        </div>
      `;
    }
  });
}

/**
 * Carrega GSAP dinamicamente
 */
async function loadGSAP(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).gsap) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar GSAP'));
    document.head.appendChild(script);
  });
}

/**
 * Cria animação de busca sequencial
 */
function createSequentialSearchAnimation(container: HTMLElement, config: any): void {
  const gsap = (window as any).gsap;
  const array = config.array || [];
  const target = config.target || config.targets?.[0];
  const speed = config.speed || 700;
  const highlightColor = config.highlightColor || '#41FF41';
  const successColor = config.successColor || '#41FF41';
  const failColor = config.failColor || '#FF6347';
  const stopCondition = config.stopCondition; // 'gt' para maior que

  const animationContainer = container.querySelector('.gsap-animation-container') || container;
  animationContainer.innerHTML = '';

  // Criar visualização do array
  const arrayContainer = document.createElement('div');
  arrayContainer.className = 'gsap-array-container';
  arrayContainer.style.cssText = `
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 20px;
  `;

  const elements: HTMLElement[] = [];
  array.forEach((value: number, index: number) => {
    const element = document.createElement('div');
    element.className = 'gsap-array-element';
    element.textContent = String(value);
    element.dataset.index = String(index);
    element.dataset.value = String(value);
    element.style.cssText = `
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-2, #2a2a2a);
      border: 2px solid var(--border-subtle, #444);
      border-radius: 8px;
      font-weight: 600;
      color: var(--text-primary, #fff);
      transition: all 0.3s ease;
      position: relative;
    `;

    const indexLabel = document.createElement('div');
    indexLabel.className = 'gsap-index-label';
    indexLabel.textContent = `[${index}]`;
    indexLabel.style.cssText = `
      position: absolute;
      top: -20px;
      font-size: 0.75rem;
      color: var(--text-secondary, #aaa);
    `;
    element.appendChild(indexLabel);
    arrayContainer.appendChild(element);
    elements.push(element);
  });

  animationContainer.appendChild(arrayContainer);

  // Criar controles
  const controls = document.createElement('div');
  controls.className = 'gsap-controls';
  controls.style.cssText = `
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
  `;

  const playBtn = document.createElement('button');
  playBtn.textContent = '▶️ Reproduzir';
  playBtn.style.cssText = `
    padding: 8px 16px;
    background: var(--callout-info-color, #4141FF);
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    font-weight: 600;
  `;

  const resetBtn = document.createElement('button');
  resetBtn.textContent = '🔄 Reiniciar';
  resetBtn.style.cssText = `
    padding: 8px 16px;
    background: var(--surface-2, #2a2a2a);
    border: 1px solid var(--border-subtle, #444);
    border-radius: 5px;
    color: var(--text-primary, #fff);
    cursor: pointer;
    font-weight: 600;
  `;

  controls.appendChild(playBtn);
  controls.appendChild(resetBtn);
  animationContainer.appendChild(controls);

  // Status
  const status = document.createElement('div');
  status.className = 'gsap-status';
  status.style.cssText = `
    text-align: center;
    margin-top: 15px;
    color: var(--text-secondary, #aaa);
    font-size: 0.9rem;
  `;
  animationContainer.appendChild(status);

  let currentIndex = 0;
  let isPlaying = false;
  let timeline: any = null;

  const reset = () => {
    if (timeline) timeline.kill();
    elements.forEach((el) => {
      el.style.background = 'var(--surface-2, #2a2a2a)';
      el.style.borderColor = 'var(--border-subtle, #444)';
      el.style.transform = 'scale(1)';
    });
    currentIndex = 0;
    isPlaying = false;
    status.textContent = 'Pronto para iniciar';
    playBtn.textContent = '▶️ Reproduzir';
  };

  const play = () => {
    if (isPlaying) return;
    isPlaying = true;
    playBtn.textContent = '⏸️ Pausado';
    reset();

    timeline = gsap.timeline({
      onComplete: () => {
        isPlaying = false;
        playBtn.textContent = '▶️ Reproduzir';
      },
    });

    let found = false;
    let shouldStop = false;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const value = Number(element.dataset.value);

      // Highlight atual
      timeline.to(element, {
        duration: 0.3,
        scale: 1.2,
        backgroundColor: highlightColor,
        borderColor: highlightColor,
        ease: 'power2.out',
      });

      // Verificar se encontrou
      if (value === target) {
        timeline.to(element, {
          duration: 0.3,
          backgroundColor: successColor,
          borderColor: successColor,
          scale: 1.3,
          ease: 'bounce.out',
        });
        status.textContent = `✅ Elemento ${target} encontrado no índice ${i}!`;
        found = true;
        break;
      }

      // Verificar condição de parada (para arranjos ordenados)
      if (stopCondition === 'gt' && value > target) {
        timeline.to(element, {
          duration: 0.3,
          backgroundColor: failColor,
          borderColor: failColor,
        });
        status.textContent = `⏹️ Parada otimizada: ${value} > ${target} (índice ${i})`;
        shouldStop = true;
        break;
      }

      // Reset highlight
      timeline.to(element, {
        duration: 0.2,
        scale: 1,
        backgroundColor: 'var(--surface-2, #2a2a2a)',
        borderColor: 'var(--border-subtle, #444)',
        delay: speed / 1000 - 0.5,
      });
    }

    if (!found && !shouldStop) {
      status.textContent = `❌ Elemento ${target} não encontrado`;
      // Destacar todos como não encontrado
      elements.forEach((el) => {
        timeline.to(el, {
          duration: 0.2,
          backgroundColor: failColor,
          borderColor: failColor,
          opacity: 0.6,
        }, '-=0.1');
      });
    }
  };

  playBtn.addEventListener('click', play);
  resetBtn.addEventListener('click', reset);

  // Auto-play opcional
  if (config.autoPlay !== false) {
    setTimeout(play, 500);
  }
}

/**
 * Cria animação de busca binária
 */
function createBinarySearchAnimation(container: HTMLElement, config: any): void {
  const gsap = (window as any).gsap;
  const array = config.array || [];
  const target = config.target;
  const speed = config.speed || 1000;
  const highlightColor = config.highlightColor || '#ADD8E6';
  const meioColor = config.meioColor || '#FF6347';
  const failColor = config.failColor || '#FF0000';

  const animationContainer = container.querySelector('.gsap-animation-container') || container;
  animationContainer.innerHTML = '';

  // Criar visualização do array
  const arrayContainer = document.createElement('div');
  arrayContainer.className = 'gsap-array-container';
  arrayContainer.style.cssText = `
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 20px;
    position: relative;
  `;

  const elements: HTMLElement[] = [];
  array.forEach((value: number, index: number) => {
    const element = document.createElement('div');
    element.className = 'gsap-array-element';
    element.textContent = String(value);
    element.dataset.index = String(index);
    element.dataset.value = String(value);
    element.style.cssText = `
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-2, #2a2a2a);
      border: 2px solid var(--border-subtle, #444);
      border-radius: 8px;
      font-weight: 600;
      color: var(--text-primary, #fff);
      transition: all 0.3s ease;
      position: relative;
    `;

    const indexLabel = document.createElement('div');
    indexLabel.className = 'gsap-index-label';
    indexLabel.textContent = `[${index}]`;
    indexLabel.style.cssText = `
      position: absolute;
      top: -20px;
      font-size: 0.75rem;
      color: var(--text-secondary, #aaa);
    `;
    element.appendChild(indexLabel);
    arrayContainer.appendChild(element);
    elements.push(element);
  });

  animationContainer.appendChild(arrayContainer);

  // Criar indicadores de ini, fim, meio
  const indicators = document.createElement('div');
  indicators.className = 'gsap-indicators';
  indicators.style.cssText = `
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    margin-top: 10px;
    font-size: 0.85rem;
    color: var(--text-secondary, #aaa);
  `;
  animationContainer.appendChild(indicators);

  // Controles
  const controls = document.createElement('div');
  controls.className = 'gsap-controls';
  controls.style.cssText = `
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
  `;

  const playBtn = document.createElement('button');
  playBtn.textContent = '▶️ Reproduzir';
  playBtn.style.cssText = `
    padding: 8px 16px;
    background: var(--callout-info-color, #4141FF);
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    font-weight: 600;
  `;

  const resetBtn = document.createElement('button');
  resetBtn.textContent = '🔄 Reiniciar';
  resetBtn.style.cssText = `
    padding: 8px 16px;
    background: var(--surface-2, #2a2a2a);
    border: 1px solid var(--border-subtle, #444);
    border-radius: 5px;
    color: var(--text-primary, #fff);
    cursor: pointer;
    font-weight: 600;
  `;

  controls.appendChild(playBtn);
  controls.appendChild(resetBtn);
  animationContainer.appendChild(controls);

  // Status
  const status = document.createElement('div');
  status.className = 'gsap-status';
  status.style.cssText = `
    text-align: center;
    margin-top: 15px;
    color: var(--text-secondary, #aaa);
    font-size: 0.9rem;
  `;
  animationContainer.appendChild(status);

  let timeline: any = null;

  const reset = () => {
    if (timeline) timeline.kill();
    elements.forEach((el) => {
      el.style.background = 'var(--surface-2, #2a2a2a)';
      el.style.borderColor = 'var(--border-subtle, #444)';
      el.style.transform = 'scale(1)';
      el.style.opacity = '1';
    });
    indicators.innerHTML = '';
    status.textContent = 'Pronto para iniciar';
    playBtn.textContent = '▶️ Reproduzir';
  };

  const play = () => {
    reset();

    timeline = gsap.timeline({
      onComplete: () => {
        playBtn.textContent = '▶️ Reproduzir';
      },
    });

    let ini = 0;
    let fim = array.length - 1;
    let iteration = 0;
    let found = false;

    const search = () => {
      if (ini > fim) {
        status.textContent = `❌ Elemento ${target} não encontrado (ini > fim)`;
        return;
      }

      iteration++;
      const meio = Math.floor((ini + fim) / 2);
      const meioValue = array[meio];

      // Atualizar indicadores
      indicators.innerHTML = `
        <span>ini = ${ini}</span>
        <span>meio = ${meio}</span>
        <span>fim = ${fim}</span>
      `;

      // Destacar meio
      const meioElement = elements[meio];
      timeline.to(meioElement, {
        duration: 0.4,
        scale: 1.3,
        backgroundColor: meioColor,
        borderColor: meioColor,
        ease: 'power2.out',
      });

      // Verificar se encontrou
      if (meioValue === target) {
        timeline.to(meioElement, {
          duration: 0.5,
          scale: 1.4,
          backgroundColor: '#41FF41',
          borderColor: '#41FF41',
          ease: 'bounce.out',
        });
        status.textContent = `✅ Elemento ${target} encontrado no índice ${meio}! (${iteration} iterações)`;
        found = true;
        return;
      }

      // Escurecer elementos descartados
      if (meioValue < target) {
        // Descartar esquerda
        for (let i = ini; i <= meio; i++) {
          if (i !== meio) {
            timeline.to(elements[i], {
              duration: 0.2,
              opacity: 0.3,
              backgroundColor: '#666',
            }, '-=0.1');
          }
        }
        ini = meio + 1;
        status.textContent = `${meioValue} < ${target}, descartando esquerda (ini = ${ini})`;
      } else {
        // Descartar direita
        for (let i = meio; i <= fim; i++) {
          if (i !== meio) {
            timeline.to(elements[i], {
              duration: 0.2,
              opacity: 0.3,
              backgroundColor: '#666',
            }, '-=0.1');
          }
        }
        fim = meio - 1;
        status.textContent = `${meioValue} > ${target}, descartando direita (fim = ${fim})`;
      }

      // Reset meio highlight
      timeline.to(meioElement, {
        duration: 0.3,
        scale: 1,
        backgroundColor: 'var(--surface-2, #2a2a2a)',
        borderColor: 'var(--border-subtle, #444)',
        delay: speed / 1000 - 0.3,
      });

      // Continuar busca
      if (!found && ini <= fim) {
        timeline.call(search, [], `+=${speed / 1000}`);
      } else if (!found) {
        status.textContent = `❌ Elemento ${target} não encontrado (ini > fim após ${iteration} iterações)`;
      }
    };

    search();
  };

  playBtn.addEventListener('click', play);
  resetBtn.addEventListener('click', reset);

  // Auto-play opcional
  if (config.autoPlay !== false) {
    setTimeout(play, 500);
  }
}

/**
 * Cria animação genérica
 */
function createGenericAnimation(container: HTMLElement, config: any): void {
  const gsap = (window as any).gsap;
  const duration = config.duration || 1;
  const delay = config.delay || 0;
  const animation = config.animation || 'fadeIn';

  const timeline = gsap.timeline({ delay });

  switch (animation) {
    case 'fadeIn':
      timeline.from(container, { opacity: 0, duration });
      break;
    case 'slideIn':
      timeline.from(container, { x: -100, opacity: 0, duration });
      break;
    default:
      timeline.from(container, { opacity: 0, scale: 0.8, duration });
  }
}

