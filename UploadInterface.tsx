import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, FileImage, X, CheckCircle, AlertCircle, TrendingUp, Activity, Heart, Droplets, Brain, Loader } from 'lucide-react';
import { Report, HealthMetric } from '../../types';
import { generateReportTitle, simulateOCRExtraction } from '../../utils/fileUtils';

interface UploadInterfaceProps {
  onUploadComplete: (report: Report) => void;
  onComprehensiveAnalysisComplete?: (analysis: string) => void;
  user: any;
  reports: any[];
  healthMetrics: HealthMetric[];
  comprehensiveAnalysis?: string | null;
}

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

export function UploadInterface({ onUploadComplete, onComprehensiveAnalysisComplete, user, reports, comprehensiveAnalysis: externalComprehensiveAnalysis }: UploadInterfaceProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [currentAnalysisReport, setCurrentAnalysisReport] = useState<Report | null>(null);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<string | null>(externalComprehensiveAnalysis || null);
  const [isComprehensiveAnalyzing, setIsComprehensiveAnalyzing] = useState(false);
  const [showComprehensiveModal, setShowComprehensiveModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 同步外部传入的综合分析数据
  useEffect(() => {
    setComprehensiveAnalysis(externalComprehensiveAnalysis || null);
  }, [externalComprehensiveAnalysis]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      preview: URL.createObjectURL(file),
      type: 'medical-report', // 使用通用类型，让AI自动识别具体类型
      status: 'pending',
      progress: 0
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const processFile = async (uploadFile: UploadFile) => {
    setUploadFiles(prev =>
      prev.map(f => f.id === uploadFile.id ? { ...f, status: 'processing', progress: 0 } : f)
    );

    // 模拟进度条
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadFiles(prev =>
        prev.map(f => f.id === uploadFile.id ? { ...f, progress } : f)
      );
    }

    try {
      // 1. 图片转base64
      const fileToBase64 = (file: File) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };
      const base64Url = await fileToBase64(uploadFile.file);
      console.log('base64长度:', base64Url.length);
      const requestBody = {
        model: 'doubao-1.5-vision-lite-250315',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '请识别图片中的文字内容，只输出识别到的原始文字，不要添加任何分析、解释或格式化。如果不是医疗报告，只输出提醒：请上传医学报告！' },
              { type: 'image_url', image_url: { url: base64Url } }
            ]
          }
        ]
      };
      console.log('豆包API请求体:', requestBody);
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DOUBAO_API_KEY}`,
        },
        body: JSON.stringify(requestBody)
      });
      // 这行代码的作用是：等待豆包API的响应，并将响应内容解析为JSON对象，赋值给data变量，供后续提取OCR识别内容使用。
      const data = await response.json();
      console.log('豆包API响应:', data);
      // 3. 解析豆包API返回内容
      let extractedData: Record<string, any> = {};
      let ocrContent = '';
      if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        const content = data.choices[0].message.content;
        ocrContent = Array.isArray(content) ? content.join('') : content;
        extractedData.ocrContent = ocrContent; // 只存豆包API内容
        console.log('豆包OCR内容:', ocrContent); // 调试用
      }

      // 4. 后续流程保持不变
      // DeepSeek医学建议
      let aiAdvice = '';
      let aiSummary = '';
      try {
        const historySummaries = reports.map(r => r.extractedData?.summary).filter(Boolean).join('\n\n');
        // 使用豆包API识别的原始内容作为DeepSeek分析的输入
        const reportContent = ocrContent || '无法识别报告内容';
        // 新的 prompt，要求 deepseek 返回结构化内容
        const prompt = `请根据以下内容，完成两项任务：\n1. 生成专业医学建议，内容简明、分点输出。\n2. 生成一份AI报告摘要，摘要内容必须包含：报告时间（时间精确到小时和分钟，根据报告内容提取，没有则填“缺省”）、类型（用AI从报告内容中总结提取具体检查类型，10个字以内，如“"血常规检查"、"B超检查"、"糖耐量测试"、"尿常规检查"等”）、关键异常指标（如“血红蛋白含量112g/L偏高”）、报告主要内容（500字以内，不显示字数）。\n\n格式要求：\n【AI分析建议】\n（分点输出）\n【AI报告摘要】\n报告时间：xxxx\n类型：xxxx\n关键异常指标：xxxx\n主要内容：xxxx\n\n以下是用户信息和报告内容：\n用户档案信息：\n${JSON.stringify(user, null, 2)}\n历史报告摘要：\n${historySummaries}\n本次报告内容：\n${reportContent}\n注意：不进行核实报告姓名与档案姓名不符的情况`;
        const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: '你是专业的孕妇健康管理专家。请对报告内容进行专业的分析' },
              { role: 'user', content: prompt }
            ]
          })
        });
        const deepseekData = await deepseekResponse.json();
        // 解析 deepseek 返回内容，分离 AI 建议和报告摘要
        const content = deepseekData.choices?.[0]?.message?.content || '';
        const adviceMatch = content.match(/【AI分析建议】([\s\S]*?)(?=【AI报告摘要】|$)/);
        const summaryMatch = content.match(/【AI报告摘要】([\s\S]*)/);
        aiAdvice = adviceMatch ? adviceMatch[1].trim() : '';
        aiSummary = summaryMatch ? summaryMatch[1].trim() : '';
      } catch (e) {
        aiAdvice = 'AI建议生成失败';
      }
      const analysis = generateAnalysis(extractedData, uploadFile.type);
      analysis.recommendations = aiAdvice.split(/\n|\r|\r\n/).filter(line => line.trim());
      // deepseek 解析后，aiSummary 作为摘要单独存储
      extractedData.summary = aiSummary; // 只存deepseek摘要

      // 从 AI 报告摘要中提取"类型"字段作为报告类型
      let extractedType = uploadFile.type; // 默认使用原始类型
      const typeMatch = aiSummary.match(/类型[：:]\s*([^\n\r]+)/);
      if (typeMatch && typeMatch[1]) {
        extractedType = typeMatch[1].trim();
      }

      const report: Report = {
        id: Math.random().toString(36).substring(2, 11),
        type: extractedType, // 使用从 AI 分析中提取的类型
        title: generateReportTitle(extractedType, new Date().toISOString()),
        date: new Date().toISOString().split('T')[0],
        imageUrl: uploadFile.preview,
        extractedData,
        analysis,
        status: 'completed',
        uploadedAt: new Date().toISOString()
      };

      setUploadFiles(prev =>
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'completed' } : f)
      );

      // Show analysis result directly on page
      setCurrentAnalysisReport(report);
      onUploadComplete(report);

      setTimeout(() => {
        removeFile(uploadFile.id);
      }, 2000);

    } catch (error) {
      setUploadFiles(prev =>
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'failed' } : f)
      );
    }
  };

  const generateAnalysis = (data: Record<string, any>, type: string) => {
    // Simple analysis generation based on extracted data
    const alerts = [];
    const recommendations = [];

    if (type === 'blood') {
      if (data.hemoglobin < 110) {
        alerts.push({ level: 'medium' as const, message: '血红蛋白偏低，建议补铁' });
        recommendations.push('增加富含铁质的食物摄入');
      }
      if (data.glucose > 7.0) {
        alerts.push({ level: 'high' as const, message: '血糖偏高，需要关注' });
        recommendations.push('控制糖分摄入，适量运动');
      }
    }

    return {
      summary: '报告已成功分析，各项指标基本正常。',
      alerts,
      recommendations: recommendations.length > 0 ? recommendations : ['继续保持健康的生活方式', '定期复查']
    };
  };

  const processAllFiles = () => {
    uploadFiles.filter(f => f.status === 'pending').forEach(processFile);
  };

  // 综合分析功能
  const performComprehensiveAnalysis = async () => {
    setIsComprehensiveAnalyzing(true);
    setComprehensiveAnalysis(null);

    try {
      // 准备分析数据
      const reportTypesInfo = reports.map(r => `${r.type}: ${r.title}`).join(', ');

      // 构建综合分析的prompt
      const comprehensivePrompt = `
