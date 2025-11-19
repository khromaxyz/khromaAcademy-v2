/**
 * Ponto de entrada da aplicação KhromaAcademy
 */

import { dataService, themeService, cursorService, geminiService } from '@/services';
import { Header } from '@/components/Header/Header';
import { MainNavigation } from '@/components/MainNavigation/MainNavigation';
import { CommandPalette } from '@/components/CommandPalette/CommandPalette';
import type { SearchItem } from '@/components/CommandPalette/CommandPalette';
import { SettingsPanel } from '@/components/SettingsPanel/SettingsPanel';
import { DisciplineCard } from '@/components/DisciplineCard/DisciplineCard';
import { KnowledgeGraph } from '@/components/KnowledgeGraph/KnowledgeGraph';
import { Modal } from '@/components/Modal/Modal';
import { AdminPanel } from '@/components/AdminPanel/AdminPanel';
import { DisciplineContent } from '@/components/DisciplineContent/DisciplineContent';
import { AgentsPanel } from '@/components/AgentsPanel/AgentsPanel';
import './styles/index.css';

// Importar CSS dos componentes
import './components/Header/Header.css';
import './components/MainNavigation/MainNavigation.css';
import './components/CommandPalette/CommandPalette.css';
import './components/SettingsPanel/SettingsPanel.css';
import './components/DisciplineCard/DisciplineCard.css';
import './components/KnowledgeGraph/KnowledgeGraph.css';
import './components/Modal/Modal.css';
import './components/AdminPanel/AdminPanel.css';
import './components/DisciplineContent/DisciplineContent.css';
import './components/AgentsPanel/AgentsPanel.css';
import './components/AgentsPanel/PDFToDocsAgent/PDFToDocsAgent.css';
import './components/AgentsPanel/ContentReviewAgent/ContentReviewAgent.css';

// Instâncias dos componentes
let header: Header;
let mainNavigation: MainNavigation;
let commandPalette: CommandPalette;
let settingsPanel: SettingsPanel;
let knowledgeGraph: KnowledgeGraph;
let modal: Modal;
let adminPanel: AdminPanel;
let disciplineContent: DisciplineContent;
let agentsPanel: AgentsPanel;

/**
 * Renderiza todas as disciplinas
 */
function renderAll(): void {
  const disciplines = dataService.getAllDisciplines();
  const gridContainer = document.querySelector('.disciplines-grid');
  const disciplinesContainer = document.querySelector('.disciplines-container');

  if (!gridContainer || !disciplinesContainer) return;

  // Renderizar grid
  let gridHtml = '';
  Object.entries(disciplines).forEach(([id, discipline]) => {
    gridHtml += DisciplineCard.render(discipline, id);
  });
  gridContainer.innerHTML = gridHtml;

  // Renderizar grafo
  knowledgeGraph.render(disciplines);

  // Adicionar event listeners aos cards imediatamente
  attachModalTriggers();
}

/**
 * Adiciona event listeners para abrir modal
 */
function attachModalTriggers(): void {
  // Adicionar listeners diretamente em cada card
  const cards = document.querySelectorAll('.chroma-card-wrapper');
  
  cards.forEach((card) => {
    const id = card.getAttribute('data-id');
    if (!id) return;

    // Adicionar listener diretamente
    card.addEventListener(
      'click',
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        const discipline = dataService.getDiscipline(id);
        if (discipline && modal) {
          modal.open(id, discipline, card as HTMLElement);
        }
      },
      { capture: false, passive: false }
    );
  });

  // Adicionar listeners aos nodes do grafo
  const nodes = document.querySelectorAll('.graph-node');
  
  nodes.forEach((node) => {
    const id = node.getAttribute('data-id');
    if (!id) return;

    node.addEventListener(
      'click',
      (e) => {
        e.stopPropagation();
        e.preventDefault();
        const discipline = dataService.getDiscipline(id);
        if (discipline && modal) {
          modal.open(id, discipline, node as HTMLElement);
        }
      },
      { capture: false, passive: false }
    );
  });
}

