import React from 'react';
import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { TUTORIAL_LESSONS_META } from '../../lib/constants';

interface LearningProgressCardProps {
  completedLessonIds: string[];
  onContinueTutorial: () => void;
}

export const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
  completedLessonIds,
  onContinueTutorial,
}) => {
  const total = TUTORIAL_LESSONS_META.length;
  const completed = completedLessonIds.length;
  const percentage = Math.round((completed / total) * 100);

  // Find next lesson to do
  const nextLesson =
    TUTORIAL_LESSONS_META.find((l) => !completedLessonIds.includes(l.id)) ||
    TUTORIAL_LESSONS_META[0];

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-zinc-100">Progreso del Tutorial</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
            {completed} de {total} lecciones
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          {completed === total ? (
            <span className="text-emerald-400 font-medium">
              ¡Has completado todas las 17 lecciones del tutorial de Texas Hold'em!
            </span>
          ) : completed === 0 ? (
            <span>
              Aún no has iniciado las lecciones. Aprende desde qué es una ciega hasta el cálculo del ganador.
            </span>
          ) : (
            <span>
              Siguiente lección recomendada:{' '}
              <strong className="text-zinc-200">{nextLesson.title}</strong> ({nextLesson.category})
            </span>
          )}
        </p>
      </div>

      <button
        onClick={onContinueTutorial}
        className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
      >
        <span>{completed === 0 ? 'Comenzar Lección 1' : 'Continuar Aprendizaje'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
