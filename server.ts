import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { TexasHoldemEngine } from './src/game-engine/game';
import { GameSettings, PlayerActionType } from './src/types/poker';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini AI client initialized server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ----------------------------------------------------
// 1. AI COACH CHAT ENDPOINT
// ----------------------------------------------------
app.post('/api/coach-chat', async (req, res) => {
  try {
    const { question, history } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'La pregunta es obligatoria.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback if API key is not yet set by user
      return res.json({
        reply: `[Modo Asistente Offline] Para Texas Hold'em: ${question}. Asegúrate de configurar GEMINI_API_KEY para respuestas generativas en tiempo real.`,
      });
    }

    const systemInstruction = `
Eres PokerCoach, un profesor amigable, pedagógico y muy claro especializado en enseñar póker Texas Hold'em a principiantes.
Reglas clave para tus respuestas:
1. Sé conciso, claro y directo. Evita jerga incomprensible sin antes explicarla.
2. Usa ejemplos visuales de cartas cuando sea oportuno (ej: A♠ K♥).
3. Nunca inventes reglas: en Texas Hold'em la mejor mano se forma estrictamente con 5 cartas de las 7 disponibles.
4. Explica siempre la diferencia entre pasar (check), igualar (call), apostar (bet), subir (raise) y retirarse (fold).
5. Mantén un tono motivador y formativo. Recuerda al usuario que se juega sin dinero real.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text || 'No pude procesar la respuesta en este momento.' });
  } catch (error: any) {
    console.error('Error in /api/coach-chat:', error);
    return res.status(500).json({
      error: 'Error al contactar con el entrenador de IA.',
      details: error.message,
    });
  }
});

// ----------------------------------------------------
// 2. PHOTO ANALYZER VISION ENDPOINT
// ----------------------------------------------------
app.post('/api/analyze-photo', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Falta la imagen codificada en base64.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        heroCards: [{ rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'spades' }],
        boardCards: [{ rank: 'A', suit: 'hearts' }, { rank: '7', suit: 'clubs' }, { rank: '2', suit: 'diamonds' }],
        villainCards: [{ rank: 'A', suit: 'diamonds' }, { rank: 'Q', suit: 'clubs' }],
        uncertainCards: [],
        note: 'Detección simulada (Configura GEMINI_API_KEY para visión en vivo).',
      });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `
Analiza esta fotografía de cartas de póker Texas Hold'em.
Identifica con exactitud:
1. "heroCards": Las cartas del jugador principal (máximo 2 cartas).
2. "boardCards": Las cartas comunitarias en la mesa (3, 4 o 5 cartas).
3. "villainCards": Las cartas de algún rival visible (máximo 2 cartas).
4. "uncertainCards": Si alguna carta está borrosa, tapada o dudosa, descríbela (ej: "Duda entre 8♠ y 8♥").
Palos válidos: "spades" (picas ♠), "hearts" (corazones ♥), "diamonds" (diamantes ♦), "clubs" (tréboles ♣).
Valores válidos: "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A".
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            heroCards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.STRING },
                  suit: { type: Type.STRING },
                },
                required: ['rank', 'suit'],
              },
            },
            boardCards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.STRING },
                  suit: { type: Type.STRING },
                },
                required: ['rank', 'suit'],
              },
            },
            villainCards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.STRING },
                  suit: { type: Type.STRING },
                },
                required: ['rank', 'suit'],
              },
            },
            uncertainCards: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['heroCards', 'boardCards', 'uncertainCards'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/analyze-photo:', error);
    return res.status(500).json({
      error: 'Error al interpretar la imagen.',
      details: error.message,
    });
  }
});

// ----------------------------------------------------
// 3. SERVER-AUTHORITATIVE MULTIPLAYER ROOMS
// ----------------------------------------------------
interface MultiplayerRoom {
  code: string;
  hostId: string;
  players: { id: string; name: string; avatar: string }[];
  engine: TexasHoldemEngine | null;
  createdAt: number;
}

const rooms = new Map<string, MultiplayerRoom>();

app.post('/api/multiplayer/create', (req, res) => {
  const { hostId, hostName, avatar } = req.body;
  const code = 'PK-' + Math.floor(1000 + Math.random() * 9000);

  const room: MultiplayerRoom = {
    code,
    hostId: hostId || 'host',
    players: [{ id: hostId || 'host', name: hostName || 'Host', avatar: avatar || '👑' }],
    engine: null,
    createdAt: Date.now(),
  };

  rooms.set(code, room);
  res.json({ code, room });
});

app.post('/api/multiplayer/join', (req, res) => {
  const { code, playerId, playerName, avatar } = req.body;
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'La sala especificada no existe.' });
  }

  if (room.players.length >= 8) {
    return res.status(400).json({ error: 'La sala está completa (máx 8 jugadores).' });
  }

  if (!room.players.some((p) => p.id === playerId)) {
    room.players.push({
      id: playerId || 'player_' + Date.now(),
      name: playerName || 'Jugador ' + (room.players.length + 1),
      avatar: avatar || '🤠',
    });
  }

  res.json({ success: true, room });
});

app.post('/api/multiplayer/start', (req, res) => {
  const { code, hostId } = req.body;
  const room = rooms.get(code);
  if (!room) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (room.hostId !== hostId) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar la partida.' });
  if (room.players.length < 2) return res.status(400).json({ error: 'Se necesitan al menos 2 jugadores.' });

  const settings: GameSettings = {
    startingChips: 1000,
    smallBlind: 10,
    bigBlind: 20,
    playerCount: room.players.length,
    difficulty: 'intermediate',
  };

  room.engine = new TexasHoldemEngine(
    settings,
    room.players.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, isBot: false }))
  );
  room.engine.startNewHand();

  res.json({ success: true, state: room.engine.state });
});

app.get('/api/multiplayer/state/:code', (req, res) => {
  const { code } = req.params;
  const playerId = req.query.playerId as string;
  const room = rooms.get(code);
  if (!room) return res.status(404).json({ error: 'Sala no encontrada.' });

  if (!room.engine) {
    return res.json({ status: 'lobby', players: room.players, code: room.code });
  }

  // Server-authoritative card hiding: mask other players' hole cards unless showdown
  const rawState = room.engine.state;
  const isShowdown = rawState.round === 'showdown' || rawState.round === 'ended';

  const sanitizedPlayers = rawState.players.map((p) => {
    if (p.id === playerId || isShowdown) {
      return p;
    }
    return {
      ...p,
      cards: p.cards.map(() => ({ rank: '?' as any, suit: 'spades' as any })),
    };
  });

  res.json({
    status: 'in_game',
    state: {
      ...rawState,
      players: sanitizedPlayers,
    },
  });
});

app.post('/api/multiplayer/action', (req, res) => {
  const { code, playerId, action, amount } = req.body;
  const room = rooms.get(code);
  if (!room || !room.engine) return res.status(404).json({ error: 'Partida no encontrada.' });

  try {
    room.engine.executeAction(playerId, action as PlayerActionType, amount);
    res.json({ success: true, state: room.engine.state });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// FRONTEND SERVING (Vite in Dev, Dist in Prod)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`♠ PokerCoach server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
