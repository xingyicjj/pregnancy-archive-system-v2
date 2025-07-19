export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  dueDate: string;
  lastMenstrualPeriod: string;
  currentWeek: number;
  medicalHistory?: string[];
}

export interface Report {
  id: string;
  type: string;  // 改为灵活的字符串类型
  title: string;
  date: string;
  imageUrl: string;
  extractedData: Record<string, any>;
  analysis: {
    summary: string;
    alerts: Array<{
      level: 'low' | 'medium' | 'high';
      message: string;
    }>;
    recommendations: string[];
  };
  status: 'processing' | 'completed' | 'failed';
  uploadedAt: string;
}

export interface HealthMetric {
  date: string;
  weight: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  glucose?: number;
  hemoglobin?: number;
}

export type NavigationTab = 'dashboard' | 'reports' | 'upload' | 'profile';