/**
 * Inicializa o toggle de visualização (Grid/Grafo)
 */
function initViewToggle(): void {
  // Toggle do header
  const viewToggleHeader = document.querySelector('.view-toggle-header');
  const viewButtonsHeader = document.querySelectorAll('.view-btn-header');
  
  // Toggle da seção disciplines (se existir)
  const viewToggle = document.querySelector('.view-toggle');
  const viewButtons = document.querySelectorAll('.view-btn');
  const disciplinesContainer = document.querySelector('.disciplines-container');

  // Handler para mudança de view
  const handleViewChange = (view: string) => {
    // Atualizar toggle do header
    if (viewToggleHeader) {
      viewToggleHeader.setAttribute('data-view', view);
    }
    
    // Atualizar toggle da seção (se existir)
    if (viewToggle) {
      viewToggle.setAttribute('data-view', view);
    }
    
    // Atualizar container
    if (disciplinesContainer) {
      disciplinesContainer.classList.toggle('graph-view', view === 'graph');
    }
  };

  // Listeners do header
  viewButtonsHeader.forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.getAttribute('data-view');
      if (view) {
        handleViewChange(view);
      }
    });
  });

  // Listeners da seção (se existir)
  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.getAttribute('data-view');
      if (view) {
        handleViewChange(view);
      }
    });
  });

  // Listener para eventos customizados
  window.addEventListener('view-toggle-change', ((e: CustomEvent) => {
    handleViewChange(e.detail.view);
  }) as EventListener);
}

/**
 * Inicializa o preloader
 */
function initPreloader(): void {
  window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    preloader?.classList.add('loaded');
  });
}

/**
 * Inicializa a aplicação
 */
async function initializeApp(): Promise<void> {
  // Carregar dados
  await dataService.loadDisciplines();

  // Carregar configurações
  themeService.loadTheme();
  cursorService.init();
  cursorService.updateCursor();

  // Inicializar Header
  header = new Header();
  header.init();

  // Inicializar CommandPalette
  commandPalette = CommandPalette.getInstance();
  setupCommandPalette();

  // Listener para abrir CommandPalette do header
  window.addEventListener('open-command-palette', () => {
    commandPalette.open();
  });

  // Inicializar MainNavigation
  mainNavigation = new MainNavigation({
    onNavigate: handleNavigation,
    onSearch: () => commandPalette.open(),
  });
  document.body.insertBefore(mainNavigation.getElement(), document.body.firstChild);

  // Escutar eventos de navegação de outros componentes
  window.addEventListener('navigation-change', ((e: CustomEvent) => {
    if (e.detail?.itemId) {
      handleNavigation(e.detail.itemId);
    }
  }) as EventListener);

  // Inicializar outros componentes
  settingsPanel = new SettingsPanel();
  settingsPanel.setHeaderInstance(header);
  settingsPanel.init();
  
  // Expor instância globalmente para acesso do Header
  (window as any).settingsPanelInstance = settingsPanel;

  knowledgeGraph = new KnowledgeGraph();
  knowledgeGraph.init();

  modal = Modal.getInstance();
  modal.init();
  
  // Expor instância globalmente para acesso de outros componentes
  (window as any).modalInstance = modal;

  adminPanel = new AdminPanel();
  adminPanel.init();
  
  // Expor instância globalmente para acesso do SettingsPanel
  (window as any).adminPanelInstance = adminPanel;

  disciplineContent = DisciplineContent.getInstance();
  disciplineContent.init();

  agentsPanel = new AgentsPanel();

  // Renderizar conteúdo
  renderAll();
  initViewToggle();

  // Escutar atualizações de disciplinas
  window.addEventListener('disciplines-updated', () => {
    renderAll();
    adminPanel.refreshDisciplinesList();
    setupCommandPalette(); // Atualizar itens de busca
  });

  // Atualizar cursor targets após renderização
  setTimeout(() => {
    cursorService.updateCursorTargets();
  }, 100);

  // Atualizar cursor quando modal abrir/fechar
  window.addEventListener('modal-opened', () => {
    setTimeout(() => cursorService.updateCursorTargets(), 100);
  });
  window.addEventListener('modal-closed', () => {
    setTimeout(() => cursorService.updateCursorTargets(), 100);
  });
}

