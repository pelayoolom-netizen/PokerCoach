import React from 'react';
import { HandHistoryRecord } from '../../types/poker';
import { AppView } from '../../types/navigation';
import { UserProfile } from '../../types/user';
import { HeroSection } from '../dashboard/HeroSection';
import { QuickActions } from '../dashboard/QuickActions';
import { StatsSummary } from '../dashboard/StatsSummary';
import { LearningProgressCard } from '../dashboard/LearningProgressCard';
import { RecentActivity } from '../dashboard/RecentActivity';
import { SeoGuideSection } from '../dashboard/SeoGuideSection';

interface DashboardViewProps {
  profile: UserProfile;
  history: HandHistoryRecord[];
  onNavigate: (view: AppView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  history,
  onNavigate,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section with Semantic H1 */}
      <HeroSection
        onNavigate={onNavigate}
        completedLessonsCount={profile.stats.tutorialCompletedLessons.length}
      />

      {/* Main Mode Quick Actions */}
      <QuickActions onNavigate={onNavigate} />

      {/* Learning Progress & Basic Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningProgressCard
          completedLessonIds={profile.stats.tutorialCompletedLessons}
          onContinueTutorial={() => onNavigate('learn')}
        />
        <StatsSummary
          stats={profile.stats}
          onNavigateToStats={() => onNavigate('stats')}
        />
      </div>

      {/* Educational SEO Guide Section: Aprende a jugar al póker */}
      <SeoGuideSection onNavigate={onNavigate} />

      {/* Recent Games / Activity */}
      <RecentActivity
        history={history}
        onPlayGame={() => onNavigate('play')}
      />
    </div>
  );
};
