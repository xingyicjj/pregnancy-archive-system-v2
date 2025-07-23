import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';
import { validateEnvConfig, validateApiKeyFormat, getEnvConfig } from '../../utils/envUtils';

export function EnvConfigChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    envValid: boolean;
    formatValid: boolean;
    missing: string[];
    errors: string[];
  }>({
    envValid: false,
    formatValid: false,
    missing: [],
    errors: []
  });

  useEffect(() => {
    const envValidation = validateEnvConfig();
    const formatValidation = validateApiKeyFormat();
    
    setConfigStatus({
      envValid: envValidation.valid,
      formatValid: formatValidation.valid,
      missing: envValidation.missing,
      errors: formatValidation.errors
    });
  }, []);

  const config = getEnvConfig();
  const isAllValid = configStatus.envValid && configStatus.formatValid;

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const maskKey = (key: string) => {
    if (!key) return '未设置';
    if (key.length <= 8) return key;
    return `${key.substring(0, 8)}...`;
  };

  return (
    <>
      {/* 触发按钮 */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`p-2 rounded-lg shadow-lg transition-colors ${
            isAllValid 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
          title="环境变量配置检查"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* 配置检查面板 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {/* 标题 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Settings className="text-blue-500" size={24} />
                <h3 className="text-lg font-bold text-gray-800">环境变量配置</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 总体状态 */}
            <div className={`mb-4 p-3 rounded-lg border ${
              isAllValid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center space-x-2">
                {isAllValid ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <AlertTriangle className="text-orange-600" size={20} />
                )}
                <span className={`font-medium ${
                  isAllValid ? 'text-green-800' : 'text-orange-800'
                }`}>
                  {isAllValid ? '配置正常' : '配置需要检查'}
                </span>
              </div>
            </div>

            {/* 详细状态 */}
            <div className="space-y-3">
              {/* 环境变量检查 */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {configStatus.envValid ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <AlertTriangle className="text-orange-600" size={16} />
                  )}
                  <span className="font-medium text-gray-700">环境变量</span>
                </div>
                {configStatus.missing.length > 0 && (
                  <div className="text-sm text-orange-700">
                    <p>缺少以下环境变量：</p>
                    <ul className="list-disc list-inside ml-2">
                      {configStatus.missing.map(key => (
                        <li key={key}>{key}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 格式检查 */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {configStatus.formatValid ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <AlertTriangle className="text-orange-600" size={16} />
                  )}
                  <span className="font-medium text-gray-700">密钥格式</span>
                </div>
                {configStatus.errors.length > 0 && (
                  <div className="text-sm text-orange-700">
                    <ul className="list-disc list-inside">
                      {configStatus.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 当前配置 */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">当前配置</span>
                  <button
                    onClick={() => setShowKeys(!showKeys)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showKeys ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-600">豆包API: </span>
                    <span className="font-mono">
                      {showKeys ? config.doubaoApiKey || '未设置' : maskKey(config.doubaoApiKey)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">DeepSeek API: </span>
                    <span className="font-mono">
                      {showKeys ? config.deepseekApiKey || '未设置' : maskKey(config.deepseekApiKey)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 帮助信息 */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 配置说明</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• 环境变量配置在 <code>.env</code> 文件中</p>
                <p>• 参考 <code>.env.example</code> 文件格式</p>
                <p>• 豆包密钥格式：UUID（8-4-4-4-12）</p>
                <p>• DeepSeek密钥格式：以 sk- 开头</p>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div className="mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
