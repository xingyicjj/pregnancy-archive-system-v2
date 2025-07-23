import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { debugUserData } from '../../services/emailService';
import { DataManager } from '../data/DataManager';

export function DataDebugPanel() {
  const { getRegisteredUsers, refreshUserData } = useAuth();
  const [showDataManager, setShowDataManager] = useState(false);

  const handleDebugUser = () => {
    const email = prompt('请输入要调试的邮箱地址:');
    if (email) {
      debugUserData(email);
    }
  };

  const handleShowAllUsers = () => {
    const users = getRegisteredUsers();
    console.log('📋 所有注册用户:', users);
    alert(`共有 ${users.length} 个注册用户，详情请查看控制台`);
  };

  const handleRefreshData = () => {
    refreshUserData();
    console.log('🔄 数据已刷新');
    alert('数据已刷新，请查看控制台');
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？这将删除所有注册用户和登录状态！')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-sm font-bold text-gray-800 mb-3">🔧 调试面板</h3>
      <div className="space-y-2">
        <button
          onClick={handleDebugUser}
          className="w-full text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        >
          调试用户数据
        </button>
        <button
          onClick={handleShowAllUsers}
          className="w-full text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
        >
          显示所有用户
        </button>
        <button
          onClick={handleRefreshData}
          className="w-full text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
        >
          刷新数据
        </button>
        <button
          onClick={() => setShowDataManager(true)}
          className="w-full text-xs bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition-colors"
        >
          数据管理
        </button>
        <button
          onClick={handleClearData}
          className="w-full text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
        >
          清除所有数据
        </button>
      </div>

      {/* 数据管理模态框 */}
      {showDataManager && (
        <DataManager onClose={() => setShowDataManager(false)} />
      )}
    </div>
  );
}
