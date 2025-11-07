import type { Discipline } from '@/types';

/**
 * Utilitário para criar cards de disciplina
 */
export class DisciplineCard {
  /**
   * Renderiza um card de disciplina
   */
  static render(discipline: Discipline, id: string): string {
    // Tratar ícones SVG complexos ou simples strings de ícone
    const iconHtml = discipline.icon.startsWith('<svg') 
      ? discipline.icon.replace(/<svg/g, `<svg style="stroke: ${discipline.color};"`)
      : `<div class="card-icon-placeholder" style="color: ${discipline.color};">${discipline.code}</div>`;
    
    const periodLabel = typeof discipline.period === 'number' 
      ? `${discipline.period}º Período` 
      : discipline.period;
    
    return `
      <article class="discipline-card link" data-id="${id}" data-progress="${discipline.progress}" style="--card-progress: ${discipline.progress}%;">
        <div class="card-inner">
          <div class="card-illustration" style="color: ${discipline.color};">
            ${iconHtml}
          </div>
          <div class="card-content">
            <div class="card-code">${discipline.code}</div>
            <h3>${discipline.title}</h3>
            <div class="card-meta">
              <span>${periodLabel}</span>
              <span class="card-progress-indicator">${discipline.progress}%</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }
}

