import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSystemConfig } from '../lib/config';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; userID?: string; requiresOTP?: boolean }>;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string; userID?: string; otpSecret?: string; qrCodeURL?: string }>;
  verifyOTP: (userID: string, otpCode: string) => Promise<{ success: boolean; message?: string }>;
  completeRegistration: (userID: string, otpCode: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 先检查是否为管理员模式（使用带缓存的系统配置获取）
    getSystemConfig()
      .then(data => {
        if (data.admin_mode) {
          // 管理员模式下，模拟admin用户
          setUser({ id: 'admin', email: 'admin@localhost' });
          setToken('admin-mode');
        } else {
          // 非管理员模式，检查本地存储中是否有token
          const savedToken = localStorage.getItem('auth_token');
          const savedUser = localStorage.getItem('auth_user');
          
          if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch system config:', err);
        // 发生错误时，继续检查本地存储
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires_otp) {
          return {
            success: true,
            userID: data.user_id,
            requiresOTP: true,
            message: data.message,
          };
        }
      } else {
        return { success: false, message: data.error };
      }
    } catch (error) {
      return { success: false, message: '登录失败，请重试' };
    }

    return { success: false, message: '未知错误' };
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          userID: data.user_id,
          otpSecret: data.otp_secret,
          qrCodeURL: data.qr_code_url,
          message: data.message,
        };
      } else {
        return { success: false, message: data.error };
      }
    } catch (error) {
      return { success: false, message: '注册失败，请重试' };
    }
  };

  const verifyOTP = async (userID: string, otpCode: string) => {
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userID, otp_code: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // 登录成功，保存token和用户信息
        const userInfo = { id: data.user_id, email: data.email };
        setToken(data.token);
        setUser(userInfo);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(userInfo));
        
        // 跳转到首页
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error };
      }
    } catch (error) {
      return { success: false, message: 'OTP验证失败，请重试' };
    }
  };

  const completeRegistration = async (userID: string, otpCode: string) => {
    try {
      const response = await fetch('/api/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userID, otp_code: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // 注册完成，自动登录
        const userInfo = { id: data.user_id, email: data.email };
        setToken(data.token);
        setUser(userInfo);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(userInfo));
        
        // 跳转到首页
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error };
      }
    } catch (error) {
      return { success: false, message: '注册完成失败，请重试' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        verifyOTP,
        completeRegistration,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}