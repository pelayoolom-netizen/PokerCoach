import React, { useState } from 'react';
import { BrainCircuit, Camera, Sparkles, RefreshCw, AlertCircle, Plus, X, CheckCircle2, Upload } from 'lucide-react';
import { Card, Rank, Suit } from '../../types/poker';
import { determineShowdownWinners, evaluateBestHand } from '../../game-engine/evaluator';
import { CardView } from '../common/CardView';
import { ALL_RANKS, ALL_SUITS } from '../../game-engine/deck';
import { sound } from '../../lib/sound';

export const AnalyzerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manual' | 'photo'>('manual');

  // Manual Cards State
  const [heroCards, setHeroCards] = useState<Card[]>([
    { rank: 'A', suit: 'spades' },
    { rank: 'K', suit: 'spades' },
  ]);

  const [boardCards, setBoardCards] = useState<Card[]>([
    { rank: 'A', suit: 'hearts' },
    { rank: '7', suit: 'clubs' },
    { rank: '2', suit: 'diamonds' },
    { rank: '10', suit: 'spades' },
    { rank: '3', suit: 'hearts' },
  ]);

  const [villainCards, setVillainCards] = useState<Card[]>([
    { rank: 'A', suit: 'diamonds' },
    { rank: 'Q', suit: 'clubs' },
  ]);

  // Card Picker Modal State
  const [pickerTarget, setPickerTarget] = useState<{
    type: 'hero' | 'board' | 'villain';
    index?: number;
  } | null>(null);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uncertainCardsNotice, setUncertainCardsNotice] = useState<string[]>([]);

  // Collect all currently chosen cards to disable duplicates
  const allChosenCards = [...heroCards, ...boardCards, ...villainCards];

  const isCardChosen = (rank: Rank, suit: Suit): boolean => {
    return allChosenCards.some((c) => c.rank === rank && c.suit === suit);
  };

  const handleSelectCard = (rank: Rank, suit: Suit) => {
    if (!pickerTarget) return;
    const newCard: Card = { rank, suit };
    sound.playCard();

    if (pickerTarget.type === 'hero') {
      const updated = [...heroCards];
      if (pickerTarget.index !== undefined && pickerTarget.index < updated.length) {
        updated[pickerTarget.index] = newCard;
      } else if (updated.length < 2) {
        updated.push(newCard);
      }
      setHeroCards(updated);
    } else if (pickerTarget.type === 'board') {
      const updated = [...boardCards];
      if (pickerTarget.index !== undefined && pickerTarget.index < updated.length) {
        updated[pickerTarget.index] = newCard;
      } else if (updated.length < 5) {
        updated.push(newCard);
      }
      setBoardCards(updated);
    } else if (pickerTarget.type === 'villain') {
      const updated = [...villainCards];
      if (pickerTarget.index !== undefined && pickerTarget.index < updated.length) {
        updated[pickerTarget.index] = newCard;
      } else if (updated.length < 2) {
        updated.push(newCard);
      }
      setVillainCards(updated);
    }

    setPickerTarget(null);
  };

  // Run Deterministic Evaluation
  let evaluationResult: any = null;
  let canEvaluate = heroCards.length === 2 && villainCards.length === 2 && boardCards.length >= 3;

  if (canEvaluate) {
    try {
      evaluationResult = determineShowdownWinners(
        [
          { id: 'hero', cards: heroCards },
          { id: 'villain', cards: villainCards },
        ],
        boardCards
      );
    } catch (e: any) {
      console.error(e);
    }
  }

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setUncertainCardsNotice([]);
    setIsAnalyzingPhoto(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);

      try {
        const res = await fetch('/api/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        const data = await res.json();
        if (data.heroCards && data.heroCards.length > 0) {
          setHeroCards(data.heroCards.slice(0, 2));
        }
        if (data.boardCards && data.boardCards.length > 0) {
          setBoardCards(data.boardCards.slice(0, 5));
        }
        if (data.villainCards && data.villainCards.length > 0) {
          setVillainCards(data.villainCards.slice(0, 2));
        }
        if (data.uncertainCards && data.uncertainCards.length > 0) {
          setUncertainCardsNotice(data.uncertainCards);
        }
        sound.playWin();
      } catch (err: any) {
        setPhotoError(err.message || 'Error al comunicarse con el modelo de visión.');
      } finally {
        setIsAnalyzingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Calculadora & Showdown</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
            Analizador de Manos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Cálculo determinista de ganador, combinaciones y desempates por kicker.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Entrada Manual</span>
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'photo'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto con IA</span>
          </button>
        </div>
      </div>

      {activeTab === 'manual' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* HERO (Tus Cartas) */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Hero (Tus Cartas)
                </span>
                <span className="text-[11px] text-zinc-500">2 cartas</span>
              </div>

              <div className="flex items-center gap-2">
                {heroCards.map((c, i) => (
                  <div key={i} className="relative group">
                    <CardView
                      card={c}
                      size="lg"
                      onClick={() => setPickerTarget({ type: 'hero', index: i })}
                    />
                    <span className="text-[10px] text-zinc-500 block text-center mt-1">Clic cambiar</span>
                  </div>
                ))}
                {heroCards.length < 2 && (
                  <button
                    onClick={() => setPickerTarget({ type: 'hero' })}
                    className="w-20 h-28 rounded-lg border-2 border-dashed border-zinc-700 hover:border-emerald-500 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Añadir</span>
                  </button>
                )}
              </div>
            </div>

            {/* COMMUNITY BOARD */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Mesa (Board Comunitario)
                </span>
                <span className="text-[11px] text-zinc-500">{boardCards.length}/5 cartas</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {boardCards.map((c, i) => (
                  <div key={i} className="relative group">
                    <CardView
                      card={c}
                      size="md"
                      onClick={() => setPickerTarget({ type: 'board', index: i })}
                    />
                  </div>
                ))}
                {boardCards.length < 5 && (
                  <button
                    onClick={() => setPickerTarget({ type: 'board' })}
                    className="w-14 h-20 rounded-md border-2 border-dashed border-zinc-700 hover:border-emerald-500 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[9px] font-bold">Carta</span>
                  </button>
                )}
              </div>
            </div>

            {/* VILLAIN (Rival) */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Villain (Rival)
                </span>
                <span className="text-[11px] text-zinc-500">2 cartas</span>
              </div>

              <div className="flex items-center gap-2">
                {villainCards.map((c, i) => (
                  <div key={i} className="relative group">
                    <CardView
                      card={c}
                      size="lg"
                      onClick={() => setPickerTarget({ type: 'villain', index: i })}
                    />
                    <span className="text-[10px] text-zinc-500 block text-center mt-1">Clic cambiar</span>
                  </div>
                ))}
                {villainCards.length < 2 && (
                  <button
                    onClick={() => setPickerTarget({ type: 'villain' })}
                    className="w-20 h-28 rounded-lg border-2 border-dashed border-zinc-700 hover:border-rose-500 flex flex-col items-center justify-center text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Añadir</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* EVALUATION RESULTS CARD */}
          {evaluationResult && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-zinc-900 to-zinc-950 border border-emerald-700/60 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Resultado del Showdown (Motor Determinista)</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <h3 className="text-2xl font-black text-zinc-100">
                  {evaluationResult.isTie
                    ? '🤝 ¡Empate entre ambos jugadores (Split Pot)!'
                    : evaluationResult.winnerIds[0] === 'hero'
                    ? '🏆 ¡Gana Hero (Tú)!'
                    : '🔴 Gana Villain (Rival)'}
                </h3>
              </div>

              <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                {evaluationResult.explanation}
              </p>

              {/* Hand Detail Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-emerald-900/40">
                  <span className="text-xs font-bold text-emerald-400 block mb-1">Mano de Hero:</span>
                  <div className="text-sm font-semibold text-zinc-200 mb-2">
                    {evaluationResult.evaluations.get('hero')?.description}
                  </div>
                  <div className="flex gap-1.5">
                    {evaluationResult.evaluations.get('hero')?.cards.map((c: Card, idx: number) => (
                      <CardView key={idx} card={c} size="xs" highlighted={evaluationResult.winnerIds.includes('hero')} />
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/80 border border-rose-900/40">
                  <span className="text-xs font-bold text-rose-400 block mb-1">Mano de Villain:</span>
                  <div className="text-sm font-semibold text-zinc-200 mb-2">
                    {evaluationResult.evaluations.get('villain')?.description}
                  </div>
                  <div className="flex gap-1.5">
                    {evaluationResult.evaluations.get('villain')?.cards.map((c: Card, idx: number) => (
                      <CardView key={idx} card={c} size="xs" highlighted={evaluationResult.winnerIds.includes('villain')} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PHOTO ANALYZER TAB */
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-800/60 text-amber-400 flex items-center justify-center mx-auto text-2xl">
              <Camera className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Analizador mediante Fotografía</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
              Haz una foto a tus cartas o a la mesa de póker. La IA identificará las cartas y luego el motor matemático determinista resolverá el ganador.
            </p>

            <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white cursor-pointer shadow-lg transition-transform hover:scale-105 active:scale-95">
              <Upload className="w-4 h-4" />
              <span>Subir Fotografía</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {isAnalyzingPhoto && (
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold animate-pulse pt-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analizando fotografía con modelo de visión...</span>
              </div>
            )}

            {photoError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {photoError}
              </div>
            )}
          </div>

          {/* Uncertain Cards Feedback (as requested in spec: "No estoy seguro de esta carta. ¿Es 8♠ o 8♥?") */}
          {uncertainCardsNotice.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-700/80 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Confirmación de Cartas Dudosas</span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {uncertainCardsNotice.map((notice, idx) => (
                  <li key={idx}>{notice}</li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-300/80">
                Puedes tocar las cartas arriba para corregirlas manualmente antes de calcular el ganador.
              </p>
            </div>
          )}

          {/* Live Preview of detected cards */}
          {canEvaluate && (
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-zinc-300 block">
                Cartas Detectadas y Evaluadas:
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Hero:</span>
                  <div className="flex gap-1">
                    {heroCards.map((c, i) => <CardView key={i} card={c} size="xs" />)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Board:</span>
                  <div className="flex gap-1">
                    {boardCards.map((c, i) => <CardView key={i} card={c} size="xs" />)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Villain:</span>
                  <div className="flex gap-1">
                    {villainCards.map((c, i) => <CardView key={i} card={c} size="xs" />)}
                  </div>
                </div>
              </div>

              {evaluationResult && (
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-xs text-emerald-400 font-semibold">
                    {evaluationResult.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 52-CARD PICKER MODAL */}
      {pickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-base text-zinc-100">
                  Selecciona una carta ({pickerTarget.type.toUpperCase()})
                </h3>
                <p className="text-xs text-zinc-400">
                  Las cartas ya elegidas en la mano aparecen deshabilitadas.
                </p>
              </div>
              <button
                onClick={() => setPickerTarget(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suit-by-Suit Matrix of 52 Cards */}
            <div className="space-y-3">
              {ALL_SUITS.map((suit) => (
                <div key={suit} className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-6 text-sm font-bold text-zinc-400 text-center">
                    {suit === 'spades' ? '♠' : suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : '♣'}
                  </span>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 flex-1">
                    {ALL_RANKS.map((rank) => {
                      const disabled = isCardChosen(rank, suit);
                      return (
                        <button
                          key={rank + suit}
                          disabled={disabled}
                          onClick={() => handleSelectCard(rank, suit)}
                          className={`w-8 sm:w-9 h-11 rounded-lg border text-xs font-bold transition-transform active:scale-95 flex flex-col items-center justify-center ${
                            disabled
                              ? 'opacity-20 cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-600'
                              : suit === 'hearts' || suit === 'diamonds'
                              ? 'bg-white border-zinc-300 text-red-600 hover:scale-110 shadow-sm'
                              : 'bg-white border-zinc-300 text-zinc-950 hover:scale-110 shadow-sm'
                          }`}
                        >
                          <span className="leading-none text-[11px]">{rank}</span>
                          <span className="leading-none text-[9px]">
                            {suit === 'spades' ? '♠' : suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : '♣'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
