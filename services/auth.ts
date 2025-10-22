// services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'staff' | 'admin';
    class?: string; // สำหรับนักเรียน
  };
  message?: string;
}

const API_BASE_URL = 'https://your-api-domain.com/api/v1';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        token: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      };
    } else {
      return {
        success: false,
        message: data.message || 'ล็อกอินไม่สำเร็จ',
      };
    }
  } catch (error) {
    console.error('Login API error:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Call logout API if needed
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    // Clear local storage
    await AsyncStorage.multiRemove([
      'auth_token',
      'refresh_token',
      'user_data',
      'device_token',
    ]);
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local storage even if API call fails
    await AsyncStorage.multiRemove([
      'auth_token',
      'refresh_token',
      'user_data',
      'device_token',
    ]);
  }
};