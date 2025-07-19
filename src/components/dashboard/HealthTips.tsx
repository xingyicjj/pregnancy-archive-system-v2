import React from 'react';
import { Lightbulb, Heart, Baby } from 'lucide-react';

export function HealthTips() {
  const tips = [
    {
      icon: Heart,
      title: '孕期营养',
      content: '多补充叶酸和钙质，保持营养均衡',
      gradient: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50'
    },
    {
      icon: Baby,
      title: '胎动监测',
      content: '每天固定时间观察胎动情况',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      icon: Lightbulb,
      title: '生活习惯',
      content: '保持规律作息，适量运动',
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50'
    }
  ];

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
          <Lightbulb size={16} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">健康小贴士</h3>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${tip.bgColor} rounded-2xl p-5 border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] shadow-lg`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${tip.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                <tip.icon size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg mb-2">{tip.title}</h4>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{tip.content}</p>
                <div className="mt-3 w-full bg-white/50 rounded-full h-1">
                  <div className={`bg-gradient-to-r ${tip.gradient} h-1 rounded-full`} style={{ width: `${(index + 1) * 30}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}