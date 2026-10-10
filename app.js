// Gerenciador de Estado do Jogo e Lógica do Quiz
class ScaleMasterApp {
  constructor() {
    this.config = {
      scaleType: 'all', // 'all', 'major', 'minor'
      gameMode: 'score', // 'score' (Pontuação) ou 'timeattack' (Contra o Tempo)
      scoreRoundTime: 60, // 30, 60, 120, 0 (zen)
      timeAttackStartTime: 20, // 10, 20, 30
      selectedTonalities: new Set()
    };

    this.gameState = {
      score: 0,
      streak: 0,
      maxStreak: 0,
      totalAnswered: 0,
      correctAnswers: 0,
      timeLeft: 60,
      timerInterval: null,
      currentScale: null,
      currentDegreeIndex: 0,
      correctNoteObj: null,
      lastAnswerTime: 0,
      mistakes: [],
      isAnsweringLocked: false,
      bestScore: parseInt(localStorage.getItem('mestre_escalas_best_score') || '0', 10)
    };

    this.initDOM();
    this.renderTonalityFilters();
    this.renderReferenceTable();
    this.bindEvents();
    this.updateBestScoreDisplay();
  }

  initDOM() {
    // Telas
    this.screenIdle = document.getElementById('game-idle-screen');
    this.screenActive = document.getElementById('game-active-screen');
    this.screenGameOver = document.getElementById('game-over-screen');

    // Stats
    this.streakCounter = document.getElementById('streak-counter');
    this.bestScoreDisplay = document.getElementById('best-score');
    this.currentScoreDisplay = document.getElementById('current-score');
    this.comboBadge = document.getElementById('combo-badge');
    this.timerDisplay = document.getElementById('timer-display');
    this.timeProgressBar = document.getElementById('time-progress-bar');

    // Question
    this.questionText = document.getElementById('question-text');
    this.choiceGrid = document.getElementById('choice-grid');
    this.feedbackBanner = document.getElementById('feedback-banner');
    this.feedbackIcon = document.getElementById('feedback-icon');
    this.feedbackMessage = document.getElementById('feedback-message');

    // Modal
    this.modal = document.getElementById('reference-modal');
    this.scalesTableBody = document.getElementById('scales-table-body');
  }

  renderTonalityFilters() {
    const container = document.getElementById('tonality-filter');
    container.innerHTML = '';

    // Filtra pelo tipo selecionado (Maiores, Menores ou Todas) mantendo a ordem exata de SCALES_DATA
    let filteredScales = SCALES_DATA;
    if (this.config.scaleType !== 'all') {
      filteredScales = SCALES_DATA.filter(s => s.type === this.config.scaleType);
    }

    filteredScales.forEach(scale => {
      this.config.selectedTonalities.add(scale.id);
      const tag = document.createElement('div');
      tag.className = 'tonality-tag selected';
      tag.dataset.id = scale.id;
      tag.textContent = scale.shortName;
      tag.title = scale.name;

      tag.addEventListener('click', () => {
        if (this.config.selectedTonalities.has(scale.id)) {
          if (this.config.selectedTonalities.size > 1) {
            this.config.selectedTonalities.delete(scale.id);
            tag.classList.remove('selected');
          }
        } else {
          this.config.selectedTonalities.add(scale.id);
          tag.classList.add('selected');
        }
      });

      container.appendChild(tag);
    });
  }

  renderReferenceTable(filter = 'all', searchQuery = '') {
    this.scalesTableBody.innerHTML = '';
    const query = searchQuery.toLowerCase().trim();

    const filtered = SCALES_DATA.filter(scale => {
      if (filter !== 'all' && scale.type !== filter) return false;
      if (query && !scale.name.toLowerCase().includes(query) && !scale.shortName.toLowerCase().includes(query)) return false;
      return true;
    });

    filtered.forEach(scale => {
      const tr = document.createElement('tr');
      const notesFormatted = scale.notes.map(n => `<strong>${n.noteEn}</strong> (${n.notePt})`).join(' - ');

      tr.innerHTML = `
        <td><strong>${scale.name}</strong> (${scale.shortName})</td>
        <td>${scale.typeName}</td>
        <td><span style="color:#fbbf24">${scale.accidentals}</span></td>
        <td>${notesFormatted}</td>
        <td>
          <button class="listen-table-btn" data-scale-id="${scale.id}">🔊 Ouvir</button>
        </td>
      `;

      tr.querySelector('.listen-table-btn').addEventListener('click', () => {
        synth.playScaleSequence(scale.notes);
      });

      this.scalesTableBody.appendChild(tr);
    });
  }

