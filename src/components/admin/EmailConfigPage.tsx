import React, { useState, useEffect } from 'react';
import { Mail, Settings, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { EMAILJS_CONFIG, isEmailJSConfigured } from '../../config/emailConfig';
import { sendVerificationEmail } from '../../services/emailService';

export function EmailConfigPage() {
  const [config, setConfig] = useState({
    serviceId: EMAILJS_CONFIG.SERVICE_ID,
    templateId: EMAILJS_CONFIG.TEMPLATE_ID,
    publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
  });
  
  const [testEmail, setTestEmail] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setIsConfigured(isEmailJSConfigured());
  }, [config]);

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = () => {
    // 在实际应用中，这里应该将配置保存到环境变量或配置文件
    // 由于这是演示，我们只是更新内存中的配置
    Object.assign(EMAILJS_CONFIG, {
      SERVICE_ID: config.serviceId,
      TEMPLATE_ID: config.templateId,
      PUBLIC_KEY: config.publicKey,
    });

    // 重新初始化EmailJS
    try {
      const emailjs = require('@emailjs/browser');
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      console.log('✅ EmailJS已重新初始化');
    } catch (error) {
      console.warn('⚠️ EmailJS初始化警告:', error);
    }

    setIsConfigured(isEmailJSConfigured());
    alert('配置已保存！现在可以直接测试邮件发送。');
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setTestResult({ success: false, message: '请输入测试邮箱地址' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // 在控制台显示调试信息
    console.log('🧪 开始测试邮件发送...');
    console.log('📧 测试邮箱:', testEmail);
    console.log('⚙️ 当前配置:', {
      serviceId: config.serviceId,
      templateId: config.templateId,
      publicKey: config.publicKey ? `${config.publicKey.substring(0, 10)}...` : '未设置'
    });

    try {
      const result = await sendVerificationEmail(testEmail, '测试用户');
      setTestResult(result);

      if (result.success) {
        console.log('✅ 邮件发送成功！');
      } else {
        console.log('❌ 邮件发送失败:', result.message);
      }
    } catch (error) {
      console.error('🚨 测试邮件发送异常:', error);
      setTestResult({ success: false, message: '测试失败，请查看浏览器控制台获取详细错误信息' });
    } finally {
      setIsTesting(false);
    }
  };

  const copyTemplateCode = () => {
    const templateCode = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .code { background: #fff; border: 2px solid #ec4899; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code-number { font-size: 32px; font-weight: bold; color: #ec4899; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👶 孕期档案管理系统</h1>
        </div>
        <div class="content">
            <h2>您好，{{to_name}}！</h2>
            <p>您正在使用邮箱验证码登录/注册孕期档案管理系统。</p>
            
            <div class="code">
                <p>您的验证码是：</p>
                <div class="code-number">{{verification_code}}</div>
            </div>
            
            <p><strong>重要提醒：</strong></p>
            <ul>
                <li>验证码有效期为 <strong>1分钟</strong></li>
                <li>请勿将验证码告诉他人</li>
                <li>如非本人操作，请忽略此邮件</li>
            </ul>
            
            <div class="footer">
                <p>此邮件由系统自动发送，请勿回复</p>
                <p>© 2024 孕期档案管理系统</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    navigator.clipboard.writeText(templateCode);
    alert('邮件模板代码已复制到剪贴板！');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">邮件服务配置</h1>
              <p className="text-gray-600">配置EmailJS实现真实邮件发送</p>
            </div>
          </div>

          {/* 配置状态 */}
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            isConfigured 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}>
            {isConfigured ? (
              <>
                <CheckCircle size={20} />
                <span>✅ EmailJS已配置，可以发送真实邮件</span>
              </>
            ) : (
              <>
                <AlertCircle size={20} />
                <span>⚠️ EmailJS未配置，当前为开发模式（控制台显示验证码）</span>
              </>
            )}
          </div>
        </div>

        {/* 配置步骤 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 左侧：配置表单 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">EmailJS配置</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service ID
                </label>
                <input
                  type="text"
                  value={config.serviceId}
                  onChange={(e) => handleConfigChange('serviceId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="service_xxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template ID
                </label>
                <input
                  type="text"
                  value={config.templateId}
                  onChange={(e) => handleConfigChange('templateId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="template_xxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Key
                </label>
                <input
                  type="text"
                  value={config.publicKey}
                  onChange={(e) => handleConfigChange('publicKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="user_xxxxxxxxxxxxxxxx"
                />
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors"
              >
                保存配置
              </button>
            </div>
          </div>

          {/* 右侧：配置指南 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">配置指南</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium">注册EmailJS账户</p>
                  <a 
                    href="https://www.emailjs.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-600 inline-flex items-center space-x-1"
                  >
                    <span>访问EmailJS官网</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium">添加邮件服务</p>
                  <p className="text-gray-600">选择Gmail、Outlook等邮箱服务</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium">创建邮件模板</p>
                  <button
                    onClick={copyTemplateCode}
                    className="text-pink-500 hover:text-pink-600 inline-flex items-center space-x-1 mt-1"
                  >
                    <Copy size={14} />
                    <span>复制模板代码</span>
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <p className="font-medium">获取配置信息</p>
                  <p className="text-gray-600">复制Service ID、Template ID和Public Key</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试邮件发送 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">测试邮件发送</h2>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="输入测试邮箱地址"
              />
            </div>
            <button
              onClick={handleTestEmail}
              disabled={isTesting}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Mail size={16} />
              <span>{isTesting ? '发送中...' : '发送测试邮件'}</span>
            </button>
          </div>

          {testResult && (
            <div className={`mt-4 p-3 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
