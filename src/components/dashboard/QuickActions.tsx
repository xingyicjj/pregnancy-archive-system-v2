import React from 'react';
import { Camera, FileText, TrendingUp } from 'lucide-react';
import { NavigationTab } from '../../types';

interface QuickActionsProps {
  onNavigate: (tab: NavigationTab) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const actions = [
    {
      id: 'upload',
      title: '上传报告',
      subtitle: '拍照或选择图片',
      icon: Camera,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      action: () => onNavigate('upload')
    },
    {
      id: 'reports',
      title: '查看档案',
      subtitle: '历史报告记录',
      icon: FileText,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      action: () => onNavigate('reports')
    },
    {
      id: 'analysis',
      title: '数据分析',
      subtitle: '智能分析报告',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-purple-500 to-violet-500',
      action: () => onNavigate('upload')
    }
  ];

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <TrendingUp size={16} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">快捷操作</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.slice(0, 2).map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`group relative overflow-hidden ${action.color} p-6 rounded-2xl text-white text-left transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  {React.createElement(action.icon, { size: 24 })}
                </div>
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
              </div>
              <h4 className="font-bold text-lg mb-2">{action.title}</h4>
              <p className="text-sm text-white/90 font-medium">{action.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Third action takes full width */}
      <div className="mt-4">
        <button
          onClick={actions[2].action}
          className={`group relative overflow-hidden w-full ${actions[2].color} p-6 rounded-2xl text-white text-left transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl`}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
              {React.createElement(actions[2].icon, { size: 24 })}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-1">{actions[2].title}</h4>
              <p className="text-sm text-white/90 font-medium">{actions[2].subtitle}</p>
            </div>
            <div className="w-3 h-3 bg-white/30 rounded-full"></div>
          </div>
        </button>
      </div>
    </div>
  );
}