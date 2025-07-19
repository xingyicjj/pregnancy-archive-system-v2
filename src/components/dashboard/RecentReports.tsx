import React from 'react';
import { Clock, AlertCircle, CheckCircle, Brain, TrendingUp, Calendar } from 'lucide-react';
import { Report } from '../../types';

interface RecentReportsProps {
  reports: Report[];
  comprehensiveAnalysis: string | null;
  onViewReport: (report: Report) => void;
}

export function RecentReports({ reports, comprehensiveAnalysis, onViewReport }: RecentReportsProps) {
  const recentReports = reports.slice(0, 3);

  // 从综合分析中提取摘要信息
  const getAnalysisSummary = (analysis: string | null) => {
    if (!analysis) return null;

    // 尝试提取综合健康评估部分作为摘要
    const healthMatch = analysis.match(/【📊 综合健康评估】([\s\S]*?)(?=【|$)/);
    if (healthMatch) {
      const content = healthMatch[1].trim();
      // 取前100个字符作为摘要
      return content.length > 100 ? content.substring(0, 100) + '...' : content;
    }

    // 如果没有找到特定部分，取前100个字符
    return analysis.length > 100 ? analysis.substring(0, 100) + '...' : analysis;
  };

  const analysisSummary = getAnalysisSummary(comprehensiveAnalysis);



  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
            <Brain size={16} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">AI最新综合分析</h3>
        </div>

      </div>

      <div className="space-y-4">
        {comprehensiveAnalysis ? (
          <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg"
          >
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 text-lg">综合健康分析报告</h4>
                  <div className="bg-green-100 px-3 py-1 rounded-full flex items-center space-x-1">
                    <CheckCircle size={12} className="text-green-600" />
                    <span className="text-xs font-medium text-green-600">已完成</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {analysisSummary}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={12} />
                    <span>基于 {reports.length} 份报告</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>最新分析</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain size={24} className="text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-800 text-lg mb-2">暂无综合分析</h4>
              <p className="text-sm text-gray-600 mb-4">
                上传报告后，可在分析页面进行AI综合健康分析
              </p>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">
                  💡 综合分析将基于您的档案信息和所有报告，提供个性化的健康评估和建议
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}