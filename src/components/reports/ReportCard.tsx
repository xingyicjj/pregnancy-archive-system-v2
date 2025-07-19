import React from 'react';
import { Clock, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Report } from '../../types';

interface ReportCardProps {
  report: Report;
  onClick: () => void;
  onDelete: () => void;
}

export function ReportCard({ report, onClick, onDelete }: ReportCardProps) {
  const getTypeColor = (type: string) => {
    // 根据类型名称生成颜色，使用哈希算法确保相同类型总是相同颜色
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600',
      'bg-yellow-100 text-yellow-600',
      'bg-orange-100 text-orange-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600'
    ];

    // 简单哈希函数
    let hash = 0;
    for (let i = 0; i < type.length; i++) {
      hash = ((hash << 5) - hash + type.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getTypeLabel = (type: string) => {
    return type === 'medical-report' ? '医疗报告' : type;
  };

  const getStatusIcon = () => {
    switch (report.status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'processing':
        return <Clock size={16} className="text-yellow-500" />;
      case 'failed':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const hasAlerts = report.analysis.alerts.length > 0;
  const highAlerts = report.analysis.alerts.filter(alert => alert.level === 'high').length;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这份报告吗？')) {
      onDelete();
    }
  };

  return (
    <div className="w-full bg-white rounded-xl p-4 border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all duration-200 group relative">
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>

      {/* Main Content - Clickable */}
      <button
        onClick={onClick}
        className="w-full text-left"
      >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={report.imageUrl}
            alt={report.title}
            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
          />
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
              {report.title}
            </h3>
            <p className="text-sm text-gray-500">{report.date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* 移除状态图标和眼睛图标，只保留删除按钮 */}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
          {getTypeLabel(report.type)}
        </span>
        
        {hasAlerts && (
          <div className="flex items-center space-x-1">
            {highAlerts > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                {highAlerts} 项异常
              </span>
            )}
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

        {report.status === 'completed' && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 line-clamp-2">{report.extractedData?.summary || report.analysis.summary}</p>
          </div>
        )}
      </button>
    </div>
  );
}