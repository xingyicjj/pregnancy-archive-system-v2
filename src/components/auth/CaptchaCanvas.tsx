import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { CaptchaData } from '../../types';

interface CaptchaCanvasProps {
  onCaptchaGenerated: (captcha: CaptchaData) => void;
  className?: string;
}

export function CaptchaCanvas({ onCaptchaGenerated, className = '' }: CaptchaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateRandomString = (length: number = 4): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const text = generateRandomString();
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 设置背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 绘制干扰线
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // 绘制噪点
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.4)`;
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    // 绘制文字
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = (width / text.length) * (i + 0.5);
      const y = height / 2 + (Math.random() - 0.5) * 10;
      
      // 随机颜色
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 40%)`;
      
      // 随机旋转
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.5);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // 获取图片数据
    const dataUrl = canvas.toDataURL();
    
    onCaptchaGenerated({
      text,
      dataUrl
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // 添加一个小延迟以显示刷新动画
    await new Promise(resolve => setTimeout(resolve, 300));
    drawCaptcha();
    setIsRefreshing(false);
  };

  useEffect(() => {
    drawCaptcha();
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        width={120}
        height={40}
        className="border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-pink-300 transition-colors"
        onClick={handleRefresh}
      />
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="absolute -right-8 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-pink-500 transition-colors disabled:opacity-50"
        title="刷新验证码"
      >
        <RefreshCw 
          size={16} 
          className={`${isRefreshing ? 'animate-spin' : ''}`}
        />
      </button>
    </div>
  );
}