作为专业的孕期健康顾问，请对以下孕妇进行全面的综合健康分析：

【用户档案信息】
- 姓名：${user.name}
- 当前孕周：${user.currentWeek}周
- 预产期：${user.dueDate}
- 末次月经：${user.lastMenstrualPeriod}
- 病史：${user.medicalHistory?.join(', ') || '无特殊病史'}

【现有报告数据】（共${reports.length}份报告）
${reports.map((r, index) => `
${index + 1}. ${r.title} (${r.date})
   - 报告类型：${r.type}
   - AI识别内容：${r.extractedData?.ocrContent || '无识别内容'}
   - AI分析摘要：${r.extractedData?.summary || '无分析摘要'}
   - 建议：${r.analysis?.recommendations?.join('；') || '无建议'}
`).join('')}

【现有报告类型】
${reportTypesInfo || '无报告'}

请按以下格式提供综合分析（每个部分都要详细分析）：

【📊 综合健康评估】
基于现有${reports.length}份报告和用户档案，对整体健康状况进行评估

【📈 孕期发展趋势】
根据报告时间序列分析健康指标变化趋势和发展规律

【⚠️ 风险识别与预警】
识别潜在风险因素，包括异常指标和需要关注的问题

【🔍 检查建议分析】
- 基于当前孕周${user.currentWeek}周，分析现有报告的完整性
- 根据标准产检流程，建议需要补充的检查项目
- 检查优先级排序（高/中/低）

