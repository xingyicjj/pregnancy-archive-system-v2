import React from 'react';
import { Calendar, Heart, AlertTriangle } from 'lucide-react';
import { User } from '../../types';
import { getDaysUntilDueDate, formatPregnancyWeeks } from '../../utils/pregnancy';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const daysUntilDue = getDaysUntilDueDate(user.dueDate);
  const pregnancyWeeks = formatPregnancyWeeks(user.currentWeek);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-8 text-white shadow-2xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-2xl border-3 border-white/30 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">你好，{user.name}</h2>
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <p className="text-sm font-medium">孕期第 {pregnancyWeeks}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-center text-pink-100 mb-2">
                <Calendar size={20} className="mr-2" />
                <span className="text-sm font-medium">预产期倒计时</span>
              </div>
              <p className="text-2xl font-bold text-center">{daysUntilDue}</p>
              <p className="text-sm text-pink-100 text-center">天</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center mr-3">
                <Heart size={20} className="text-green-300" />
              </div>
              <span className="text-sm font-medium text-pink-100">健康状态</span>
            </div>
            <p className="text-xl font-bold text-green-300">良好</p>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div className="bg-green-400 h-2 rounded-full w-4/5"></div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all duration-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center mr-3">
                <AlertTriangle size={20} className="text-yellow-300" />
              </div>
              <span className="text-sm font-medium text-pink-100">注意事项</span>
            </div>
            <p className="text-xl font-bold text-yellow-300">1 项</p>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div className="bg-yellow-400 h-2 rounded-full w-1/5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}