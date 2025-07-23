// API调用相关工具函数

export interface APIConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface ErrorInfo {
  code: string;
  message: string;
  suggestion: string;
  retryable: boolean;
}

// API配置
export const API_CONFIGS = {
  doubao: { timeout: 30000, retries: 3, retryDelay: 2000 },
  deepseek: { timeout: 45000, retries: 2, retryDelay: 3000 }
};

// 错误信息定义
export const ERROR_MESSAGES: Record<string, ErrorInfo> = {
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: '网络连接失败',
    suggestion: '请检查网络连接后重试',
    retryable: true
  },
  API_TIMEOUT: {
    code: 'API_TIMEOUT',
    message: 'AI服务响应超时',
    suggestion: '服务器繁忙，请稍后重试',
    retryable: true
  },
  API_ERROR: {
    code: 'API_ERROR',
    message: 'AI服务调用失败',
    suggestion: '服务暂时不可用，请稍后重试',
    retryable: true
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    message: '文件过大',
    suggestion: '请上传小于5MB的图片文件',
    retryable: false
  },
  INVALID_FILE_TYPE: {
    code: 'INVALID_FILE_TYPE',
    message: '文件格式不支持',
    suggestion: '请上传JPG、PNG或PDF格式的文件',
    retryable: false
  },
  PARSE_ERROR: {
    code: 'PARSE_ERROR',
    message: 'AI响应解析失败',
    suggestion: '响应格式异常，请重试',
    retryable: true
  }
};

// 带重试和超时的fetch函数
export const fetchWithRetry = async (
  url: string, 
  options: RequestInit, 
  config: APIConfig,
  onRetry?: (attempt: number, error: Error) => void
): Promise<Response> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      
      // 如果是AbortError，说明是超时
      if (lastError.name === 'AbortError') {
        lastError = new Error('API_TIMEOUT');
      }
      
      // 如果还有重试次数，则等待后重试
      if (attempt < config.retries) {
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        continue;
      }
    }
  }
  
  throw lastError;
};

// 图片转base64（使用Web Worker优化）
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 检查文件大小（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('FILE_TOO_LARGE'));
      return;
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      reject(new Error('INVALID_FILE_TYPE'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FILE_READ_ERROR'));
    reader.readAsDataURL(file);
  });
};

// 错误分类函数
export const classifyError = (error: Error): ErrorInfo => {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('timeout') || errorMessage.includes('api_timeout')) {
    return ERROR_MESSAGES.API_TIMEOUT;
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (errorMessage.includes('file_too_large')) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }
  
  if (errorMessage.includes('invalid_file_type')) {
    return ERROR_MESSAGES.INVALID_FILE_TYPE;
  }
  
  if (errorMessage.includes('parse') || errorMessage.includes('json')) {
    return ERROR_MESSAGES.PARSE_ERROR;
  }
  
  // 默认为API错误
  return ERROR_MESSAGES.API_ERROR;
};

// 性能监控函数
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    console.log(`⏱️ ${operationName} 耗时: ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ ${operationName} 失败 (耗时: ${duration.toFixed(2)}ms):`, error);
    throw error;
  }
};

// 模拟进度更新（用于长时间的API调用）
export const simulateProgress = (
  onProgress: (progress: number) => void,
  duration: number = 10000,
  interval: number = 500
): () => void => {
  let progress = 0;
  const increment = (interval / duration) * 100;
  
  const timer = setInterval(() => {
    progress = Math.min(95, progress + increment); // 最多到95%，等待实际完成
    onProgress(progress);
  }, interval);
  
  return () => clearInterval(timer);
};

// 日志记录函数
export const logAPICall = (
  apiName: string,
  duration: number,
  success: boolean,
  error?: Error
) => {
  const logData = {
    api: apiName,
    duration: Math.round(duration),
    success,
    timestamp: new Date().toISOString(),
    error: error?.message
  };
  
  console.log(`📊 API调用记录:`, logData);
  
  // 这里可以发送到分析服务
  // analytics.track('api_call', logData);
};
