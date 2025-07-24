import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Lock, ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { CaptchaCanvas } from './CaptchaCanvas';
import { useAuth } from '../../contexts/AuthContext';
import { sendVerificationEmail, isValidEmail } from '../../services/emailService';
import { RegisterForm, CaptchaData } from '../../types';
import { DevModeNotification } from '../debug/DevModeNotification';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register } = useAuth();

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
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '', // 保留但不在表单中显示
    captcha: '',
    emailCode: '',
    dueDate: '',
    lastMenstrualPeriod: '',
  });
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [devModeNotification, setDevModeNotification] = useState<{ email: string; code: string } | null>(null);

  const handleInputChange = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // 清除消息
    if (message) setMessage(null);
  };

  const handleSendEmailCode = async () => {
    // 验证邮箱格式
    if (!isValidEmail(form.email)) {
      setMessage({ type: 'error', text: '请输入有效的邮箱地址' });
      return;
    }

    // 验证图形验证码
    if (!captchaData || form.captcha.toUpperCase() !== captchaData.text.toUpperCase()) {
      setMessage({ type: 'error', text: '图形验证码错误' });
      return;
    }

    setIsSendingCode(true);
    try {
      const result = await sendVerificationEmail(form.email, form.name);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setEmailCodeSent(true);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '发送失败，请稍后重试' });
    } finally {
      setIsSendingCode(false);
    }
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return '请输入姓名';
    if (!isValidEmail(form.email)) return '请输入有效的邮箱地址';
    if (!form.password) return '请输入密码';
    if (form.password.length < 6) return '密码长度至少6位';
    if (!form.confirmPassword) return '请确认密码';
    if (form.password !== form.confirmPassword) return '两次输入的密码不一致';
    if (!form.captcha) return '请输入图形验证码';
    if (!form.emailCode) return '请输入邮件验证码';
    if (!form.lastMenstrualPeriod) return '请选择末次月经日期';

    // 验证图形验证码
    if (!captchaData || form.captcha.toUpperCase() !== captchaData.text.toUpperCase()) {
      return '图形验证码错误';
    }

    // 验证末次月经日期
    const lmpDate = new Date(form.lastMenstrualPeriod);
    const today = new Date();

    if (lmpDate > today) {
      return '末次月经日期不能晚于今天';
    }

    // 验证末次月经日期不能太早（比如超过1年前）
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (lmpDate < oneYearAgo) {
      return '末次月经日期不能早于一年前';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(form);
      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '注册失败，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👶</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">孕期档案管理</h1>
          <p className="text-gray-600">创建您的账户</p>
        </div>

        {/* 注册表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 姓名输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名 *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入您的姓名"
                  required
                />
              </div>
            </div>

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
                  placeholder="请输入密码（至少6位）"
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

            {/* 确认密码输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认密码 *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请再次输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

            {/* 邮件验证码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮件验证码 *
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={form.emailCode}
                    onChange={(e) => handleInputChange('emailCode', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="请输入6位验证码"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  disabled={isSendingCode || !form.email || !form.captcha}
                  className="px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {isSendingCode ? '发送中...' : emailCodeSent ? '重新发送' : '获取验证码'}
                </button>
              </div>
            </div>



            {/* 末次月经 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                末次月经 *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={form.lastMenstrualPeriod}
                  onChange={(e) => handleInputChange('lastMenstrualPeriod', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="yyyy/mm/dd"
                  required
                />
              </div>
            </div>

            {/* 消息提示 */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text.includes('该邮箱已注册') ? (
                  <div className="flex items-center justify-between">
                    <span>该邮箱已注册</span>
                    <button
                      onClick={onSwitchToLogin}
                      className="ml-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      立即登录 →
                    </button>
                  </div>
                ) : (
                  message.text
                )}
              </div>
            )}

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>注册</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* 切换到登录 */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              已有账户？
              <button
                onClick={onSwitchToLogin}
                className="ml-1 text-pink-500 hover:text-pink-600 font-medium transition-colors inline-flex items-center"
              >
                立即登录
                <LogIn size={16} className="ml-1" />
              </button>
            </p>
          </div>
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
