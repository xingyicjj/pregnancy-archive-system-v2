/**
 * 环境变量工具函数
 * 用于验证和管理环境变量配置
 */

export interface EnvConfig {
  doubaoApiKey: string;
  deepseekApiKey: string;
}

/**
 * 获取环境变量配置
 */
export function getEnvConfig(): EnvConfig {
  return {
    doubaoApiKey: import.meta.env.VITE_DOUBAO_API_KEY || '',
    deepseekApiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  };
}

/**
 * 验证环境变量是否正确配置
 */
export function validateEnvConfig(): { valid: boolean; missing: string[] } {
  const config = getEnvConfig();
  const missing: string[] = [];

  if (!config.doubaoApiKey) {
    missing.push('VITE_DOUBAO_API_KEY');
  }

  if (!config.deepseekApiKey) {
    missing.push('VITE_DEEPSEEK_API_KEY');
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * 检查API密钥格式是否正确
 */
export function validateApiKeyFormat(): { valid: boolean; errors: string[] } {
  const config = getEnvConfig();
  const errors: string[] = [];

  // 验证豆包API密钥格式
  if (config.doubaoApiKey && !config.doubaoApiKey.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)) {
    errors.push('豆包API密钥格式不正确（应为UUID格式）');
  }

  // 验证DeepSeek API密钥格式
  if (config.deepseekApiKey && !config.deepseekApiKey.startsWith('sk-')) {
    errors.push('DeepSeek API密钥格式不正确（应以sk-开头）');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 获取API认证头
 */
export function getAuthHeaders(apiType: 'doubao' | 'deepseek'): { [key: string]: string } {
  const config = getEnvConfig();
  
  const baseHeaders = {
    'Content-Type': 'application/json',
  };

  switch (apiType) {
    case 'doubao':
      if (!config.doubaoApiKey) {
        throw new Error('豆包API密钥未配置');
      }
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${config.doubaoApiKey}`,
      };
    
    case 'deepseek':
      if (!config.deepseekApiKey) {
        throw new Error('DeepSeek API密钥未配置');
      }
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${config.deepseekApiKey}`,
      };
    
    default:
      throw new Error(`不支持的API类型: ${apiType}`);
  }
}

/**
 * 开发模式下的配置检查
 */
export function checkEnvConfigInDev(): void {
  if (import.meta.env.DEV) {
    const validation = validateEnvConfig();
    const formatValidation = validateApiKeyFormat();

    if (!validation.valid) {
      console.warn('⚠️ 环境变量配置检查:');
      console.warn('缺少以下环境变量:', validation.missing);
      console.warn('请检查 .env 文件是否正确配置');
    }

    if (!formatValidation.valid) {
      console.warn('⚠️ API密钥格式检查:');
      formatValidation.errors.forEach(error => {
        console.warn(`- ${error}`);
      });
    }

    if (validation.valid && formatValidation.valid) {
      console.log('✅ 环境变量配置检查通过');
      const config = getEnvConfig();
      console.log('📋 当前配置:');
      console.log(`- 豆包API: ${config.doubaoApiKey.substring(0, 8)}...`);
      console.log(`- DeepSeek API: ${config.deepseekApiKey.substring(0, 8)}...`);
    }
  }
}

/**
 * 生产环境下的配置检查
 */
export function checkEnvConfigInProd(): boolean {
  const validation = validateEnvConfig();
  const formatValidation = validateApiKeyFormat();

  if (!validation.valid || !formatValidation.valid) {
    console.error('❌ 生产环境配置检查失败');
    if (!validation.valid) {
      console.error('缺少环境变量:', validation.missing);
    }
    if (!formatValidation.valid) {
      console.error('格式错误:', formatValidation.errors);
    }
    return false;
  }

  return true;
}
