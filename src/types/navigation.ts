export type AppView =
  | 'dashboard'
  | 'learn'
  | 'play'
  | 'analyzer'
  | 'trainer'
  | 'coach'
  | 'stats';

export interface NavItem {
  id: AppView;
  label: string;
  icon: string;
  badge?: string;
  description: string;
}
