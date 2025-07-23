// 进度追踪相关类型定义
export interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  weight: number; // 该阶段占总进度的权重
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  progress: number; // 0-100
}

export interface StatusMessage {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
  timestamp: number;
  duration?: number;
}

export interface PerformanceMetrics {
  uploadTime: number;
  ocrTime: number;
  analysisTime: number;
  totalTime: number;
  fileSize: number;
  apiResponseTimes: {
    doubao: number;
    deepseek: number;
  };
  errorCount: number;
  retryCount: number;
}

// 处理阶段定义
export const PROCESSING_STAGES: ProcessingStage[] = [
  {
    id: 'upload',
    name: '文件准备',
    description: '正在准备上传医疗报告图片...',
    weight: 10,
    status: 'pending',
    progress: 0
  },
  {
    id: 'ocr',
    name: 'AI文字识别',
    description: '正在使用豆包AI识别报告中的文字内容...',
    weight: 30,
    status: 'pending',
    progress: 0
  },
  {
    id: 'analysis',
    name: 'AI医学分析',
    description: '正在使用DeepSeek AI分析报告内容并生成建议...',
    weight: 50,
    status: 'pending',
    progress: 0
  },
  {
    id: 'finalize',
    name: '生成报告',
    description: '正在整理分析结果并生成最终报告...',
    weight: 10,
    status: 'pending',
    progress: 0
  }
];

// 综合分析阶段定义
export const COMPREHENSIVE_ANALYSIS_STAGES: ProcessingStage[] = [
  {
    id: 'prepare',
    name: '数据准备',
    description: '正在整理用户档案和历史报告数据...',
    weight: 20,
    status: 'pending',
    progress: 0
  },
  {
    id: 'analysis',
    name: 'AI综合分析',
    description: '正在使用DeepSeek AI进行深度综合健康分析...',
    weight: 70,
    status: 'pending',
    progress: 0
  },
  {
    id: 'finalize',
    name: '生成报告',
    description: '正在整理综合分析结果...',
    weight: 10,
    status: 'pending',
    progress: 0
  }
];

// 进度追踪器类
export class ProgressTracker {
  private stages: ProcessingStage[];
  private currentStageIndex: number = 0;
  private onProgressUpdate: (progress: number, stage: ProcessingStage, stages: ProcessingStage[]) => void;
  private startTime: number;

  constructor(
    stages: ProcessingStage[],
    onUpdate: (progress: number, stage: ProcessingStage, stages: ProcessingStage[]) => void
  ) {
    // 创建完全独立的副本，确保每次都是全新状态
    this.stages = stages.map(stage => ({
      ...stage,
      status: 'pending' as const,
      progress: 0,
      startTime: undefined,
      endTime: undefined
    }));
    this.onProgressUpdate = onUpdate;
    this.startTime = Date.now();
    this.currentStageIndex = 0;
  }

  startStage(stageId: string) {
    const stageIndex = this.stages.findIndex(s => s.id === stageId);
    if (stageIndex !== -1) {
      this.currentStageIndex = stageIndex;
      this.stages[stageIndex].status = 'processing';
      this.stages[stageIndex].startTime = Date.now();
      this.stages[stageIndex].progress = 0;
      this.updateProgress();
    }
  }

  updateStageProgress(stageId: string, progress: number) {
    const stage = this.stages.find(s => s.id === stageId);
    if (stage && stage.status === 'processing') {
      stage.progress = Math.min(100, Math.max(0, progress));
      this.updateProgress();
    }
  }

  completeStage(stageId: string) {
    const stage = this.stages.find(s => s.id === stageId);
    if (stage) {
      stage.status = 'completed';
      stage.progress = 100;
      stage.endTime = Date.now();
      this.updateProgress();
    }
  }

  failStage(stageId: string, error?: string) {
    const stage = this.stages.find(s => s.id === stageId);
    if (stage) {
      stage.status = 'failed';
      stage.endTime = Date.now();
      this.updateProgress();
    }
  }

  private updateProgress() {
    let totalProgress = 0;
    
    for (const stage of this.stages) {
      if (stage.status === 'completed') {
        totalProgress += stage.weight;
      } else if (stage.status === 'processing') {
        totalProgress += (stage.weight * stage.progress) / 100;
      }
    }
    
    const currentStage = this.stages[this.currentStageIndex];
    this.onProgressUpdate(totalProgress, currentStage, this.stages);
  }

  getMetrics(): Partial<PerformanceMetrics> {
    const totalTime = Date.now() - this.startTime;
    const completedStages = this.stages.filter(s => s.status === 'completed');
    
    return {
      totalTime,
      errorCount: this.stages.filter(s => s.status === 'failed').length
    };
  }

  reset() {
    this.stages.forEach(stage => {
      stage.status = 'pending';
      stage.progress = 0;
      stage.startTime = undefined;
      stage.endTime = undefined;
    });
    this.currentStageIndex = 0;
    this.startTime = Date.now();
  }
}

// 状态消息定义
export const STATUS_MESSAGES = {
  UPLOAD_START: {
    type: 'info' as const,
    title: '开始处理',
    description: '正在准备处理您的医疗报告...'
  },
  OCR_START: {
    type: 'info' as const,
    title: 'AI识别中',
    description: '正在使用豆包AI识别报告中的文字内容，这可能需要几秒钟...'
  },
  OCR_SUCCESS: {
    type: 'success' as const,
    title: '识别完成',
    description: '已成功识别报告内容，开始医学分析...'
  },
  ANALYSIS_START: {
    type: 'info' as const,
    title: '医学分析中',
    description: '正在使用DeepSeek AI分析报告内容并生成专业建议...'
  },
  ANALYSIS_SUCCESS: {
    type: 'success' as const,
    title: '分析完成',
    description: '已完成AI医学分析，正在生成最终报告...'
  },
  COMPLETE: {
    type: 'success' as const,
    title: '处理完成',
    description: '报告已成功处理并保存！'
  },
  COMPREHENSIVE_START: {
    type: 'info' as const,
    title: '综合分析中',
    description: '正在对您的所有报告进行深度综合分析...'
  },
  COMPREHENSIVE_SUCCESS: {
    type: 'success' as const,
    title: '综合分析完成',
    description: '已完成综合健康分析，为您生成了详细的健康报告！'
  }
};
