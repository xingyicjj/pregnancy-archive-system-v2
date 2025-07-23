import React from 'react';
import { CheckCircle, Loader, AlertCircle, Circle, Clock, Zap } from 'lucide-react';
import { ProcessingStage, StatusMessage } from '../../utils/progressTracker';

interface ProcessingProgressProps {
  stages: ProcessingStage[];
  currentStage: ProcessingStage;
  totalProgress: number;
  statusMessage?: StatusMessage;
  isVisible: boolean;
}

export function ProcessingProgress({ 
  stages, 
  currentStage, 
  totalProgress, 
  statusMessage,
  isVisible 
}: ProcessingProgressProps) {
  if (!isVisible) return null;

  const getStageIcon = (stage: ProcessingStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStageStatusColor = (stage: ProcessingStage) => {
    switch (stage.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI智能分析中</h3>
              <p className="text-blue-100 text-sm">请稍候，正在处理您的医疗报告</p>
            </div>
          </div>
          
          {/* 总进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>总体进度</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 当前状态消息 */}
        {statusMessage && (
          <div className="p-4 border-b border-gray-100">
            <div className={`p-3 rounded-lg border ${
              statusMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              statusMessage.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <div>
                  <p className="font-medium text-sm">{statusMessage.title}</p>
                  <p className="text-xs opacity-80">{statusMessage.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 处理阶段列表 */}
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center space-x-3">
              {/* 阶段图标 */}
              <div className="flex-shrink-0">
                {getStageIcon(stage)}
              </div>
              
              {/* 阶段内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${
                    stage.status === 'completed' ? 'text-green-600' :
                    stage.status === 'processing' ? 'text-blue-600' :
                    stage.status === 'failed' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {stage.name}
                  </h4>
                  {stage.status === 'processing' && (
                    <span className="text-xs text-blue-500 font-medium">
                      {stage.progress}%
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {stage.description}
                </p>
                
                {/* 阶段进度条 */}
                {stage.status === 'processing' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-500 rounded-full h-1 transition-all duration-300"
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* 完成时间显示 */}
                {stage.status === 'completed' && stage.startTime && stage.endTime && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ 完成 ({((stage.endTime - stage.startTime) / 1000).toFixed(1)}s)
                  </div>
                )}
                
                {/* 失败信息 */}
                {stage.status === 'failed' && (
                  <div className="text-xs text-red-600 mt-1">
                    ✗ 处理失败
                  </div>
                )}
              </div>
              
              {/* 连接线 */}
              {index < stages.length - 1 && (
                <div className="absolute left-6 mt-8 w-px h-4 bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>AI正在努力工作中，请耐心等待...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 简化版进度条组件（用于按钮内显示）
interface SimpleProgressProps {
  progress: number;
  stage: string;
  className?: string;
}

export function SimpleProgress({ progress, stage, className = '' }: SimpleProgressProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Loader className="w-5 h-5 animate-spin" />
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span>{stage}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1">
          <div 
            className="bg-white rounded-full h-1 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// 错误显示组件
interface ErrorDisplayProps {
  error: {
    code: string;
    message: string;
    suggestion: string;
    retryable: boolean;
  };
  onRetry?: () => void;
  onClose: () => void;
}

export function ErrorDisplay({ error, onRetry, onClose }: ErrorDisplayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">处理失败</h3>
              <p className="text-red-600 text-sm">{error.message}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">{error.suggestion}</p>
          </div>
          
          <div className="flex space-x-3">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                重试
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
