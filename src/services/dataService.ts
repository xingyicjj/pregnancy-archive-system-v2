/**
 * 数据导出导入服务
 * 用于备份和恢复用户数据
 */

export interface ExportData {
  version: string;
  exportDate: string;
  userData: {
    registeredUsers: any[]; // 包含用户头像的Base64数据
    currentUser: any;       // 当前用户信息
    reports: any[];         // 包含报告图片的Base64数据
    healthMetrics: any[];   // 健康指标数据
    comprehensiveAnalysis: string | null; // 综合分析结果
  };
  metadata: {
    totalUsers: number;
    totalReports: number;
    totalMetrics: number;
    appVersion: string;
    imageDataIncluded: boolean; // 标识是否包含图片数据
  };
}

/**
 * 导出所有数据
 */
export function exportAllData(): ExportData {
  try {
    // 获取所有localStorage数据
    const registeredUsers = JSON.parse(localStorage.getItem('pregnancy-registered-users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('pregnancy-auth-user') || 'null');
    const reports = JSON.parse(localStorage.getItem('pregnancy-reports') || '[]');
    const healthMetrics = JSON.parse(localStorage.getItem('pregnancy-metrics') || '[]');
    const comprehensiveAnalysis = JSON.parse(localStorage.getItem('pregnancy-comprehensive-analysis') || 'null');

    // 检查是否包含图片数据
    const hasImageData = reports.some((report: any) =>
      report.imageUrl && report.imageUrl.startsWith('data:image/')
    ) || registeredUsers.some((user: any) =>
      user.avatar && user.avatar.startsWith('data:image/')
    );

    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      userData: {
        registeredUsers,
        currentUser,
        reports,
        healthMetrics,
        comprehensiveAnalysis,
      },
      metadata: {
        totalUsers: registeredUsers.length,
        totalReports: reports.length,
        totalMetrics: healthMetrics.length,
        appVersion: '1.0.0',
        imageDataIncluded: hasImageData,
      },
    };

    return exportData;
  } catch (error) {
    console.error('导出数据失败:', error);
    throw new Error('导出数据失败，请稍后重试');
  }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 导出数据为JSON文件
 */
export function downloadDataAsFile(filename?: string): void {
  try {
    const data = exportAllData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 记录文件大小信息
    const fileSize = formatFileSize(blob.size);
    console.log(`📁 导出文件大小: ${fileSize}`);
    console.log(`📸 包含图片数据: ${data.metadata.imageDataIncluded ? '是' : '否'}`);

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `pregnancy-data-backup-${new Date().toISOString().split('T')[0]}.json`;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理URL对象
    URL.revokeObjectURL(url);

    console.log('✅ 数据导出成功');
  } catch (error) {
    console.error('下载文件失败:', error);
    throw new Error('下载文件失败，请稍后重试');
  }
}

/**
 * 验证导入数据的格式
 */
export function validateImportData(data: any): { valid: boolean; error?: string } {
  try {
    // 检查基本结构
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '数据格式无效' };
    }

    // 检查版本信息
    if (!data.version) {
      return { valid: false, error: '缺少版本信息' };
    }

    // 检查用户数据结构
    if (!data.userData || typeof data.userData !== 'object') {
      return { valid: false, error: '用户数据结构无效' };
    }

    const { userData } = data;

    // 检查必要字段
    if (!Array.isArray(userData.registeredUsers)) {
      return { valid: false, error: '注册用户数据格式无效' };
    }

    if (!Array.isArray(userData.reports)) {
      return { valid: false, error: '报告数据格式无效' };
    }

    if (!Array.isArray(userData.healthMetrics)) {
      return { valid: false, error: '健康指标数据格式无效' };
    }

    // 验证用户数据结构
    for (const user of userData.registeredUsers) {
      if (!user.id || !user.email || !user.name) {
        return { valid: false, error: '用户数据缺少必要字段' };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('验证数据失败:', error);
    return { valid: false, error: '数据验证失败' };
  }
}

/**
 * 导入数据
 */
export function importData(data: ExportData, options: { 
  overwrite?: boolean; 
  mergeUsers?: boolean;
  preserveCurrentUser?: boolean;
} = {}): { success: boolean; message: string; details?: any } {
  try {
    // 验证数据
    const validation = validateImportData(data);
    if (!validation.valid) {
      return { success: false, message: validation.error || '数据验证失败' };
    }

    const { overwrite = false, mergeUsers = true, preserveCurrentUser = true } = options;
    const { userData } = data;

    // 备份当前数据（以防导入失败）
    const backup = exportAllData();

    try {
      // 处理注册用户数据
      if (overwrite) {
        // 完全覆盖
        localStorage.setItem('pregnancy-registered-users', JSON.stringify(userData.registeredUsers));
      } else if (mergeUsers) {
        // 合并用户数据
        const currentUsers = JSON.parse(localStorage.getItem('pregnancy-registered-users') || '[]');
        const mergedUsers = [...currentUsers];
        
        userData.registeredUsers.forEach((importUser: any) => {
          const existingIndex = mergedUsers.findIndex(u => u.email === importUser.email);
          if (existingIndex >= 0) {
            // 更新现有用户（保留更新的数据）
            mergedUsers[existingIndex] = {
              ...mergedUsers[existingIndex],
              ...importUser,
              id: mergedUsers[existingIndex].id, // 保持原有ID
            };
          } else {
            // 添加新用户
            mergedUsers.push(importUser);
          }
        });
        
        localStorage.setItem('pregnancy-registered-users', JSON.stringify(mergedUsers));
      }

      // 处理当前用户
      if (!preserveCurrentUser && userData.currentUser) {
        localStorage.setItem('pregnancy-auth-user', JSON.stringify(userData.currentUser));
      }

      // 处理报告数据
      if (overwrite) {
        localStorage.setItem('pregnancy-reports', JSON.stringify(userData.reports));
      } else {
        // 合并报告数据
        const currentReports = JSON.parse(localStorage.getItem('pregnancy-reports') || '[]');
        const mergedReports = [...currentReports];
        
        userData.reports.forEach((importReport: any) => {
          const existingIndex = mergedReports.findIndex(r => r.id === importReport.id);
          if (existingIndex >= 0) {
            mergedReports[existingIndex] = importReport;
          } else {
            mergedReports.push(importReport);
          }
        });
        
        localStorage.setItem('pregnancy-reports', JSON.stringify(mergedReports));
      }

      // 处理健康指标数据
      if (overwrite) {
        localStorage.setItem('pregnancy-metrics', JSON.stringify(userData.healthMetrics));
      } else {
        // 合并健康指标数据
        const currentMetrics = JSON.parse(localStorage.getItem('pregnancy-metrics') || '[]');
        const mergedMetrics = [...currentMetrics];
        
        userData.healthMetrics.forEach((importMetric: any) => {
          const existingIndex = mergedMetrics.findIndex(m => m.id === importMetric.id);
          if (existingIndex >= 0) {
            mergedMetrics[existingIndex] = importMetric;
          } else {
            mergedMetrics.push(importMetric);
          }
        });
        
        localStorage.setItem('pregnancy-metrics', JSON.stringify(mergedMetrics));
      }

      // 处理综合分析数据
      if (userData.comprehensiveAnalysis) {
        localStorage.setItem('pregnancy-comprehensive-analysis', JSON.stringify(userData.comprehensiveAnalysis));
      }

      // 触发数据更新事件
      window.dispatchEvent(new CustomEvent('localStorage-pregnancy-registered-users', {
        detail: JSON.parse(localStorage.getItem('pregnancy-registered-users') || '[]')
      }));
      
      window.dispatchEvent(new CustomEvent('localStorage-pregnancy-reports', {
        detail: JSON.parse(localStorage.getItem('pregnancy-reports') || '[]')
      }));

      window.dispatchEvent(new CustomEvent('localStorage-pregnancy-metrics', {
        detail: JSON.parse(localStorage.getItem('pregnancy-metrics') || '[]')
      }));

      const importStats = {
        usersImported: userData.registeredUsers.length,
        reportsImported: userData.reports.length,
        metricsImported: userData.healthMetrics.length,
        importDate: data.exportDate,
      };

      console.log('✅ 数据导入成功:', importStats);
      
      return { 
        success: true, 
        message: '数据导入成功', 
        details: importStats 
      };

    } catch (importError) {
      // 导入失败，恢复备份数据
      console.error('导入过程中出错，正在恢复备份:', importError);
      
      localStorage.setItem('pregnancy-registered-users', JSON.stringify(backup.userData.registeredUsers));
      localStorage.setItem('pregnancy-auth-user', JSON.stringify(backup.userData.currentUser));
      localStorage.setItem('pregnancy-reports', JSON.stringify(backup.userData.reports));
      localStorage.setItem('pregnancy-metrics', JSON.stringify(backup.userData.healthMetrics));
      
      throw importError;
    }

  } catch (error) {
    console.error('导入数据失败:', error);
    return { success: false, message: '导入数据失败，请检查文件格式' };
  }
}

/**
 * 从文件导入数据
 */
export function importDataFromFile(file: File, options?: { 
  overwrite?: boolean; 
  mergeUsers?: boolean;
  preserveCurrentUser?: boolean;
}): Promise<{ success: boolean; message: string; details?: any }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = JSON.parse(jsonString);
        const result = importData(data, options);
        resolve(result);
      } catch (error) {
        console.error('解析文件失败:', error);
        resolve({ success: false, message: '文件格式无效，请选择正确的备份文件' });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: '读取文件失败，请重试' });
    };
    
    reader.readAsText(file);
  });
}
