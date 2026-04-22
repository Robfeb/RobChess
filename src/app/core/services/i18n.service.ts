import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type TranslationKey =
  | 'appName' | 'beginner' | 'intermediate' | 'advanced' | 'master' | 'grandmaster'
  | 'rating' | 'themes' | 'viewOnLichess' | 'hint' | 'legalMoves' | 'nextPuzzle'
  | 'retry' | 'settings' | 'boardTheme' | 'pieceSet' | 'language' | 'darkMode'
  | 'lightMode' | 'crowns' | 'puzzleComplete' | 'wrongMove' | 'loading' | 'filterByTheme'
  | 'allThemes' | 'solved' | 'level' | 'puzzle' | 'of' | 'batch' | 'youPlayAs' | 'white' | 'black'
  | 'errors' | 'streak' | 'help' | 'legend' | 'helpDesc' | 'legendDesc'
  | 'startTutorial' | 'skipTutorial' | 'next' | 'back' | 'finish'
  | 'share' | 'rings' | 'puzzleShared'
  | 'copyLink' | 'sound' | 'soundOn' | 'soundOff' | 'randomNext'
  | 'alreadyPlayed' | 'previousErrors' | 'playAgain' | 'coins'
  | 'tutStep1Title' | 'tutStep1Desc' | 'tutStep2Title' | 'tutStep2Desc'
  | 'tutStep3Title' | 'tutStep3Desc' | 'tutStep4Title' | 'tutStep4Desc'
  | 'tutStep5Title' | 'tutStep5Desc' | 'tutStep6Title' | 'tutStep6Desc';

type Translations = Record<TranslationKey, string>;

const EN: Translations = {
  appName: 'Rob Chess',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  master: 'Master',
  grandmaster: 'Grandmaster',
  rating: 'Rating',
  themes: 'Themes',
  viewOnLichess: 'View on Lichess',
  hint: 'Hint',
  legalMoves: 'Show Moves',
  nextPuzzle: 'Next Puzzle',
  retry: 'Retry',
  settings: 'Settings',
  boardTheme: 'Board Theme',
  pieceSet: 'Piece Set',
  language: 'Language',
  darkMode: 'Dark Mode',
  lightMode: 'Light Mode',
  crowns: 'Crowns',
  puzzleComplete: 'Puzzle Complete!',
  wrongMove: 'Wrong Move!',
  loading: 'Loading...',
  filterByTheme: 'Filter by Theme',
  allThemes: 'All Themes',
  solved: 'Solved',
  level: 'Level',
  puzzle: 'Puzzle',
  of: 'of',
  batch: 'Batch',
  youPlayAs: 'You play as',
  white: 'White',
  black: 'Black',
  errors: 'Errors',
  streak: 'Streak',
  help: 'Help',
  legend: 'Legend',
  helpDesc: 'Select a piece and move it to a legal square to find the tactic. Navigation is sequential by default; toggle Random mode in settings to mix it up!',
  legendDesc: 'Green dot = Legal move, Yellow ring = Capture, Red square = Check or Error',
  startTutorial: 'Start Tutorial',
  skipTutorial: 'Skip',
  next: 'Next',
  back: 'Back',
  finish: 'Got it!',
  share: 'Share',
  rings: 'Rings',
  puzzleShared: 'Link copied to clipboard!',
  copyLink: 'Copy Link',
  sound: 'Sound',
  soundOn: 'Sound On',
  soundOff: 'Sound Off',
  randomNext: 'Random Selection',
  alreadyPlayed: 'You already played this puzzle!',
  previousErrors: 'Previous errors: {{count}}',
  playAgain: 'Play again to improve your score.',
  coins: 'Coins',
  tutStep1Title: 'Welcome to Rob Chess!',
  tutStep1Desc: 'Master the art of chess tactics with over 50,000 hand-picked puzzles.',
  tutStep2Title: 'Find the Best Move',
  tutStep2Desc: 'In each puzzle, you must find the winning sequence. Follow the prompt to solve the tactic!',
  tutStep3Title: 'Levels & Themes',
  tutStep3Desc: 'Choose your level from Beginner to Grandmaster. Use the 🔍 Filter tab to narrow down puzzles by tactical theme. By default puzzles are sequential; enable Random Mode in Settings for variety.',
  tutStep4Title: 'Movement & Hints',
  tutStep4Desc: 'Click or drag pieces to move. Toggle legal move dots 🎯 in the ⚙️ Settings menu. Use the 💡 lightbulb for a move hint.',
  tutStep5Title: 'Streak & Errors',
  tutStep5Desc: 'Build your 🔥 streak with consecutive correct moves. One mistake resets it!',
  tutStep6Title: 'Earn Crowns & Coins',
  tutStep6Desc: 'Every solved puzzle earns you 👑 Crowns and 🪙 Coins. Coin amount depends on difficulty; mistakes reduce the reward. Complete a full batch to earn a bonus of +50 Crowns!',
};

