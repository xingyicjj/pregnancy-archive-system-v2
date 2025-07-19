import React from 'react';
import { Home, FileText, BarChart3, User } from 'lucide-react';
import { NavigationTab } from '../types';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

const tabs = [
  { id: 'dashboard' as NavigationTab, label: '首页', icon: Home },
  { id: 'reports' as NavigationTab, label: '档案', icon: FileText },
  { id: 'upload' as NavigationTab, label: '分析', icon: BarChart3 },
  { id: 'profile' as NavigationTab, label: '我的', icon: User },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-white/50 px-4 py-3 z-50 bottom-nav-safe shadow-2xl">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`relative flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 ${
              activeTab === id
                ? 'text-white'
                : 'text-gray-500 hover:text-pink-400 hover:bg-pink-50'
            }`}
          >
            {/* Active background */}
            {activeTab === id && (
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg"></div>
            )}

            {/* Icon and label */}
            <div className="relative flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-xl mb-1 transition-all duration-300 ${
                activeTab === id
                  ? 'bg-white/20 scale-110'
                  : 'hover:bg-pink-100'
              }`}>
                <Icon size={18} />
              </div>
              <span className={`text-xs font-semibold transition-all duration-300 ${
                activeTab === id ? 'scale-105' : ''
              }`}>
                {label}
              </span>
            </div>

            {/* Active indicator dot */}
            {activeTab === id && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}