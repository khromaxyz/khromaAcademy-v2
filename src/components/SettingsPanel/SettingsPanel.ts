import type { CursorType } from '@/types';
import { cursorService } from '@/services';
import './SettingsPanel.css';

/**
 * Componente SettingsPanel
 */
export class SettingsPanel {
  /**
   * Inicializa o painel de configurações
   */
  init(): void {
    this.initCursorToggle();
    this.initCursorOptions();
    this.initAdminButton();
  }

  /**
   * Inicializa o toggle do cursor
   */
  private initCursorToggle(): void {
    const toggle = document.getElementById('cursor-enabled-toggle');
    if (!toggle) return;

    const config = cursorService.getConfig();
    toggle.classList.toggle('active', config.enabled);

    toggle.addEventListener('click', () => {
      cursorService.toggle();
      const isEnabled = cursorService.getConfig().enabled;
      toggle.classList.toggle('active', isEnabled);
    });
  }

  /**
   * Inicializa as opções de cursor
   */
  private initCursorOptions(): void {
    const options = document.querySelectorAll('.cursor-option');
    const config = cursorService.getConfig();

    options.forEach((option) => {
      const cursorType = option.getAttribute('data-cursor') as CursorType;
      if (cursorType === config.type) {
        option.classList.add('active');
      }

      option.addEventListener('click', () => {
        options.forEach((opt) => opt.classList.remove('active'));
        option.classList.add('active');
        cursorService.setType(cursorType);
      });
    });
  }

  /**
   * Inicializa o botão de admin
   */
  private initAdminButton(): void {
    const btn = document.getElementById('btn-admin-settings');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const adminPanel = document.getElementById('admin-panel');
      const settingsPanel = document.querySelector('.settings-panel');
      if (adminPanel && settingsPanel) {
        settingsPanel.classList.remove('visible');
        adminPanel.classList.add('visible');
      }
    });
  }
}

