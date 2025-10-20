import { MCQ, ReadingPassage, WritingPrompt } from './common'

export const itGrammarVocab: MCQ[] = [
  { id: 'it-gv-1', prompt: 'Scegli la forma corretta: Io ___ italiano.', options: ['parlo', 'parla', 'parli'], correctIndex: 0, band: 'A1' },
  { id: 'it-gv-2', prompt: 'Qual è il plurale di “amico”?', options: ['amici', 'amicos', 'amiche'], correctIndex: 0, band: 'A1' },
  { id: 'it-gv-3', prompt: '“Andare” al passato prossimo (io) è…', options: ['sono andato/a', 'ho andato', 'ero andato'], correctIndex: 0, band: 'A2' },
  { id: 'it-gv-4', prompt: 'Scegli la preposizione: Vado ___ lavoro.', options: ['a', 'in', 'da'], correctIndex: 1, band: 'A2' },
  { id: 'it-gv-5', prompt: 'Concordanza: Le ragazze ___ stanche.', options: ['sono', 'è', 'siete'], correctIndex: 0, band: 'A1' },
  { id: 'it-gv-6', prompt: 'Sinonimo di “rapidamente”.', options: ['velocemente', 'lontano', 'spesso'], correctIndex: 0, band: 'B1' },
  { id: 'it-gv-7', prompt: 'Periodo ipotetico (realtà): Se ___ tempo, vado al mare.', options: ['ho', 'avrei', 'avessi'], correctIndex: 0, band: 'B1' },
  { id: 'it-gv-8', prompt: 'Congiuntivo presente: Penso che lui ___ ragione.', options: ['abbia', 'ha', 'avrebbe'], correctIndex: 0, band: 'B2' },
  { id: 'it-gv-9', prompt: 'Uso di “ne”: Quanti libri hai? Ne ___ tre.', options: ['ho', 'ci sono', 'ne sono'], correctIndex: 0, band: 'B1' },
  { id: 'it-gv-10', prompt: 'Futuro: Domani ___ presto.', options: ['mi alzerò', 'mi alzo', 'mi alzerei'], correctIndex: 0, band: 'A2' },
  { id: 'it-gv-11', prompt: 'Passato remoto di “essere” (3a sing.)', options: ['fu', 'era', 'è stato'], correctIndex: 0, band: 'C1', weight: 2 },
  { id: 'it-gv-12', prompt: 'Qual è l’uso corretto di “ci” in: “___ penso spesso”.', options: ['Ci', 'Vi', 'Ne'], correctIndex: 0, band: 'B2' },
  { id: 'it-gv-13', prompt: 'Forma riflessiva: Loro ___ incontrano alle 8.', options: ['si', 'li', 'le'], correctIndex: 0, band: 'A2' },
  { id: 'it-gv-14', prompt: 'Locuzione: “Prendere qualcosa alla lettera” significa…', options: ['interpretarla letteralmente', 'scriverla bene', 'leggerla piano'], correctIndex: 0, band: 'B2' },
  { id: 'it-gv-15', prompt: 'Connettivo: È tardi, ___ andiamo.', options: ['quindi', 'anche se', 'siccome'], correctIndex: 0, band: 'A2' },
]

export const itReading: ReadingPassage[] = [
  {
    id: 'it-r-1',
    title: 'Un caffè in piazza',
    text:
      'Ogni mattina, Marco prende un caffè al bar in piazza prima di andare al lavoro. Saluta il barista, legge il giornale e osserva le persone che passano.',
    questions: [
      { id: 'it-r-1-q1', prompt: 'Quando Marco prende il caffè?', options: ['Di mattina', 'Di sera', 'Nel weekend'], correctIndex: 0, band: 'A1' },
      { id: 'it-r-1-q2', prompt: 'Cosa fa mentre beve il caffè?', options: ['Legge il giornale', 'Parla al telefono', 'Scrive e-mail'], correctIndex: 0, band: 'A1' },
      { id: 'it-r-1-q3', prompt: 'Dove lo prende?', options: ['Al bar', 'A casa', 'In ufficio'], correctIndex: 0, band: 'A1' },
    ]
  },
  {
    id: 'it-r-2',
    title: 'Città sostenibile',
    text:
      'Negli ultimi anni, molte città italiane hanno investito in piste ciclabili e trasporto pubblico per ridurre il traffico e l’inquinamento. I cittadini sono incoraggiati a usare mezzi alternativi all’auto.',
    questions: [
      { id: 'it-r-2-q1', prompt: 'Qual è l’obiettivo degli investimenti?', options: ['Ridurre traffico e inquinamento', 'Aumentare parcheggi', 'Costruire autostrade'], correctIndex: 0, band: 'B1' },
      { id: 'it-r-2-q2', prompt: 'Cosa viene incoraggiato?', options: ['L’uso di mezzi alternativi', 'L’uso dell’auto', 'Il turismo'], correctIndex: 0, band: 'B1' },
    ]
  }
]

export const itWriting: WritingPrompt = {
  id: 'it-w-1',
  prompt: 'Descrivi brevemente la tua routine mattutina (5–7 frasi).',
  keywords: ['sveglio', 'colazione', 'lavoro', 'scuola', 'tram', 'treno', 'doccia', 'vesto'],
  targetWords: 60
}
