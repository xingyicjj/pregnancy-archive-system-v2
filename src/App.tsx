import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ReportList } from './components/reports/ReportList';
import { UploadInterface } from './components/upload/UploadInterface';
import { AnalysisCharts } from './components/analysis/AnalysisCharts';
import { ProfileSettings } from './components/profile/ProfileSettings';

import { useLocalStorage } from './hooks/useLocalStorage';
import { mockUser, mockReports, mockHealthMetrics } from './data/mockData';
import { NavigationTab, User, Report, HealthMetric } from './types';

// 新增：报告详情弹窗组件
function ReportDetailModal({ report, onClose }: { report: Report, onClose: () => void }) {
  if (!report) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl max-w-xs w-11/12 p-4 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-pink-500 text-xl"
          onClick={onClose}
        >×</button>
        <div className="flex items-center space-x-3 mb-3">
          <img src={report.imageUrl} alt={report.title} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">{report.title}</h2>
            <div className="text-xs text-gray-500 mb-1">{report.date}</div>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-600">{report.type === 'medical-report' ? '医疗报告' : report.type}</span>
          </div>
        </div>
        <div className="mb-3">
          <h3 className="font-semibold text-gray-700 mb-1 text-sm">AI内容识别</h3>
          <div className="bg-gray-50 rounded-lg p-2 text-gray-700 text-xs whitespace-pre-line min-h-[32px]">
            {/* 该数据来源于report.extractedData.ocrContent，通常由AI识别报告图片后提取的内容 */}
            {report.extractedData?.ocrContent || '暂无AI识别内容'}
          </div>
        </div>
        <div className="mb-2">
          <h3 className="font-semibold text-gray-700 mb-1 text-sm">AI分析建议</h3>
          <ul className="list-disc pl-4 text-gray-700 text-xs">
            {report.analysis?.recommendations?.map((rec: string, idx: number) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
        <div className="mb-2">
          <h3 className="font-semibold text-gray-700 mb-1 text-sm">AI报告摘要</h3>
          <div className="bg-blue-50 rounded-lg p-2 text-blue-700 text-xs whitespace-pre-line min-h-[32px]">
            {report.extractedData?.summary || '暂无报告摘要'}
          </div>
        </div>
        {report.analysis?.alerts?.length > 0 && (
          <div className="mt-2">
            <h3 className="font-semibold text-gray-700 mb-1 text-sm">预警</h3>
            <ul className="list-disc pl-4 text-red-600 text-xs">
              {report.analysis.alerts.map((alert: any, idx: number) => (
                <li key={idx}>{alert.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [user, setUser] = useLocalStorage<User>('pregnancy-user', mockUser);
  const [reports, setReports] = useLocalStorage<Report[]>('pregnancy-reports', mockReports);
  const [healthMetrics, setHealthMetrics] = useLocalStorage<HealthMetric[]>('pregnancy-metrics', mockHealthMetrics);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useLocalStorage<string | null>('pregnancy-comprehensive-analysis', null);
  const [selectedReport, setSelectedReport] = useState<Report|null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);


  const handleUploadComplete = (report: Report) => {
    setReports(prevReports => [report, ...prevReports]);
    setActiveTab('reports');
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleComprehensiveAnalysisComplete = (analysis: string) => {
    setComprehensiveAnalysis(analysis);
  };

  // 空函数，保持接口兼容性
  const handleViewComprehensiveAnalysis = () => {
    // 不再显示弹窗
  };



  const handleDeleteReport = (reportId: string) => {
    setReports(prevReports => prevReports.filter(report => report.id !== reportId));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            reports={reports}
            comprehensiveAnalysis={comprehensiveAnalysis}
            onNavigate={setActiveTab}
            onViewReport={handleViewReport}

          />
        );
      case 'reports':
        return (
          <ReportList
            reports={reports}
            onViewReport={handleViewReport}
            onDeleteReport={handleDeleteReport}
          />
        );
      case 'upload':
        return (
          <UploadInterface
            onUploadComplete={handleUploadComplete}
            onComprehensiveAnalysisComplete={handleComprehensiveAnalysisComplete}
            onViewComprehensiveAnalysis={handleViewComprehensiveAnalysis}
            user={user}
            reports={reports}
            healthMetrics={healthMetrics}
            comprehensiveAnalysis={comprehensiveAnalysis}
          />
        );
      case 'analysis':
        return (
          <AnalysisCharts
            healthMetrics={healthMetrics}
            comprehensiveAnalysis={comprehensiveAnalysis}
            onViewComprehensiveAnalysis={handleViewComprehensiveAnalysis}
          />
        );
      case 'profile':
        return (
          <ProfileSettings
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 safe-area-padding prevent-bounce">
      <div className="scrollable-content">
        {renderActiveTab()}
        {showDetailModal && selectedReport && (
          <ReportDetailModal report={selectedReport} onClose={() => setShowDetailModal(false)} />
        )}

      </div>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;