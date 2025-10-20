import { MCQ, ReadingPassage, WritingPrompt } from './common'

export const deGrammarVocab: MCQ[] = [
  { id: 'de-gv-1', prompt: 'Wähle die richtige Form: Ich ___ Deutsch.', options: ['spreche', 'sprichst', 'spricht'], correctIndex: 0, band: 'A1' },
  { id: 'de-gv-2', prompt: 'Plural von “Buch”?', options: ['Bücher', 'Buchs', 'Büchen'], correctIndex: 0, band: 'A1' },
  { id: 'de-gv-3', prompt: 'Perfekt (ich): Ich ___ nach Hause ___ .', options: ['bin ... gegangen', 'habe ... gegangen', 'war ... gehen'], correctIndex: 0, band: 'A2' },
  { id: 'de-gv-4', prompt: 'Präposition: Ich fahre ___ Arbeit.', options: ['zur', 'bei', 'gegen'], correctIndex: 0, band: 'A2' },
  { id: 'de-gv-5', prompt: 'Modalverb: Er ___ heute nicht kommen.', options: ['kann', 'können', 'kannst'], correctIndex: 0, band: 'A1' },
  { id: 'de-gv-6', prompt: 'Synonym für “schnell”.', options: ['rasch', 'bald', 'spät'], correctIndex: 0, band: 'B1' },
  { id: 'de-gv-7', prompt: 'Konjunktiv II (Realität nahe): Wenn ich Zeit ___, gehe ich ins Kino.', options: ['habe', 'hätte', 'hatte'], correctIndex: 0, band: 'B1' },
  { id: 'de-gv-8', prompt: 'Relativsatz: Das ist der Mann, ___ ich gestern gesehen habe.', options: ['den', 'der', 'dem'], correctIndex: 0, band: 'B2' },
  { id: 'de-gv-9', prompt: 'Trennbares Verb: Ich ___ morgen um 7 Uhr ___ .', options: ['stehe ... auf', 'auf ... stehe', 'aufstehe ...'], correctIndex: 0, band: 'A2' },
  { id: 'de-gv-10', prompt: 'Futur I: Morgen ___ ich früh aufstehen.', options: ['werde', 'wird', 'würde'], correctIndex: 0, band: 'A2' },
  { id: 'de-gv-11', prompt: 'Genitiv: Das ist das Auto ___ Nachbarn.', options: ['des', 'der', 'dem'], correctIndex: 0, band: 'B2' },
  { id: 'de-gv-12', prompt: 'Idiom: “etwas wörtlich nehmen” bedeutet…', options: ['es genau so verstehen', 'es später machen', 'es laut lesen'], correctIndex: 0, band: 'B2' },
  { id: 'de-gv-13', prompt: 'Reflexiv: Sie ___ sich um 7 Uhr.', options: ['zieht', 'ziehts', 'zieht sich'], correctIndex: 2, band: 'A2' },
  { id: 'de-gv-14', prompt: 'Konjunktion: Es ist spät, ___ gehen wir.', options: ['deshalb', 'obwohl', 'während'], correctIndex: 0, band: 'A2' },
  { id: 'de-gv-15', prompt: 'Präteritum von “sein” (3. Sg.)', options: ['war', 'ist gewesen', 'warte'], correctIndex: 0, band: 'C1', weight: 2 },
]

export const deReading: ReadingPassage[] = [
  {
    id: 'de-r-1',
    title: 'Morgens im Café',
    text:
      'Jeden Morgen trinkt Anna einen Kaffee im Café an der Ecke, bevor sie zur Arbeit geht. Sie liest Nachrichten und beobachtet die Leute.',
    questions: [
      { id: 'de-r-1-q1', prompt: 'Wann trinkt Anna Kaffee?', options: ['Morgens', 'Abends', 'Nur am Wochenende'], correctIndex: 0, band: 'A1' },
      { id: 'de-r-1-q2', prompt: 'Was macht sie im Café?', options: ['Sie liest Nachrichten', 'Sie schläft', 'Sie telefoniert laut'], correctIndex: 0, band: 'A1' },
    ]
  },
  {
    id: 'de-r-2',
    title: 'Nachhaltige Stadt',
    text:
      'Viele deutsche Städte investieren in Radwege und öffentlichen Verkehr, um Staus und Luftverschmutzung zu reduzieren. Bürger werden ermutigt, Alternativen zum Auto zu nutzen.',
    questions: [
      { id: 'de-r-2-q1', prompt: 'Was ist das Ziel der Investitionen?', options: ['Weniger Staus und Verschmutzung', 'Mehr Parkplätze', 'Mehr Autobahnen'], correctIndex: 0, band: 'B1' },
      { id: 'de-r-2-q2', prompt: 'Was wird empfohlen?', options: ['Alternative Verkehrsmittel', 'Mehr Autofahren', 'Reisen'], correctIndex: 0, band: 'B1' },
      { id: 'de-r-2-q3', prompt: 'Worauf liegt der Fokus?', options: ['Radwege & ÖPNV', 'Tourismus', 'Wohnungsbau'], correctIndex: 0, band: 'B1' },
    ]
  }
]

export const deWriting: WritingPrompt = {
  id: 'de-w-1',
  prompt: 'Beschreibe kurz deine Morgenroutine (5–7 Sätze).',
  keywords: ['frühstück', 'arbeit', 'schule', 'dusche', 'zug', 'bahn', 'anziehen', 'aufstehen'],
  targetWords: 60
}