【💡 个性化健康建议】
1. 生活方式调整建议
2. 营养补充具体建议
3. 日常监测重点
4. 心理健康关注

【📋 下一步行动计划】
具体的时间节点和检查安排，包括：
- 近期（1-2周内）需要完成的检查
- 中期（1个月内）的健康管理重点
- 长期（到分娩前）的整体规划
`;

      // 调用DeepSeek API进行综合分析
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是专业的孕期健康顾问和医学分析专家，具有丰富的产科临床经验。请提供专业、详细、实用的综合健康分析。'
            },
            { role: 'user', content: comprehensivePrompt }
          ]
        })
      });

      const data = await response.json();
      const analysisResult = data.choices?.[0]?.message?.content || '分析生成失败，请稍后重试';

      setComprehensiveAnalysis(analysisResult);
      // 调用回调函数，将分析结果传递给App组件进行存储
      if (onComprehensiveAnalysisComplete) {
        onComprehensiveAnalysisComplete(analysisResult);
      }
    } catch (error) {
      console.error('综合分析失败:', error);
      setComprehensiveAnalysis('综合分析失败，请检查网络连接后重试');
    } finally {
      setIsComprehensiveAnalyzing(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-md mx-auto px-4 pt-6 content-safe-bottom">
        {/* Header with gradient background */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI智能分析
          </h1>
          <p className="text-gray-600 text-sm">上传医疗报告，获得专业AI分析建议</p>
        </div>

        {/* Upload Methods with enhanced design */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Camera size={24} />
                </div>
                <span className="font-semibold text-sm">拍照上传</span>
                <span className="text-xs text-blue-100 mt-1">快速拍摄</span>
              </div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <FileImage size={24} />
                </div>
                <span className="font-semibold text-sm">选择文件</span>
                <span className="text-xs text-green-100 mt-1">从相册选择</span>
              </div>
            </button>
          </div>
        </div>
      {/* File Inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
        {/* Upload Queue with enhanced design */}
        {uploadFiles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Upload size={16} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">处理队列</h3>
              </div>
              {uploadFiles.some(f => f.status === 'pending') && (
                <button
                  onClick={processAllFiles}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  开始处理
                </button>
              )}
            </div>
            <div className="space-y-4">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img src={uploadFile.preview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        {uploadFile.status === 'completed' && <CheckCircle size={12} className="text-white" />}
                        {uploadFile.status === 'processing' && <Loader size={12} className="text-white animate-spin" />}
                        {uploadFile.status === 'failed' && <AlertCircle size={12} className="text-white" />}
                        {uploadFile.status === 'pending' && <Upload size={12} className="text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800 truncate">{uploadFile.file.name}</span>
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex items-center space-x-3">
                        {uploadFile.status === 'processing' && (
                          <>
                            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                                style={{ width: `${uploadFile.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-purple-600">{uploadFile.progress}%</span>
                          </>
                        )}
                        {uploadFile.status === 'completed' && (
                          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            <CheckCircle size={16} className="mr-2" />
                            <span className="text-sm font-medium">处理完成</span>
                          </div>
                        )}
                        {uploadFile.status === 'failed' && (
                          <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full">
                            <AlertCircle size={16} className="mr-2" />
                            <span className="text-sm font-medium">处理失败</span>
                          </div>
                        )}
                        {uploadFile.status === 'pending' && (
                          <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                            <Upload size={16} className="mr-2" />
                            <span className="text-sm font-medium">等待处理</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Upload Tips with compact design */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
              <TrendingUp size={12} className="text-white" />
            </div>
            <h4 className="text-sm font-semibold text-gray-700">上传小贴士</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>确保图片清晰</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <span>支持常见格式</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>可批量上传</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
              <span>AI自动分析</span>
            </div>
          </div>
        </div>
        {/* Comprehensive Analysis Button with enhanced design */}
        {reports.length > 0 && (
          <div className="mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                        <Brain size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">AI综合健康分析</h3>
                        <p className="text-purple-100 text-sm">智能分析您的健康状况</p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-100">已上传报告</span>
                        <span className="font-bold text-white">{reports.length} 份</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min(reports.length * 25, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={performComprehensiveAnalysis}
                  disabled={isComprehensiveAnalyzing}
                  className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 backdrop-blur-sm text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-105 disabled:hover:scale-100 shadow-lg"
                >
                  {isComprehensiveAnalyzing ? (
                    <>
                      <Loader size={24} className="animate-spin" />
                      <span className="text-lg">AI正在深度分析中...</span>
                    </>
                  ) : (
                    <>
                      <Brain size={24} />
                      <span className="text-lg">开始综合分析</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}



        {/* AI Comprehensive Analysis Card */}
        {reports.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Brain size={16} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">AI综合健康分析</h3>
              </div>

            </div>

            <div className="space-y-4">
              {comprehensiveAnalysis ? (
                <div
                  className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => setShowComprehensiveModal(true)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Brain size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-800 text-lg">综合健康分析报告</h4>
                        <div className="bg-green-100 px-3 py-1 rounded-full flex items-center space-x-1">
                          <CheckCircle size={12} className="text-green-600" />
                          <span className="text-xs font-medium text-green-600">已完成</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {comprehensiveAnalysis.length > 100 ? comprehensiveAnalysis.substring(0, 100) + '...' : comprehensiveAnalysis}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <TrendingUp size={12} />
                            <span>基于 {reports.length} 份报告</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity size={12} />
                            <span>最新分析</span>
                          </div>
                        </div>
                        <div className="text-xs text-purple-600 font-medium">点击查看详情 →</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain size={24} className="text-gray-400" />
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">暂无综合分析</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      上传报告后，可在分析页面进行AI综合健康分析
                    </p>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">
                        💡 综合分析将基于您的档案信息和所有报告，提供个性化的健康评估和建议
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Analysis Result Display with enhanced design */}
        {currentAnalysisReport && (
          <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/50 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">分析完成</h3>
                    <p className="text-pink-100 text-sm">{currentAnalysisReport.title}</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* AI内容识别 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <FileImage size={16} className="text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-blue-800">AI内容识别</h4>
                </div>
                <div className="bg-white/70 rounded-xl p-4 text-sm text-blue-900 whitespace-pre-line leading-relaxed">
                  {currentAnalysisReport.extractedData?.ocrContent || '暂无AI识别内容'}
                </div>
              </div>

              {/* AI建议 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                    <Heart size={16} className="text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-green-800">AI健康建议</h4>
                </div>
                <div className="space-y-2">
                  {currentAnalysisReport.analysis.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white/70 rounded-xl p-3 flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span className="text-sm text-green-900 font-medium">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 报告摘要 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-purple-800">报告摘要</h4>
                </div>
                <div className="bg-white/70 rounded-xl p-4 text-sm text-purple-900 whitespace-pre-line leading-relaxed">
                  {currentAnalysisReport.extractedData?.summary || '暂无报告摘要'}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setCurrentAnalysisReport(null)}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={20} />
                  <span>完成查看</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Analysis Modal */}
        {showComprehensiveModal && comprehensiveAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Brain size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">AI综合健康分析报告</h2>
                      <p className="text-purple-100 text-sm">基于 {reports.length} 份报告的专业分析</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowComprehensiveModal(false)}
                    className="text-white hover:text-purple-200 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="prose prose-sm max-w-none">
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {comprehensiveAnalysis}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}