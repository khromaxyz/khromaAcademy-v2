/**
 * Ponto de entrada da aplicação KhromaAcademy
 */

import { dataService, themeService, cursorService } from '@/services';
import { Header } from '@/components/Header/Header';
import { SettingsPanel } from '@/components/SettingsPanel/SettingsPanel';
import { DisciplineCard } from '@/components/DisciplineCard/DisciplineCard';
import { KnowledgeGraph } from '@/components/KnowledgeGraph/KnowledgeGraph';
import { Modal } from '@/components/Modal/Modal';
import { AdminPanel } from '@/components/AdminPanel/AdminPanel';
import { DisciplineContent } from '@/components/DisciplineContent/DisciplineContent';
import './styles/index.css';

// Importar CSS dos componentes
import './components/Header/Header.css';
import './components/SettingsPanel/SettingsPanel.css';
import './components/DisciplineCard/DisciplineCard.css';
import './components/KnowledgeGraph/KnowledgeGraph.css';
import './components/Modal/Modal.css';
import './components/AdminPanel/AdminPanel.css';
import './components/DisciplineContent/DisciplineContent.css';

// Instâncias dos componentes
let header: Header;
let settingsPanel: SettingsPanel;
let knowledgeGraph: KnowledgeGraph;
let modal: Modal;
let adminPanel: AdminPanel;
let disciplineContent: DisciplineContent;

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
  const cards = document.querySelectorAll('.discipline-card');
  
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
  const viewToggle = document.querySelector('.view-toggle');
  const viewButtons = document.querySelectorAll('.view-btn');
  const disciplinesContainer = document.querySelector('.disciplines-container');

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.getAttribute('data-view');
      if (view && viewToggle && disciplinesContainer) {
        viewToggle.setAttribute('data-view', view);
        disciplinesContainer.classList.toggle('graph-view', view === 'graph');
      }
    });
  });
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

  // Inicializar componentes
  header = new Header();
  header.init();

  settingsPanel = new SettingsPanel();
  settingsPanel.init();

  knowledgeGraph = new KnowledgeGraph();
  knowledgeGraph.init();

  modal = Modal.getInstance();
  modal.init();

  adminPanel = new AdminPanel();
  adminPanel.init();

  disciplineContent = DisciplineContent.getInstance();
  disciplineContent.init();

  // Renderizar conteúdo
  renderAll();
  initViewToggle();

  // Escutar atualizações de disciplinas
  window.addEventListener('disciplines-updated', () => {
    renderAll();
    adminPanel.refreshDisciplinesList();
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
