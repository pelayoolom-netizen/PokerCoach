import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Bot, User, RefreshCw, AlertCircle } from 'lucide-react';
import { sound } from '../../lib/sound';

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: number;
}

export const AICoachView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: '¡Hola! Soy tu entrenador de Texas Hold\'em en PokerCoach. Pregúntame lo que necesites: reglas básicas, jerarquía de manos, cuándo hacer fold, o cómo interpretar situaciones en la mesa.',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    '¿Qué diferencia hay entre call y raise?',
    '¿Qué es un Full House y qué manos le ganan?',
    '¿Qué significa tener posición en la mesa?',
    '¿Cómo se decide el desempate cuando ambos tienen la misma pareja?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputText;
    if (!q.trim() || isLoading) return;

    sound.playCard();
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: q.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al comunicarse con el entrenador.');
      }

      sound.playChip();
      setMessages((prev) => [
        ...prev,
        {
          id: 'coach_' + Date.now(),
          sender: 'coach',
          text: data.reply || 'Aquí tienes la explicación sobre esa regla.',
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      console.warn('Backend chat fallback:', err);
      // High quality educational fallback for common queries if API key is not yet set
      let fallback = 'En Texas Hold\'em, el juego se basa en combinar tus 2 cartas privadas con las 5 comunitarias para formar la mejor combinación de 5 cartas. Las acciones principales son pasar (check), apostar (bet), igualar (call), subir (raise) y retirarse (fold).';
      if (q.toLowerCase().includes('call') && q.toLowerCase().includes('raise')) {
        fallback = '**Call (Igualar):** Pagas la apuesta que ha hecho el jugador anterior para continuar en la mano sin encarecerla.\n\n**Raise (Subir):** Aumentas el tamaño de la apuesta, obligando a los siguientes jugadores a poner más fichas si quieren seguir o retirarse.';
      } else if (q.toLowerCase().includes('full')) {
        fallback = 'Un **Full House** está compuesto por un trío y una pareja (ej: K-K-K-8-8). Solamente lo superan el Póker (4 de un mismo valor), la Escalera de Color y la Escalera Real. El Full House supera al Color y a la Escalera.';
      } else if (q.toLowerCase().includes('posición')) {
        fallback = '**Tener posición** (especialmente en el botón BTN o Cutoff) significa actuar el último en cada ronda postflop. Te otorga una ventaja inmensa porque ves qué hacen todos los rivales antes de arriesgar tus fichas.';
      } else if (q.toLowerCase().includes('desempate') || q.toLowerCase().includes('kicker')) {
        fallback = 'Cuando dos jugadores tienen la misma jugada (ej. ambos tienen Pareja de Ases), se comparan las cartas restantes de su mano de 5 cartas en orden descendente. Estas cartas se llaman **Kickers**. Quien tenga el kicker más alto gana el bote entero.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'coach_' + Date.now(),
          sender: 'coach',
          text: fallback,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>Tutor Personal de Texas Hold'em</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
          Pregunta al Entrenador
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          Resuelve cualquier duda sobre reglas, situaciones, jerarquías de manos o táctica básica.
        </p>
      </div>

      {/* Main Chat Window */}
      <div className="max-w-3xl mx-auto rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[580px]">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'coach' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center flex-shrink-0 text-emerald-300 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-zinc-950/90 border border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <span className="text-[9px] opacity-40 block text-right mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-zinc-300 shadow-md">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-emerald-400 font-semibold animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-300">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span>El entrenador está analizando tu consulta...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Prompts */}
        <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-950/60 flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(q)}
              className="text-[11px] px-3 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700/60 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Text Input Form */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              disabled={isLoading}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Haz una pregunta al entrenador sobre Texas Hold'em..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
