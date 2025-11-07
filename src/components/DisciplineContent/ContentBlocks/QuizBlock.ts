/**
 * QuizBlock - Renderizador de quizzes inline para conteúdo markdown
 */

/**
 * Interface para dados de quiz
 */
interface QuizData {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Classe para renderizar quizzes interativos a partir de elementos HTML
 */
export class QuizBlock {
  /**
   * Renderiza um quiz interativo dentro de um container
   * @param container - Elemento HTML que será substituído pelo quiz
   * @param quizData - Dados do quiz
   */
  static render(container: HTMLElement, quizData: QuizData): void {
    const quizHTML = `
      <div class="quiz-block" data-quiz-id="${quizData.id}">
        <h4 class="quiz-title">❓ ${quizData.question}</h4>
        <div class="quiz-options">
          ${quizData.options
            .map(
              (opt: string, idx: number) => `
            <button class="quiz-option" data-index="${idx}">
              <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
              <span class="quiz-option-text">${opt}</span>
            </button>
          `
            )
            .join('')}
        </div>
        <div class="quiz-feedback" style="display: none;"></div>
        <div class="quiz-explanation" style="display: none;">
          <strong>📚 Explicação:</strong> ${quizData.explanation}
        </div>
      </div>
    `;

    container.innerHTML = quizHTML;

    // Adicionar event listeners
    const options = container.querySelectorAll('.quiz-option');
    options.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const correct = idx === quizData.correctIndex;
        const feedback = container.querySelector('.quiz-feedback') as HTMLElement;
        const explanation = container.querySelector('.quiz-explanation') as HTMLElement;

        feedback.style.display = 'block';
        explanation.style.display = 'block';

        if (correct) {
          feedback.className = 'quiz-feedback correct';
          feedback.innerHTML = '<strong>✅ Correto!</strong>';
          btn.classList.add('correct');
        } else {
          feedback.className = 'quiz-feedback incorrect';
          feedback.innerHTML = '<strong>❌ Incorreto!</strong>';
          btn.classList.add('incorrect');
          options[quizData.correctIndex].classList.add('correct');
        }

        // Desabilitar todas as opções
        options.forEach((o) => ((o as HTMLButtonElement).disabled = true));
      });
    });
  }

  /**
   * Processa todos os elementos [data-quiz] em um container
   * @param container - Container com elementos de quiz
   */
  static processAll(container: HTMLElement): void {
    const quizElements = container.querySelectorAll('[data-quiz]');
    
    quizElements.forEach((el) => {
      try {
        const dataAttr = el.getAttribute('data-quiz');
        if (!dataAttr) return;

        const quizData = JSON.parse(dataAttr) as QuizData;
        this.render(el as HTMLElement, quizData);
      } catch (error) {
        console.error('Erro ao processar quiz:', error);
        (el as HTMLElement).innerHTML = `
          <div class="quiz-error">
            <strong>⚠️ Erro ao carregar quiz</strong>
            <p>Não foi possível processar os dados do quiz.</p>
          </div>
        `;
      }
    });
  }
}

