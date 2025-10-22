// services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { LoginResponse, RegisterResponse, Profile } from '../types';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: error.message || 'ล็อกอินไม่สำเร็จ',
      };
    }

    if (data.user) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          classroom:classrooms(*),
          department:departments(*)
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return {
          success: false,
          message: 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้',
        };
      }

      // Store session data
      await AsyncStorage.setItem('auth_session', JSON.stringify(data.session));
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));

      return {
        success: true,
        user: profile as Profile,
        session: data.session,
      };
    }

    return {
      success: false,
      message: 'ไม่พบข้อมูลผู้ใช้',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    };
  }
};

export const register = async (formData: any): Promise<RegisterResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
        },
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message || 'การลงทะเบียนไม่สำเร็จ',
      };
    }

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          student_id: formData.student_id,
          national_id: formData.national_id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          classroom_id: formData.classroom_id,
          year_level: formData.year_level,
          role: 'student',
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return {
          success: false,
          message: 'ไม่สามารถสร้างโปรไฟล์ได้',
        };
      }

      return {
        success: true,
        message: 'ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
      };
    }

    return {
      success: false,
      message: 'ไม่สามารถสร้างบัญชีได้',
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear local storage
    await AsyncStorage.multiRemove([
      'auth_session',
      'user_profile',
      'device_token',
    ]);
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local storage even if API call fails
    await AsyncStorage.multiRemove([
      'auth_session',
      'user_profile',
      'device_token',
    ]);
  }
};

export const getCurrentUser = async (): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        classroom:classrooms(*),
        department:departments(*)
      `)
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }

    return profile as Profile;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; message?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'ไม่พบผู้ใช้' };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'อัปเดตโปรไฟล์สำเร็จ' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดต' };
  }
};

export const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://your-app.com/reset-password',
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' };
  }
};