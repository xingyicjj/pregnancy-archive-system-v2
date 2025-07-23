import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Mail, Code, Clock } from 'lucide-react';

interface DevModeNotificationProps {
  email: string;
  verificationCode: string;
  onClose: () => void;
}

export function DevModeNotification({ email, verificationCode, onClose }: DevModeNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(60); // 60秒倒计时

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-orange-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">开发模式</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800 mb-3">
              由于未配置邮件服务，系统运行在开发模式下。验证码将直接显示在这里：
            </p>
            
            {/* 邮箱信息 */}
            <div className="flex items-center space-x-2 mb-2">
              <Mail size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700">{email}</span>
            </div>

            {/* 验证码 */}
            <div className="bg-white border-2 border-orange-300 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Code size={20} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">验证码</span>
              </div>
              <div className="text-3xl font-bold text-orange-600 tracking-wider">
                {verificationCode}
              </div>
            </div>

            {/* 倒计时 */}
            <div className="flex items-center justify-center space-x-2 mt-3">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                有效期: {timeLeft > 0 ? formatTime(timeLeft) : '已过期'}
              </span>
            </div>
          </div>

          {/* 说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 如何启用真实邮件发送？</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 按照 <code>EmailJS配置指南.md</code> 配置邮件服务</li>
              <li>• 在 <code>src/config/emailConfig.ts</code> 中填入真实配置</li>
              <li>• 重启应用后即可发送真实邮件</li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(verificationCode);
                alert('验证码已复制到剪贴板');
              }}
              className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              复制验证码
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
