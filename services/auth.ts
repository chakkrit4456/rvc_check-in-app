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

// Read from environment instead of using a placeholder URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    if (!API_BASE_URL) {
      return { success: false, message: 'ระบบยังไม่ได้ตั้งค่า API_BASE_URL' };
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // Try to parse JSON safely
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // Fall through; non-JSON response
    }

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
        message: (data && (data.message || data.error)) || 'ล็อกอินไม่สำเร็จ',
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
    if (token && API_BASE_URL) {
      await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(() => undefined);
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