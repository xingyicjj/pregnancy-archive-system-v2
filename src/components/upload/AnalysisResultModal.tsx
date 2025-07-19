import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, FileText, Calendar, Tag } from 'lucide-react';
import { Report } from '../../types';

interface AnalysisResultModalProps {
  report: Report;
  onClose: () => void;
  onSave: () => void;
}

export function AnalysisResultModal({ report, onClose, onSave }: AnalysisResultModalProps) {
  const getReportTypeLabel = (type: string) => {
    return type === 'medical-report' ? '医疗报告' : type;
  };

  const getReportTypeIcon = (type: string) => {
    // 根据类型名称生成图标，使用哈希算法确保相同类型总是相同图标
    const icons = ['🩸', '🏥', '🧪', '🍯', '📋', '🔬', '💊', '🩺', '📊', '🧬'];

    // 简单哈希函数
    let hash = 0;
    for (let i = 0; i < type.length; i++) {
      hash = ((hash << 5) - hash + type.charCodeAt(i)) & 0xffffffff;
    }
    return icons[Math.abs(hash) % icons.length];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getReportTypeIcon(report.type)}</div>
              <div>
                <h2 className="text-xl font-bold">AI 分析结果</h2>
                <p className="text-pink-100 text-sm">{getReportTypeLabel(report.type)} • {report.date}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Report Image */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FileText size={20} className="mr-2 text-blue-500" />
              原始报告
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <img
                src={report.imageUrl}
                alt="报告图片"
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* AI Analysis Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Info size={20} className="mr-2 text-green-500" />
              AI内容识别
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {report.extractedData?.ocrContent || '暂无AI识别内容'}
              </div>
            </div>
          </div>

          {/* Analysis Recommendations */}
          {report.analysis?.recommendations && report.analysis.recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle size={20} className="mr-2 text-green-500" />
                分析建议
              </h3>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <ul className="space-y-2">
                  {report.analysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Report Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FileText size={20} className="mr-2 text-blue-500" />
              报告摘要
            </h3>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {report.extractedData?.summary || '暂无报告摘要'}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {report.analysis?.alerts && report.analysis.alerts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <AlertTriangle size={20} className="mr-2 text-yellow-500" />
                注意事项
              </h3>
              <div className="space-y-3">
                {report.analysis.alerts.map((alert: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      alert.level === 'high'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : alert.level === 'medium'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <AlertTriangle
                        size={16}
                        className={`mt-0.5 ${
                          alert.level === 'high'
                            ? 'text-red-500'
                            : alert.level === 'medium'
                            ? 'text-yellow-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <span>{alert.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Tag size={20} className="mr-2 text-purple-500" />
              报告详情
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">报告类型：</span>
                  <span className="font-medium text-gray-800">{getReportTypeLabel(report.type)}</span>
                </div>
                <div>
                  <span className="text-gray-500">检查日期：</span>
                  <span className="font-medium text-gray-800">{report.date}</span>
                </div>
                <div>
                  <span className="text-gray-500">上传时间：</span>
                  <span className="font-medium text-gray-800">
                    {new Date(report.uploadedAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">状态：</span>
                  <span className="font-medium text-green-600">已完成分析</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
          >
            保存报告
          </button>
        </div>
      </div>
    </div>
  );
}
