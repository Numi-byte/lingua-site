export type Locale = 'en' | 'it' | 'de'

export const dict: Record<Locale, Record<string, string>> = {
  en: {
    nav_assessment: 'Assessment',
    nav_book: 'Free Trial',
    nav_pricing: 'Packages',
    nav_dashboard: 'Dashboard',
    sign_in: 'Sign in',
    book_free_class: 'Book free class',
  },
  it: {
    nav_assessment: 'Valutazione',
    nav_book: 'Lezione gratuita',
    nav_pricing: 'Pacchetti',
    nav_dashboard: 'Area personale',
    sign_in: 'Accedi',
    book_free_class: 'Prenota lezione gratis',
  },
  de: {
    nav_assessment: 'Einstufungstest',
    nav_book: 'Kostenlose Stunde',
    nav_pricing: 'Pakete',
    nav_dashboard: 'Dashboard',
    sign_in: 'Anmelden',
    book_free_class: 'Kostenlose Stunde buchen',
  },
}
