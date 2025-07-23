import React, { useState } from 'react';
import { Calculator, Calendar, Clock } from 'lucide-react';

export function PregnancyCalculatorTest() {
  const [lmpDate, setLmpDate] = useState('2025-01-21');
  const [currentDate, setCurrentDate] = useState('2025-07-19');
  const [result, setResult] = useState<any>(null);

  const calculatePregnancy = () => {
    const lmp = new Date(lmpDate);
    const current = new Date(currentDate);
    
    // 计算时间差
    const diffTime = current.getTime() - lmp.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    
    // 计算预产期（280天后）
    const dueDate = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
    
    // 计算距离预产期的天数
    const daysUntilDue = Math.ceil((dueDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    
    setResult({
      lmpDate: lmp.toLocaleDateString('zh-CN'),
      currentDate: current.toLocaleDateString('zh-CN'),
      diffDays,
      diffWeeks,
      remainingDays,
      pregnancyWeeks: `${diffWeeks}周${remainingDays > 0 ? `${remainingDays}天` : ''}`,
      dueDate: dueDate.toLocaleDateString('zh-CN'),
      dueDateISO: dueDate.toISOString().split('T')[0],
      daysUntilDue,
      trimester: diffWeeks <= 12 ? 1 : diffWeeks <= 28 ? 2 : 3,
      isValid: diffTime > 0 && diffWeeks <= 42
    });
  };

  React.useEffect(() => {
    calculatePregnancy();
  }, [lmpDate, currentDate]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center mb-6">
        <Calculator className="text-pink-500 mr-3" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">孕周计算器测试</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            末次月经日期
          </label>
          <input
            type="date"
            value={lmpDate}
            onChange={(e) => setLmpDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            当前日期
          </label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Clock className="mr-2" size={20} />
              计算结果
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">末次月经:</span>
                  <span className="font-medium">{result.lmpDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">当前日期:</span>
                  <span className="font-medium">{result.currentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">相差天数:</span>
                  <span className="font-medium">{result.diffDays}天</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">相差周数:</span>
                  <span className="font-medium">{result.diffWeeks}周</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">当前孕周:</span>
                  <span className="font-bold text-pink-600 text-lg">{result.pregnancyWeeks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">预产期:</span>
                  <span className="font-medium">{result.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">距离预产期:</span>
                  <span className="font-medium">{result.daysUntilDue}天</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">孕期阶段:</span>
                  <span className="font-medium">
                    {result.trimester === 1 ? '孕早期' : result.trimester === 2 ? '孕中期' : '孕晚期'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${result.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${result.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${result.isValid ? 'text-green-800' : 'text-red-800'}`}>
                {result.isValid ? '计算结果有效' : '计算结果异常（可能日期设置有误）'}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">调试信息</h4>
            <pre className="text-sm text-blue-700 overflow-x-auto">
{JSON.stringify({
  lmpDate: lmpDate,
  currentDate: currentDate,
  diffDays: result.diffDays,
  diffWeeks: result.diffWeeks,
  remainingDays: result.remainingDays,
  dueDateISO: result.dueDateISO,
  daysUntilDue: result.daysUntilDue
}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
