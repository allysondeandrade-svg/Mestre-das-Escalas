// Base completa de teoria musical para todas as 12 tonalidades Maiores e Menores Naturais
// Contém graus corretos com notação enarmônica rigorosa (ex: F# Maior tem E# / Mi#, Cb Maior, etc.)

const SCALES_DATA = [
  // --- ESCALAS MAIORES NA ORDEM EXATA ESPECIFICADA ---
  // C, D, E, F, G, A, B, C#, D#, F#, G#, A#, Db, Eb, Gb, Ab, Bb
  {
    id: "c_major",
    name: "Dó Maior",
    shortName: "C",
    type: "major",
    typeName: "Maior",
    tonic: "C",
    tonicPt: "Dó",
    accidentals: "Nenhum (Natural)",
    accidentalsCount: 0,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Dó", noteEn: "C", freq: 261.63 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Ré", noteEn: "D", freq: 293.66 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Si", noteEn: "B", freq: 493.88 }
    ]
  },
  {
    id: "d_major",
    name: "Ré Maior",
    shortName: "D",
    type: "major",
    typeName: "Maior",
    tonic: "D",
    tonicPt: "Ré",
    accidentals: "2 sustenidos (Fá♯, Dó♯)",
    accidentalsCount: 2,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Ré", noteEn: "D", freq: 293.66 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Si", noteEn: "B", freq: 493.88 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Dó♯", noteEn: "C#", freq: 554.37 }
    ]
  },
  {
    id: "e_major",
    name: "Mi Maior",
    shortName: "E",
    type: "major",
    typeName: "Maior",
    tonic: "E",
    tonicPt: "Mi",
    accidentals: "4 sustenidos (Fá♯, Dó♯, Sol♯, Ré♯)",
    accidentalsCount: 4,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Si", noteEn: "B", freq: 493.88 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Dó♯", noteEn: "C#", freq: 554.37 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Ré♯", noteEn: "D#", freq: 622.25 }
    ]
  },
  {
    id: "f_major",
    name: "Fá Maior",
    shortName: "F",
    type: "major",
    typeName: "Maior",
    tonic: "F",
    tonicPt: "Fá",
    accidentals: "1 bemol (Si♭)",
    accidentalsCount: 1,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Si♭", noteEn: "Bb", freq: 466.16 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Dó", noteEn: "C", freq: 523.25 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Ré", noteEn: "D", freq: 587.33 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Mi", noteEn: "E", freq: 659.25 }
    ]
  },
  {
    id: "g_major",
    name: "Sol Maior",
    shortName: "G",
    type: "major",
    typeName: "Maior",
    tonic: "G",
    tonicPt: "Sol",
    accidentals: "1 sustenido (Fá♯)",
    accidentalsCount: 1,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Si", noteEn: "B", freq: 493.88 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Dó", noteEn: "C", freq: 523.25 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Ré", noteEn: "D", freq: 587.33 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Mi", noteEn: "E", freq: 659.25 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Fá♯", noteEn: "F#", freq: 739.99 }
    ]
  },
  {
    id: "a_major",
    name: "Lá Maior",
    shortName: "A",
    type: "major",
    typeName: "Maior",
    tonic: "A",
    tonicPt: "Lá",
    accidentals: "3 sustenidos (Fá♯, Dó♯, Sol♯)",
    accidentalsCount: 3,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Lá", noteEn: "A", freq: 220.00 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Si", noteEn: "B", freq: 246.94 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Dó♯", noteEn: "C#", freq: 277.18 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Ré", noteEn: "D", freq: 293.66 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 }
    ]
  },
  {
    id: "b_major",
    name: "Si Maior",
    shortName: "B",
    type: "major",
    typeName: "Maior",
    tonic: "B",
    tonicPt: "Si",
    accidentals: "5 sustenidos (Fá♯, Dó♯, Sol♯, Ré♯, Lá♯)",
    accidentalsCount: 5,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Si", noteEn: "B", freq: 246.94 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Dó♯", noteEn: "C#", freq: 277.18 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Ré♯", noteEn: "D#", freq: 311.13 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Lá♯", noteEn: "A#", freq: 466.16 }
    ]
  },
  {
    id: "csharp_major",
    name: "Dó♯ Maior",
    shortName: "C#",
    type: "major",
    typeName: "Maior",
    tonic: "C#",
    tonicPt: "Dó♯",
    accidentals: "7 sustenidos (Fá♯, Dó♯, Sol♯, Ré♯, Lá♯, Mi♯, Si♯)",
    accidentalsCount: 7,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Dó♯", noteEn: "C#", freq: 277.18 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Ré♯", noteEn: "D#", freq: 311.13 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Mi♯", noteEn: "E#", freq: 349.23 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Lá♯", noteEn: "A#", freq: 466.16 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Si♯", noteEn: "B#", freq: 523.25 }
    ]
  },
  {
    id: "dsharp_major",
    name: "Ré♯ Maior",
    shortName: "D#",
    type: "major",
    typeName: "Maior",
    tonic: "D#",
    tonicPt: "Ré♯",
    accidentals: "9 sustenidos (Enarmônica de Mi♭)",
    accidentalsCount: 9,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Ré♯", noteEn: "D#", freq: 311.13 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Mi♯", noteEn: "E#", freq: 349.23 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Lá♯", noteEn: "A#", freq: 466.16 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Dó", noteEn: "C", freq: 523.25 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Ré", noteEn: "D", freq: 587.33 }
    ]
  },
  {
    id: "fsharp_major",
    name: "Fá♯ Maior",
    shortName: "F#",
    type: "major",
    typeName: "Maior",
    tonic: "F#",
    tonicPt: "Fá♯",
    accidentals: "6 sustenidos (Fá♯, Dó♯, Sol♯, Ré♯, Lá♯, Mi♯)",
    accidentalsCount: 6,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Lá♯", noteEn: "A#", freq: 466.16 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Si", noteEn: "B", freq: 493.88 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Dó♯", noteEn: "C#", freq: 554.37 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Ré♯", noteEn: "D#", freq: 622.25 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Mi♯", noteEn: "E#", freq: 659.25 }
    ]
  },
  {
    id: "gsharp_major",
    name: "Sol♯ Maior",
    shortName: "G#",
    type: "major",
    typeName: "Maior",
    tonic: "G#",
    tonicPt: "Sol♯",
    accidentals: "8 sustenidos (Enarmônica de Lá♭)",
    accidentalsCount: 8,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Lá♯", noteEn: "A#", freq: 466.16 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Dó", noteEn: "C", freq: 523.25 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Dó♯", noteEn: "C#", freq: 554.37 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Ré♯", noteEn: "D#", freq: 622.25 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Mi♯", noteEn: "E#", freq: 659.25 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Sol", noteEn: "G", freq: 783.99 }
    ]
  },
  {
    id: "asharp_major",
    name: "Lá♯ Maior",
    shortName: "A#",
    type: "major",
    typeName: "Maior",
    tonic: "A#",
    tonicPt: "Lá♯",
    accidentals: "10 sustenidos (Enarmônica de Si♭)",
    accidentalsCount: 10,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Lá♯", noteEn: "A#", freq: 466.16 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Dó", noteEn: "C", freq: 523.25 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Ré", noteEn: "D", freq: 587.33 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Ré♯", noteEn: "D#", freq: 622.25 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Mi♯", noteEn: "E#", freq: 659.25 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Sol", noteEn: "G", freq: 783.99 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Lá", noteEn: "A", freq: 880.00 }
    ]
  },
  {
    id: "dflat_major",
    name: "Ré♭ Maior",
    shortName: "Db",
    type: "major",
    typeName: "Maior",
    tonic: "Db",
    tonicPt: "Ré♭",
    accidentals: "5 bemóis (Si♭, Mi♭, Lá♭, Ré♭, Sol♭)",
    accidentalsCount: 5,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Ré♭", noteEn: "Db", freq: 277.18 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Mi♭", noteEn: "Eb", freq: 311.13 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Sol♭", noteEn: "Gb", freq: 369.99 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Lá♭", noteEn: "Ab", freq: 415.30 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Si♭", noteEn: "Bb", freq: 466.16 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Dó", noteEn: "C", freq: 523.25 }
    ]
  },
  {
    id: "eflat_major",
    name: "Mi♭ Maior",
    shortName: "Eb",
    type: "major",
    typeName: "Maior",
    tonic: "Eb",
    tonicPt: "Mi♭",
    accidentals: "3 bemóis (Si♭, Mi♭, Lá♭)",
    accidentalsCount: 3,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Mi♭", noteEn: "Eb", freq: 311.13 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Lá♭", noteEn: "Ab", freq: 415.30 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Si♭", noteEn: "Bb", freq: 466.16 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Dó", noteEn: "C", freq: 523.25 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Ré", noteEn: "D", freq: 587.33 }
    ]
  },
  {
    id: "gflat_major",
    name: "Sol♭ Maior",
    shortName: "Gb",
    type: "major",
    typeName: "Maior",
    tonic: "Gb",
    tonicPt: "Sol♭",
    accidentals: "6 bemóis (Si♭, Mi♭, Lá♭, Ré♭, Sol♭, Dó♭)",
    accidentalsCount: 6,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Sol♭", noteEn: "Gb", freq: 369.99 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Lá♭", noteEn: "Ab", freq: 415.30 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Si♭", noteEn: "Bb", freq: 466.16 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Dó♭", noteEn: "Cb", freq: 493.88 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Ré♭", noteEn: "Db", freq: 554.37 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Mi♭", noteEn: "Eb", freq: 622.25 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Fá", noteEn: "F", freq: 698.46 }
    ]
  },
  {
    id: "aflat_major",
    name: "Lá♭ Maior",
    shortName: "Ab",
    type: "major",
    typeName: "Maior",
    tonic: "Ab",
    tonicPt: "Lá♭",
    accidentals: "4 bemóis (Si♭, Mi♭, Lá♭, Ré♭)",
    accidentalsCount: 4,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Lá♭", noteEn: "Ab", freq: 207.65 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Si♭", noteEn: "Bb", freq: 233.08 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Dó", noteEn: "C", freq: 261.63 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Ré♭", noteEn: "Db", freq: 277.18 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Mi♭", noteEn: "Eb", freq: 311.13 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Sol", noteEn: "G", freq: 392.00 }
    ]
  },
  {
    id: "bflat_major",
    name: "Si♭ Maior",
    shortName: "Bb",
    type: "major",
    typeName: "Maior",
    tonic: "Bb",
    tonicPt: "Si♭",
    accidentals: "2 bemóis (Si♭, Mi♭)",
    accidentalsCount: 2,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Si♭", noteEn: "Bb", freq: 233.08 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Dó", noteEn: "C", freq: 261.63 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Maior (3ª)", notePt: "Ré", noteEn: "D", freq: 293.66 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Mi♭", noteEn: "Eb", freq: 311.13 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Maior (6ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Maior (7ª / Sensível)", notePt: "Lá", noteEn: "A", freq: 440.00 }
    ]
  },

  // --- ESCALAS MENORES NATURAIS (Fórmula: T - st - T - T - st - T - T) ---
  {
    id: "a_minor",
    name: "Lá Menor",
    shortName: "Am",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "A",
    tonicPt: "Lá",
    accidentals: "Nenhum (Relativa de Dó Maior)",
    accidentalsCount: 0,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Lá", noteEn: "A", freq: 220.00 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Si", noteEn: "B", freq: 246.94 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Dó", noteEn: "C", freq: 261.63 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Ré", noteEn: "D", freq: 293.66 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Sol", noteEn: "G", freq: 392.00 }
    ]
  },
  {
    id: "e_minor",
    name: "Mi Menor",
    shortName: "Em",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "E",
    tonicPt: "Mi",
    accidentals: "1 sustenido (Fá♯)",
    accidentalsCount: 1,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Si", noteEn: "B", freq: 493.88 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Dó", noteEn: "C", freq: 523.25 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Ré", noteEn: "D", freq: 587.33 }
    ]
  },
  {
    id: "b_minor",
    name: "Si Menor",
    shortName: "Bm",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "B",
    tonicPt: "Si",
    accidentals: "2 sustenidos (Fá♯, Dó♯)",
    accidentalsCount: 2,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Si", noteEn: "B", freq: 246.94 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Dó♯", noteEn: "C#", freq: 277.18 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Ré", noteEn: "D", freq: 293.66 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Lá", noteEn: "A", freq: 440.00 }
    ]
  },
  {
    id: "fsharp_minor",
    name: "Fá♯ Menor",
    shortName: "F#m",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "F#",
    tonicPt: "Fá♯",
    accidentals: "3 sustenidos (Fá♯, Dó♯, Sol♯)",
    accidentalsCount: 3,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Si", noteEn: "B", freq: 493.88 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Dó♯", noteEn: "C#", freq: 554.37 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Ré", noteEn: "D", freq: 587.33 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Mi", noteEn: "E", freq: 659.25 }
    ]
  },
  {
    id: "csharp_minor",
    name: "Dó♯ Menor",
    shortName: "C#m",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "C#",
    tonicPt: "Dó♯",
    accidentals: "4 sustenidos (Fá♯, Dó♯, Sol♯, Ré♯)",
    accidentalsCount: 4,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Dó♯", noteEn: "C#", freq: 277.18 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Ré♯", noteEn: "D#", freq: 311.13 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Fá♯", noteEn: "F#", freq: 369.99 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Si", noteEn: "B", freq: 493.88 }
    ]
  },
  {
    id: "gsharp_minor",
    name: "Sol♯ Menor",
    shortName: "G#m",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "G#",
    tonicPt: "Sol♯",
    accidentals: "5 sustenidos (Fá♯, Dó♯, Sol♯, Ré♯, Lá♯)",
    accidentalsCount: 5,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Sol♯", noteEn: "G#", freq: 415.30 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Lá♯", noteEn: "A#", freq: 466.16 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Si", noteEn: "B", freq: 493.88 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Dó♯", noteEn: "C#", freq: 554.37 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Ré♯", noteEn: "D#", freq: 622.25 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Mi", noteEn: "E", freq: 659.25 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Fá♯", noteEn: "F#", freq: 739.99 }
    ]
  },
  {
    id: "d_minor",
    name: "Ré Menor",
    shortName: "Dm",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "D",
    tonicPt: "Ré",
    accidentals: "1 bemol (Si♭)",
    accidentalsCount: 1,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Ré", noteEn: "D", freq: 293.66 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Mi", noteEn: "E", freq: 329.63 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Si♭", noteEn: "Bb", freq: 466.16 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Dó", noteEn: "C", freq: 523.25 }
    ]
  },
  {
    id: "g_minor",
    name: "Sol Menor",
    shortName: "Gm",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "G",
    tonicPt: "Sol",
    accidentals: "2 bemóis (Si♭, Mi♭)",
    accidentalsCount: 2,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Lá", noteEn: "A", freq: 440.00 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Si♭", noteEn: "Bb", freq: 466.16 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Dó", noteEn: "C", freq: 523.25 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Ré", noteEn: "D", freq: 587.33 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Mi♭", noteEn: "Eb", freq: 622.25 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Fá", noteEn: "F", freq: 698.46 }
    ]
  },
  {
    id: "c_minor",
    name: "Dó Menor",
    shortName: "Cm",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "C",
    tonicPt: "Dó",
    accidentals: "3 bemóis (Si♭, Mi♭, Lá♭)",
    accidentalsCount: 3,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Dó", noteEn: "C", freq: 261.63 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Ré", noteEn: "D", freq: 293.66 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Mi♭", noteEn: "Eb", freq: 311.13 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Lá♭", noteEn: "Ab", freq: 415.30 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Si♭", noteEn: "Bb", freq: 466.16 }
    ]
  },
  {
    id: "f_minor",
    name: "Fá Menor",
    shortName: "Fm",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "F",
    tonicPt: "Fá",
    accidentals: "4 bemóis (Si♭, Mi♭, Lá♭, Ré♭)",
    accidentalsCount: 4,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Sol", noteEn: "G", freq: 392.00 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Lá♭", noteEn: "Ab", freq: 415.30 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Si♭", noteEn: "Bb", freq: 466.16 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Dó", noteEn: "C", freq: 523.25 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Ré♭", noteEn: "Db", freq: 554.37 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Mi♭", noteEn: "Eb", freq: 622.25 }
    ]
  },
  {
    id: "bflat_minor",
    name: "Si♭ Menor",
    shortName: "Bbm",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "Bb",
    tonicPt: "Si♭",
    accidentals: "5 bemóis (Si♭, Mi♭, Lá♭, Ré♭, Sol♭)",
    accidentalsCount: 5,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Si♭", noteEn: "Bb", freq: 233.08 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Dó", noteEn: "C", freq: 261.63 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Ré♭", noteEn: "Db", freq: 277.18 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Mi♭", noteEn: "Eb", freq: 311.13 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Sol♭", noteEn: "Gb", freq: 369.99 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Lá♭", noteEn: "Ab", freq: 415.30 }
    ]
  },
  {
    id: "eflat_minor",
    name: "Mi♭ Menor",
    shortName: "Ebm",
    type: "minor",
    typeName: "Menor Natural",
    tonic: "Eb",
    tonicPt: "Mi♭",
    accidentals: "6 bemóis (Si♭, Mi♭, Lá♭, Ré♭, Sol♭, Dó♭)",
    accidentalsCount: 6,
    notes: [
      { degree: 1, degreeRoman: "I", degreeName: "Tônica (1ª)", notePt: "Mi♭", noteEn: "Eb", freq: 311.13 },
      { degree: 2, degreeRoman: "II", degreeName: "Segunda Maior (2ª)", notePt: "Fá", noteEn: "F", freq: 349.23 },
      { degree: 3, degreeRoman: "III", degreeName: "Terça Menor (3ªm)", notePt: "Sol♭", noteEn: "Gb", freq: 369.99 },
      { degree: 4, degreeRoman: "IV", degreeName: "Quarta Justa (4ª)", notePt: "Lá♭", noteEn: "Ab", freq: 415.30 },
      { degree: 5, degreeRoman: "V", degreeName: "Quinta Justa (5ª)", notePt: "Si♭", noteEn: "Bb", freq: 466.16 },
      { degree: 6, degreeRoman: "VI", degreeName: "Sexta Menor (6ªm)", notePt: "Dó♭", noteEn: "Cb", freq: 493.88 },
      { degree: 7, degreeRoman: "VII", degreeName: "Sétima Menor (7ªm / Subtônica)", notePt: "Ré♭", noteEn: "Db", freq: 554.37 }
    ]
  }
];

// Lista de todas as opções de notas disponíveis em cifras para o gerador de quiz
const ALL_POSSIBLE_NOTES = [
  "C", "D", "E", "F", "G", "A", "B",
  "C#", "D#", "F#", "G#", "A#", "E#", "B#",
  "Db", "Eb", "Gb", "Ab", "Bb", "Cb"
];
