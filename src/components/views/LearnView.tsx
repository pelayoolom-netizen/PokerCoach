import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Award, HelpCircle, Check, X } from 'lucide-react';
import { LESSONS_DATA } from '../../tutorial/lessons';
import { HAND_RANKINGS } from '../../lib/constants';
import { UserProfile } from '../../types/user';
import { CardView } from '../common/CardView';
import { sound } from '../../lib/sound';

interface LearnViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ profile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'rankings'>('lessons');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('1');
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const completed = profile.stats.tutorialCompletedLessons;
  const currentLesson = LESSONS_DATA.find((l) => l.id === selectedLessonId) || LESSONS_DATA[0];

  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(id);
    setSelectedAnswerIndex(null);
    setHasAnswered(false);
  };

  const toggleLessonCompleted = (lessonId: string) => {
    const isDone = completed.includes(lessonId);
    const updatedLessons = isDone
      ? completed.filter((id) => id !== lessonId)
      : [...completed, lessonId];

    if (!isDone) sound.playWin();

    onUpdateProfile({
      ...profile,
      stats: {
        ...profile.stats,
        tutorialCompletedLessons: updatedLessons,
      },
    });
  };

  const handleAnswerQuiz = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswerIndex(index);
    setHasAnswered(true);

    const isCorrect = index === currentLesson.quiz.correctOptionIndex;
    if (isCorrect) {
      sound.playWin();
      // Auto complete lesson if not already completed
      if (!completed.includes(currentLesson.id)) {
        toggleLessonCompleted(currentLesson.id);
      }
    } else {
      sound.playFold();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Módulo de Aprendizaje</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
            Aprende a jugar Texas Hold'em
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            17 lecciones interactivas paso a paso con ejercicios evaluados al instante.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'lessons'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lecciones ({completed.length}/{LESSONS_DATA.length})
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rankings'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Ranking de Manos
          </button>
        </div>
      </div>

      {activeTab === 'lessons' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lessons List Sidebar */}
          <div className="lg:col-span-1 space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {LESSONS_DATA.map((lesson) => {
              const isDone = completed.includes(lesson.id);
              const isSelected = selectedLessonId === lesson.id;

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-100 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {lesson.id}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{lesson.title}</p>
                      <span className="text-[10px] text-zinc-500">{lesson.category} • {lesson.readTime}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLessonCompleted(lesson.id);
                    }}
                    title={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
                    className={`p-1 rounded-md transition-colors ${
                      isDone
                        ? 'text-emerald-400 bg-emerald-950/90'
                        : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Lesson Content Viewer */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    Lección #{currentLesson.id} • {currentLesson.category} ({currentLesson.readTime})
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-100 mt-0.5">
                    {currentLesson.title}
                  </h2>
                </div>
                <button
                  onClick={() => toggleLessonCompleted(currentLesson.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    completed.includes(currentLesson.id)
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completed.includes(currentLesson.id) ? 'Completada' : 'Marcar Leída'}</span>
                </button>
              </div>

              {/* Lesson Text Body */}
              <div className="text-zinc-300 text-sm space-y-3 leading-relaxed">
                {currentLesson.body.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Visual Card Diagrams */}
              {currentLesson.visualCards && currentLesson.visualCards.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  {currentLesson.visualCards.map((vc, i) => (
                    <div key={i} className="space-y-2">
                      <span className="text-xs font-bold text-zinc-400">{vc.label}</span>
                      <div className="flex flex-wrap gap-2">
                        {vc.cards.map((c, cIdx) => (
                          <CardView key={cIdx} card={c} size="md" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Quiz Box */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-emerald-900/40 shadow-inner space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Comprobación Rápida: Ejercicio de la Lección</span>
                </div>

                <p className="text-sm font-semibold text-zinc-100">
                  {currentLesson.quiz.question}
                </p>

                <div className="space-y-2">
                  {currentLesson.quiz.options.map((opt, idx) => {
                    const isSelected = selectedAnswerIndex === idx;
                    const isCorrect = idx === currentLesson.quiz.correctOptionIndex;

                    let btnClass = 'border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300';
                    if (hasAnswered) {
                      if (isCorrect) {
                        btnClass = 'border-emerald-600 bg-emerald-950/90 text-emerald-200 font-bold';
                      } else if (isSelected) {
                        btnClass = 'border-rose-600 bg-rose-950/90 text-rose-200 font-bold';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={hasAnswered}
                        onClick={() => handleAnswerQuiz(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {hasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        {hasAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div className="pt-2 text-xs text-zinc-300 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 animate-in fade-in">
                    <strong className={selectedAnswerIndex === currentLesson.quiz.correctOptionIndex ? 'text-emerald-400' : 'text-rose-400'}>
                      {selectedAnswerIndex === currentLesson.quiz.correctOptionIndex ? '¡Respuesta Correcta! ' : 'Respuesta Incorrecta. '}
                    </strong>
                    {currentLesson.quiz.explanation}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer Navigation */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Progreso: {completed.length} / {LESSONS_DATA.length} lecciones completadas
              </span>

              <button
                onClick={() => {
                  const currentIndex = LESSONS_DATA.findIndex((l) => l.id === selectedLessonId);
                  const nextIndex = (currentIndex + 1) % LESSONS_DATA.length;
                  handleSelectLesson(LESSONS_DATA[nextIndex].id);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
              >
                <span>Siguiente Lección</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Hand Rankings Reference Tab */
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            De mayor a menor jerarquía. El motor de póker utiliza esta jerarquía oficial y desempata por kickers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HAND_RANKINGS.map((hand) => (
              <div
                key={hand.category}
                className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-300 font-black text-sm flex items-center justify-center flex-shrink-0">
                  {hand.level}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-100">{hand.name}</h4>
                    <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-zinc-950">
                      Nivel {hand.level}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{hand.description}</p>
                  <p className="text-xs font-mono text-zinc-300 pt-1">Ej: {hand.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
