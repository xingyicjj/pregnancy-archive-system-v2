import emailjs from '@emailjs/browser';
import { EmailVerification } from '../types';
import { EMAILJS_CONFIG, isEmailJSConfigured, EmailTemplateParams } from '../config/emailConfig';

// 本地存储键名
const VERIFICATION_STORAGE_KEY = 'pregnancy_email_verification';

/**
 * 生成6位数字验证码
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 获取存储的邮件验证信息
 */
export function getStoredVerification(email: string): EmailVerification | null {
  try {
    const stored = localStorage.getItem(`${VERIFICATION_STORAGE_KEY}_${email}`);
    if (!stored) return null;
    
    const verification: EmailVerification = JSON.parse(stored);
    
    // 检查是否过期
    if (Date.now() > verification.expiresAt) {
      localStorage.removeItem(`${VERIFICATION_STORAGE_KEY}_${email}`);
      return null;
    }
    
    return verification;
  } catch (error) {
    console.error('获取验证信息失败:', error);
    return null;
  }
}

/**
 * 存储邮件验证信息
 */
export function storeVerification(email: string, code: string): void {
  const verification: EmailVerification = {
    email,
    code,
    expiresAt: Date.now() + 1 * 60 * 1000, // 1分钟后过期
    attempts: 0,
  };

  localStorage.setItem(`${VERIFICATION_STORAGE_KEY}_${email}`, JSON.stringify(verification));
}

/**
 * 验证邮件验证码
 */
export function verifyEmailCode(email: string, inputCode: string): { success: boolean; message: string } {
  console.log('🔍 开始验证邮件验证码...');
  console.log('📧 邮箱:', email);
  console.log('🔢 输入的验证码:', inputCode);

  const stored = getStoredVerification(email);

  if (!stored) {
    console.log('❌ 没有找到存储的验证码或已过期');
    return { success: false, message: '验证码已过期，请重新获取' };
  }

  console.log('📋 存储的验证信息:', {
    code: stored.code,
    attempts: stored.attempts,
    expiresAt: new Date(stored.expiresAt).toLocaleString(),
    remainingTime: Math.ceil((stored.expiresAt - Date.now()) / 1000) + '秒'
  });

  // 检查尝试次数
  if (stored.attempts >= 3) {
    console.log('❌ 尝试次数已用完');
    localStorage.removeItem(`${VERIFICATION_STORAGE_KEY}_${email}`);
    return { success: false, message: '验证码输入错误次数过多，请重新获取' };
  }

  // 更新尝试次数
  stored.attempts += 1;
  localStorage.setItem(`${VERIFICATION_STORAGE_KEY}_${email}`, JSON.stringify(stored));

  console.log('🔄 更新尝试次数:', stored.attempts);

  if (stored.code !== inputCode) {
    console.log('❌ 验证码不匹配');
    console.log('期望:', stored.code);
    console.log('输入:', inputCode);
    return { success: false, message: `验证码错误，还可尝试 ${3 - stored.attempts} 次` };
  }

  // 验证成功，清除存储的验证码
  console.log('✅ 验证码验证成功！');
  localStorage.removeItem(`${VERIFICATION_STORAGE_KEY}_${email}`);
  return { success: true, message: '验证成功' };
}

/**
 * 发送邮件验证码
 * 支持开发模式（控制台显示）和生产模式（真实邮件发送）
 */
