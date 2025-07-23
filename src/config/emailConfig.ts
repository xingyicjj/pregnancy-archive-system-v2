// EmailJS 配置文件
// 请按照 EmailJS配置指南.md 中的步骤获取这些配置信息

export const EMAILJS_CONFIG = {
  // ✅ 真实的EmailJS配置

  // 服务ID - 在EmailJS控制台的"Email Services"中获取
  SERVICE_ID: 'service_tf453z8',

  // 模板ID - 在EmailJS控制台的"Email Templates"中获取
  TEMPLATE_ID: 'template_myxo361',

  // 公钥 - 在EmailJS控制台的"Account" -> "API Keys"中获取
  PUBLIC_KEY: 'g9lxqFRG1Pzler8Pv',
};

// 🚀 快速配置检查
export const isEmailJSConfigured = (): boolean => {
  return (
    EMAILJS_CONFIG.SERVICE_ID !== 'your_service_id_here' &&
    EMAILJS_CONFIG.TEMPLATE_ID !== 'your_template_id_here' &&
    EMAILJS_CONFIG.PUBLIC_KEY !== 'your_public_key_here'
  );
};

// 📧 邮件模板参数接口
export interface EmailTemplateParams {
  // 主要字段
  to_email: string;
  to_name: string;
  verification_code: string;
  app_name: string;

  // EmailJS标准字段名（多种格式兼容）
  email: string;
  name: string;
  message: string;

  // 更多EmailJS常用字段名
  user_email: string;
  user_name: string;
  reply_to: string;
  from_name: string;
  subject: string;
}

// 🎨 邮件模板预览（用于测试）
export const EMAIL_TEMPLATE_PREVIEW = `
<!DOCTYPE html>
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
</html>
`;
