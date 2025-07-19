export function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export function generateReportTitle(type: string, date: string): string {
  const formattedDate = new Date(date).toLocaleDateString('zh-CN');
  // 如果type是通用类型，使用默认标题，否则使用type作为标题
  const reportName = type === 'medical-report' ? '健康检查报告' : type;
  return `${reportName} - ${formattedDate}`;
}

export function simulateOCRExtraction(type: string): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 返回通用的模拟数据，不依赖特定类型
      const mockData = {
        extractedText: `模拟提取的${type}报告内容`,
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0的置信度
        timestamp: new Date().toISOString()
      };

      resolve(mockData);
    }, 2000);
  });
}