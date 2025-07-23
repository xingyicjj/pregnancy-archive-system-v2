import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginForm, RegisterForm } from '../types';
import { verifyEmailCode, cleanupExpiredVerifications } from '../services/emailService';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AuthContextType extends AuthState {
  login: (form: LoginForm) => Promise<{ success: boolean; message: string }>;
  register: (form: RegisterForm) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  checkUserExists: (email: string) => boolean;
  getRegisteredUsers: () => User[];
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // 使用 localStorage 持久化用户数据
  const [storedUser, setStoredUser, refreshStoredUser] = useLocalStorage<User | null>('pregnancy-auth-user', null);
  const [registeredUsers, setRegisteredUsers, refreshRegisteredUsers] = useLocalStorage<User[]>('pregnancy-registered-users', []);

  // 初始化认证状态
  useEffect(() => {
    // 清理过期的验证码
    cleanupExpiredVerifications();

    if (storedUser) {
      setAuthState({
        isAuthenticated: true,
        user: storedUser,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [storedUser]);

  const login = async (form: LoginForm): Promise<{ success: boolean; message: string }> => {
    try {
      // 查找用户
      const user = registeredUsers.find(u => u.email === form.email);
      if (!user) {
        return { success: false, message: '用户不存在，请先注册 →' };
      }

      // 验证密码
      if (user.password !== form.password) {
        return { success: false, message: '密码错误，请重新输入' };
      }

      // 登录成功
      setStoredUser(user);
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });

      return { success: true, message: '登录成功' };
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, message: '登录失败，请稍后重试' };
    }
  };

  const register = async (form: RegisterForm): Promise<{ success: boolean; message: string }> => {
    try {
      // 验证邮件验证码
      const emailVerification = verifyEmailCode(form.email, form.emailCode);
      if (!emailVerification.success) {
        return emailVerification;
      }

      // 检查邮箱是否已注册
      const existingUser = registeredUsers.find(u => u.email === form.email);
      if (existingUser) {
        return { success: false, message: '该邮箱已注册，请直接登录 →' };
      }

      // 根据末次月经日期计算预产期和当前孕周
      const lmpDate = new Date(form.lastMenstrualPeriod);
      const currentDate = new Date();

      // 预产期通常是末次月经后280天（40周）
      const dueDateObj = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
      const diffTime = currentDate.getTime() - lmpDate.getTime();
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

      // 创建新用户
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: form.name,
        email: form.email,
        password: form.password, // 存储密码（实际项目中应该加密）
        phone: '', // 默认为空，用户可以后续在个人资料中填写
        dueDate: dueDateObj.toISOString().split('T')[0], // 根据末次月经计算
        lastMenstrualPeriod: form.lastMenstrualPeriod,
        currentWeek: Math.max(0, Math.min(42, diffWeeks)), // 限制在0-42周之间
        medicalHistory: [],
      };

      // 保存用户到注册用户列表
      const updatedUsers = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);

      // 自动登录
      setStoredUser(newUser);
      setAuthState({
        isAuthenticated: true,
        user: newUser,
        isLoading: false,
      });

      return { success: true, message: '注册成功' };
    } catch (error) {
      console.error('注册失败:', error);
      return { success: false, message: '注册失败，请稍后重试' };
    }
  };

  const logout = () => {
    setStoredUser(null);
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  const updateUser = (updatedUser: User) => {
    // 更新当前用户
    setStoredUser(updatedUser);
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));

    // 更新注册用户列表中的用户信息
    const updatedUsers = registeredUsers.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    );
    setRegisteredUsers(updatedUsers);
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const userIndex = registeredUsers.findIndex(u => u.email === email);

      if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
      }

      // 更新用户密码
      const updatedUsers = [...registeredUsers];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
      setRegisteredUsers(updatedUsers);

      return { success: true, message: '密码重置成功' };
    } catch (error) {
      console.error('重置密码失败:', error);
      return { success: false, message: '重置失败，请稍后重试' };
    }
  };

  const checkUserExists = (email: string): boolean => {
    return registeredUsers.some(u => u.email === email);
  };

  const getRegisteredUsers = (): User[] => {
    return registeredUsers;
  };

  const refreshUserData = () => {
    refreshRegisteredUsers();
    refreshStoredUser();
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    resetPassword,
    checkUserExists,
    getRegisteredUsers,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