/**
 * Handle navegação do menu
 */
function handleNavigation(itemId: string): void {
  // Esconder todas as seções
  const hero = document.querySelector('.hero') as HTMLElement;
  const disciplines = document.querySelector('.disciplines') as HTMLElement;
  const myCoursesContainer = document.getElementById('my-courses-container');
  const placeholderContainer = document.getElementById('placeholder-container');
  const exploreContainer = document.getElementById('explore-container');
  const settingsPageContainer = document.getElementById('settings-page');
  const agentsPageContainer = document.getElementById('agents-page');
  const continueSection = document.getElementById('continue-section');
  
  if (hero) hero.style.display = 'none';
  if (disciplines) disciplines.style.display = 'none';
  if (myCoursesContainer) myCoursesContainer.style.display = 'none';
  if (placeholderContainer) placeholderContainer.style.display = 'none';
  if (exploreContainer) exploreContainer.style.display = 'none';
  if (settingsPageContainer) settingsPageContainer.style.display = 'none';
  if (agentsPageContainer) agentsPageContainer.style.display = 'none';
  if (continueSection) (continueSection as HTMLElement).style.display = 'none';

  // Resetar active state
  if (mainNavigation) {
    mainNavigation.setActive(itemId);
  }

  switch (itemId) {
    case 'home':
      // Mostrar apenas hero e preview de "Continue de onde parou"
      showHome();
      break;
    
    case 'meus-cursos':
      // Implementar visualização "Meus Cursos"
      showMyCourses();
      break;
    
    case 'cursos':
      // Mostrar seção Disciplinas (Explorar) com Grid/Grafo
      showExplore();
      break;
    
    case 'trilhas':
      // Placeholder para trilhas
      showPlaceholder('Trilhas', 'Em breve você terá acesso a trilhas de aprendizado personalizadas!');
      break;
    
    case 'agentes':
      // Abrir página de agentes
      showAgentsPage();
      break;
    
    case 'comunidade':
      // Placeholder para comunidade
      showPlaceholder('Comunidade', 'A comunidade Khroma está chegando! Conecte-se com outros estudantes.');
      break;
    
    case 'configuracoes':
      // Abrir página de configurações (full-page)
      showSettingsPage();
      break;
  }
}

/**
 * Mostra a página completa de Configurações
 */
