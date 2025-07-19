import React, { useState } from 'react';
import { Search, Filter, Calendar, FileText } from 'lucide-react';
import { Report } from '../../types';
import { ReportCard } from './ReportCard';

interface ReportListProps {
  reports: Report[];
  onViewReport: (report: Report) => void;
  onDeleteReport: (reportId: string) => void;
}

export function ReportList({ reports, onViewReport, onDeleteReport }: ReportListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');

  // 动态生成报告类型筛选选项
  const reportTypes = [
    { value: 'all', label: '全部类型' },
    ...Array.from(new Set(reports.map(r => r.type))).map(type => ({
      value: type,
      label: type === 'medical-report' ? '医疗报告' : type
    }))
  ];

  const filteredReports = reports
    .filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || report.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.type.localeCompare(b.type);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-md mx-auto px-4 pt-6 content-safe-bottom">
        {/* Header with enhanced design */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            检查档案
          </h1>
          <p className="text-gray-600 text-sm">管理您的医疗报告档案</p>
        </div>

        {/* Search Bar with enhanced design */}
        <div className="relative mb-8">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索报告..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-lg text-gray-800 placeholder-gray-500"
          />
        </div>

        {/* Filter Tabs with enhanced design */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
              <Filter size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">筛选类型</span>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 shadow-lg ${
                  selectedType === type.value
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-200 scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-xl hover:scale-105'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid with enhanced design */}
        {filteredReports.length > 0 ? (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => onViewReport(report)}
                onDelete={() => onDeleteReport(report.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-3">暂无报告</h3>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto">还没有上传任何医疗报告，点击下方按钮开始添加</p>
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold inline-flex items-center space-x-2 shadow-lg">
              <Upload size={20} />
              <span>上传第一份报告</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}