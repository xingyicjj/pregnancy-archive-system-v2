export interface User {
  id: string;
  name: string;
  phone: string;
  email: string; // 新增邮箱字段
  password: string; // 新增密码字段
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

export type NavigationTab = 'dashboard' | 'reports' | 'upload' | 'analysis' | 'profile';

// 认证相关类型
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
  captcha: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string; // 保留但在表单中不显示
  captcha: string;
  emailCode: string;
  dueDate: string; // 保留但在表单中不显示，将根据末次月经自动计算
  lastMenstrualPeriod: string; // 用户输入的末次月经日期
}

export interface CaptchaData {
  text: string;
  dataUrl: string;
}

export interface EmailVerification {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}