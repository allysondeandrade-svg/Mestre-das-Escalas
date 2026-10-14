// ==========================================================================
// BANCO DE DADOS LOCAL E GERENCIADOR DE RECORDES (LocalStorage Engine)
// ==========================================================================
class ScoreDatabase {
  constructor() {
    this.historyKey = 'mestre_escalas_history_v2';
    this.recordsKey = 'mestre_escalas_records_v2';
  }

  getAllMatches() {
    try {
      const raw = localStorage.getItem(this.historyKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Erro ao recuperar histórico:', e);
      return [];
    }
  }

  getRecords() {
    try {
      const raw = localStorage.getItem(this.recordsKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('Erro ao recuperar recordes:', e);
      return {};
    }
  }

  saveMatch(match) {
    const matches = this.getAllMatches();
    matches.unshift(match);
    // Limita o armazenamento aos últimos 60 jogos para desempenho ideal
    if (matches.length > 60) matches.pop();

    try {
      localStorage.setItem(this.historyKey, JSON.stringify(matches));
    } catch (e) {
      console.error('Erro ao salvar histórico:', e);
    }

    // Identificador único da categoria
    let catKey = match.mode;
    if (match.mode === 'timeattack') {
      catKey = `timeattack_${match.difficulty}`;
    } else if (match.mode === 'score') {
      catKey = `score_${match.timeLimit || 60}`;
    }

    const records = this.getRecords();
    const currentRecord = records[catKey];
    let isNewRecord = false;

    if (!currentRecord || match.score > currentRecord.score) {
      isNewRecord = true;
      records[catKey] = {
        title: match.mode === 'timeattack' 
          ? `Contra o Tempo (${match.difficultyName})` 
          : match.modeName,
        score: match.score,
        accuracy: match.accuracy,
        maxStreak: match.maxStreak,
        roundsReached: match.roundsReached,
        dateFormatted: match.dateFormatted,
        isVictory: match.isVictory || false
      };

      try {
        localStorage.setItem(this.recordsKey, JSON.stringify(records));
      } catch (e) {
        console.error('Erro ao salvar recorde:', e);
      }
    }

    return { isNewRecord, record: records[catKey] };
  }

  getOverallBest() {
    const records = this.getRecords();
    let max = 0;
    Object.values(records).forEach(rec => {
      if (rec && typeof rec.score === 'number' && rec.score > max) {
        max = rec.score;
      }
    });
    // Fallback legado
    const legacy = parseInt(localStorage.getItem('mestre_escalas_best_score') || '0', 10);
    return Math.max(max, legacy);
  }

  clearHistory() {
    localStorage.removeItem(this.historyKey);
    localStorage.removeItem(this.recordsKey);
    localStorage.removeItem('mestre_escalas_best_score');
  }
}

// ==========================================================================
// CONFIGURAÇÃO DAS DIFICULDADES DO MODO CONTRA O TEMPO
// ==========================================================================
const TIME_ATTACK_CONFIG = {
  easy: {
    name: 'Fácil',
    initialTime: 20,
    correctGain: 10,
    bonusGain: 30, // 3x base gain (30s)
    wrongLoss: 0,
    comboWindow: 4.0,
    hint: 'Fácil: Acerto +10s (Bônus +30s) | Sem perda | Combo: 4s'
  },
  medium: {
    name: 'Médio',
    initialTime: 20,
    correctGain: 5,
    bonusGain: 15, // 3x base gain (15s)
    wrongLoss: 5,
    comboWindow: 3.0,
    hint: 'Médio: Acerto +5s (Bônus +15s) | Erro -5s | Combo: 3s'
  },
  hard: {
    name: 'Difícil',
    initialTime: 15,
    correctGain: 3,
    bonusGain: 9, // 3x base gain (9s)
    wrongLoss: 5,
    comboWindow: 1.5,
    hint: 'Difícil: Acerto +3s (Bônus +9s) | Erro -5s | Combo: 1,5s'
  },
  expert: {
    name: 'Especialista',
    initialTime: 10,
    correctGain: 1.5,
    bonusGain: 4.5, // 3x base gain (4,5s)
    wrongLoss: 5,
    comboWindow: 0.5,
    hint: 'Especialista: Acerto +1,5s (Bônus +4,5s) | Erro -5s | Combo: 0,5s'
  }
};

// ==========================================================================
// GERENCIADOR PRINCIPAL DO APLICATIVO E MOTOR DO QUIZ
// ==========================================================================
class ScaleMasterApp {
  constructor() {
    this.db = new ScoreDatabase();

    this.config = {
      scaleType: 'all', // 'all', 'major', 'minor'
      gameMode: 'score', // 'score', 'timeattack', 'ear'
      scoreRoundTime: 60, // 30, 60, 120, 0 (zen)
      timeAttackDifficulty: 'medium', // 'easy', 'medium', 'hard', 'expert'
      earQuestionTime: 20, // 10, 20, 30 por pergunta
      selectedTonalities: new Set()
    };

    this.gameState = {
      score: 0,
      streak: 0,
      maxStreak: 0,
      totalAnswered: 0,
      correctAnswers: 0,
      timeLeft: 60,
      totalInitialTime: 60,
      timerInterval: null,
      comboLevel: 0, // 0, 1, 2, 3, 4 (máx +4s)
      nextComboLevel: 0,
      comboInterval: null,
      pendingComboStart: false,
      currentScale: null,
      currentDegreeIndex: 0,
      correctNoteObj: null,
      lastAnswerTime: 0,
      mistakes: [],
      isAnsweringLocked: false,
      bestScore: this.db.getOverallBest()
    };

    // Estado específico do sistema de 5 rodadas do Contra o Tempo
    this.timeAttackState = {
      round: 1,
      maxRounds: 5,
      questionInRound: 1,
      isBonusQuestion: false,
      savedMainTime: 0,
      bonusTimeLeft: 10.0,
      bonusInterval: null,
      bonusWonCount: 0
    };

    this.initDOM();
    this.renderTonalityFilters();
    this.renderReferenceTable();
    this.bindEvents();
    this.updateBestScoreDisplay();
    this.initGameStandby();
  }

  initDOM() {
    // Telas
    this.screenActive = document.getElementById('game-active-screen');
    this.screenGameOver = document.getElementById('game-over-screen');

    // Stats
    this.streakCounter = document.getElementById('streak-counter');
    this.bestScoreDisplay = document.getElementById('best-score');
    this.scorePillText = document.getElementById('score-pill-text');
    this.timerDisplay = document.getElementById('timer-display');
    this.timeProgressBar = document.getElementById('time-progress-bar');
    this.headerRecordBadge = document.getElementById('header-record-badge');

    // Barra de rodadas e Bloco de Combo
    this.roundBar = document.getElementById('timeattack-round-bar');
    this.roundNumberText = document.getElementById('round-number-text');
    this.roundQuestionText = document.getElementById('round-question-text');
    this.roundComboBlock = document.getElementById('round-combo-block');
    this.comboBadge = document.getElementById('combo-badge');
    this.comboProgressFill = document.getElementById('combo-mini-progress');
    this.bonusBadge = document.getElementById('bonus-question-badge');

    // Question & Controls
    this.questionContainer = document.querySelector('.question-container');
    this.questionText = document.getElementById('question-text');
    this.choiceGrid = document.getElementById('choice-grid');
    this.feedbackBanner = document.getElementById('feedback-banner');
    this.feedbackIcon = document.getElementById('feedback-icon');
    this.feedbackMessage = document.getElementById('feedback-message');
    this.audioBtn = document.getElementById('play-scale-audio-btn');
    this.inlineFeedback = document.getElementById('inline-feedback');
    this.inlineFeedbackText = document.getElementById('inline-feedback-text');
    this.timeAttackHint = document.getElementById('timeattack-hint');

    // Modais
    this.modal = document.getElementById('reference-modal');
    this.scalesTableBody = document.getElementById('scales-table-body');
    this.historyModal = document.getElementById('history-modal');
    this.tabRecordsBtn = document.getElementById('tab-records-btn');
    this.tabHistoryBtn = document.getElementById('tab-history-btn');
    this.tabRecordsContent = document.getElementById('tab-records-content');
    this.tabHistoryContent = document.getElementById('tab-history-content');
    this.timeAttackRecordsGrid = document.getElementById('timeattack-records-grid');
    this.otherRecordsGrid = document.getElementById('other-records-grid');
    this.historyTableBody = document.getElementById('history-table-body');
    this.historyTotalCount = document.getElementById('history-total-count');
    this.clearHistoryBtn = document.getElementById('clear-history-btn');
  }

  renderTonalityFilters() {
    const container = document.getElementById('tonality-filter');
    container.innerHTML = '';

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
    // Início de Jogo
    document.getElementById('start-game-btn').addEventListener('click', () => this.startGame(true));
    document.getElementById('restart-btn').addEventListener('click', () => this.startGame(true));
    document.getElementById('back-config-btn').addEventListener('click', () => {
      this.showScreen('active');
      const configCard = document.querySelector('.config-card');
      if (configCard) {
        configCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // In-game actions
    document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
    document.getElementById('give-up-btn').addEventListener('click', () => this.endGame());
    this.audioBtn.addEventListener('click', () => {
      if (this.gameState.correctNoteObj) {
        if (this.config.gameMode === 'ear') {
          synth.playNote(this.gameState.correctNoteObj.freq, 1.2);
        } else if (this.gameState.currentScale) {
          synth.playScaleSequence(this.gameState.currentScale.notes);
        }
      }
    });

    // Som
    document.getElementById('sound-toggle-btn').addEventListener('click', () => {
      const enabled = synth.toggleSound();
      document.getElementById('sound-icon').textContent = enabled ? '🔊' : '🔇';
    });

    // Seletores de Tipo de Escala
    document.querySelectorAll('#scale-type-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#scale-type-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.config.scaleType = e.currentTarget.dataset.scaleType;
        this.config.selectedTonalities.clear();
        this.renderTonalityFilters();
      });
    });

    // Seletores de Modo de Jogo
    document.querySelectorAll('#question-mode-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#question-mode-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.config.gameMode = e.currentTarget.dataset.qmode;

        const timerScoreSelector = document.getElementById('timer-score-selector');
        const timerTimeAttackSelector = document.getElementById('timer-timeattack-selector');
        const timerEarSelector = document.getElementById('timer-ear-selector');
        const timerGroupLabel = document.getElementById('timer-group-label');

        timerScoreSelector.style.display = 'none';
        timerTimeAttackSelector.style.display = 'none';
        timerEarSelector.style.display = 'none';

        if (this.config.gameMode === 'score') {
          timerGroupLabel.textContent = 'Tempo por Rodada:';
          timerScoreSelector.style.display = 'flex';
          if (this.timeAttackHint) this.timeAttackHint.style.display = 'none';
        } else if (this.config.gameMode === 'timeattack') {
          timerGroupLabel.textContent = 'Dificuldade:';
          timerTimeAttackSelector.style.display = 'flex';
          if (this.timeAttackHint) {
            this.timeAttackHint.style.display = 'block';
            this.timeAttackHint.textContent = TIME_ATTACK_CONFIG[this.config.timeAttackDifficulty].hint;
          }
        } else if (this.config.gameMode === 'ear') {
          timerGroupLabel.textContent = 'Tempo por Pergunta:';
          timerEarSelector.style.display = 'flex';
          if (this.timeAttackHint) this.timeAttackHint.style.display = 'none';
        }

        this.updateRoundUI();
        this.updateStatsUI();
      });
    });

