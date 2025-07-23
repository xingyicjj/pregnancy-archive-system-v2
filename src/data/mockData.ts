import { User, Report, HealthMetric } from '../types';

export const mockUser: User = {
  id: '1',
  name: '张小美',
  phone: '138****8888',
  email: 'demo@example.com', // 新增邮箱字段
  password: '123456', // 演示密码
  avatar: 'https://images.pexels.com/photos/2169434/pexels-photo-2169434.jpeg?auto=compress&cs=tinysrgb&w=150',
  dueDate: '2024-08-15',
  lastMenstrualPeriod: '2023-11-15',
  currentWeek: 28,
  medicalHistory: ['无重大疾病史', '无遗传病史']
};

export const mockReports: Report[] = [
  {
    id: '1',
    type: '血常规检查',
    title: '血常规检查',
    date: '2024-01-15',
    imageUrl: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=800',
    extractedData: {
      hemoglobin: 120,
      whiteBloodCells: 8.5,
      platelets: 250,
      glucose: 5.2
    },
    analysis: {
      summary: '血常规指标基本正常，血红蛋白水平良好，血糖控制理想。',
      alerts: [
        {
          level: 'low',
          message: '血红蛋白略低，建议适当补铁'
        }
      ],
      recommendations: [
        '多食用富含铁质的食物，如瘦肉、菠菜',
        '定期复查血常规',
        '保持均衡饮食'
      ]
    },
    status: 'completed',
    uploadedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'B超检查',
    title: 'B超检查',
    date: '2024-01-10',
    imageUrl: 'https://images.pexels.com/photos/7088526/pexels-photo-7088526.jpeg?auto=compress&cs=tinysrgb&w=800',
    extractedData: {
      fetalWeight: 1200,
      biparietal: 70,
      fetalHeartRate: 145,
      amnioticFluid: 'normal'
    },
    analysis: {
      summary: '胎儿发育良好，各项指标正常，胎心率稳定。',
      alerts: [],
      recommendations: [
        '继续保持健康的生活方式',
        '定期产检',
        '注意胎动情况'
      ]
    },
    status: 'completed',
    uploadedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    type: '糖耐量测试',
    title: '糖耐量测试',
    date: '2024-01-05',
    imageUrl: 'https://images.pexels.com/photos/3845129/pexels-photo-3845129.jpeg?auto=compress&cs=tinysrgb&w=800',
    extractedData: {
      fastingGlucose: 5.1,
      oneHourGlucose: 8.5,
      twoHourGlucose: 7.2
    },
    analysis: {
      summary: '糖耐量测试结果正常，无妊娠糖尿病风险。',
      alerts: [],
      recommendations: [
        '继续保持低糖饮食',
        '适量运动',
        '定期监测血糖'
      ]
    },
    status: 'completed',
    uploadedAt: '2024-01-05T09:15:00Z'
  }
];

export const mockHealthMetrics: HealthMetric[] = [
  {
    date: '2024-01-15',
    weight: 65.5,
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 75,
    glucose: 5.2,
    hemoglobin: 120
  },
  {
    date: '2024-01-10',
    weight: 65.2,
    bloodPressure: { systolic: 118, diastolic: 78 },
    heartRate: 73,
    glucose: 5.1
  },
  {
    date: '2024-01-05',
    weight: 64.8,
    bloodPressure: { systolic: 122, diastolic: 82 },
    heartRate: 76,
    glucose: 5.0
  },
  {
    date: '2024-01-01',
    weight: 64.5,
    bloodPressure: { systolic: 119, diastolic: 79 },
    heartRate: 74,
    glucose: 4.9
  },
  {
    date: '2023-12-25',
    weight: 64.0,
    bloodPressure: { systolic: 121, diastolic: 81 },
    heartRate: 75,
    glucose: 5.0
  },
  {
    date: '2023-12-20',
    weight: 63.8,
    bloodPressure: { systolic: 117, diastolic: 77 },
    heartRate: 72,
    glucose: 4.8
  }
];