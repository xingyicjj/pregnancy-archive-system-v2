import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { sendVerificationEmail, isValidEmail } from '../../services/emailService';
import { EMAILJS_CONFIG } from '../../config/emailConfig';

export function EmailTest() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('测试用户');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTest = async () => {
    if (!isValidEmail(email)) {
      setResult({ success: false, message: '请输入有效的邮箱地址' });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await sendVerificationEmail(email, name);
      setResult(response);
    } catch (error) {
      setResult({ success: false, message: '发送失败，请检查配置' });
    } finally {
      setIsSending(false);
    }
  };

  const isConfigured = EMAILJS_CONFIG.SERVICE_ID !== 'your_service_id_here' &&
                      EMAILJS_CONFIG.TEMPLATE_ID !== 'your_template_id_here' &&
                      EMAILJS_CONFIG.PUBLIC_KEY !== 'your_public_key_here';

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <div className="flex items-center space-x-2 mb-3">
        <Mail className="text-blue-500" size={20} />
        <h3 className="text-sm font-bold text-gray-800">📧 邮件测试</h3>
      </div>

      {/* 配置状态 */}
      <div className={`mb-3 p-2 rounded text-xs ${
        isConfigured 
          ? 'bg-green-50 text-green-700 border border-green-200' 
          : 'bg-orange-50 text-orange-700 border border-orange-200'
      }`}>
        <div className="flex items-center space-x-1">
          {isConfigured ? (
            <CheckCircle size={14} className="text-green-600" />
          ) : (
            <Settings size={14} className="text-orange-600" />
          )}
          <span className="font-medium">
            {isConfigured ? 'EmailJS已配置' : 'EmailJS未配置'}
          </span>
        </div>
        {isConfigured && (
          <div className="mt-1 space-y-1">
            <div>服务ID: {EMAILJS_CONFIG.SERVICE_ID}</div>
            <div>模板ID: {EMAILJS_CONFIG.TEMPLATE_ID}</div>
            <div>公钥: {EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 10)}...</div>
          </div>
        )}
      </div>

      {/* 测试表单 */}
      <div className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="收件人姓名"
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="测试邮箱地址"
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSendTest}
          disabled={isSending || !email}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
        >
          <Send size={12} />
          <span>{isSending ? '发送中...' : '发送测试邮件'}</span>
        </button>
      </div>

      {/* 结果显示 */}
      {result && (
        <div className={`mt-2 p-2 rounded text-xs ${
          result.success 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center space-x-1">
            {result.success ? (
              <CheckCircle size={14} className="text-green-600" />
            ) : (
              <AlertCircle size={14} className="text-red-600" />
            )}
            <span className="font-medium">
              {result.success ? '发送成功' : '发送失败'}
            </span>
          </div>
          <div className="mt-1">{result.message}</div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-3 text-xs text-gray-600">
        <p>💡 输入您的邮箱地址测试真实邮件发送</p>
        {!isConfigured && (
          <p className="text-orange-600 mt-1">⚠️ 需要配置EmailJS才能发送真实邮件</p>
        )}
      </div>
    </div>
  );
}
