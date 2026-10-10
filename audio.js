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

  // Toca uma nota única simulando timbre de piano/vibrafone agradável
  playNote(frequency, duration = 0.45, startTime = null) {
    if (!this.soundEnabled) return;
    this.initAudio();

    const t = startTime !== null ? startTime : this.audioCtx.currentTime;
    
    // Oscilador principal (tom quente - seno + triângulo mistos)
    const osc = this.audioCtx.createOscillator();
    const oscHarmonic = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, t);

    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(frequency * 2, t);

    // Envelope ADSR suave (Attack rápido, Decay e Release natural)
    gainNode.gain.setValueAtTime(0.001, t);
    gainNode.gain.exponentialRampToValueAtTime(0.35, t + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.18, t + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gainNode);
    oscHarmonic.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start(t);
    oscHarmonic.start(t);

    osc.stop(t + duration);
    oscHarmonic.stop(t + duration);
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