export async function sendVerificationEmail(email: string, userName?: string): Promise<{ success: boolean; message: string }> {
  try {
    // 检查是否有未过期的验证码
    const existing = getStoredVerification(email);
    if (existing) {
      const remainingTime = Math.ceil((existing.expiresAt - Date.now()) / 1000 / 60);
      return {
        success: false,
        message: `验证码仍有效，请 ${remainingTime} 分钟后再试`
      };
    }

    const code = generateVerificationCode();

    // 检查是否已配置EmailJS
    if (!isEmailJSConfigured()) {
      // 开发模式：直接显示验证码
      console.log(`📧 开发模式 - 模拟发送邮件到 ${email}:`);
      console.log(`验证码: ${code}`);
      console.log(`有效期: 1分钟`);
      console.log(`💡 要启用真实邮件发送，请按照 EmailJS配置指南.md 配置邮件服务`);

      // 存储验证码
      storeVerification(email, code);

      // 触发开发模式通知事件
      window.dispatchEvent(new CustomEvent('dev-mode-verification', {
        detail: { email, code }
      }));

      return {
        success: true,
        message: `验证码已生成：${code}（开发模式）`
      };
    }

    console.log('✅ EmailJS已配置，准备发送真实邮件...');
    console.log('📋 配置信息:', {
      SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
      TEMPLATE_ID: EMAILJS_CONFIG.TEMPLATE_ID,
      PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY ? `${EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 10)}...` : '未设置'
    });

    // 生产模式：发送真实邮件
    console.log(`📧 正在发送邮件到 ${email}...`);

    const templateParams: EmailTemplateParams = {
      // 主要字段
      to_email: email,
      to_name: userName || '用户',
      verification_code: code,
      app_name: '孕期档案管理系统',

      // EmailJS标准字段名（多种格式兼容）
      email: email,                    // 标准收件人字段
      name: userName || '用户',         // 标准姓名字段
      message: code,                   // 备用消息字段

      // 更多EmailJS常用字段名
      user_email: email,               // 用户邮箱
      user_name: userName || '用户',    // 用户姓名
      reply_to: email,                 // 回复地址
      from_name: '孕期档案管理系统',     // 发送方名称
      subject: '孕期档案管理系统 - 验证码', // 邮件主题
    };

    // 打印发送的参数（调试用）
    console.log('📋 发送的邮件参数:', {
      to_email: templateParams.to_email,
      to_name: templateParams.to_name,
      verification_code: templateParams.verification_code,
      email: templateParams.email,
      name: templateParams.name
    });

    // 初始化EmailJS（每次都重新初始化以确保使用最新配置）
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('📧 EmailJS响应:', response);

    // 存储验证码
    storeVerification(email, code);

    console.log(`✅ 邮件发送成功到 ${email}`);
    return { success: true, message: `验证码已发送到 ${email}，请查收邮箱（有效期1分钟）` };
  } catch (error) {
    console.error('📧 发送邮件失败 - 详细错误信息:', error);

    // 打印当前配置信息（不包含敏感信息）
    console.log('📋 当前EmailJS配置:', {
      SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
      TEMPLATE_ID: EMAILJS_CONFIG.TEMPLATE_ID,
      PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY ? `${EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 10)}...` : '未设置',
      isConfigured: isEmailJSConfigured()
    });

    // 如果是EmailJS相关错误，提供更详细的错误信息
    if (error instanceof Error) {
      console.error('🔍 错误类型:', error.name);
      console.error('🔍 错误消息:', error.message);

      if (error.message.includes('Invalid service ID') || error.message.includes('service')) {
        return { success: false, message: '❌ 邮件服务配置错误，请检查Service ID是否正确' };
      } else if (error.message.includes('Invalid template ID') || error.message.includes('template')) {
        return { success: false, message: '❌ 邮件模板配置错误，请检查Template ID是否正确' };
      } else if (error.message.includes('Invalid public key') || error.message.includes('public')) {
        return { success: false, message: '❌ 邮件服务密钥错误，请检查Public Key是否正确' };
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        return { success: false, message: '❌ 网络连接错误，请检查网络连接' };
      } else if (error.message.includes('unauthorized') || error.message.includes('403')) {
        return { success: false, message: '❌ 邮件服务未授权，请检查EmailJS账户设置' };
      }
    }

    return { success: false, message: '❌ 发送失败，请查看浏览器控制台获取详细错误信息' };
  }
}

/**
 * 检查邮箱格式是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 清理过期的验证码
 */
export function cleanupExpiredVerifications(): void {
  console.log('🧹 开始清理过期的验证码...');
  const keys = Object.keys(localStorage);
  let cleanedCount = 0;

  keys.forEach(key => {
    if (key.startsWith(VERIFICATION_STORAGE_KEY)) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const verification: EmailVerification = JSON.parse(stored);
          if (Date.now() > verification.expiresAt) {
            localStorage.removeItem(key);
            cleanedCount++;
            console.log('🗑️ 清理过期验证码:', key);
          }
        }
      } catch (error) {
        // 清理无效的存储项
        localStorage.removeItem(key);
        cleanedCount++;
        console.log('🗑️ 清理无效存储项:', key);
      }
    }
  });

  console.log(`✅ 清理完成，共清理 ${cleanedCount} 个项目`);
}

/**
 * 强制清理指定邮箱的验证码（调试用）
 */
export function forceCleanVerification(email: string): void {
  const key = `${VERIFICATION_STORAGE_KEY}_${email}`;
  localStorage.removeItem(key);
  console.log('🗑️ 强制清理验证码:', email);
}

/**
 * 调试工具：查看用户数据状态
 */
export function debugUserData(email: string): void {
  console.log('🔍 调试用户数据状态:');
  console.log('📧 查询邮箱:', email);

  // 检查注册用户列表
  const users = JSON.parse(localStorage.getItem('pregnancy-registered-users') || '[]');
  console.log('👥 所有注册用户:', users);

  const user = users.find((u: any) => u.email === email);
  console.log('🔍 找到的用户:', user);

  // 检查当前登录用户
  const currentUser = JSON.parse(localStorage.getItem('pregnancy-auth-user') || 'null');
  console.log('👤 当前登录用户:', currentUser);

  // 检查验证码状态
  const verificationKey = `${VERIFICATION_STORAGE_KEY}_${email}`;
  const verification = localStorage.getItem(verificationKey);
  console.log('🔢 验证码状态:', verification ? JSON.parse(verification) : '无');
}