const ES: Translations = {
  appName: 'Rob Chess',
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  master: 'Maestro',
  grandmaster: 'Gran Maestro',
  rating: 'Puntuación',
  themes: 'Temas',
  viewOnLichess: 'Ver en Lichess',
  hint: 'Pista',
  legalMoves: 'Ver Jugadas',
  nextPuzzle: 'Siguiente',
  retry: 'Reintentar',
  settings: 'Ajustes',
  boardTheme: 'Tema del Tablero',
  pieceSet: 'Set de Piezas',
  language: 'Idioma',
  darkMode: 'Modo Oscuro',
  lightMode: 'Modo Claro',
  crowns: 'Coronas',
  puzzleComplete: '¡Puzzle Completo!',
  wrongMove: '¡Jugada Incorrecta!',
  loading: 'Cargando...',
  filterByTheme: 'Filtrar por Tema',
  allThemes: 'Todos los Temas',
  solved: 'Resuelto',
  level: 'Nivel',
  puzzle: 'Puzzle',
  of: 'de',
  batch: 'Lote',
  youPlayAs: 'Juegas con',
  white: 'Blancas',
  black: 'Negras',
  errors: 'Errores',
  streak: 'Racha',
  help: 'Ayuda',
  legend: 'Leyenda',
  helpDesc: 'Selecciona una pieza y muévela a una casilla legal para resolver la táctica. La navegación es secuencial por defecto; ¡activa el modo Aleatorio en los ajustes para variarlo!',
  legendDesc: 'Punto verde = Jugada legal, Anillo amarillo = Captura, Casilla roja = Jaque o Error',
  startTutorial: 'Iniciar Tutorial',
  skipTutorial: 'Saltar',
  next: 'Siguiente',
  back: 'Atrás',
  finish: '¡Entendido!',
  share: 'Compartir',
  rings: 'Anillos',
  puzzleShared: '¡Enlace copiado al portapapeles!',
  copyLink: 'Copiar Enlace',
  sound: 'Sonido',
  soundOn: 'Sonido Activado',
  soundOff: 'Sonido Desactivado',
  randomNext: 'Selección Aleatoria',
  alreadyPlayed: '¡Ya has jugado este puzzle!',
  previousErrors: 'Errores anteriores: {{count}}',
  playAgain: 'Juega de nuevo para mejorar tu racha.',
  coins: 'Monedas',
  tutStep1Title: '¡Bienvenido a Rob Chess!',
  tutStep1Desc: 'Domina el arte de las tácticas de ajedrez con más de 50,000 acertijos seleccionados.',
  tutStep2Title: 'Encuentra la Mejor Jugada',
  tutStep2Desc: 'En cada acertijo, debes encontrar la secuencia ganadora. ¡Sigue las indicaciones para resolverlo!',
  tutStep3Title: 'Niveles y Temas',
  tutStep3Desc: 'Elige tu nivel de Principiante a Gran Maestro. Usa la pestaña 🔍 Filtro para explorar puzzles por tema táctico. Por defecto son secuenciales; activa el Modo Aleatorio en Ajustes para variar.',
  tutStep4Title: 'Movimiento y Pistas',
  tutStep4Desc: 'Haz clic o arrastra las piezas. Activa los puntos de jugadas legales 🎯 en el menú ⚙️ Ajustes. Usa la 💡 bombilla para una pista.',
  tutStep5Title: 'Racha y Errores',
  tutStep5Desc: '¡Construye tu racha 🔥 con movimientos correctos consecutivos. Un error la reinicia!',
  tutStep6Title: 'Gana Coronas y Monedas',
  tutStep6Desc: 'Cada puzzle resuelto te da 👑 Coronas y 🪙 Monedas. Las monedas dependen de la dificultad; los errores reducen la recompensa. ¡Completa un lote y gana +50 Coronas de bonus!',
};

