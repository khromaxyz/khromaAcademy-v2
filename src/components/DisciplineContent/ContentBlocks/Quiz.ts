/**
 * Quiz Component
 * Componente de quiz interativo
 */

import './Quiz.css';

export interface QuizOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  hint?: string;
}

export interface QuizOptions {
  showResultsImmediately?: boolean;
  allowRetry?: boolean;
  className?: string;
}

/**
 * Classe Quiz para criar quizzes interativos
 */
export class Quiz {
  private container: HTMLElement;
  private questions: QuizQuestion[];
  private options: QuizOptions;
  private currentQuestionIndex: number = 0;
  private score: number = 0;
  private answers: (number | null)[] = [];

  constructor(questions: QuizQuestion[], options: QuizOptions = {}) {
    this.questions = questions;
    this.options = {
      showResultsImmediately: true,
      allowRetry: true,
      ...options
    };
    this.answers = new Array(questions.length).fill(null);
    this.container = this.create();
  }

  private create(): HTMLElement {
    const quiz = document.createElement('div');
    quiz.className = `quiz ${this.options.className || ''}`.trim();

    quiz.innerHTML = `
      <div class="quiz-header">
        <div class="quiz-progress">
          <span class="quiz-progress-text">Questão <span class="current-question">1</span> de ${this.questions.length}</span>
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: 0%"></div>
          </div>
        </div>
      </div>
      <div class="quiz-body"></div>
    `;

    this.renderQuestion(0);
    return quiz;
  }

  private renderQuestion(index: number): void {
    const question = this.questions[index];
    const body = this.container.querySelector('.quiz-body');
    if (!body) return;

    const isAnswered = this.answers[index] !== null;

    body.innerHTML = `
      <div class="quiz-question">
        <h3>${question.question}</h3>
        ${question.hint ? `<div class="quiz-hint">💡 Dica: ${question.hint}</div>` : ''}
      </div>
      <div class="quiz-options">
        ${question.options.map((option, i) => `
          <button 
            class="quiz-option ${isAnswered && i === this.answers[index] ? (option.isCorrect ? 'correct' : 'wrong') : ''}"
            data-index="${i}"
            ${isAnswered ? 'disabled' : ''}
          >
            <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
            <span class="quiz-option-text">${option.text}</span>
            ${isAnswered && i === this.answers[index] && option.explanation ? `
              <div class="quiz-explanation">${option.explanation}</div>
            ` : ''}
          </button>
        `).join('')}
      </div>
      <div class="quiz-navigation">
        ${index > 0 ? '<button class="btn-secondary" data-action="prev">← Anterior</button>' : '<div></div>'}
        ${index < this.questions.length - 1 
          ? '<button class="btn-secondary" data-action="next" disabled>Próxima →</button>'
          : '<button class="btn-primary" data-action="finish" disabled>Finalizar</button>'
        }
      </div>
    `;

    this.setupQuestionListeners(index);
    this.updateProgress();
  }

  private setupQuestionListeners(index: number): void {
    const options = this.container.querySelectorAll('.quiz-option');
    options.forEach((option) => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const optionIndex = parseInt(target.dataset.index || '0');
        this.selectAnswer(index, optionIndex);
      });
    });

    const prevBtn = this.container.querySelector('[data-action="prev"]');
    prevBtn?.addEventListener('click', () => this.goToPrevious());

    const nextBtn = this.container.querySelector('[data-action="next"]');
    nextBtn?.addEventListener('click', () => this.goToNext());

    const finishBtn = this.container.querySelector('[data-action="finish"]');
    finishBtn?.addEventListener('click', () => this.finish());
  }

  private selectAnswer(questionIndex: number, optionIndex: number): void {
    this.answers[questionIndex] = optionIndex;
    const question = this.questions[questionIndex];
    const isCorrect = question.options[optionIndex].isCorrect;

    if (isCorrect) {
      this.score++;
    }

    if (this.options.showResultsImmediately) {
      this.renderQuestion(questionIndex);
      
      // Habilitar botão de próxima
      const nextBtn = this.container.querySelector('[data-action="next"]') as HTMLButtonElement;
      const finishBtn = this.container.querySelector('[data-action="finish"]') as HTMLButtonElement;
      if (nextBtn) nextBtn.disabled = false;
      if (finishBtn) finishBtn.disabled = false;
    }
  }

  private goToPrevious(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderQuestion(this.currentQuestionIndex);
    }
  }

  private goToNext(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderQuestion(this.currentQuestionIndex);
    }
  }

  private finish(): void {
    const percentage = Math.round((this.score / this.questions.length) * 100);
    
    const body = this.container.querySelector('.quiz-body');
    if (!body) return;

    body.innerHTML = `
      <div class="quiz-results">
        <div class="quiz-results-score">
          <div class="quiz-results-percentage">${percentage}%</div>
          <div class="quiz-results-text">Você acertou ${this.score} de ${this.questions.length} questões</div>
        </div>
        ${this.options.allowRetry ? `
          <button class="btn-primary" data-action="retry">Tentar Novamente</button>
        ` : ''}
      </div>
    `;

    const retryBtn = body.querySelector('[data-action="retry"]');
    retryBtn?.addEventListener('click', () => this.retry());
  }

  private retry(): void {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.answers = new Array(this.questions.length).fill(null);
    this.renderQuestion(0);
  }

  private updateProgress(): void {
    const current = this.container.querySelector('.current-question');
    const progressFill = this.container.querySelector('.quiz-progress-fill') as HTMLElement;
    
    if (current) current.textContent = String(this.currentQuestionIndex + 1);
    if (progressFill) {
      const percentage = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
      progressFill.style.width = `${percentage}%`;
    }
  }

  getElement(): HTMLElement {
    return this.container;
  }

  static create(questions: QuizQuestion[], options?: QuizOptions): HTMLElement {
    const quiz = new Quiz(questions, options);
    return quiz.getElement();
  }
}

