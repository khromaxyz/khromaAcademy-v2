import type { ThemeType, ThemeConfig, ThemeConfigs } from '@/types/theme';
import { forceReflow, nextFrame } from '@/utils/animations';

const STORAGE_KEY = 'khroma-theme';

/**
 * Configurações de todos os temas disponíveis
 */
const THEME_CONFIGS: ThemeConfigs = {
  rgb: {
    primaryHighlight: '#41FF41',
    gradientMain:
      'linear-gradient(90deg, #FF4141, #F2FF41, #41FF41, #41FFFF, #4141FF, #FF41FF)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #FF4141 0%, #F2FF41 15%, #41FF41 33%, #41FFFF 50%, #4141FF 66%, #FF41FF 85%, #FF4141 100%)',
  },
  red: {
    primaryHighlight: '#FF4141',
    gradientMain: 'linear-gradient(90deg, #FF4141, #FF6B6B, #FF8D8D)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #FF4141, #FF6B6B, #FF8D8D, #FF4141)',
  },
  green: {
    primaryHighlight: '#41FF41',
    gradientMain: 'linear-gradient(90deg, #41FF41, #6BFF6B, #A3FFA3)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #41FF41, #6BFF6B, #A3FFA3, #41FF41)',
  },
  blue: {
    primaryHighlight: '#4141FF',
    gradientMain: 'linear-gradient(90deg, #4141FF, #6B6BFF, #8D8DFF)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #4141FF, #6B6BFF, #8D8DFF, #4141FF)',
  },
  purple: {
    primaryHighlight: '#B441FF',
    gradientMain: 'linear-gradient(90deg, #B441FF, #C66BFF, #D88DFF)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #B441FF, #C66BFF, #D88DFF, #B441FF)',
  },
  orange: {
    primaryHighlight: '#FF8D41',
    gradientMain: 'linear-gradient(90deg, #FF8D41, #FFA66B, #FFC18D)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #FF8D41, #FFA66B, #FFC18D, #FF8D41)',
  },
  cyan: {
    primaryHighlight: '#41FFFF',
    gradientMain: 'linear-gradient(90deg, #41FFFF, #6BFFFF, #8DFFFF)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #41FFFF, #6BFFFF, #8DFFFF, #41FFFF)',
  },
  pink: {
    primaryHighlight: '#FF41C1',
    gradientMain: 'linear-gradient(90deg, #FF41C1, #FF6BCD, #FF8DD9)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #FF41C1, #FF6BCD, #FF8DD9, #FF41C1)',
  },
  yellow: {
    primaryHighlight: '#F2FF41',
    gradientMain: 'linear-gradient(90deg, #F2FF41, #F5FF6B, #F8FF8D)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #F2FF41, #F5FF6B, #F8FF8D, #F2FF41)',
  },
  monochrome: {
    primaryHighlight: '#FFFFFF',
    gradientMain: 'linear-gradient(90deg, #FFFFFF, #CCCCCC, #888888)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #FFFFFF, #CCCCCC, #888888, #FFFFFF)',
  },
  neon: {
    primaryHighlight: '#00FFFF',
    gradientMain: 'linear-gradient(90deg, #FF00FF, #00FFFF, #FFFF00, #FF00FF)',
    gradientConic:
      'conic-gradient(from 180deg at 50% 50%, #FF00FF 0%, #00FFFF 33%, #FFFF00 66%, #FF00FF 100%)',
  },
};

/**
 * Serviço para gerenciamento de temas
 */
export class ThemeService {
  private currentTheme: ThemeType = 'rgb';

  /**
   * Carrega o tema salvo do localStorage
   */
  loadTheme(): ThemeType {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme = (saved as ThemeType) || 'rgb';
    this.applyTheme(theme);
    return theme;
  }

  /**
   * Aplica um tema no documento
   */
  applyTheme(theme: ThemeType): void {
    if (!theme) return;

    this.currentTheme = theme;

    // Remover tema antigo
    const oldTheme = document.body.getAttribute('data-theme');
    if (oldTheme) {
      document.body.classList.remove(`theme-${oldTheme}`);
      document.documentElement.classList.remove(`theme-${oldTheme}`);
    }

    // Aplicar novo tema
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.classList.add(`theme-${theme}`);

    // Forçar reflow
    forceReflow(document.body);
    forceReflow(document.documentElement);

    // Atualizar botões de tema
    document.querySelectorAll('.theme-btn-enhanced').forEach((btn) => {
      const btnTheme = btn.getAttribute('data-theme');
      if (btnTheme === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Forçar atualização de elementos que usam o tema
    nextFrame().then(() => {
      const elementsToUpdate = document.querySelectorAll(
        '.logo, .highlight-chroma, .theme-btn-enhanced.active, .login-btn, .settings-header, .cursor'
      );
      elementsToUpdate.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.transition = 'none';
        forceReflow(htmlEl);
        htmlEl.style.transition = '';
      });
    });
  }

  /**
   * Salva o tema atual no localStorage
   */
  saveTheme(): void {
    localStorage.setItem(STORAGE_KEY, this.currentTheme);
  }

  /**
   * Retorna o tema atual
   */
  getCurrentTheme(): ThemeType {
    return this.currentTheme;
  }

  /**
   * Retorna a configuração de um tema
   */
  getThemeConfig(theme: ThemeType): ThemeConfig | undefined {
    return THEME_CONFIGS[theme];
  }

  /**
   * Retorna todas as configurações de temas
   */
  getAllThemeConfigs(): ThemeConfigs {
    return THEME_CONFIGS;
  }

  /**
   * Lista todos os temas disponíveis
   */
  getAvailableThemes(): ThemeType[] {
    return Object.keys(THEME_CONFIGS) as ThemeType[];
  }
}

// Singleton instance
export const themeService = new ThemeService();

