import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, Heart, Droplets } from 'lucide-react';
import { HealthMetric } from '../../types';

interface AnalysisChartsProps {
  healthMetrics: HealthMetric[];
  comprehensiveAnalysis?: string | null;
  onViewComprehensiveAnalysis?: () => void;
}

export function AnalysisCharts({ healthMetrics, comprehensiveAnalysis, onViewComprehensiveAnalysis }: AnalysisChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'bloodPressure' | 'heartRate' | 'glucose'>('weight');

  const chartData = healthMetrics.map(metric => ({
    date: new Date(metric.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    weight: metric.weight,
    systolic: metric.bloodPressure.systolic,
    diastolic: metric.bloodPressure.diastolic,
    heartRate: metric.heartRate,
    glucose: metric.glucose || 0
  })).reverse();

  const metrics = [
    {
      key: 'weight' as const,
      label: '体重变化',
      icon: TrendingUp,
      color: '#EC4899',
      unit: 'kg',
      current: healthMetrics[0]?.weight || 0,
      change: healthMetrics.length > 1 ? 
        ((healthMetrics[0]?.weight || 0) - (healthMetrics[1]?.weight || 0)).toFixed(1) : '0'
    },
    {
      key: 'bloodPressure' as const,
      label: '血压监测',
      icon: Activity,
      color: '#8B5CF6',
      unit: 'mmHg',
      current: healthMetrics[0]?.bloodPressure.systolic || 0,
      change: healthMetrics.length > 1 ? 
        ((healthMetrics[0]?.bloodPressure.systolic || 0) - (healthMetrics[1]?.bloodPressure.systolic || 0)).toString() : '0'
    },
    {
      key: 'heartRate' as const,
      label: '心率变化',
      icon: Heart,
      color: '#10B981',
      unit: 'bpm',
      current: healthMetrics[0]?.heartRate || 0,
      change: healthMetrics.length > 1 ? 
        ((healthMetrics[0]?.heartRate || 0) - (healthMetrics[1]?.heartRate || 0)).toString() : '0'
    },
    {
      key: 'glucose' as const,
      label: '血糖水平',
      icon: Droplets,
      color: '#F59E0B',
      unit: 'mmol/L',
      current: healthMetrics[0]?.glucose || 0,
      change: healthMetrics.length > 1 ? 
        ((healthMetrics[0]?.glucose || 0) - (healthMetrics[1]?.glucose || 0)).toFixed(1) : '0'
    }
  ];

  const getChartComponent = () => {
    switch (selectedMetric) {
      case 'weight':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#EC4899" strokeWidth={3} dot={{ fill: '#EC4899', strokeWidth: 2, r: 6 }} />
          </LineChart>
        );
      case 'bloodPressure':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="systolic" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }} name="收缩压" />
            <Line type="monotone" dataKey="diastolic" stroke="#A855F7" strokeWidth={3} dot={{ fill: '#A855F7', strokeWidth: 2, r: 6 }} name="舒张压" />
          </LineChart>
        );
      case 'heartRate':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="heartRate" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'glucose':
        return (
          <LineChart data={chartData.filter(d => d.glucose > 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="glucose" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }} />
          </LineChart>
        );
      default:
        return null;
    }
  };

  const selectedMetricData = metrics.find(m => m.key === selectedMetric);

  return (
    <div className="max-w-md mx-auto px-4 pt-6 content-safe-bottom">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">数据分析</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedMetric === metric.key
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon size={20} style={{ color: metric.color }} />
              <span className={`text-sm font-medium ${
                parseFloat(metric.change) > 0 ? 'text-red-500' : 
                parseFloat(metric.change) < 0 ? 'text-green-500' : 'text-gray-500'
              }`}>
                {parseFloat(metric.change) > 0 ? '+' : ''}{metric.change}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{metric.label}</h3>
            <p className="text-lg font-bold" style={{ color: metric.color }}>
              {metric.current} {metric.unit}
            </p>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedMetricData?.label}
          </h3>
          <div className="flex items-center space-x-2">
            <selectedMetricData.icon size={20} style={{ color: selectedMetricData.color }} />
            <span className="text-sm text-gray-500">最近6次记录</span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {getChartComponent()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI综合健康分析 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Activity className="mr-2 text-purple-600" size={20} />
            AI综合健康分析
          </h3>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
          {comprehensiveAnalysis ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {comprehensiveAnalysis}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Activity size={32} className="mb-2 opacity-50" />
              <p className="text-sm">暂无综合分析</p>
              <p className="text-xs mt-1">上传报告后，可在分析页面进行AI综合健康分析</p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">AI 分析摘要</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-700">整体健康指标处于正常范围内</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-700">体重增长趋势符合孕期正常范围</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-700">血压稳定，建议继续监测</p>
          </div>
        </div>
      </div>
    </div>
  );
}