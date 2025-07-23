import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ReportList } from './components/reports/ReportList';
import { UploadInterface } from './components/upload/UploadInterface';
import { AnalysisCharts } from './components/analysis/AnalysisCharts';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { AuthPage } from './components/auth/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DataDebugPanel } from './components/debug/DataDebugPanel';
import { EmailTest } from './components/debug/EmailTest';
import { EnvConfigChecker } from './components/debug/EnvConfigChecker';

import { useLocalStorage } from './hooks/useLocalStorage';
import { mockReports, mockHealthMetrics } from './data/mockData';
import { NavigationTab, User, Report, HealthMetric } from './types';

// 新增：图片查看器组件
function ImageViewer({ imageUrl, onClose }: { imageUrl: string, onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  // 重置图片状态
  const resetImage = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // 处理拖拽移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // 处理拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* 工具栏 */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
        <button
          onClick={() => setRotation(prev => prev + 90)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
          title="旋转"
        >
          🔄
        </button>
        <button
          onClick={resetImage}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
          title="重置"
        >
          ↺
        </button>
        <button
          onClick={onClose}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
          title="关闭"
        >
          ✕
        </button>
      </div>

      {/* 缩放控制 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg p-2">
        <button
          onClick={() => setScale(prev => Math.max(0.1, prev - 0.2))}
          className="text-white p-1 hover:bg-white hover:bg-opacity-20 rounded"
        >
          −
        </button>
        <span className="text-white text-sm min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(prev => Math.min(5, prev + 0.2))}
          className="text-white p-1 hover:bg-white hover:bg-opacity-20 rounded"
        >
          +
        </button>
      </div>

      {/* 图片 */}
      <img
        src={imageUrl}
        alt="报告图片"
        className="max-w-none max-h-none cursor-move select-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        draggable={false}
      />
    </div>
  );
}

// 新增：报告详情弹窗组件
function ReportDetailModal({ report, onClose }: { report: Report, onClose: () => void }) {
  const [showImageViewer, setShowImageViewer] = useState(false);

  if (!report) return null;

  // 处理点击外部区域关闭弹窗
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理ESC键关闭弹窗
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-11/12 p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-pink-500 text-xl"
          onClick={onClose}
        >×</button>
        <div className="flex items-center space-x-4 mb-6">
          <img src={report.imageUrl} alt={report.title} className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-md" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{report.title}</h2>
            <div className="text-sm text-gray-500 mb-2">{report.date}</div>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-600">{report.type === 'medical-report' ? '医疗报告' : report.type}</span>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 text-lg flex items-center">
            <Camera className="w-5 h-5 mr-2 text-blue-600" />
            原始照片
          </h3>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            {report.imageUrl ? (
              <div className="relative group">
                <img
                  src={report.imageUrl}
                  alt={`${report.title} - 原始照片`}
                  className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]"
                  onClick={() => setShowImageViewer(true)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 text-gray-600 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 opacity-0 group-hover:opacity-100">
                    点击查看大图
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>暂无原始照片</p>
              </div>
            )}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 text-lg">AI分析建议</h3>
          <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
            {report.analysis?.recommendations?.map((rec: string, idx: number) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 text-lg">AI报告摘要</h3>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-purple-700 text-sm whitespace-pre-line min-h-[80px] border border-purple-200">
            {report.extractedData?.summary || '暂无报告摘要'}
          </div>
        </div>
        {report.analysis?.alerts?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3 text-lg">预警信息</h3>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
              <ul className="list-disc pl-6 text-red-600 text-sm space-y-1">
                {report.analysis.alerts.map((alert: any, idx: number) => (
                  <li key={idx}>{alert.message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 图片查看器 */}
      {showImageViewer && report.imageUrl && (
        <ImageViewer
          imageUrl={report.imageUrl}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
}

// 主应用组件（需要在认证上下文内部）
function MainApp() {
  const { isAuthenticated, user, isLoading, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [reports, setReports] = useLocalStorage<Report[]>('pregnancy-reports', mockReports);
  const [healthMetrics, setHealthMetrics] = useLocalStorage<HealthMetric[]>('pregnancy-metrics', mockHealthMetrics);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useLocalStorage<string | null>('pregnancy-comprehensive-analysis', null);
  const [selectedReport, setSelectedReport] = useState<Report|null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 监听页面切换，自动关闭弹窗
  useEffect(() => {
    if (showDetailModal) {
      setShowDetailModal(false);
      setSelectedReport(null);
    }
  }, [activeTab]); // 当activeTab变化时执行

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👶</span>
          </div>
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，显示认证页面
  if (!isAuthenticated || !user) {
    return (
      <>
        <AuthPage />
        <DataDebugPanel />
        <EmailTest />
        <EnvConfigChecker />
      </>
    );
  }


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
    updateUser(updatedUser);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <Dashboard
              user={user}
              reports={reports}
              comprehensiveAnalysis={comprehensiveAnalysis}
              onNavigate={setActiveTab}
              onViewReport={handleViewReport}
            />
          </ErrorBoundary>
        );
      case 'reports':
        return (
          <ErrorBoundary>
            <ReportList
              reports={reports}
              onViewReport={handleViewReport}
              onDeleteReport={handleDeleteReport}
              onNavigateToUpload={() => setActiveTab('upload')}
            />
          </ErrorBoundary>
        );
      case 'upload':
        return (
          <ErrorBoundary>
            <UploadInterface
              onUploadComplete={handleUploadComplete}
              onComprehensiveAnalysisComplete={handleComprehensiveAnalysisComplete}
              onViewComprehensiveAnalysis={handleViewComprehensiveAnalysis}
              user={user}
              reports={reports}
              healthMetrics={healthMetrics}
              comprehensiveAnalysis={comprehensiveAnalysis}
            />
          </ErrorBoundary>
        );
      case 'analysis':
        return (
          <ErrorBoundary>
            <AnalysisCharts
              healthMetrics={healthMetrics}
              comprehensiveAnalysis={comprehensiveAnalysis}
              onViewComprehensiveAnalysis={handleViewComprehensiveAnalysis}
            />
          </ErrorBoundary>
        );
      case 'profile':
        return (
          <ErrorBoundary>
            <ProfileSettings
              user={user}
              onUpdateUser={handleUpdateUser}
            />
          </ErrorBoundary>
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

      {/* 调试面板 */}
      <DataDebugPanel />

      {/* 邮件测试 */}
      <EmailTest />

      {/* 环境变量配置检查 */}
      <EnvConfigChecker />
    </div>
  );
}

// 根应用组件（包装认证提供者）
function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;