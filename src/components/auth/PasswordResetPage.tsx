import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { CaptchaCanvas } from './CaptchaCanvas';
import { sendVerificationEmail, verifyEmailCode, isValidEmail, debugUserData } from '../../services/emailService';
import { CaptchaData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { DevModeNotification } from '../debug/DevModeNotification';

interface PasswordResetPageProps {
  onBackToLogin: () => void;
  onResetSuccess: () => void;
}

type ResetStep = 'email' | 'verify' | 'newPassword' | 'success';

export function PasswordResetPage({ onBackToLogin, onResetSuccess }: PasswordResetPageProps) {
  const { resetPassword, checkUserExists, getRegisteredUsers, refreshUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleSendCode = async () => {
    if (!isValidEmail(email)) {
      setMessage({ type: 'error', text: '请输入有效的邮箱地址' });
      return;
    }

    if (!captchaData || captcha.toUpperCase() !== captchaData.text.toUpperCase()) {
      setMessage({ type: 'error', text: '图形验证码错误' });
      return;
    }

    // 刷新用户数据确保最新状态
    refreshUserData();

    // 调试：查看用户数据状态
    debugUserData(email);
    console.log('🔍 AuthContext中的用户:', getRegisteredUsers());

    // 检查用户是否存在
    if (!checkUserExists(email)) {
      setMessage({ type: 'error', text: '该邮箱未注册，请先注册账户' });
      return;
    }

    const users = getRegisteredUsers();
    const userExists = users.find(u => u.email === email);

    setIsSendingCode(true);
    try {
      const result = await sendVerificationEmail(email, userExists.name || '用户');
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setCurrentStep('verify');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '发送失败，请稍后重试' });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!emailCode) {
      setMessage({ type: 'error', text: '请输入邮件验证码' });
      return;
    }

    setIsLoading(true);
    try {
      const result = verifyEmailCode(email, emailCode);
      if (result.success) {
        setMessage({ type: 'success', text: '验证成功！' });
        setCurrentStep('newPassword');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '验证失败，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setMessage({ type: 'error', text: '请输入新密码' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '密码长度至少6位' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(email, newPassword);
      if (result.success) {
        setCurrentStep('success');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '重置失败，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">找回密码</h2>
        <p className="text-gray-600">请输入您的邮箱地址，我们将发送验证码</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮箱地址 *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="请输入邮箱地址"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            图形验证码 *
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="请输入验证码"
              maxLength={4}
              required
            />
            <CaptchaCanvas onCaptchaGenerated={setCaptchaData} />
          </div>
        </div>

        <button
          onClick={handleSendCode}
          disabled={isSendingCode || !email || !captcha}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Mail size={20} />
          <span>{isSendingCode ? '发送中...' : '发送验证码'}</span>
        </button>
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">验证邮箱</h2>
        <p className="text-gray-600">验证码已发送到 {email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮件验证码 *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="请输入6位验证码"
              maxLength={6}
              required
            />
          </div>
        </div>

        <button
          onClick={handleVerifyCode}
          disabled={isLoading || !emailCode}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <ArrowRight size={20} />
          <span>{isLoading ? '验证中...' : '验证并继续'}</span>
        </button>

        <button
          onClick={() => setCurrentStep('email')}
          className="w-full text-gray-600 hover:text-pink-500 py-2 transition-colors"
        >
          重新发送验证码
        </button>
      </div>
    </div>
  );

  const renderNewPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">设置新密码</h2>
        <p className="text-gray-600">请设置您的新密码</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            新密码 *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="请输入新密码（至少6位）"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            确认新密码 *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="请再次输入新密码"
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

        <button
          onClick={handleResetPassword}
          disabled={isLoading || !newPassword || !confirmPassword}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <CheckCircle size={20} />
          <span>{isLoading ? '重置中...' : '重置密码'}</span>
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="text-green-500" size={32} />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">密码重置成功！</h2>
        <p className="text-gray-600">您的密码已成功重置，现在可以使用新密码登录了</p>
      </div>

      <button
        onClick={onResetSuccess}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <ArrowRight size={20} />
        <span>返回登录</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/50">
          {/* 返回按钮 */}
          {currentStep !== 'success' && (
            <button
              onClick={onBackToLogin}
              className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回登录</span>
            </button>
          )}

          {/* 步骤内容 */}
          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'verify' && renderVerifyStep()}
          {currentStep === 'newPassword' && renderNewPasswordStep()}
          {currentStep === 'success' && renderSuccessStep()}

          {/* 消息提示 */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
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