const FR: Translations = {
  appName: 'Rob Chess',
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  master: 'Maître',
  grandmaster: 'Grand Maître',
  rating: 'Classement',
  themes: 'Thèmes',
  viewOnLichess: 'Voir sur Lichess',
  hint: 'Indice',
  legalMoves: 'Voir les coups',
  nextPuzzle: 'Suivant',
  retry: 'Réessayer',
  settings: 'Paramètres',
  boardTheme: 'Thème du plateau',
  pieceSet: 'Jeu de pièces',
  language: 'Langue',
  darkMode: 'Mode Sombre',
  lightMode: 'Mode Claire',
  crowns: 'Couronnes',
  puzzleComplete: 'Puzzle terminé !',
  wrongMove: 'Mauvais coup !',
  loading: 'Chargement...',
  filterByTheme: 'Filtrer par thème',
  allThemes: 'Tous les thèmes',
  solved: 'Résolu',
  level: 'Niveau',
  puzzle: 'Puzzle',
  of: 'de',
  batch: 'Lot',
  youPlayAs: 'Vous jouez les',
  white: 'Blancs',
  black: 'Noirs',
  errors: 'Erreurs',
  streak: 'Série',
  help: 'Aide',
  legend: 'Légende',
  helpDesc: 'Sélectionnez une pièce et déplacez-la sur une case légale pour résoudre la tactique. La navigation est séquentielle par défaut ; activez le mode Aléatoire dans les paramètres pour varier !',
  legendDesc: 'Point vert = Coup légal, Anneau jaune = Capture, Carré rouge = Échec ou Erreur',
  startTutorial: 'Commencer le tutoriel',
  skipTutorial: 'Passer',
  next: 'Suivant',
  back: 'Retour',
  finish: 'Compris !',
  share: 'Partager',
  rings: 'Anneaux',
  puzzleShared: 'Lien copié dans le presse-papier !',
  copyLink: 'Copier le lien',
  sound: 'Son',
  soundOn: 'Son activé',
  soundOff: 'Son désactivé',
  randomNext: 'Sélection aléatoire',
  alreadyPlayed: 'Vous avez déjà joué ce puzzle !',
  previousErrors: 'Erreurs précédentes : {{count}}',
  playAgain: 'Rejouez pour améliorer votre score.',
  coins: 'Pièces',
  tutStep1Title: 'Bienvenue sur Rob Chess !',
  tutStep1Desc: 'Maîtrisez l\'art de la tactique aux échecs avec plus de 50 000 énigmes triées sur le volet.',
  tutStep2Title: 'Trouvez le meilleur coup',
  tutStep2Desc: 'Dans chaque puzzle, vous devez trouver la séquence gagnante. Suivez l\'invite pour résoudre la tactique !',
  tutStep3Title: 'Niveaux et thèmes',
  tutStep3Desc: 'Choisissez votre niveau de Débutant à Grand Maître. Utilisez l\'onglet 🔍 Filtre pour explorer les puzzles par thème tactique. Par défaut ils sont séquentiels ; activez le Mode Aléatoire dans les Paramètres.',
  tutStep4Title: 'Mouvements et indices',
  tutStep4Desc: 'Cliquez ou faites glisser les pièces. Activez les points de coups légaux 🎯 dans le menu ⚙️ Paramètres. Utilisez l\'ampoule 💡 pour un indice.',
  tutStep5Title: 'Série et erreurs',
  tutStep5Desc: 'Construisez votre série 🔥 avec des coups corrects consécutifs. Une erreur la réinitialise !',
  tutStep6Title: 'Gagnez des Couronnes et des Pièces',
  tutStep6Desc: 'Chaque puzzle résolu rapporte 👑 Couronnes et 🪙 Pièces d\'or. Le montant dépend de la difficulté ; les erreurs réduisent la récompense. Complétez un lot pour gagner +50 Couronnes bonus !',
};