  bindEvents() {
    // Start buttons
    document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
    document.getElementById('quick-start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
    document.getElementById('back-config-btn').addEventListener('click', () => this.showScreen('idle'));

    // In-game actions
    document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
    document.getElementById('give-up-btn').addEventListener('click', () => this.endGame());
    document.getElementById('play-scale-audio-btn').addEventListener('click', () => {
      if (this.gameState.currentScale) {
        synth.playScaleSequence(this.gameState.currentScale.notes);
      }
    });

    // Sound toggle
    document.getElementById('sound-toggle-btn').addEventListener('click', () => {
      const enabled = synth.toggleSound();
      document.getElementById('sound-icon').textContent = enabled ? '🔊' : '🔇';
    });

    // Config selectors - Scale Type
    document.querySelectorAll('#scale-type-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#scale-type-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.config.scaleType = e.currentTarget.dataset.scaleType;
        this.config.selectedTonalities.clear();
        this.renderTonalityFilters();
      });
    });

    // Config selectors - Game Mode (Pontuação vs Contra o Tempo)
    document.querySelectorAll('#question-mode-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#question-mode-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.config.gameMode = e.currentTarget.dataset.qmode;

        const timerScoreSelector = document.getElementById('timer-score-selector');
        const timerTimeAttackSelector = document.getElementById('timer-timeattack-selector');
        const timerGroupLabel = document.getElementById('timer-group-label');

        if (this.config.gameMode === 'score') {
          timerGroupLabel.textContent = 'Tempo por Rodada:';
          timerScoreSelector.style.display = 'flex';
          timerTimeAttackSelector.style.display = 'none';
        } else {
          timerGroupLabel.textContent = 'Tempo Inicial:';
          timerScoreSelector.style.display = 'none';
          timerTimeAttackSelector.style.display = 'flex';
        }
      });
    });

    // Timer selector for Score Mode
    document.querySelectorAll('#timer-score-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#timer-score-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.config.scoreRoundTime = parseInt(e.currentTarget.dataset.time, 10);
      });
    });

    // Timer selector for Time Attack Mode
    document.querySelectorAll('#timer-timeattack-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#timer-timeattack-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.config.timeAttackStartTime = parseInt(e.currentTarget.dataset.time, 10);
      });
    });

    // Quick selection buttons
    document.getElementById('select-all-btn').addEventListener('click', () => {
      let filteredScales = SCALES_DATA;
      if (this.config.scaleType !== 'all') {
        filteredScales = SCALES_DATA.filter(s => s.type === this.config.scaleType);
      }
      filteredScales.forEach(s => this.config.selectedTonalities.add(s.id));
      document.querySelectorAll('.tonality-tag').forEach(t => t.classList.add('selected'));
    });

    document.getElementById('select-naturals-btn').addEventListener('click', () => {
      this.config.selectedTonalities.clear();
      const naturalTonics = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

      document.querySelectorAll('.tonality-tag').forEach(t => {
        const id = t.dataset.id;
        const scale = SCALES_DATA.find(s => s.id === id);
        if (scale && naturalTonics.includes(scale.shortName)) {
          this.config.selectedTonalities.add(scale.id);
          t.classList.add('selected');
        } else {
          t.classList.remove('selected');
        }
      });
    });

    // Modal Reference
    document.getElementById('open-reference-btn').addEventListener('click', () => {
      this.modal.classList.add('active');
    });
    document.getElementById('close-reference-btn').addEventListener('click', () => {
      this.modal.classList.remove('active');
    });
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.modal.classList.remove('active');
    });

    // Reference filters
    document.querySelectorAll('.modal-segmented .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.modal-segmented .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const search = document.getElementById('scale-search-input').value;
        this.renderReferenceTable(e.currentTarget.dataset.refFilter, search);
      });
    });

    document.getElementById('scale-search-input').addEventListener('input', (e) => {
      const activeFilter = document.querySelector('.modal-segmented .seg-btn.active').dataset.refFilter;
      this.renderReferenceTable(activeFilter, e.target.value);
    });
  }

  showScreen(name) {
    this.screenIdle.classList.remove('active');
    this.screenActive.classList.remove('active');
    this.screenGameOver.classList.remove('active');

    if (name === 'idle') this.screenIdle.classList.add('active');
    if (name === 'active') this.screenActive.classList.add('active');
    if (name === 'over') this.screenGameOver.classList.add('active');
  }

  startGame() {
    this.gameState.score = 0;
    this.gameState.streak = 0;
    this.gameState.maxStreak = 0;
    this.gameState.totalAnswered = 0;
    this.gameState.correctAnswers = 0;
    this.gameState.mistakes = [];
    this.gameState.isAnsweringLocked = false;
    this.gameState.lastAnswerTime = Date.now();

    if (this.config.gameMode === 'timeattack') {
      this.gameState.timeLeft = this.config.timeAttackStartTime;
      this.gameState.totalInitialTime = this.config.timeAttackStartTime;
    } else {
      this.gameState.timeLeft = this.config.scoreRoundTime;
      this.gameState.totalInitialTime = this.config.scoreRoundTime;
    }

    this.updateStatsUI();
    this.showScreen('active');
    this.startTimer();
    this.generateNextQuestion();
  }

  startTimer() {
    if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);

    if (this.config.gameMode === 'score' && this.config.scoreRoundTime === 0) {
      this.timerDisplay.textContent = 'Zen ∞';
      this.timeProgressBar.style.width = '100%';
      return;
    }

    this.timerDisplay.textContent = `${this.gameState.timeLeft}s`;
    this.timeProgressBar.style.width = '100%';

    this.gameState.timerInterval = setInterval(() => {
      this.gameState.timeLeft--;
      this.timerDisplay.textContent = `${this.gameState.timeLeft}s`;

      const baseTime = Math.max(this.gameState.totalInitialTime, this.gameState.timeLeft);
      const pct = (this.gameState.timeLeft / baseTime) * 100;
      this.timeProgressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;

      if (this.gameState.timeLeft <= 0) {
        clearInterval(this.gameState.timerInterval);
        this.endGame();
      }
    }, 1000);
  }

  generateNextQuestion() {
    this.gameState.isAnsweringLocked = false;
    this.feedbackBanner.className = 'feedback-banner';
    this.gameState.lastQuestionRenderTime = Date.now();

    // 1. Filtrar lista de escalas disponíveis
    let availableScales = SCALES_DATA.filter(s => this.config.selectedTonalities.has(s.id));
    if (this.config.scaleType !== 'all') {
      availableScales = availableScales.filter(s => s.type === this.config.scaleType);
    }
    if (availableScales.length === 0) availableScales = SCALES_DATA;

    // Escolhe uma escala aleatória
    const scale = availableScales[Math.floor(Math.random() * availableScales.length)];
    this.gameState.currentScale = scale;

    // Escolhe um grau aleatório (0 a 6 => 1ª a 7ª)
    const degreeIndex = Math.floor(Math.random() * 7);
    this.gameState.currentDegreeIndex = degreeIndex;
    const targetNote = scale.notes[degreeIndex];
    this.gameState.correctNoteObj = targetNote;

    // Atualiza visual da questão no formato limpo e direto: "2º de C", "5º de Dm", etc.
    const degreeNumber = degreeIndex + 1;
    this.questionText.innerHTML = `${degreeNumber}º de ${scale.shortName}`;

    this.renderChoiceOptions(targetNote.noteEn);
  }

  renderChoiceOptions(correctNoteCipher) {
    this.choiceGrid.innerHTML = '';

    // Extrai todas as 7 notas da escala atual
    const scaleNotes = this.gameState.currentScale.notes.map(n => n.noteEn);

    // Conjunto de 4 opções que pertencem à escala
    const options = new Set();
    options.add(correctNoteCipher);

    // Sorteia outras 3 notas da própria escala
    while (options.size < 4 && options.size < scaleNotes.length) {
      const randNote = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
      options.add(randNote);
    }

    // Embaralha as 4 notas da escala
    const shuffled = Array.from(options).sort(() => Math.random() - 0.5);

    shuffled.forEach(cipherText => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = cipherText;

      btn.addEventListener('click', () => {
        if (this.gameState.isAnsweringLocked) return;
        this.handleAnswer(cipherText, btn);
      });

      this.choiceGrid.appendChild(btn);
    });
  }

  handleAnswer(selectedCipher, clickedBtn) {
    this.gameState.isAnsweringLocked = true;
    this.gameState.totalAnswered++;

    const now = Date.now();
    const timeSinceLastAnswer = (now - this.gameState.lastAnswerTime) / 1000;
    this.gameState.lastAnswerTime = now;

    const isFastCombo = timeSinceLastAnswer <= 3.0 && this.gameState.streak > 0;
    const isCorrect = selectedCipher === this.gameState.correctNoteObj.noteEn;
    const allBtns = this.choiceGrid.querySelectorAll('.choice-btn');

    if (isCorrect) {
      // Acerto!
      this.gameState.correctAnswers++;
      this.gameState.streak++;
      if (this.gameState.streak > this.gameState.maxStreak) {
        this.gameState.maxStreak = this.gameState.streak;
      }

      let feedbackText = '';

      if (this.config.gameMode === 'timeattack') {
        // Modo Contra o Tempo: +5s ou +7s se combo rápido (< 3s)
        const secondsBonus = isFastCombo ? 7 : 5;
        this.gameState.timeLeft += secondsBonus;
        this.timerDisplay.textContent = `${this.gameState.timeLeft}s`;
        feedbackText = isFastCombo ? `🔥 Combo Rápido! +${secondsBonus}s` : `Correto! +${secondsBonus}s`;
      } else {
        // Modo Pontuação: 1 ponto por acerto + multiplicador de combo
        const multiplier = Math.min(4, 1 + Math.floor(this.gameState.streak / 3) * 0.5);
        const earnedPoints = 1 * multiplier;
        this.gameState.score += earnedPoints;
        feedbackText = `Correto! +${earnedPoints} pt${earnedPoints > 1 ? 's' : ''}`;
      }

      clickedBtn.classList.add('correct');
      synth.playNote(this.gameState.correctNoteObj.freq);
      synth.playSuccessSound();

      this.showFeedback(true, feedbackText);
    } else {
      // Erro!
      this.gameState.streak = 0;
      clickedBtn.classList.add('wrong');

      // Revela o botão correto
      allBtns.forEach(btn => {
        if (btn.textContent === this.gameState.correctNoteObj.noteEn) {
          btn.classList.add('correct');
        }
      });

      let feedbackText = `Incorreto! A nota certa é ${this.gameState.correctNoteObj.noteEn}`;

      if (this.config.gameMode === 'timeattack') {
        // Penalidade de -5 segundos
        this.gameState.timeLeft = Math.max(0, this.gameState.timeLeft - 5);
        this.timerDisplay.textContent = `${this.gameState.timeLeft}s`;
        feedbackText = `❌ Errou! -5s (Era ${this.gameState.correctNoteObj.noteEn})`;

        if (this.gameState.timeLeft <= 0) {
          clearInterval(this.gameState.timerInterval);
          this.endGame();
          return;
        }
      }

      synth.playErrorSound();
      this.showFeedback(false, feedbackText);

      // Guarda histórico de erro para revisão
      this.gameState.mistakes.push({
        scale: this.gameState.currentScale.name,
        degree: `${this.gameState.currentDegreeIndex + 1}º grau`,
        correct: this.gameState.correctNoteObj.noteEn,
        selected: selectedCipher
      });
    }

    this.updateStatsUI();

    // Próxima pergunta após breve intervalo
    setTimeout(() => {
      if (this.gameState.timeLeft > 0 || (this.config.gameMode === 'score' && this.config.scoreRoundTime === 0)) {
        this.generateNextQuestion();
      }
    }, isCorrect ? 750 : 1400);
  }

  skipQuestion() {
    if (this.gameState.isAnsweringLocked) return;
    this.gameState.streak = 0;

    if (this.config.gameMode === 'timeattack') {
      this.gameState.timeLeft = Math.max(0, this.gameState.timeLeft - 3);
      this.timerDisplay.textContent = `${this.gameState.timeLeft}s`;
    } else {
      this.gameState.score = Math.max(0, this.gameState.score - 1);
    }

    this.updateStatsUI();
    this.generateNextQuestion();
  }

  showFeedback(isSuccess, message) {
    this.feedbackBanner.className = `feedback-banner show ${isSuccess ? 'correct' : 'wrong'}`;
    this.feedbackIcon.textContent = isSuccess ? '✅' : '❌';
    this.feedbackMessage.textContent = message;
  }

  updateStatsUI() {
    if (this.config.gameMode === 'timeattack') {
      this.currentScoreDisplay.textContent = `${this.gameState.correctAnswers} acertos`;
      document.querySelector('.score-pill .pill-label').textContent = 'Acertos';
    } else {
      this.currentScoreDisplay.textContent = this.gameState.score;
      document.querySelector('.score-pill .pill-label').textContent = 'Pontos';
    }

    this.streakCounter.textContent = `🔥 ${this.gameState.streak}`;
    const multiplier = Math.min(4, 1 + Math.floor(this.gameState.streak / 3) * 0.5);
    this.comboBadge.textContent = `Combo ${multiplier}x`;
  }

  updateBestScoreDisplay() {
    this.bestScoreDisplay.textContent = `🏆 ${this.gameState.bestScore}`;
  }

  endGame() {
    if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);

    // Salva recorde (no modo pontuação salva pontos, no timeattack salva acertos)
    const currentMetric = this.config.gameMode === 'timeattack' ? this.gameState.correctAnswers : this.gameState.score;
    if (currentMetric > this.gameState.bestScore) {
      this.gameState.bestScore = currentMetric;
      localStorage.setItem('mestre_escalas_best_score', this.gameState.bestScore.toString());
      this.updateBestScoreDisplay();
    }

    // Calcula precisão
    const accuracy = this.gameState.totalAnswered > 0 
      ? Math.round((this.gameState.correctAnswers / this.gameState.totalAnswered) * 100)
      : 0;

    // Popula tela de Game Over
    document.getElementById('final-score').textContent = this.config.gameMode === 'timeattack' 
      ? `${this.gameState.correctAnswers} acertos` 
      : `${this.gameState.score} pts`;
    document.getElementById('final-accuracy').textContent = `${accuracy}%`;
    document.getElementById('final-correct').textContent = `${this.gameState.correctAnswers} / ${this.gameState.totalAnswered}`;
    document.getElementById('final-streak').textContent = `🔥 ${this.gameState.maxStreak}`;

    const mistakesContainer = document.getElementById('mistakes-container');
    const mistakesList = document.getElementById('mistakes-list');
    mistakesList.innerHTML = '';

    if (this.gameState.mistakes.length === 0) {
      mistakesContainer.style.display = 'none';
      document.getElementById('result-subtitle').textContent = 'Perfeito! Você não errou nenhuma nota!';
    } else {
      mistakesContainer.style.display = 'block';
      document.getElementById('result-subtitle').textContent = 'Veja abaixo as perguntas que você errou:';
      
      this.gameState.mistakes.forEach(m => {
        const item = document.createElement('div');
        item.className = 'mistake-item';
        item.innerHTML = `
          <span><strong>${m.scale}</strong> (${m.degree})</span>
          <span>Você marcou: <span style="color:#f87171">${m.selected}</span> | Certo: <strong style="color:#34d399">${m.correct}</strong></span>
        `;
        mistakesList.appendChild(item);
      });
    }

    this.showScreen('over');
  }
}

// Inicializa a aplicação ao carregar
window.addEventListener('DOMContentLoaded', () => {
  window.scaleApp = new ScaleMasterApp();
});
