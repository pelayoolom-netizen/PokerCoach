import { Card } from '../types/poker';

export interface TutorialQuiz {
  question: string;
  heroCards?: Card[];
  boardCards?: Card[];
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface LessonContent {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  body: string[];
  visualCards?: {
    label: string;
    cards: Card[];
  }[];
  quiz: TutorialQuiz;
}

export const LESSONS_DATA: LessonContent[] = [
  {
    id: '1',
    title: '¿Qué es Texas Hold\'em?',
    category: 'Fundamentos',
    readTime: '2 min',
    summary: 'La modalidad de póker más popular del mundo, jugada con una baraja de 52 cartas.',
    body: [
      'Texas Hold\'em es un juego de cartas comunitario donde el objetivo principal es ganar el bote (pot) de fichas acumulado en el centro de la mesa.',
      'Puedes ganar el bote de dos formas: mostrando la mejor combinación de 5 cartas en el showdown al final de la mano, o haciendo que todos los demás jugadores se retiren (fold) ante tus apuestas.',
      'En PokerCoach todas las fichas son 100% virtuales y de práctica, sin dinero real involucrado.',
    ],
    quiz: {
      question: '¿De cuántas formas distintas puedes ganar una mano en Texas Hold\'em?',
      options: [
        'Solamente teniendo la mejor mano de cartas al final.',
        'De 2 formas: mostrando la mejor mano en el showdown o logrando que los rivales se retiren.',
        'Únicamente si tienes una pareja de Ases en mano.',
        'Llegando a 21 puntos como en el blackjack.',
      ],
      correctOptionIndex: 1,
      explanation: '¡Correcto! Puedes ganar en el showdown si tienes la mejor jugada de 5 cartas, o antes si todos los oponentes hacen fold a tus apuestas.',
    },
  },
  {
    id: '2',
    title: 'Las cartas privadas (Hole Cards)',
    category: 'Fundamentos',
    readTime: '2 min',
    summary: 'Cada jugador recibe 2 cartas secretas que solo él puede ver y usar.',
    body: [
      'Al comenzar cada mano, el crupier reparte exactamente 2 cartas boca abajo a cada jugador.',
      'Estas cartas se llaman "cartas privadas" o "hole cards". Nadie más en la mesa puede verlas ni utilizarlas hasta que termine la mano.',
      'Junto con las 5 cartas que saldrán en el centro de la mesa, buscarás formar la mejor mano posible de 5 cartas.',
    ],
    visualCards: [
      {
        label: 'Ejemplo de tus cartas privadas (Pocket Aces - La mejor mano inicial):',
        cards: [{ rank: 'A', suit: 'spades' }, { rank: 'A', suit: 'hearts' }],
      },
    ],
    quiz: {
      question: '¿Cuántas cartas privadas recibe cada jugador en Texas Hold\'em?',
      options: ['5 cartas', '2 cartas', '4 cartas', '3 cartas'],
      correctOptionIndex: 1,
      explanation: '¡Exacto! En Texas Hold\'em cada jugador recibe estrictamente 2 cartas privadas.',
    },
  },
  {
    id: '3',
    title: 'Las cartas comunitarias (Board)',
    category: 'Fundamentos',
    readTime: '2 min',
    summary: 'Hasta 5 cartas que se colocan boca arriba en el centro para que todos las compartan.',
    body: [
      'A lo largo de la mano, se revelan hasta 5 cartas en el centro de la mesa, llamadas "cartas comunitarias" o "board".',
      'Todos los jugadores activos pueden combinar cualquiera de estas 5 cartas con sus 2 privadas.',
      'Puedes usar 2 de tus cartas privadas y 3 de la mesa, 1 de tus cartas y 4 de la mesa, o incluso las 5 cartas de la mesa si esa es la mejor combinación.',
    ],
    visualCards: [
      {
        label: 'Mesa comunitaria completa (Flop, Turn y River):',
        cards: [
          { rank: 'K', suit: 'spades' },
          { rank: 'Q', suit: 'hearts' },
          { rank: 'J', suit: 'diamonds' },
          { rank: '10', suit: 'clubs' },
          { rank: '2', suit: 'spades' },
        ],
      },
    ],
    quiz: {
      question: 'Si las 5 cartas comunitarias forman una Escalera Real y ningún jugador tiene una mejor jugada, ¿quién gana?',
      options: [
        'El jugador que apostó primero.',
        'Se reparte el bote en partes iguales entre los jugadores activos (Split Pot).',
        'El crupier se queda con las fichas.',
        'El jugador que tenga el As en su mano.',
      ],
      correctOptionIndex: 1,
      explanation: '¡Excelente! Como todos pueden usar las 5 cartas comunitarias, todos tienen Escalera Real y el bote se divide en partes iguales.',
    },
  },
  {
    id: '4',
    title: 'Fase 1: Preflop',
    category: 'Rondas',
    readTime: '2 min',
    summary: 'La primera ronda de apuestas, justo después de recibir tus 2 cartas privadas.',
    body: [
      'El "Preflop" ocurre antes de que se reparta ninguna carta comunitaria.',
      'Las dos posiciones a la izquierda del botón de repartidor ponen las apuestas obligatorias (ciegas).',
      'El primer jugador en hablar debe decidir si iguala la ciega grande (Call), sube la apuesta (Raise) o se retira (Fold).',
    ],
    quiz: {
      question: 'En preflop, ¿qué cartas están visibles en la mesa?',
      options: ['3 cartas comunitarias', 'Ninguna carta comunitaria todavía', 'Las 5 cartas completas', '1 carta'],
      correctOptionIndex: 1,
      explanation: '¡Correcto! En preflop los jugadores únicamente conocen sus 2 cartas privadas.',
    },
  },
  {
    id: '5',
    title: 'Fase 2: El Flop',
    category: 'Rondas',
    readTime: '2 min',
    summary: 'Las primeras 3 cartas comunitarias que se revelan al mismo tiempo.',
    body: [
      'Una vez terminadas las apuestas del preflop, el repartidor quema una carta y descubre 3 cartas comunitarias a la vez: el "Flop".',
      'En este momento ya conoces 5 de las 7 cartas totales de la mano.',
      'Se abre una nueva ronda de apuestas empezando por el primer jugador activo a la izquierda del botón.',
    ],
    visualCards: [
      {
        label: 'Ejemplo de Flop:',
        cards: [
          { rank: 'A', suit: 'hearts' },
          { rank: '8', suit: 'clubs' },
          { rank: '3', suit: 'diamonds' },
        ],
      },
    ],
    quiz: {
      question: '¿Cuántas cartas comunitarias se revelan en el Flop?',
      options: ['1 carta', '2 cartas', '3 cartas', '4 cartas'],
      correctOptionIndex: 2,
      explanation: '¡Así es! El Flop siempre consta de exactamente 3 cartas comunitarias simultáneas.',
    },
  },
  {
    id: '6',
    title: 'Fase 3: El Turn',
    category: 'Rondas',
    readTime: '2 min',
    summary: 'La cuarta carta comunitaria, también conocida como "Fourth Street".',
    body: [
      'Tras completarse las apuestas del Flop, se reparte una única carta adicional: el "Turn".',
      'Ahora hay 4 cartas comunitarias visibles en la mesa.',
      'Esta carta puede completar proyectos de escalera, color o darle trío a tu pareja.',
    ],
    quiz: {
      question: '¿Cuántas cartas comunitarias hay en total en la mesa cuando se reparte el Turn?',
      options: ['4 cartas', '3 cartas', '5 cartas', '2 cartas'],
      correctOptionIndex: 0,
      explanation: '¡Correcto! 3 cartas del Flop + 1 del Turn = 4 cartas comunitarias.',
    },
  },
  {
    id: '7',
    title: 'Fase 4: El River',
    category: 'Rondas',
    readTime: '2 min',
    summary: 'La quinta y última carta comunitaria en la mesa.',
    body: [
      'El "River" es la última carta que se reparte. Ya no habrá más cartas nuevas en esta mano.',
      'Ahora están visibles las 5 cartas comunitarias completas.',
      'Se realiza la ronda final de apuestas antes de llegar al Showdown.',
    ],
    quiz: {
      question: '¿Habrá más cartas comunitarias después del River?',
      options: ['Sí, una sexta carta de desempate', 'No, el River es la última carta comunitaria', 'Depende de cuántos jugadores queden'],
      correctOptionIndex: 1,
      explanation: '¡Exacto! El River es la quinta y última carta comunitaria del juego.',
    },
  },
  {
    id: '8',
    title: 'Acción: Pasar (Check)',
    category: 'Acciones',
    readTime: '2 min',
    summary: 'Ceder el turno al siguiente jugador sin apostar fichas adicionales.',
    body: [
      'Hacer "Check" significa pasar la acción al siguiente jugador sin colocar fichas en el bote.',
      'Solo puedes hacer Check si NADIE ha realizado una apuesta antes que tú en esa ronda.',
      'Si un jugador anterior ya apostó, no puedes hacer Check: debes hacer Call (igualar), Raise (subir) o Fold (retirarte).',
    ],
    quiz: {
      question: 'Un rival apuesta 50 fichas antes de tu turno. ¿Puedes hacer Check?',
      options: [
        'Sí, siempre se puede pasar gratis.',
        'No, porque hay una apuesta pendiente de 50 fichas.',
        'Solo si tengo pareja.',
      ],
      correctOptionIndex: 1,
      explanation: '¡Muy bien! Ante una apuesta rival, tus únicas opciones son pagar (Call), subir (Raise) o retirarte (Fold).',
    },
  },
  {
    id: '9',
    title: 'Acción: Apostar (Bet)',
    category: 'Acciones',
    readTime: '2 min',
    summary: 'Ser el primero en poner fichas en juego durante una ronda.',
    body: [
      'Hacer "Bet" consiste en ser el primer jugador en colocar fichas en el bote durante una ronda postflop.',
      'Obliga a todos los jugadores posteriores a pagar al menos esa cantidad si quieren seguir en la mano.',
      'La apuesta mínima en No-Limit Hold\'em suele ser igual a una ciega grande.',
    ],
    quiz: {
      question: '¿Cuándo se llama "Bet" a una apuesta?',
      options: [
        'Cuando eres el primero en apostar en esa ronda.',
        'Cuando subes una apuesta previa de otro jugador.',
        'Cuando te retiras.',
      ],
      correctOptionIndex: 0,
      explanation: '¡Correcto! Bet es la primera apuesta de la ronda. Si alguien ya apostó, subir se llama Raise.',
    },
  },
  {
    id: '10',
    title: 'Acción: Igualar (Call)',
    category: 'Acciones',
    readTime: '2 min',
    summary: 'Pagar la apuesta actual para continuar en la mano.',
    body: [
      'Hacer "Call" significa colocar en el bote exactamente la cantidad necesaria para igualar la apuesta más alta en curso.',
      'Te permite seguir compitiendo por el bote sin encarecer la mano para los demás.',
    ],
    quiz: {
      question: 'El jugador A apuesta 30 fichas. Si quieres continuar sin subir, ¿qué acción eliges?',
      options: ['Call por 30 fichas', 'Check', 'Fold', 'All-in obligatorio'],
      correctOptionIndex: 0,
      explanation: '¡Excelente! Call iguala la apuesta en curso de 30 fichas.',
    },
  },
  {
    id: '11',
    title: 'Acción: Subir (Raise)',
    category: 'Acciones',
    readTime: '2 min',
    summary: 'Aumentar el tamaño de la apuesta en curso, exigiendo más fichas a los rivales.',
    body: [
      'Hacer "Raise" no solo iguala la apuesta anterior, sino que añade más fichas al bote.',
      'Obliga a todos los demás jugadores a pagar la nueva cantidad aumentada o retirarse.',
      'Es la herramienta clave para presionar con manos fuertes o para farolear.',
    ],
    quiz: {
      question: 'Si un rival apuesta 20 fichas y tú haces Raise a 60, ¿cuántas fichas deben poner los demás para seguir?',
      options: ['20 fichas', '60 fichas en total', '80 fichas', '40 fichas'],
      correctOptionIndex: 1,
      explanation: '¡Correcto! Los demás deberán igualar el nuevo total de 60 fichas o subir.',
    },
  },
  {
    id: '12',
    title: 'Acción: Retirarse (Fold)',
    category: 'Acciones',
    readTime: '1 min',
    summary: 'Abandonar tus cartas y renunciar a las fichas ya apostadas en esta mano.',
    body: [
      'Hacer "Fold" significa devolver tus cartas boca abajo y salir de la mano actual.',
      'No tendrás que poner más fichas, pero perderás cualquier ficha que ya hayas puesto en el bote.',
      'Saber retirarse a tiempo es una de las virtudes más importantes de los mejores jugadores de póker.',
    ],
    quiz: {
      question: 'Si haces Fold, ¿recuperas las fichas que habías apostado anteriormente?',
      options: ['No, las fichas se quedan en el bote para el ganador', 'Sí, se te devuelven inmediatamente', 'La mitad'],
      correctOptionIndex: 0,
      explanation: '¡Exacto! Al retirarte renuncias a las fichas puestas en el bote a cambio de no arriesgar más.',
    },
  },
  {
    id: '13',
    title: 'Acción: Todo dentro (All-in)',
    category: 'Acciones',
    readTime: '2 min',
    summary: 'Apostar todas las fichas restantes de tu pila (stack).',
    body: [
      'Un jugador va "All-in" cuando apuesta la totalidad de sus fichas restantes.',
      'Un jugador que está All-in no puede ser forzado a retirarse por falta de fichas: llegará al Showdown sin tener que pagar más apuestas en calles posteriores.',
      'Si otros jugadores apuestan más fichas, se genera un "Bote Lateral" (Side Pot) del que el jugador All-in no puede participar.',
    ],
    quiz: {
      question: 'Si tienes 100 fichas y tu rival apuesta 500, ¿puedes ir All-in con tus 100 fichas?',
      options: [
        'Sí, y puedes disputar el bote principal correspondiente a tus 100 fichas.',
        'No, debes tener exactamente 500 fichas.',
        'No, te expulsan de la partida.',
      ],
      correctOptionIndex: 0,
      explanation: '¡Muy bien! Puedes ir All-in con tus 100 fichas y competirás por el bote principal equivalente a tu apuesta.',
    },
  },
  {
    id: '14',
    title: 'El Bote (Pot) y fichas',
    category: 'Estructura',
    readTime: '2 min',
    summary: 'El tesoro en disputa acumulado por todas las apuestas de los jugadores.',
    body: [
      'El Bote (Pot) es la suma total de fichas que los jugadores han ido apostando a lo largo de las calles.',
      'Al final de la mano, el bote completo se entrega al ganador (o se reparte equitativamente en caso de empate exacto).',
      'En Texas Hold\'em es vital calcular las "Pot Odds" (la relación entre lo que debes pagar y lo que hay en el bote).',
    ],
    quiz: {
      question: 'El bote tiene 100 fichas y te cuesta 20 fichas pagar. ¿Cuál es el tamaño total del bote si pagas?',
      options: ['120 fichas', '100 fichas', '200 fichas', '80 fichas'],
      correctOptionIndex: 0,
      explanation: '¡Correcto! 100 del bote + tus 20 de call = 120 fichas totales.',
    },
  },
  {
    id: '15',
    title: 'Las Ciegas (Small & Big Blind)',
    category: 'Estructura',
    readTime: '2 min',
    summary: 'Apuestas obligatorias antes de ver las cartas para incentivar la acción.',
    body: [
      'Sin apuestas obligatorias, los jugadores simplemente esperarían a tener la mejor mano sin arriesgar nada.',
      'La Ciega Pequeña (Small Blind) y la Ciega Grande (Big Blind) las ponen por turno los dos jugadores a la izquierda del repartidor.',
      'Normalmente la Ciega Grande es el doble de la Ciega Pequeña (por ejemplo, 10 / 20).',
    ],
    quiz: {
      question: '¿Por qué existen las ciegas en el póker?',
      options: [
        'Para asegurar que siempre haya fichas en el bote e incentivar la competencia en cada mano.',
        'Por simple tradición sin utilidad práctica.',
        'Para beneficiar siempre al crupier.',
      ],
      correctOptionIndex: 0,
      explanation: '¡Excelente! Las ciegas evitan que los jugadores se queden pasivos esperando Ases gratis.',
    },
  },
  {
    id: '16',
    title: 'Cómo se determina el ganador',
    category: 'Reglas',
    readTime: '2 min',
    summary: 'La regla dorada: exactamente las mejores 5 cartas de las 7 disponibles.',
    body: [
      'Al llegar al Showdown, cada jugador forma la mejor mano posible eligiendo 5 cartas entre sus 2 privadas y las 5 comunitarias.',
      'Las 2 cartas sobrantes no cuentan para nada.',
      'Si dos jugadores tienen la misma combinación (ej. Pareja de Ases), se comparan las cartas de desempate llamadas "Kickers".',
    ],
    visualCards: [
      {
        label: 'Ejemplo de desempate por Kicker:',
        cards: [{ rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'diamonds' }],
      },
    ],
    quiz: {
      question: 'Hero tiene A♠ K♠. Rival tiene A♦ Q♣. La mesa es A♥ 7♣ 2♦ 10♠ 3♥. Ambos tienen Pareja de Ases. ¿Quién gana?',
      options: [
        'Hero, porque su Kicker Rey (K) es superior a la Dama (Q) del rival.',
        'El rival, porque tiene tréboles.',
        'Empate porque ambos tienen pareja de Ases.',
      ],
      correctOptionIndex: 0,
      explanation: '¡Exacto! Ambos tienen pareja de Ases, pero la quinta mejor carta de Hero es un K, mientras que la del rival es una Q.',
    },
  },
  {
    id: '17',
    title: 'Ranking de manos oficial',
    category: 'Reglas',
    readTime: '3 min',
    summary: 'La jerarquía universal de combinaciones en Texas Hold\'em de mayor a menor valor.',
    body: [
      '1. Escalera Real (A-K-Q-J-10 del mismo palo)',
      '2. Escalera de Color (5 consecutivas del mismo palo)',
      '3. Póker (4 cartas de igual valor)',
      '4. Full House (Un trío y una pareja)',
      '5. Color (5 cartas del mismo palo no consecutivas)',
      '6. Escalera (5 cartas consecutivas de palos distintos)',
      '7. Trío (3 cartas de igual valor)',
      '8. Doble Pareja (2 parejas distintas)',
      '9. Pareja (2 cartas iguales)',
      '10. Carta Alta (Gana la carta de mayor valor)',
    ],
    quiz: {
      question: '¿Qué combinación es superior: Color o Escalera?',
      options: ['Color supera a Escalera', 'Escalera supera a Color', 'Tienen el mismo valor'],
      correctOptionIndex: 0,
      explanation: '¡Así es! En Texas Hold\'em, el Color (5 cartas del mismo palo) siempre supera a la Escalera (5 cartas consecutivas).',
    },
  },
];
