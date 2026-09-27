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
// 3. SERVER-AUTHORITATIVE MULTIPLAYER ROOMS & REALTIME SSE
// ----------------------------------------------------
interface ConnectedClient {
  playerId: string;
  res: express.Response;
}

interface MultiplayerRoom {
  code: string;
  hostId: string;
  players: { id: string; name: string; avatar: string; joinedAt: number }[];
  engine: TexasHoldemEngine | null;
  createdAt: number;
  lastActivity: number;
  clients: Set<ConnectedClient>;
}

const rooms = new Map<string, MultiplayerRoom>();

// Clean up dead rooms every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActivity > 2 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 30 * 60 * 1000);

function getSanitizedRoomState(room: MultiplayerRoom, playerId?: string) {
  if (!room.engine) {
    return {
      status: 'lobby',
      code: room.code,
      hostId: room.hostId,
      players: room.players,
      createdAt: room.createdAt,
    };
  }

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

  const legalActions = playerId ? room.engine.getLegalActions(playerId) : null;

  return {
    status: 'in_game',
    code: room.code,
    hostId: room.hostId,
    state: {
      ...rawState,
      players: sanitizedPlayers,
    },
    legalActions,
  };
}

function broadcastRoom(code: string) {
  const room = rooms.get(code);
  if (!room) return;
  room.lastActivity = Date.now();

  for (const client of Array.from(room.clients)) {
    try {
      const payload = getSanitizedRoomState(room, client.playerId);
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      room.clients.delete(client);
    }
  }
}

// Create a new multiplayer room
app.post('/api/multiplayer/create', (req, res) => {
  const { hostId, hostName, avatar } = req.body;
  const code = 'PK-' + Math.floor(1000 + Math.random() * 9000);

  const finalHostId = hostId || 'host_' + Math.random().toString(36).substring(2, 9);
  const room: MultiplayerRoom = {
    code,
    hostId: finalHostId,
    players: [
      {
        id: finalHostId,
        name: hostName || 'Anfitrión',
        avatar: avatar || '👑',
        joinedAt: Date.now(),
      },
    ],
    engine: null,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    clients: new Set(),
  };

  rooms.set(code, room);
  res.json({ code, hostId: finalHostId, room: getSanitizedRoomState(room, finalHostId) });
});

// Join an existing multiplayer room
app.post('/api/multiplayer/join', (req, res) => {
  const { code, playerId, playerName, avatar } = req.body;
  if (!code) return res.status(400).json({ error: 'Falta el código de sala.' });

  const upperCode = code.trim().toUpperCase();
  const room = rooms.get(upperCode);
  if (!room) {
    return res.status(404).json({ error: 'La sala especificada no existe. Verifica el código.' });
  }

  if (room.engine && !room.players.some((p) => p.id === playerId)) {
    return res.status(400).json({ error: 'La partida ya comenzó. No puedes unirte a una partida en curso.' });
  }

  if (room.players.length >= 8 && !room.players.some((p) => p.id === playerId)) {
    return res.status(400).json({ error: 'La sala está completa (máximo 8 jugadores).' });
  }

  const existingPlayer = room.players.find((p) => p.id === playerId);
  if (!existingPlayer) {
    room.players.push({
      id: playerId || 'player_' + Date.now(),
      name: playerName || 'Jugador ' + (room.players.length + 1),
      avatar: avatar || '🤠',
      joinedAt: Date.now(),
    });
  } else if (playerName) {
    existingPlayer.name = playerName;
    if (avatar) existingPlayer.avatar = avatar;
  }

  room.lastActivity = Date.now();
  broadcastRoom(upperCode);

  res.json({
    success: true,
    code: upperCode,
    room: getSanitizedRoomState(room, playerId),
  });
});

// Real-time Server-Sent Events (SSE) Stream
app.get('/api/multiplayer/stream/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const playerId = (req.query.playerId as string) || '';
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Sala no encontrada.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const client: ConnectedClient = { playerId, res };
  room.clients.add(client);
  room.lastActivity = Date.now();

  // Send initial state immediately
  const initialPayload = getSanitizedRoomState(room, playerId);
  res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);

  // Keep alive comment every 15s
  const keepAlive = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(keepAlive);
      room.clients.delete(client);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    room.clients.delete(client);
  });
});