function showSettingsPage(): void {
  const main = document.querySelector('main');
  if (!main) return;

  // Esconder outras seções
  const hero = document.querySelector('.hero') as HTMLElement;
  const disciplines = document.querySelector('.disciplines') as HTMLElement;
  const myCoursesContainer = document.getElementById('my-courses-container');
  const placeholderContainer = document.getElementById('placeholder-container');
  const exploreContainer = document.getElementById('explore-container');
  const continueSection = document.getElementById('continue-section');
  if (hero) hero.style.display = 'none';
  if (disciplines) disciplines.style.display = 'none';
  if (myCoursesContainer) myCoursesContainer.style.display = 'none';
  if (placeholderContainer) placeholderContainer.style.display = 'none';
  if (exploreContainer) exploreContainer.style.display = 'none';
  if (continueSection) (continueSection as HTMLElement).style.display = 'none';

  // Criar container da página de configurações, se não existir
  let settingsPage = document.getElementById('settings-page');
  if (!settingsPage) {
    settingsPage = document.createElement('section');
    settingsPage.id = 'settings-page';
    settingsPage.className = 'settings-page container';
    main.appendChild(settingsPage);
  }

  // Garantir que o painel flutuante esteja fechado
  const floatingSettings = document.querySelector('.settings-panel') as HTMLElement | null;
  if (floatingSettings) {
    floatingSettings.classList.remove('visible');
  }

  settingsPage.style.display = 'block';

  // Renderizar conteúdo (reutilizando estrutura do painel)
  settingsPage.innerHTML = `
    <div class="settings-content">
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          <div class="settings-section-title">
            <h4>Modo Escuro</h4>
            <p>Ative ou desative o modo escuro</p>
          </div>
        </div>
        <div class="toggle-switch">
          <span class="toggle-switch-label">Modo Escuro</span>
          <div class="toggle-switch-input" id="dark-mode-toggle"></div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
              <path d="M13 13l6 6"></path>
            </svg>
          </div>
          <div class="settings-section-title">
            <h4>Cursor Personalizado</h4>
            <p>Personalize o ponteiro do mouse</p>
          </div>
        </div>
        <div class="toggle-switch">
          <span class="toggle-switch-label">Habilitar Cursor</span>
          <div class="toggle-switch-input" id="cursor-enabled-toggle"></div>
        </div>
        <div class="cursor-select" id="cursor-select">
          <div class="cursor-option" data-cursor="classic">Clássico</div>
          <div class="cursor-option" data-cursor="dot">Ponto</div>
          <div class="cursor-option" data-cursor="square">Quadrado</div>
          <div class="cursor-option" data-cursor="crosshair">Mira</div>
          <div class="cursor-option" data-cursor="glow">Glow</div>
          <div class="cursor-option" data-cursor="outline">Outline</div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div class="settings-section-title">
            <h4>Modelo de IA</h4>
            <p>Escolha o modelo para agentes e geração de disciplinas</p>
          </div>
        </div>
        <div class="model-select" id="model-select">
          <select class="model-select-input" id="gemini-model-select">
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-flash-lite-latest">Gemini Flash Lite (Latest)</option>
            <option value="gemini-flash-latest">Gemini Flash (Latest)</option>
          </select>
        </div>
        <div class="model-advanced-config" id="model-advanced-config">
          <div class="config-row">
            <label for="config-temperature">
              <span>Temperature</span>
              <small>Controla aleatoriedade (0.0-2.0)</small>
            </label>
            <div class="config-input-group">
              <input type="range" id="config-temperature" min="0" max="2" step="0.1" value="1.0">
              <span class="config-value" id="config-temperature-value">1.0</span>
            </div>
          </div>
          <div class="config-row">
            <label for="config-topP">
              <span>Top P</span>
              <small>Nucleus sampling (0.0-1.0)</small>
            </label>
            <div class="config-input-group">
              <input type="range" id="config-topP" min="0" max="1" step="0.05" value="0.95">
              <span class="config-value" id="config-topP-value">0.95</span>
            </div>
          </div>
          <div class="config-row">
            <label for="config-topK">
              <span>Top K</span>
              <small>Top-K sampling (1-40)</small>
            </label>
            <div class="config-input-group">
              <input type="range" id="config-topK" min="1" max="40" step="1" value="40">
              <span class="config-value" id="config-topK-value">40</span>
            </div>
          </div>
          <div class="config-row">
            <label for="config-maxOutputTokens">
              <span>Max Output Tokens</span>
              <small id="maxOutputTokens-desc">Máximo de tokens na resposta (1-65536)</small>
            </label>
            <div class="config-input-group">
              <input type="number" id="config-maxOutputTokens" min="1" max="65536" step="1" value="65536" class="config-number-input">
              <input type="range" id="config-maxOutputTokens-range" min="1" max="65536" step="100" value="65536">
              <span class="config-value" id="config-maxOutputTokens-value">65536</span>
            </div>
          </div>
          <div class="config-row" id="config-enable-google-search-row">
            <label for="config-enableGoogleSearch">
              <span>Google Search (Embasamento)</span>
              <small>Permite que o modelo pesquise na web para respostas mais precisas e atualizadas</small>
            </label>
            <div class="toggle-switch">
              <span class="toggle-switch-label">Enable Google Search</span>
              <div class="toggle-switch-input" id="config-enableGoogleSearch-toggle"></div>
            </div>
          </div>
          <div class="config-row" id="config-image-size-row" style="display: none;">
            <label for="config-imageSize">
              <span>Image Size</span>
              <small>Apenas para Gemini 2.5 Pro</small>
            </label>
            <div class="config-input-group">
              <select id="config-imageSize" class="config-select">
                <option value="1K">1K</option>
                <option value="2K">2K</option>
                <option value="4K">4K</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <div class="settings-section-title">
            <h4>Gerenciamento</h4>
            <p>Edite e organize as disciplinas</p>
          </div>
        </div>
        <div class="settings-actions">
          <button class="btn-admin-settings" id="btn-admin-settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Gerenciar Disciplinas</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Reativar binds dos componentes
  // - Event delegation já está configurado, apenas atualizar estados
  // Usar setTimeout para garantir que o DOM esteja completamente renderizado
  setTimeout(() => {
    settingsPanel?.updateToggleStates();
    settingsPanel?.initModelSelect();
    settingsPanel?.initCursorOptions();
    // Botão admin é tratado por event delegation no SettingsPanel
    // Atualizar targets de cursor na nova página
    cursorService.updateCursorTargets();
    
    // Garantir que as configurações avançadas sejam atualizadas
    const currentModel = geminiService.getModel();
    const currentConfig = geminiService.getGenerationConfig();
    settingsPanel?.updateAdvancedConfigUI?.(currentConfig, currentModel);
  }, 150);
}

/**
 * Mostra página de Agentes
 */
function showAgentsPage(): void {
  const main = document.querySelector('main');
  if (!main) return;

  // Esconder outras seções
  const hero = document.querySelector('.hero') as HTMLElement;
  const disciplines = document.querySelector('.disciplines') as HTMLElement;
  const myCoursesContainer = document.getElementById('my-courses-container');
  const placeholderContainer = document.getElementById('placeholder-container');
  const exploreContainer = document.getElementById('explore-container');
  const settingsPageContainer = document.getElementById('settings-page');
  const continueSection = document.getElementById('continue-section');
  if (hero) hero.style.display = 'none';
  if (disciplines) disciplines.style.display = 'none';
  if (myCoursesContainer) myCoursesContainer.style.display = 'none';
  if (placeholderContainer) placeholderContainer.style.display = 'none';
  if (exploreContainer) exploreContainer.style.display = 'none';
  if (settingsPageContainer) settingsPageContainer.style.display = 'none';
  if (continueSection) (continueSection as HTMLElement).style.display = 'none';

  // Criar container da página de agentes, se não existir
  let agentsPage = document.getElementById('agents-page');
  if (!agentsPage) {
    agentsPage = document.createElement('section');
    agentsPage.id = 'agents-page';
    agentsPage.className = 'agents-page container';
    main.appendChild(agentsPage);
  }

  agentsPage.style.display = 'block';

  // Renderizar AgentsPanel
  if (agentsPanel) {
    agentsPage.innerHTML = '';
    agentsPage.appendChild(agentsPanel.create());
  }

  // Atualizar targets de cursor
  setTimeout(() => {
    cursorService.updateCursorTargets();
  }, 100);
}

/**
 * Mostra página Home com preview
 */
function showHome(): void {
  const hero = document.querySelector('.hero') as HTMLElement;
  const disciplines = document.querySelector('.disciplines') as HTMLElement;
  const main = document.querySelector('main');
  if (!main) return;

  // Mostrar hero, esconder disciplines
  if (hero) hero.style.display = 'block';
  if (disciplines) disciplines.style.display = 'none';

  // Criar ou atualizar seção "Continue de onde parou"
  let continueSection = document.getElementById('continue-section');
  if (!continueSection) {
    continueSection = document.createElement('section');
    continueSection.id = 'continue-section';
    continueSection.className = 'continue-section container';
    main.appendChild(continueSection);
  }

  continueSection.style.display = 'block';
  
  const allDisciplines = dataService.getAllDisciplines();
  const inProgressDisciplines = Object.entries(allDisciplines)
    .filter(([_, discipline]) => discipline.progress > 0 && discipline.progress < 100)
    .slice(0, 3); // Mostrar apenas 3 cursos em progresso

  continueSection.innerHTML = `
    <div class="continue-header">
      <h2>Continue de onde parou</h2>
      <p>Retome seus estudos</p>
    </div>
    ${inProgressDisciplines.length > 0 
      ? `<div class="continue-grid">
          ${inProgressDisciplines.map(([id, discipline]) => 
            DisciplineCard.render(discipline, id)
          ).join('')}
        </div>`
      : '<div class="empty-state"><p>Você ainda não iniciou nenhum curso</p><small>Explore nossos cursos e comece sua jornada!</small></div>'
    }
  `;

  // Reattach event listeners
  attachModalTriggers();
}

/**
 * Mostra página "Meus Cursos"
 */
function showMyCourses(): void {
  const main = document.querySelector('main');
  if (!main) return;

  // Criar container se não existir
  let myCoursesContainer = document.getElementById('my-courses-container');
  if (!myCoursesContainer) {
    myCoursesContainer = document.createElement('section');
    myCoursesContainer.id = 'my-courses-container';
    myCoursesContainer.className = 'my-courses container';
    main.appendChild(myCoursesContainer);
  }

  myCoursesContainer.style.display = 'block';
  
  const disciplines = dataService.getAllDisciplines();
  const inProgressDisciplines = Object.entries(disciplines).filter(
    ([_, discipline]) => discipline.progress > 0 && discipline.progress < 100
  );

  myCoursesContainer.innerHTML = `
    <div class="my-courses-header">
      <h2>Meus Cursos</h2>
      <p>Continue de onde parou</p>
    </div>
    <div class="my-courses-grid">
      ${inProgressDisciplines.length > 0 
        ? inProgressDisciplines.map(([id, discipline]) => 
            DisciplineCard.render(discipline, id)
          ).join('')
        : '<div class="empty-state"><p>Você ainda não iniciou nenhum curso</p><small>Explore nossos cursos disponíveis e comece sua jornada!</small></div>'
      }
    </div>
  `;

  // Reattach event listeners
  attachModalTriggers();
}

/**
 * Mostra página Explorar com todos os cursos
 */
function showExplore(): void {
  // Mostrar a seção padrão de disciplinas (com Grid/Grafo)
  const disciplinesSection = document.querySelector('.disciplines') as HTMLElement | null;
  if (disciplinesSection) {
    disciplinesSection.style.display = 'block';
  }
  // Garantir que o bloco "Continue de onde parou" não apareça aqui
  const continueSection = document.getElementById('continue-section');
  if (continueSection) (continueSection as HTMLElement).style.display = 'none';

  // Re-render para garantir interatividade (cards + grafo)
  renderAll();
  initViewToggle();
  attachModalTriggers();
  // Resetar view para grid ao entrar em Explorar
  const viewToggleHeader = document.querySelector('.view-toggle-header');
  const viewToggle = document.querySelector('.view-toggle');
  const disciplinesContainer = document.querySelector('.disciplines-container');
  if (viewToggleHeader) viewToggleHeader.setAttribute('data-view', 'grid');
  if (viewToggle) viewToggle.setAttribute('data-view', 'grid');
  if (disciplinesContainer) disciplinesContainer.classList.remove('graph-view');

  setTimeout(() => cursorService.updateCursorTargets(), 50);
}

/**
 * Mostra placeholder para páginas futuras
 */
function showPlaceholder(title: string, description: string): void {
  const main = document.querySelector('main');
  if (!main) return;

  let placeholderContainer = document.getElementById('placeholder-container');
  if (!placeholderContainer) {
    placeholderContainer = document.createElement('section');
    placeholderContainer.id = 'placeholder-container';
    placeholderContainer.className = 'placeholder container';
    main.appendChild(placeholderContainer);
  }

  placeholderContainer.style.display = 'flex';
  placeholderContainer.innerHTML = `
    <div class="placeholder-content">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
      </svg>
      <h2>${title}</h2>
      <p>${description}</p>
    </div>
  `;
}

/**
 * Setup CommandPalette com itens de busca
 */
function setupCommandPalette(): void {
  const disciplines = dataService.getAllDisciplines();
  const searchItems: SearchItem[] = [];

  // Adicionar disciplinas
  Object.entries(disciplines).forEach(([id, discipline]) => {
    searchItems.push({
      id: `curso-${id}`,
      title: discipline.title,
      category: 'curso',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`,
      keywords: [discipline.description, ...(discipline.syllabus || [])],
      action: () => {
        const card = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
        if (card && modal) {
          modal.open(id, discipline, card);
        }
      }
    });
  });

  // Adicionar ações
  searchItems.push(
    {
      id: 'action-home',
      title: 'Ir para Home',
      category: 'acao',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`,
      keywords: ['início', 'principal'],
      action: () => handleNavigation('home')
    },
    {
      id: 'action-my-courses',
      title: 'Meus Cursos',
      category: 'acao',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect></svg>`,
      keywords: ['progresso', 'continuar'],
      action: () => handleNavigation('meus-cursos')
    },
    {
      id: 'action-settings',
      title: 'Abrir Configurações',
      category: 'config',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
      keywords: ['preferências', 'temas', 'cursor'],
      action: () => handleNavigation('configuracoes')
    },
    {
      id: 'action-admin',
      title: 'Gerenciar Disciplinas',
      category: 'config',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
      keywords: ['admin', 'editar', 'adicionar'],
      action: () => adminPanel.open()
    }
  );

  commandPalette.registerItems(searchItems);
}

