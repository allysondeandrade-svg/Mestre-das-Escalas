// Módulo de Áudio com Web Audio API para tocar notas acústicas sintetizadas
class SoundSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  // Toca uma nota única simulando timbre de piano acústico com harmônicos ricos
  playNote(frequency, duration = 0.8, startTime = null) {
    if (!this.soundEnabled) return;
    this.initAudio();

    const t = startTime !== null ? startTime : this.audioCtx.currentTime;
    
    // Osciladores harmônicos para criar timbre realista de piano
    const osc1 = this.audioCtx.createOscillator(); // Fundamental
    const osc2 = this.audioCtx.createOscillator(); // 2º Harmônico (Oitava)
    const osc3 = this.audioCtx.createOscillator(); // 3º Harmônico (Quinta acima)
    const gainNode = this.audioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2, t);

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(frequency * 3, t);

    // Envelope ADSR natural de piano
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.linearRampToValueAtTime(0.45, t + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.25, t + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);

    osc1.stop(t + duration);
    osc2.stop(t + duration);
    osc3.stop(t + duration);
  }

  // Efeito sonoro de acerto
  playSuccessSound() {
    if (!this.soundEnabled) return;
    this.initAudio();
    const now = this.audioCtx.currentTime;
    this.playNote(523.25, 0.15, now);       // Dó 5
    this.playNote(659.25, 0.15, now + 0.08); // Mi 5
    this.playNote(783.99, 0.35, now + 0.16); // Sol 5
  }

  // Efeito sonoro de erro
  playErrorSound() {
    if (!this.soundEnabled) return;
    this.initAudio();
    const now = this.audioCtx.currentTime;
    this.playNote(220.00, 0.2, now);
    this.playNote(207.65, 0.35, now + 0.12);
  }

  // Toca toda a sequência da escala em arpejo ascendente
  playScaleSequence(scaleNotes) {
    if (!this.soundEnabled) return;
    this.initAudio();
    const now = this.audioCtx.currentTime;
    const noteGap = 0.22;

    scaleNotes.forEach((note, index) => {
      this.playNote(note.freq, 0.35, now + (index * noteGap));
    });

    // Toca a oitava no final se quiser fechar o ciclo
    const octaveFreq = scaleNotes[0].freq * 2;
    this.playNote(octaveFreq, 0.5, now + (scaleNotes.length * noteGap));
  }
}

const synth = new SoundSynthesizer();