// Polling fallback state endpoint
app.get('/api/multiplayer/state/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const playerId = req.query.playerId as string;
  const room = rooms.get(code);
  if (!room) return res.status(404).json({ error: 'Sala no encontrada.' });

  res.json(getSanitizedRoomState(room, playerId));
});

// Start the game in room (host only)
app.post('/api/multiplayer/start', (req, res) => {
  const { code, hostId, startingChips = 1000, smallBlind = 10 } = req.body;
  const upperCode = (code || '').trim().toUpperCase();
  const room = rooms.get(upperCode);
  if (!room) return res.status(404).json({ error: 'Sala no encontrada.' });

  if (room.hostId !== hostId) {
    return res.status(403).json({ error: 'Solo el anfitrión puede iniciar la partida.' });
  }

  if (room.players.length < 2) {
    return res.status(400).json({ error: 'Se necesitan al menos 2 jugadores para jugar.' });
  }

  const settings: GameSettings = {
    startingChips: Number(startingChips) || 1000,
    smallBlind: Number(smallBlind) || 10,
    bigBlind: (Number(smallBlind) || 10) * 2,
    playerCount: room.players.length,
    difficulty: 'intermediate',
  };

  room.engine = new TexasHoldemEngine(
    settings,
    room.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isBot: false,
    }))
  );

  room.engine.startNewHand();
  broadcastRoom(upperCode);

  res.json({ success: true, state: getSanitizedRoomState(room, hostId) });
});

// Submit a player action (fold, check, call, bet, raise, all-in)
app.post('/api/multiplayer/action', (req, res) => {
  const { code, playerId, action, amount } = req.body;
  const upperCode = (code || '').trim().toUpperCase();
  const room = rooms.get(upperCode);
  if (!room || !room.engine) {
    return res.status(404).json({ error: 'Partida no encontrada o aún no ha comenzado.' });
  }

  try {
    room.engine.executeAction(playerId, action as PlayerActionType, amount ? Number(amount) : undefined);
    broadcastRoom(upperCode);
    res.json({ success: true, state: getSanitizedRoomState(room, playerId) });
  } catch (err: any) {
    console.error('Multiplayer action error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Deal next hand
app.post('/api/multiplayer/next-hand', (req, res) => {
  const { code, playerId } = req.body;
  const upperCode = (code || '').trim().toUpperCase();
  const room = rooms.get(upperCode);
  if (!room || !room.engine) {
    return res.status(404).json({ error: 'Partida no encontrada.' });
  }

  try {
    // Check if at least 2 players have chips
    const playersWithChips = room.engine.state.players.filter((p) => p.chips > 0);
    if (playersWithChips.length < 2) {
      // Reload busted players with chips so fun doesn't end
      for (const p of room.engine.state.players) {
        if (p.chips <= 0) {
          p.chips = room.engine.state.settings.startingChips;
        }
      }
    }

    room.engine.startNewHand();
    broadcastRoom(upperCode);
    res.json({ success: true, state: getSanitizedRoomState(room, playerId) });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Rebuy / Reload chips when busted
app.post('/api/multiplayer/rebuy', (req, res) => {
  const { code, playerId } = req.body;
  const upperCode = (code || '').trim().toUpperCase();
  const room = rooms.get(upperCode);
  if (!room || !room.engine) return res.status(404).json({ error: 'Partida no encontrada.' });

  const target = room.engine.state.players.find((p) => p.id === playerId);
  if (target && target.chips <= 0) {
    target.chips = room.engine.state.settings.startingChips;
    target.folded = false;
    room.engine.state.historyLog.push(`🔄 ${target.name} recargó fichas para continuar jugando.`);
    broadcastRoom(upperCode);
  }

  res.json({ success: true, state: getSanitizedRoomState(room, playerId) });
});

// Leave room
app.post('/api/multiplayer/leave', (req, res) => {
  const { code, playerId } = req.body;
  const upperCode = (code || '').trim().toUpperCase();
  const room = rooms.get(upperCode);
  if (!room) return res.json({ success: true });

  room.players = room.players.filter((p) => p.id !== playerId);
  if (room.players.length === 0) {
    rooms.delete(upperCode);
  } else {
    if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
    }
    broadcastRoom(upperCode);
  }

  res.json({ success: true });
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