// Expor renderAll globalmente para acesso externo
(window as any).renderAll = renderAll;

// Função para adicionar item de teste no exemplo visual
(window as any).addTestSyllabusItem = function() {
  const container = document.getElementById('syllabus-test-example');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'syllabus-item';
  div.style.cssText = 'display: flex !important; gap: var(--space-m) !important; align-items: center !important; width: 100% !important; padding: var(--space-m) var(--space-l) !important; background: rgba(255, 255, 255, 0.02) !important; border: 1px solid var(--border-subtle) !important; border-radius: var(--border-radius-small) !important; visibility: visible !important; opacity: 1 !important;';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = 'Novo Item de Teste';
  input.placeholder = 'Tópico do syllabus';
  input.readOnly = true;
  input.style.cssText = 'flex: 1 !important; width: 100% !important; min-width: 200px !important; padding: var(--space-m) var(--space-l) !important; background: var(--surface-2) !important; border: 1px solid var(--border-subtle) !important; border-radius: var(--border-radius-small) !important; color: var(--text-primary) !important; font-family: var(--font-body) !important; font-size: 0.95rem !important; cursor: default !important; display: block !important; visibility: visible !important; opacity: 1 !important;';
  
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-remove-syllabus';
  removeBtn.setAttribute('aria-label', 'Remover item');
  removeBtn.style.cssText = 'width: 36px !important; height: 36px !important; min-width: 36px !important; padding: 0 !important; background: rgba(255, 65, 65, 0.15) !important; border: 2px solid rgba(255, 65, 65, 0.4) !important; border-radius: 50% !important; color: #ff4141 !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; line-height: 1 !important; font-size: 0 !important; box-shadow: 0 2px 6px rgba(255, 65, 65, 0.2) !important;';
  removeBtn.onclick = function() {
    div.remove();
  };
  
  removeBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px !important; height: 18px !important; stroke: currentColor !important; stroke-width: 2.5 !important; pointer-events: none !important; flex-shrink: 0 !important; display: block !important; opacity: 1 !important;">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  
  div.appendChild(input);
  div.appendChild(removeBtn);
  container.appendChild(div);
};

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initializeApp();
  });
} else {
  initPreloader();
  initializeApp();
}
