import React from 'react';
import { User, Report } from '../types';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { QuickActions } from './dashboard/QuickActions';
import { RecentReports } from './dashboard/RecentReports';
import { HealthTips } from './dashboard/HealthTips';
import { NavigationTab } from '../types';

interface DashboardProps {
  user: User;
  reports: Report[];
  comprehensiveAnalysis: string | null;
  onNavigate: (tab: NavigationTab) => void;
  onViewReport: (report: Report) => void;
}

export function Dashboard({ user, reports, comprehensiveAnalysis, onNavigate, onViewReport }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-md mx-auto px-4 pt-6 content-safe-bottom space-y-6">
        <DashboardHeader user={user} />
        <QuickActions onNavigate={onNavigate} />
        <RecentReports
          reports={reports}
          comprehensiveAnalysis={comprehensiveAnalysis}
          onViewReport={onViewReport}
        />
        <HealthTips />
      </div>
    </div>
  );
}