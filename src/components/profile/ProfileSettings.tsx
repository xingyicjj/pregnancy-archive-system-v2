import React, { useState } from 'react';
import { Camera, Calendar, Phone, Shield, FileText, LogOut, ChevronRight, Mail, Calculator, Database } from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { PregnancyCalculatorTest } from '../debug/PregnancyCalculatorTest';
import { DataManager } from '../data/DataManager';

interface ProfileSettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export function ProfileSettings({ user, onUpdateUser }: ProfileSettingsProps) {
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    dueDate: user.dueDate,
    lastMenstrualPeriod: user.lastMenstrualPeriod,
    medicalHistory: user.medicalHistory?.join(', ') || ''
  });

  // 头像上传相关状态
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  // 头像上传处理函数
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // 创建文件预览URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatarUrl = e.target?.result as string;

        // 更新用户头像
        const updatedUser = {
          ...user,
          avatar: newAvatarUrl
        };

        onUpdateUser(updatedUser);
        console.log('✅ 头像上传成功');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ 头像上传失败:', error);
      alert('头像上传失败，请重试');
    } finally {
      setIsUploadingAvatar(false);
      // 清空input值，允许重复选择同一文件
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleSave = () => {
    // 根据末次月经日期重新计算孕周和预产期
    const lmpDate = new Date(editForm.lastMenstrualPeriod);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - lmpDate.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    const currentWeek = Math.max(0, Math.min(42, diffWeeks)); // 限制在0-42周之间

    // 根据末次月经日期计算预产期（280天后）
    const calculatedDueDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
    const dueDateString = calculatedDueDate.toISOString().split('T')[0];

    // 调试信息
    console.log('🔍 孕周和预产期计算调试信息:');
    console.log('末次月经日期:', editForm.lastMenstrualPeriod);
    console.log('当前日期:', currentDate.toISOString().split('T')[0]);
    console.log('时间差(毫秒):', diffTime);
    console.log('时间差(天):', Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    console.log('计算出的孕周:', diffWeeks);
    console.log('最终孕周:', currentWeek);
    console.log('原预产期:', editForm.dueDate);
    console.log('重新计算的预产期:', dueDateString);

    const updatedUser: User = {
      ...user,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      dueDate: dueDateString, // 使用重新计算的预产期
      lastMenstrualPeriod: editForm.lastMenstrualPeriod,
      currentWeek: currentWeek, // 重新计算的孕周
      medicalHistory: editForm.medicalHistory.split(',').map(item => item.trim()).filter(Boolean)
    };

    console.log('📝 更新后的用户信息:', updatedUser);
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  const menuItems = [
    {
      icon: FileText,
      label: '隐私协议',
      action: () => {},
      color: 'text-blue-500'
    },
    {
      icon: Shield,
      label: '数据安全',
      action: () => {},
      color: 'text-green-500'
    },
    {
      icon: Phone,
      label: '联系客服',
      action: () => {},
      color: 'text-purple-500'
    },

    {
      icon: Database,
      label: '数据管理',
      action: () => setShowDataManager(true),
      color: 'text-indigo-500'
    },
    {
      icon: Calculator,
      label: '孕周计算器测试',
      action: () => setShowCalculatorTest(true),
      color: 'text-pink-500'
    },
    {
      icon: LogOut,
      label: '退出登录',
      action: logout,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-md mx-auto px-4 pt-6 content-safe-bottom">
        {/* Header with enhanced design */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            个人设置
          </h1>
          <p className="text-gray-600 text-sm">管理您的个人信息和偏好设置</p>
        </div>

        {/* Profile Header with enhanced design */}
        <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-3xl p-8 text-white mb-8 shadow-2xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative flex items-center space-x-6">
            <div className="relative">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80'}
                alt={user.name}
                className="w-24 h-24 rounded-3xl border-4 border-white/30 shadow-xl object-cover"
                onError={(e) => {
                  // 如果图片加载失败，使用默认女性头像
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80';
                }}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-pink-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                title="更换头像"
              >
                {isUploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera size={18} />
                )}
              </button>
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
              <div className="space-y-2">
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  <p className="text-sm font-medium">孕期第 {user.currentWeek} 周</p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  <p className="text-sm font-medium">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">基本信息</h3>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            {isEditing ? '保存' : '编辑'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent no-zoom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent no-zoom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent no-zoom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">预产期</label>
              <input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent no-zoom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">末次月经</label>
              <input
                type="date"
                value={editForm.lastMenstrualPeriod}
                onChange={(e) => setEditForm({ ...editForm, lastMenstrualPeriod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent no-zoom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">病史（用逗号分隔）</label>
              <textarea
                value={editForm.medicalHistory}
                onChange={(e) => setEditForm({ ...editForm, medicalHistory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent no-zoom"
                rows={3}
                placeholder="例如：无重大疾病史，无遗传病史"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">预产期：</span>
              <span className="font-medium">{new Date(user.dueDate).toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">末次月经：</span>
              <span className="font-medium">{new Date(user.lastMenstrualPeriod).toLocaleDateString('zh-CN')}</span>
            </div>
            {user.medicalHistory && user.medicalHistory.length > 0 && (
              <div className="flex items-start space-x-3">
                <FileText size={16} className="text-gray-400 mt-1" />
                <div>
                  <span className="text-sm text-gray-600">病史：</span>
                  <div className="mt-1">
                    {user.medicalHistory.map((history, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2 mb-1">
                        {history}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

        {/* Menu Items with enhanced design */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden shadow-lg mb-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center justify-between p-5 hover:bg-white/60 transition-all duration-200 border-b border-gray-100 last:border-b-0 hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  item.color === 'text-blue-500' ? 'bg-blue-100' :
                  item.color === 'text-green-500' ? 'bg-green-100' :
                  item.color === 'text-purple-500' ? 'bg-purple-100' :
                  'bg-red-100'
                }`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <span className="font-semibold text-gray-800 text-lg">{item.label}</span>
              </div>
              <div className="bg-gray-100 p-2 rounded-xl">
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>
          ))}
        </div>

        {/* Data Usage Info with enhanced design */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <Shield size={20} className="text-white" />
            </div>
            <h4 className="text-lg font-bold text-blue-800">数据安全承诺</h4>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-sm text-blue-700 font-medium leading-relaxed">
              我们严格保护您的隐私数据，所有信息均采用端到端加密存储，
              您可以随时导出或删除个人数据。
            </p>
          </div>
        </div>
      </div>



      {showCalculator && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">孕周计算器测试</h2>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <PregnancyCalculatorTest />
            </div>
          </div>
        </div>
      )}

      {/* 隐藏的头像上传输入 */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* 数据管理模态框 */}
      {showDataManager && (
        <DataManager onClose={() => setShowDataManager(false)} />
      )}
    </div>
  );
}