    // Seletor de Tempo no Modo Pontuação
    document.querySelectorAll('#timer-score-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#timer-score-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.config.scoreRoundTime = parseInt(e.currentTarget.dataset.time, 10);
      });
    });

    // Seletor de Dificuldade no Modo Contra o Tempo
    document.querySelectorAll('#timer-timeattack-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#timer-timeattack-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.config.timeAttackDifficulty = e.currentTarget.dataset.difficulty;
        if (this.timeAttackHint) {
          this.timeAttackHint.textContent = TIME_ATTACK_CONFIG[this.config.timeAttackDifficulty].hint;
        }
      });
    });

    // Seletor de Tempo no Treino de Ouvido
    document.querySelectorAll('#timer-ear-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#timer-ear-selector .seg-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.config.earQuestionTime = parseInt(e.currentTarget.dataset.time, 10);
      });
    });

    // Botões de seleção rápida de tonalidades
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

    // Modal Dicionário de Escalas
    document.getElementById('open-reference-btn').addEventListener('click', () => {
      this.modal.classList.add('active');
    });
    document.getElementById('close-reference-btn').addEventListener('click', () => {
      this.modal.classList.remove('active');
    });
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.modal.classList.remove('active');
    });

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

    // Modal Histórico e Recordes
    if (this.headerRecordBadge) {
      this.headerRecordBadge.addEventListener('click', () => this.openHistoryModal('records'));
    }
    const openHistoryBtn = document.getElementById('open-history-btn');
    if (openHistoryBtn) {
      openHistoryBtn.addEventListener('click', () => this.openHistoryModal('records'));
    }
    const viewHistoryBtn = document.getElementById('view-history-btn');
    if (viewHistoryBtn) {
      viewHistoryBtn.addEventListener('click', () => this.openHistoryModal('history'));
    }
    const closeHistoryBtn = document.getElementById('close-history-btn');
    if (closeHistoryBtn) {
      closeHistoryBtn.addEventListener('click', () => this.closeHistoryModal());
    }
    if (this.historyModal) {
      this.historyModal.addEventListener('click', (e) => {
        if (e.target === this.historyModal) this.closeHistoryModal();
      });
    }

    // Abas do Modal de Histórico
    if (this.tabRecordsBtn && this.tabHistoryBtn) {
      this.tabRecordsBtn.addEventListener('click', () => this.switchHistoryTab('records'));
      this.tabHistoryBtn.addEventListener('click', () => this.switchHistoryTab('history'));
    }

    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja apagar todo o histórico de partidas e recordes?')) {
          this.db.clearHistory();
          this.gameState.bestScore = 0;
          this.updateBestScoreDisplay();
          this.renderRecordsTab();
          this.renderHistoryTab();
        }
      });
    }
  }

  showScreen(name) {
    this.screenActive.classList.remove('active');
    this.screenGameOver.classList.remove('active');

    if (name === 'idle' || name === 'active') this.screenActive.classList.add('active');
    if (name === 'over') this.screenGameOver.classList.add('active');
  }

  initGameStandby() {
    this.gameState.score = 0;
    this.gameState.streak = 0;
    this.gameState.maxStreak = 0;
    this.gameState.totalAnswered = 0;
    this.gameState.correctAnswers = 0;
    this.gameState.mistakes = [];
    this.gameState.isAnsweringLocked = false;
    this.gameState.comboLevel = 0;
    this.gameState.nextComboLevel = 0;
    this.gameState.pendingComboStart = false;
    this.gameState.timeLeft = this.config.scoreRoundTime;
    this.gameState.totalInitialTime = this.config.scoreRoundTime;

    this.timeAttackState.round = 1;
    this.timeAttackState.questionInRound = 1;
    this.timeAttackState.isBonusQuestion = false;
    this.timeAttackState.savedMainTime = 0;
    this.timeAttackState.bonusWonCount = 0;

    if (this.comboProgressFill) this.comboProgressFill.style.width = '0%';
    this.updateStatsUI();
    this.updateComboUI();
    this.updateRoundUI();
    this.showScreen('active');
    this.generateNextQuestion(false);
  }

  startGame(shouldScroll = true) {
    if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);
    if (this.gameState.comboInterval) clearInterval(this.gameState.comboInterval);
    if (this.timeAttackState.bonusInterval) clearInterval(this.timeAttackState.bonusInterval);

    this.gameState.score = 0;
    this.gameState.streak = 0;
    this.gameState.maxStreak = 0;
    this.gameState.totalAnswered = 0;
    this.gameState.correctAnswers = 0;
    this.gameState.mistakes = [];
    this.gameState.isAnsweringLocked = false;
    this.gameState.lastAnswerTime = Date.now();
    this.gameState.comboLevel = 0;
    this.gameState.nextComboLevel = 0;
    this.gameState.pendingComboStart = false;

    // Reseta estado de rodadas
    this.timeAttackState.round = 1;
    this.timeAttackState.questionInRound = 1;
    this.timeAttackState.isBonusQuestion = false;
    this.timeAttackState.savedMainTime = 0;
    this.timeAttackState.bonusWonCount = 0;

    if (this.config.gameMode === 'timeattack') {
      const diffConfig = TIME_ATTACK_CONFIG[this.config.timeAttackDifficulty];
      this.gameState.timeLeft = diffConfig.initialTime;
      this.gameState.totalInitialTime = diffConfig.initialTime;
    } else if (this.config.gameMode === 'ear') {
      this.gameState.timeLeft = this.config.earQuestionTime;
      this.gameState.totalInitialTime = this.config.earQuestionTime;
    } else {
      this.gameState.timeLeft = this.config.scoreRoundTime;
      this.gameState.totalInitialTime = this.config.scoreRoundTime;
    }

    if (this.comboProgressFill) this.comboProgressFill.style.width = '0%';
    this.updateStatsUI();
    this.updateComboUI();
    this.updateRoundUI();
    this.showScreen('active');
    this.startTimer();
    this.generateNextQuestion(true);

    if (shouldScroll) {
      this.scrollToGame();
    }
  }

  scrollToGame() {
    const gameCard = document.querySelector('.game-card');
    if (gameCard) {
      gameCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Sempre arredonda o tempo para números inteiros (ex: 17s, 16s etc.)
  formatTimeDisplay(seconds) {
    if (seconds <= 0) return '0s';
    return `${Math.ceil(seconds)}s`;
  }

  updateRoundUI() {
    if (!this.roundBar) return;

    if (this.config.gameMode === 'timeattack') {
      this.roundBar.style.display = 'flex';

      if (this.timeAttackState.round === 5) {
        this.roundNumberText.innerHTML = `🔥 Rodada 5/5 <span style="font-size:0.75rem;opacity:0.85;color:#fcd34d;">(Final -20%)</span>`;
      } else {
        this.roundNumberText.textContent = `Rodada ${this.timeAttackState.round}/5`;
      }

      if (this.timeAttackState.isBonusQuestion) {
        this.roundQuestionText.innerHTML = `⭐ <strong style="color:#fbbf24">BÔNUS!</strong>`;
        if (this.bonusBadge) this.bonusBadge.style.display = 'flex';
      } else {
        this.roundQuestionText.textContent = `Pergunta ${this.timeAttackState.questionInRound}/10`;
        if (this.bonusBadge) this.bonusBadge.style.display = 'none';
      }

      this.updateComboUI();
    } else {
      this.roundBar.style.display = 'none';
      if (this.bonusBadge) this.bonusBadge.style.display = 'none';
    }
  }

  startTimer() {
    if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);

    if (this.config.gameMode === 'score' && this.config.scoreRoundTime === 0) {
      this.timerDisplay.textContent = 'Zen ∞';
      this.timeProgressBar.style.width = '100%';
      return;
    }

    this.timerDisplay.textContent = this.formatTimeDisplay(this.gameState.timeLeft);
    this.timeProgressBar.style.width = '100%';

    if (this.config.gameMode === 'timeattack') {
      // Loop contínuo para Time Attack
      this.gameState.timerInterval = setInterval(() => {
        this.gameState.timeLeft = Math.max(0, Math.round((this.gameState.timeLeft - 0.1) * 10) / 10);
        this.timerDisplay.textContent = this.formatTimeDisplay(this.gameState.timeLeft);

        const baseTime = Math.max(this.gameState.totalInitialTime, this.gameState.timeLeft);
        const pct = (this.gameState.timeLeft / baseTime) * 100;
        this.timeProgressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;

        if (this.gameState.timeLeft <= 0) {
          clearInterval(this.gameState.timerInterval);
          this.endGame(false);
        }
      }, 100);
    } else {
      // Loop de 1s para Pontuação e Ouvido
      this.gameState.timerInterval = setInterval(() => {
        this.gameState.timeLeft--;
        this.timerDisplay.textContent = this.formatTimeDisplay(this.gameState.timeLeft);

        const baseTime = this.config.gameMode === 'ear' 
          ? this.config.earQuestionTime 
          : Math.max(this.gameState.totalInitialTime, this.gameState.timeLeft);

        const pct = (this.gameState.timeLeft / baseTime) * 100;
        this.timeProgressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;

        if (this.gameState.timeLeft <= 0) {
          clearInterval(this.gameState.timerInterval);
          this.endGame(false);
        }
      }, 1000);
    }
  }

  // Inicia a mini-linha regressiva do combo (apenas a linha diminui, sem mostrar números de tempo)
  startComboTimer() {
    if (this.config.gameMode !== 'timeattack') return;
    // Na rodada 5, o combo é desativado
    if (this.timeAttackState.round === 5) return;
    if (this.timeAttackState.isBonusQuestion) return;

    if (this.gameState.comboInterval) {
      clearInterval(this.gameState.comboInterval);
      this.gameState.comboInterval = null;
    }

    const diffConfig = TIME_ATTACK_CONFIG[this.config.timeAttackDifficulty];
    const duration = diffConfig.comboWindow;
    const startTime = Date.now();
    const durationMs = duration * 1000;

    if (this.comboProgressFill) {
      this.comboProgressFill.style.width = '100%';
    }
    this.updateComboUI();

    this.gameState.comboInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, durationMs - elapsed);
      const pct = (remaining / durationMs) * 100;

      if (this.comboProgressFill) {
        this.comboProgressFill.style.width = `${pct}%`;
      }

      if (remaining <= 0) {
        this.expireCombo();
      }
    }, 25);
  }

  expireCombo() {
    if (this.gameState.comboInterval) {
      clearInterval(this.gameState.comboInterval);
      this.gameState.comboInterval = null;
    }
    this.gameState.comboLevel = 0;
    if (this.comboProgressFill) {
      this.comboProgressFill.style.width = '0%';
    }
    this.updateComboUI();
  }

  updateComboUI() {
    if (!this.comboBadge) return;

    if (this.config.gameMode === 'timeattack') {
      if (this.timeAttackState.round === 5) {
        this.comboBadge.textContent = '🚫 Sem Combo';
        if (this.roundComboBlock) this.roundComboBlock.classList.remove('combo-active');
        if (this.comboProgressFill) this.comboProgressFill.style.width = '0%';
      } else if (this.timeAttackState.isBonusQuestion) {
        this.comboBadge.textContent = '⭐ Bônus';
        if (this.roundComboBlock) this.roundComboBlock.classList.remove('combo-active');
        if (this.comboProgressFill) this.comboProgressFill.style.width = '0%';
      } else if (this.gameState.comboLevel > 0) {
        this.comboBadge.textContent = `Combo ${this.gameState.comboLevel}+`;
        if (this.roundComboBlock) this.roundComboBlock.classList.add('combo-active');
      } else {
        this.comboBadge.textContent = 'Combo 0';
        if (this.roundComboBlock) this.roundComboBlock.classList.remove('combo-active');
        if (this.comboProgressFill) this.comboProgressFill.style.width = '0%';
      }
    } else {
      if (this.roundComboBlock) this.roundComboBlock.style.display = 'none';
    }
  }

  showInlineFeedback(isCorrect, text) {
    if (!this.inlineFeedback) return;
    this.inlineFeedback.className = `inline-feedback show ${isCorrect ? 'correct' : 'wrong'}`;
    if (this.inlineFeedbackText) {
      this.inlineFeedbackText.textContent = text;
    }

    if (this.inlineFeedbackTimeout) clearTimeout(this.inlineFeedbackTimeout);
    this.inlineFeedbackTimeout = setTimeout(() => {
      if (this.inlineFeedback) {
        this.inlineFeedback.classList.remove('show');
      }
    }, 1500);
  }

  resetQuestionTimer() {
    if (this.config.gameMode === 'ear') {
      this.gameState.timeLeft = this.config.earQuestionTime;
      this.timerDisplay.textContent = this.formatTimeDisplay(this.gameState.timeLeft);
      this.timeProgressBar.style.width = '100%';
    }
  }

  generateNextQuestion(playSound = true) {
    // Se estiver no Modo Contra o Tempo e for a pergunta bônus da rodada
    if (this.config.gameMode === 'timeattack' && this.timeAttackState.isBonusQuestion) {
      this.generateBonusQuestion(playSound);
      return;
    }

    this.gameState.isAnsweringLocked = false;
    this.feedbackBanner.className = 'feedback-banner';

    // Restaura classes visuais normais
    if (this.questionContainer) this.questionContainer.classList.remove('bonus-mode');
    if (this.timeProgressBar) this.timeProgressBar.classList.remove('bonus-progress');

    // Se estiver no modo Contra o Tempo e houver combo pendente, inicia o mini-timer no momento que a pergunta surge
    if (this.config.gameMode === 'timeattack') {
      if (this.timeAttackState.round === 5) {
        this.expireCombo();
      } else if (this.gameState.pendingComboStart) {
        this.gameState.pendingComboStart = false;
        this.gameState.comboLevel = this.gameState.nextComboLevel;
        this.startComboTimer();
      } else {
        this.updateComboUI();
      }
      this.updateRoundUI();
    } else {
      this.updateComboUI();
    }

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

    const degreeNumber = degreeIndex + 1;

    // Configura texto e áudio
    if (this.config.gameMode === 'ear') {
      this.questionText.innerHTML = `🎵 Qual é o som? (${scale.shortName})`;
      this.audioBtn.textContent = '🔊 Tocar Nota Novamente';
      if (playSound) {
        setTimeout(() => {
          synth.playNote(targetNote.freq, 1.0);
        }, 250);
      }
    } else {
      this.questionText.innerHTML = `${degreeNumber}º de ${scale.shortName}`;
      this.audioBtn.textContent = '🔊 Ouvir Escala';
    }

    this.renderChoiceOptions(targetNote.noteEn);
  }

  // ==========================================================================
  // PERGUNTA BÔNUS ESPECIAL (Escala não-natural com 10s dedicados e 3x ganho)
  // ==========================================================================
  generateBonusQuestion(playSound = true) {
    this.gameState.isAnsweringLocked = false;
    this.feedbackBanner.className = 'feedback-banner';

    // 1. Congela o timer principal do jogo
    if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);
    if (this.gameState.comboInterval) clearInterval(this.gameState.comboInterval);
    this.timeAttackState.savedMainTime = this.gameState.timeLeft;

    // 2. Destaca visualmente a Pergunta Bônus
    if (this.questionContainer) this.questionContainer.classList.add('bonus-mode');
    if (this.timeProgressBar) this.timeProgressBar.classList.add('bonus-progress');
    this.updateRoundUI();
    this.updateComboUI();

    // 3. Escolhe escala NÃO-NATURAL (sustenidos e bemóis: C#, Eb, F#m, etc.)
    let nonNaturalScales = SCALES_DATA.filter(s => s.shortName.includes('#') || s.shortName.includes('b'));
    if (this.config.scaleType !== 'all') {
      const filtered = nonNaturalScales.filter(s => s.type === this.config.scaleType);
      if (filtered.length > 0) nonNaturalScales = filtered;
    }
    const scale = nonNaturalScales[Math.floor(Math.random() * nonNaturalScales.length)];
    this.gameState.currentScale = scale;

    const degreeIndex = Math.floor(Math.random() * 7);
    this.gameState.currentDegreeIndex = degreeIndex;
    const targetNote = scale.notes[degreeIndex];
    this.gameState.correctNoteObj = targetNote;

    const degreeNumber = degreeIndex + 1;
    this.questionText.innerHTML = `⭐ BÔNUS: ${degreeNumber}º de ${scale.shortName}`;
    this.audioBtn.textContent = '🔊 Ouvir Escala Bônus';

    this.renderChoiceOptions(targetNote.noteEn);

    // 4. Inicia contagem regressiva dedicada de 10s da Pergunta Bônus (arredondada para inteiros)
    this.timeAttackState.bonusTimeLeft = 10.0;
    this.timerDisplay.textContent = `⭐ 10s`;
    this.timeProgressBar.style.width = '100%';

    if (this.timeAttackState.bonusInterval) clearInterval(this.timeAttackState.bonusInterval);
    this.timeAttackState.bonusInterval = setInterval(() => {
      this.timeAttackState.bonusTimeLeft = Math.max(0, Math.round((this.timeAttackState.bonusTimeLeft - 0.1) * 10) / 10);
      this.timerDisplay.textContent = `⭐ ${this.formatTimeDisplay(this.timeAttackState.bonusTimeLeft)}`;

      const pct = (this.timeAttackState.bonusTimeLeft / 10.0) * 100;
      this.timeProgressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;

      if (this.timeAttackState.bonusTimeLeft <= 0) {
        clearInterval(this.timeAttackState.bonusInterval);
        this.handleBonusTimeout();
      }
    }, 100);
  }

  handleBonusTimeout() {
    if (this.gameState.isAnsweringLocked) return;
    this.gameState.isAnsweringLocked = true;

    synth.playErrorSound();
    this.showInlineFeedback(false, `❌ Tempo Bônus Esgotado`);
    this.showFeedback(false, `Tempo da Pergunta Bônus esgotado! (A nota certa era ${this.gameState.correctNoteObj.noteEn})`);

    const allBtns = this.choiceGrid.querySelectorAll('.choice-btn');
    allBtns.forEach(btn => {
      if (btn.textContent === this.gameState.correctNoteObj.noteEn) {
        btn.classList.add('correct');
      }
    });

    // Restaura tempo principal intacto (sem perda)
    this.gameState.timeLeft = this.timeAttackState.savedMainTime;

    setTimeout(() => {
      this.concludeBonusQuestion();
    }, 900);
  }

  concludeBonusQuestion() {
    if (this.timeAttackState.bonusInterval) clearInterval(this.timeAttackState.bonusInterval);

    // Se completou a pergunta bônus da 5ª rodada -> Vitória!
    if (this.timeAttackState.round >= 5) {
      this.endGame(true);
      return;
    }

    // Avança para a próxima rodada
    this.timeAttackState.round++;
    this.timeAttackState.questionInRound = 1;
    this.timeAttackState.isBonusQuestion = false;

    if (this.questionContainer) this.questionContainer.classList.remove('bonus-mode');
    if (this.timeProgressBar) this.timeProgressBar.classList.remove('bonus-progress');

    this.updateRoundUI();
    this.startTimer();
    this.generateNextQuestion(true);
  }

  renderChoiceOptions(correctNoteCipher) {
    this.choiceGrid.innerHTML = '';
    const scaleNotes = this.gameState.currentScale.notes.map(n => n.noteEn);

    const options = new Set();
    options.add(correctNoteCipher);

    while (options.size < 4 && options.size < scaleNotes.length) {
      const randNote = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
      options.add(randNote);
    }

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
    // -------------------------------------------------------------
    // CASO 1: Resposta para a Pergunta Bônus Especial do Time Attack
    // -------------------------------------------------------------
    if (this.config.gameMode === 'timeattack' && this.timeAttackState.isBonusQuestion) {
      if (this.timeAttackState.bonusInterval) clearInterval(this.timeAttackState.bonusInterval);
      this.gameState.isAnsweringLocked = true;
      this.gameState.totalAnswered++;

      const isCorrect = selectedCipher === this.gameState.correctNoteObj.noteEn;
      const allBtns = this.choiceGrid.querySelectorAll('.choice-btn');

      if (isCorrect) {
        this.timeAttackState.bonusWonCount++;
        this.gameState.correctAnswers++;
        this.gameState.streak++;
        this.gameState.score += 50;

        const diffConfig = TIME_ATTACK_CONFIG[this.config.timeAttackDifficulty];
        const bonusGain = diffConfig.bonusGain; // 3x base gain (+30s, +15s, +9s, +4.5s)

        // Adiciona ao tempo principal que estava congelado
        this.gameState.timeLeft = Math.round((this.timeAttackState.savedMainTime + bonusGain) * 10) / 10;
        this.timerDisplay.textContent = this.formatTimeDisplay(this.gameState.timeLeft);

        clickedBtn.classList.add('correct');
        synth.playSuccessSound();

        this.showFeedback(true, `⭐ PERGUNTA BÔNUS CORRETA! +${this.formatTimeDisplay(bonusGain)} adicionados!`);
        this.showInlineFeedback(true, `⭐ BÔNUS! +${this.formatTimeDisplay(bonusGain)}`);
      } else {
        clickedBtn.classList.add('wrong');
        allBtns.forEach(btn => {
          if (btn.textContent === this.gameState.correctNoteObj.noteEn) btn.classList.add('correct');
        });
        synth.playErrorSound();

        // Não perde tempo principal
        this.gameState.timeLeft = this.timeAttackState.savedMainTime;

        this.showFeedback(false, `Incorreto! Tempo bônus não obtido. (Era nota ${this.gameState.correctNoteObj.noteEn})`);
        this.showInlineFeedback(false, `❌ Bônus perdido`);

        this.gameState.mistakes.push({
          scale: this.gameState.currentScale.name,
          degree: `${this.gameState.currentDegreeIndex + 1}º grau (BÔNUS)`,
          correct: this.gameState.correctNoteObj.noteEn,
          selected: selectedCipher
        });
      }

      this.updateStatsUI();

      setTimeout(() => {
        this.concludeBonusQuestion();
      }, 800);
      return;
    }

    // -------------------------------------------------------------
    // CASO 2: Perguntas Normais (Pontuação, Ouvido e Time Attack regular)
    // -------------------------------------------------------------
    if (!this.gameState.timerInterval && !(this.config.gameMode === 'score' && this.config.scoreRoundTime === 0)) {
      this.startTimer();
    }

    this.gameState.isAnsweringLocked = true;
    this.gameState.totalAnswered++;

    const now = Date.now();
    this.gameState.lastAnswerTime = now;

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
      let inlineText = '';

      if (this.config.gameMode === 'timeattack') {
        const diffConfig = TIME_ATTACK_CONFIG[this.config.timeAttackDifficulty];

        // Regra da Rodada 5 (Última Rodada): ganho reduzido em 20% e sem combo
        if (this.timeAttackState.round === 5) {
          const reducedGain = Math.round((diffConfig.correctGain * 0.8) * 10) / 10;
          this.gameState.timeLeft += reducedGain;
          this.timerDisplay.textContent = this.formatTimeDisplay(this.gameState.timeLeft);

          inlineText = `✅ +${Math.round(reducedGain)}s (-20%)`;
          feedbackText = `Correto! +${Math.round(reducedGain)}s (Fase Final: -20% sem Combo)`;
          this.gameState.comboLevel = 0;
          this.gameState.pendingComboStart = false;
          this.expireCombo();
          this.gameState.score += 10;
        } else {
          // Rodadas 1 a 4: Combo 0 = ganho normal; Combo 1+ = +1s; Combo 2+ = +2s; Combo 3+ = +3s; Combo 4+ = +4s máx
          const currentLevel = this.gameState.comboLevel || 0;
          const extraSeconds = Math.min(4, currentLevel);
          const totalSecondsGain = diffConfig.correctGain + extraSeconds;

          this.gameState.timeLeft += totalSecondsGain;
          this.timerDisplay.textContent = this.formatTimeDisplay(this.gameState.timeLeft);

          // Próximo combo: avança em +1 até o teto de 4+
          const nextLevel = Math.min(4, currentLevel + 1);
          this.gameState.nextComboLevel = nextLevel;
          this.gameState.pendingComboStart = true;

          if (currentLevel > 0) {
            inlineText = `🔥 +${Math.round(totalSecondsGain)}s (Combo ${currentLevel}+)`;
            feedbackText = `🔥 Combo ${currentLevel}+! +${Math.round(totalSecondsGain)}s (+${extraSeconds}s extra)`;
          } else {
            inlineText = `✅ +${Math.round(totalSecondsGain)}s`;
            feedbackText = `Correto! +${Math.round(totalSecondsGain)}s`;
          }

          this.gameState.score += 10 + (extraSeconds * 5);
        }

        // Progressão da pergunta na rodada
        if (this.timeAttackState.questionInRound >= 10) {
          this.timeAttackState.isBonusQuestion = true;
        } else {
          this.timeAttackState.questionInRound++;
        }
      } else if (this.config.gameMode === 'ear') {
        this.resetQuestionTimer();
        inlineText = `✅ Acertou!`;
        feedbackText = `🎯 Na mosca! Nota ${this.gameState.correctNoteObj.noteEn}`;
        this.gameState.score += 10;
      } else {
        const multiplier = Math.min(4, 1 + Math.floor(this.gameState.streak / 3) * 0.5);
        const earnedPoints = Math.round(10 * multiplier);
        this.gameState.score += earnedPoints;
        inlineText = `✅ +${earnedPoints} pts`;
        feedbackText = `Correto! +${earnedPoints} pts`;
      }

      clickedBtn.classList.add('correct');
      synth.playNote(this.gameState.correctNoteObj.freq, 0.9);

      this.showFeedback(true, feedbackText);
      this.showInlineFeedback(true, inlineText);
    } else {
      // Erro!
      this.gameState.streak = 0;
      clickedBtn.classList.add('wrong');

      allBtns.forEach(btn => {
        if (btn.textContent === this.gameState.correctNoteObj.noteEn) {
          btn.classList.add('correct');
        }
      });

      let feedbackText = `Incorreto! A nota certa é ${this.gameState.correctNoteObj.noteEn}`;
      let inlineText = `❌ Incorreto`;

      if (this.config.gameMode === 'timeattack') {
        const diffConfig = TIME_ATTACK_CONFIG[this.config.timeAttackDifficulty];
        this.expireCombo();
        this.gameState.pendingComboStart = false;

        if (diffConfig.wrongLoss > 0) {
          this.gameState.timeLeft = Math.max(0, Math.round((this.gameState.timeLeft - diffConfig.wrongLoss) * 10) / 10);
          this.timerDisplay.textContent = this.formatTimeDisplay(this.gameState.timeLeft);
          inlineText = `❌ -${diffConfig.wrongLoss}s`;
          feedbackText = `❌ Errou! -${diffConfig.wrongLoss}s (Era ${this.gameState.correctNoteObj.noteEn})`;
        } else {
          inlineText = `❌ Errou (sem perda)`;
          feedbackText = `Errou! Sem penalidade no Fácil (Era ${this.gameState.correctNoteObj.noteEn})`;
        }

        // Progressão da pergunta na rodada mesmo no erro
        if (this.timeAttackState.questionInRound >= 10) {
          this.timeAttackState.isBonusQuestion = true;
        } else {
          this.timeAttackState.questionInRound++;
        }

        if (this.gameState.timeLeft <= 0) {
          if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);
          this.endGame(false);
          return;
        }
      }

      synth.playErrorSound();
      this.showFeedback(false, feedbackText);
      this.showInlineFeedback(false, inlineText);

      this.gameState.mistakes.push({
        scale: this.gameState.currentScale.name,
        degree: `${this.gameState.currentDegreeIndex + 1}º grau`,
        correct: this.gameState.correctNoteObj.noteEn,
        selected: selectedCipher
      });
    }

    this.updateStatsUI();

    const delay = this.config.gameMode === 'timeattack'
      ? (isCorrect ? 350 : 600)
      : (isCorrect ? 600 : 1000);

    setTimeout(() => {
      if (this.gameState.timeLeft > 0 || (this.config.gameMode === 'score' && this.config.scoreRoundTime === 0) || this.config.gameMode === 'ear') {
        if (this.config.gameMode === 'ear') {
          this.resetQuestionTimer();
        }
        this.generateNextQuestion(true);
      }
    }, delay);
  }

  skipQuestion() {
    if (this.gameState.isAnsweringLocked) return;

    if (this.config.gameMode === 'timeattack' && this.timeAttackState.isBonusQuestion) {
      if (this.timeAttackState.bonusInterval) clearInterval(this.timeAttackState.bonusInterval);
      this.gameState.timeLeft = this.timeAttackState.savedMainTime;
      this.showInlineFeedback(false, 'Bônus pulado');
      this.concludeBonusQuestion();
      return;
    }

    this.gameState.streak = 0;

    if (this.config.gameMode === 'timeattack') {
      const diffConfig = TIME_ATTACK_CONFIG[this.config.timeAttackDifficulty];
      this.expireCombo();
      this.gameState.pendingComboStart = false;

      if (diffConfig.wrongLoss > 0) {
        this.gameState.timeLeft = Math.max(0, Math.round((this.gameState.timeLeft - diffConfig.wrongLoss) * 10) / 10);
        this.timerDisplay.textContent = this.formatTimeDisplay(this.gameState.timeLeft);
        this.showInlineFeedback(false, `Pular (-${diffConfig.wrongLoss}s)`);
      } else {
        this.showInlineFeedback(false, `Pular`);
      }

      if (this.timeAttackState.questionInRound >= 10) {
        this.timeAttackState.isBonusQuestion = true;
      } else {
        this.timeAttackState.questionInRound++;
      }

      if (this.gameState.timeLeft <= 0) {
        if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);
        this.endGame(false);
        return;
      }
    } else if (this.config.gameMode === 'ear') {
      this.resetQuestionTimer();
      this.showInlineFeedback(false, `Pular`);
    } else {
      this.gameState.score = Math.max(0, this.gameState.score - 5);
      this.showInlineFeedback(false, `Pular (-5 pts)`);
    }

    this.updateStatsUI();
    this.generateNextQuestion(true);
  }

  showFeedback(isSuccess, message) {
    this.feedbackBanner.className = `feedback-banner show ${isSuccess ? 'correct' : 'wrong'}`;
    this.feedbackIcon.textContent = isSuccess ? '✅' : '❌';
    this.feedbackMessage.textContent = message;
  }

  updateStatsUI() {
    if (this.scorePillText) {
      if (this.config.gameMode === 'timeattack' || this.config.gameMode === 'ear') {
        this.scorePillText.textContent = `Acertos ${this.gameState.correctAnswers}`;
      } else {
        this.scorePillText.textContent = `Pontos ${this.gameState.score}`;
      }
    }

    this.streakCounter.textContent = `🔥 ${this.gameState.streak}`;
    this.updateComboUI();
    this.updateRoundUI();
  }

  updateBestScoreDisplay() {
    this.gameState.bestScore = this.db.getOverallBest();
    this.bestScoreDisplay.textContent = `🏆 ${this.gameState.bestScore}`;
  }

  getModeName() {
    if (this.config.gameMode === 'timeattack') return 'Contra o Tempo';
    if (this.config.gameMode === 'ear') return 'Treino de Ouvido';
    return 'Pontuação';
  }

  endGame(isVictory = false) {
    if (this.gameState.timerInterval) clearInterval(this.gameState.timerInterval);
    if (this.gameState.comboInterval) clearInterval(this.gameState.comboInterval);
    if (this.timeAttackState.bonusInterval) clearInterval(this.timeAttackState.bonusInterval);
    this.expireCombo();

    const currentMetric = (this.config.gameMode === 'timeattack' || this.config.gameMode === 'ear') 
      ? this.gameState.correctAnswers 
      : this.gameState.score;

    const accuracy = this.gameState.totalAnswered > 0 
      ? Math.round((this.gameState.correctAnswers / this.gameState.totalAnswered) * 100)
      : 0;

    let roundsReachedText = '-';
    if (this.config.gameMode === 'timeattack') {
      roundsReachedText = isVictory 
        ? '5/5 (Vitória! 👑)' 
        : `Rodada ${this.timeAttackState.round}/5 (Perg. ${this.timeAttackState.questionInRound}/10)`;
    }

    // Salva no Banco de Dados
    const matchRecord = {
      id: 'match_' + Date.now(),
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      mode: this.config.gameMode,
      modeName: this.getModeName(),
      difficulty: this.config.timeAttackDifficulty,
      difficultyName: TIME_ATTACK_CONFIG[this.config.timeAttackDifficulty].name,
      score: currentMetric,
      timeLimit: this.config.scoreRoundTime,
      correctAnswers: this.gameState.correctAnswers,
      totalAnswered: this.gameState.totalAnswered,
      accuracy: accuracy,
      maxStreak: this.gameState.maxStreak,
      roundsReached: roundsReachedText,
      isVictory: isVictory
    };

    const dbResult = this.db.saveMatch(matchRecord);
    this.updateBestScoreDisplay();

    // Customiza a tela de encerramento
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultSubtitle = document.getElementById('result-subtitle');

    if (isVictory) {
      resultIcon.textContent = '👑';
      resultTitle.textContent = '🎉 Desafio Vencido!';
      resultSubtitle.textContent = `Sensacional! Você sobreviveu e completou com maestria todas as 5 rodadas do Modo Contra o Tempo!`;
    } else {
      resultIcon.textContent = '🏆';
      resultTitle.textContent = 'Fim da Rodada!';
      resultSubtitle.textContent = dbResult.isNewRecord 
        ? `🔥 Novo Recorde Conquistado! Parabéns!` 
        : `Você demonstrou ótimo conhecimento teórico.`;
    }

    document.getElementById('final-score').textContent = (this.config.gameMode === 'timeattack' || this.config.gameMode === 'ear')
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
      if (!isVictory) resultSubtitle.textContent = 'Perfeito! Você não errou nenhuma nota!';
    } else {
      mistakesContainer.style.display = 'block';
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

  // ==========================================================================
  // CONTROLE DO MODAL DE HISTÓRICO E RECORDES
  // ==========================================================================
  openHistoryModal(activeTab = 'records') {
    if (!this.historyModal) return;
    this.historyModal.classList.add('active');
    this.switchHistoryTab(activeTab);
    this.renderRecordsTab();
    this.renderHistoryTab();
  }

  closeHistoryModal() {
    if (this.historyModal) {
      this.historyModal.classList.remove('active');
    }
  }

  switchHistoryTab(tabName) {
    if (tabName === 'records') {
      this.tabRecordsBtn.classList.add('active');
      this.tabHistoryBtn.classList.remove('active');
      this.tabRecordsContent.style.display = 'block';
      this.tabHistoryContent.style.display = 'none';
      this.renderRecordsTab();
    } else {
      this.tabRecordsBtn.classList.remove('active');
      this.tabHistoryBtn.classList.add('active');
      this.tabRecordsContent.style.display = 'none';
      this.tabHistoryContent.style.display = 'block';
      this.renderHistoryTab();
    }
  }

  renderRecordsTab() {
    const records = this.db.getRecords();

    // Contra o Tempo (Fácil, Médio, Difícil, Especialista)
    if (this.timeAttackRecordsGrid) {
      this.timeAttackRecordsGrid.innerHTML = '';
      const diffs = ['easy', 'medium', 'hard', 'expert'];

      diffs.forEach(d => {
        const conf = TIME_ATTACK_CONFIG[d];
        const rec = records[`timeattack_${d}`];
        const card = document.createElement('div');
        card.className = 'record-card';

        if (rec) {
          card.innerHTML = `
            <span class="record-card-level">${conf.name}</span>
            <span class="record-card-val">${rec.score} acertos</span>
            <span class="record-card-sub">${rec.roundsReached} • ${rec.accuracy}% precisão</span>
            <span class="record-card-sub" style="font-size:0.7rem;opacity:0.7">${rec.dateFormatted}</span>
          `;
        } else {
          card.innerHTML = `
            <span class="record-card-level">${conf.name}</span>
            <span class="record-card-val" style="color:#6b7280">0</span>
            <span class="record-card-sub">Nenhum recorde ainda</span>
          `;
        }
        this.timeAttackRecordsGrid.appendChild(card);
      });
    }

    // Outros Modos
    if (this.otherRecordsGrid) {
      this.otherRecordsGrid.innerHTML = '';
      const otherKeys = [
        { key: 'score_60', name: 'Pontuação (60s)', unit: 'pts' },
        { key: 'score_30', name: 'Pontuação (30s)', unit: 'pts' },
        { key: 'ear', name: 'Treino de Ouvido', unit: 'acertos' }
      ];

      otherKeys.forEach(item => {
        const rec = records[item.key];
        const card = document.createElement('div');
        card.className = 'record-card';

        if (rec) {
          card.innerHTML = `
            <span class="record-card-level">${item.name}</span>
            <span class="record-card-val">${rec.score} ${item.unit}</span>
            <span class="record-card-sub">${rec.accuracy}% precisão • Seq: 🔥 ${rec.maxStreak}</span>
            <span class="record-card-sub" style="font-size:0.7rem;opacity:0.7">${rec.dateFormatted}</span>
          `;
        } else {
          card.innerHTML = `
            <span class="record-card-level">${item.name}</span>
            <span class="record-card-val" style="color:#6b7280">0</span>
            <span class="record-card-sub">Nenhum recorde ainda</span>
          `;
        }
        this.otherRecordsGrid.appendChild(card);
      });
    }
  }

  renderHistoryTab() {
    const matches = this.db.getAllMatches();
    if (this.historyTotalCount) {
      this.historyTotalCount.textContent = `${matches.length} partida(s) registrada(s)`;
    }

    if (!this.historyTableBody) return;
    this.historyTableBody.innerHTML = '';

    if (matches.length === 0) {
      this.historyTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;color:#9ca3af;padding:2rem;">
            Nenhuma partida salva ainda. Jogue uma rodada para salvar seus resultados automaticamente!
          </td>
        </tr>
      `;
      return;
    }

    matches.forEach(m => {
      const tr = document.createElement('tr');
      const isTa = m.mode === 'timeattack';
      const scoreFormatted = isTa || m.mode === 'ear' ? `${m.score} acertos` : `${m.score} pts`;
      const statusTag = m.isVictory 
        ? `<span class="status-tag victory">👑 Vitória 5/5</span>` 
        : `<span class="status-tag finished">Finalizado</span>`;

      tr.innerHTML = `
        <td style="font-size:0.8rem;white-space:nowrap;">${m.dateFormatted}</td>
        <td><strong>${m.modeName}</strong></td>
        <td>${isTa ? m.difficultyName : '-'}</td>
        <td><strong>${scoreFormatted}</strong></td>
        <td style="font-size:0.8rem;">${m.roundsReached || '-'} ${statusTag}</td>
        <td>${m.accuracy}%</td>
        <td>🔥 ${m.maxStreak}</td>
      `;

      this.historyTableBody.appendChild(tr);
    });
  }
}

// Inicializa a aplicação ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  window.scaleApp = new ScaleMasterApp();
});
