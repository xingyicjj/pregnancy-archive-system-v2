import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import { CaptchaCanvas } from './CaptchaCanvas';
import { useAuth } from '../../contexts/AuthContext';
import { sendVerificationEmail, isValidEmail, debugUserData } from '../../services/emailService';
import { LoginForm, CaptchaData } from '../../types';
import { DevModeNotification } from '../debug/DevModeNotification';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSwitchToPasswordReset: () => void;
}

export function LoginPage({ onSwitchToRegister, onSwitchToPasswordReset }: LoginPageProps) {
  const { login, getRegisteredUsers, refreshUserData } = useAuth();
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
    captcha: '',
  });
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [devModeNotification, setDevModeNotification] = useState<{ email: string; code: string } | null>(null);

  // 监听开发模式验证码事件
  useEffect(() => {
    const handleDevModeVerification = (event: CustomEvent) => {
      setDevModeNotification(event.detail);
    };

    window.addEventListener('dev-mode-verification', handleDevModeVerification as EventListener);
    return () => {
      window.removeEventListener('dev-mode-verification', handleDevModeVerification as EventListener);
    };
  }, []);

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // 清除消息
    if (message) setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.captcha) {
      setMessage({ type: 'error', text: '请填写所有必填项' });
      return;
    }

    if (!captchaData || form.captcha.toUpperCase() !== captchaData.text.toUpperCase()) {
      setMessage({ type: 'error', text: '图形验证码错误' });
      return;
    }

    setIsLoading(true);
    try {
      // 刷新用户数据确保最新状态
      refreshUserData();

      // 调试：查看用户数据状态
      debugUserData(form.email);
      console.log('🔍 AuthContext中的用户:', getRegisteredUsers());

      const result = await login(form);
      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '登录失败，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👶</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">孕期档案管理</h1>
          <p className="text-gray-600">登录您的账户</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址 *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码 *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* 图形验证码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图形验证码 *
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={form.captcha}
                  onChange={(e) => handleInputChange('captcha', e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入验证码"
                  maxLength={4}
                  required
                />
                <CaptchaCanvas onCaptchaGenerated={setCaptchaData} />
              </div>
            </div>

            {/* 消息提示 */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text.includes('用户不存在') ? (
                  <div className="flex items-center justify-between">
                    <span>用户不存在</span>
                    <button
                      onClick={onSwitchToRegister}
                      className="ml-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      立即注册 →
                    </button>
                  </div>
                ) : (
                  message.text
                )}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>登录</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* 忘记密码链接 */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onSwitchToPasswordReset}
                className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
              >
                忘记密码？
              </button>
            </div>
          </form>

          {/* 切换到注册 */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              还没有账户？
              <button
                onClick={onSwitchToRegister}
                className="ml-1 text-pink-500 hover:text-pink-600 font-medium transition-colors inline-flex items-center"
              >
                立即注册
                <UserPlus size={16} className="ml-1" />
              </button>
            </p>
          </div>

          {/* 临时调试按钮 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                🔧 清理数据（调试用）
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 开发模式验证码通知 */}
      {devModeNotification && (
        <DevModeNotification
          email={devModeNotification.email}
          verificationCode={devModeNotification.code}
          onClose={() => setDevModeNotification(null)}
        />
      )}
    </div>
  );
}