const CA: Translations = {
  appName: 'Rob Chess',
  beginner: 'Principiant',
  intermediate: 'Intermedi',
  advanced: 'Avançat',
  master: 'Mestre',
  grandmaster: 'Gran Mestre',
  rating: 'Classificació',
  themes: 'Temes',
  viewOnLichess: 'Veure a Lichess',
  hint: 'Pista',
  legalMoves: 'Veure moviments',
  nextPuzzle: 'Següent',
  retry: 'Reintentar',
  settings: 'Configuració',
  boardTheme: 'Tema del tauler',
  pieceSet: 'Set de peces',
  language: 'Idioma',
  darkMode: 'Mode Fosc',
  lightMode: 'Mode Clar',
  crowns: 'Corones',
  puzzleComplete: 'Puzzle completat!',
  wrongMove: 'Moviment incorrecte!',
  loading: 'Carregant...',
  filterByTheme: 'Filtrar per tema',
  allThemes: 'Tots els temes',
  solved: 'Resolt',
  level: 'Nivell',
  puzzle: 'Puzzle',
  of: 'de',
  batch: 'Lot',
  youPlayAs: 'Jugues amb',
  white: 'Blanques',
  black: 'Negres',
  errors: 'Errors',
  streak: 'Ratxa',
  help: 'Ajuda',
  legend: 'Llegenda',
  helpDesc: 'Selecciona una peça i mou-la a una casella legal per resoldre la tàctica. La navegació és seqüencial per defecte; activa el mode Aleatori a la configuració per variar!',
  legendDesc: 'Punt verd = Moviment legal, Anell groc = Captura, Quadrat vermell = Escac o Error',
  startTutorial: 'Iniciar tutorial',
  skipTutorial: 'Saltar',
  next: 'Següent',
  back: 'Enrere',
  finish: 'Entès!',
  share: 'Compartir',
  rings: 'Anells',
  puzzleShared: 'Enllaç copiat al porta-retalls!',
  copyLink: 'Copiar enllaç',
  sound: 'So',
  soundOn: 'So activat',
  soundOff: 'So desactivat',
  randomNext: 'Selecció aleatòria',
  alreadyPlayed: 'Ja has jugat aquest puzzle!',
  previousErrors: 'Errors anteriors: {{count}}',
  playAgain: 'Torna a jugar per millorar la teva puntuació.',
  coins: 'Monedes',
  tutStep1Title: 'Benvingut a Rob Chess!',
  tutStep1Desc: 'Domina l\'art de la tàctica d\'escacs amb més de 50.000 tàctiques seleccionades.',
  tutStep2Title: 'Troba el millor moviment',
  tutStep2Desc: 'En cada tàctica, has de trobar la seqüència guanyadora. Segueix l\'indicació per resoldre-la!',
  tutStep3Title: 'Nivells i Temes',
  tutStep3Desc: 'Tria el teu nivell de Principiant a Gran Mestre. Fes servir la pestanya 🔍 Filtre per explorar puzzles per tema tàctic. Per defecte són seqüencials; activa el Mode Aleatori a la Configuració.',
  tutStep4Title: 'Moviment i Pistes',
  tutStep4Desc: 'Fes clic o arrossega les peces. Activa els punts de moviments legals 🎯 al menú ⚙️ Configuració. Utilitza la bombeta 💡 si necessites una pista.',
  tutStep5Title: 'Ratxa i Errors',
  tutStep5Desc: 'Augmenta la teva ratxa 🔥 amb moviments correctes consecutius. Un error la reinicia!',
  tutStep6Title: 'Guanya Corones i Monedes',
  tutStep6Desc: 'Cada tàctica resolta et dóna 👑 Corones i 🪙 Monedes. La quantitat depèn de la dificultat; els errors redueixen la recompensa. Completa un lot i guanya +50 Corones de bonus!',
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<'en' | 'es' | 'fr' | 'ca'>('en');

  constructor(private storage: StorageService) {
    const saved = storage.getLanguage() as any;
    if (['en', 'es', 'fr', 'ca'].includes(saved)) {
      this.lang.set(saved);
    } else {
      this.lang.set('en');
    }
  }

  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const dicts: Record<string, Translations> = { en: EN, es: ES, fr: FR, ca: CA };
    const dict = dicts[this.lang()] || EN;
    let text = dict[key] ?? key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, String(v));
      });
    }
    return text;
  }

  setLanguage(lang: 'en' | 'es' | 'fr' | 'ca'): void {
    this.lang.set(lang);
    this.storage.setLanguage(lang);
  }

  toggleLanguage(): void {
    const langs: ('en' | 'es' | 'fr' | 'ca')[] = ['en', 'es', 'fr', 'ca'];
    const idx = langs.indexOf(this.lang());
    const next = langs[(idx + 1) % langs.length];
    this.setLanguage(next);
  }
}
