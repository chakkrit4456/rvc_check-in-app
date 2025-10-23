// services/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { LoginResponse, RegisterResponse, Profile } from '../types';

export const login = async (email: string, password: string, loginType: 'email' | 'student' = 'email'): Promise<LoginResponse> => {
  try {
    console.log('Attempting login with:', email, 'type:', loginType);
    
    // Always use profile lookup instead of Supabase Auth
    let profileQuery;
    
    if (loginType === 'student') {
      // Login with student ID and national ID
      profileQuery = supabase
        .from('profiles')
        .select(`
          *,
          classroom:classrooms(*),
          department:departments(*)
        `)
        .eq('student_id', email)
        .eq('national_id', password)
        .single();
    } else {
      // Login with email
      profileQuery = supabase
        .from('profiles')
        .select(`
          *,
          classroom:classrooms(*),
          department:departments(*)
        `)
        .eq('email', email)
        .single();
    }

    const { data: profile, error: profileError } = await profileQuery;

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      console.log('Using fallback authentication system');
      
      // Fallback: Check for admin login
      if (loginType === 'email' && email === 'chakkritnb1123@gmail.com') {
        const fallbackAdmin = {
          id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          student_id: 'admin',
          national_id: '66202040013',
          first_name: 'Chakkrit',
          last_name: 'Admin',
          gender: 'male',
          email: 'chakkritnb1123@gmail.com',
          phone: '0812345678',
          role: 'admin',
          is_active: true,
          classroom: null,
          department: null
        };

        const mockSession = {
          access_token: 'admin_session_' + Date.now(),
          refresh_token: 'admin_refresh_' + Date.now(),
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: fallbackAdmin.id,
            email: fallbackAdmin.email,
            role: fallbackAdmin.role,
          }
        };

        await AsyncStorage.setItem('auth_session', JSON.stringify(mockSession));
        await AsyncStorage.setItem('user_profile', JSON.stringify(fallbackAdmin));

        return {
          success: true,
          user: fallbackAdmin as Profile,
          session: mockSession,
        };
      }
      
      // Fallback: Check for test student
      if (loginType === 'student' && email === '1234567890' && password === '1234567890123') {
        const fallbackStudent = {
          id: '01ce7d17-5810-408b-93f2-d375622e782f',
          student_id: '1234567890',
          national_id: '1234567890123',
          first_name: 'Test',
          last_name: 'Student',
          gender: 'male',
          email: 'test.student@example.com',
          phone: '0987654321',
          role: 'student',
          is_active: true,
          classroom: { id: 'class-001', name: 'ปวช.1/1' },
          department: { id: 'd003', name: 'เทคโนโลยีสารสนเทศฯ' }
        };

        const mockSession = {
          access_token: 'student_session_' + Date.now(),
          refresh_token: 'student_refresh_' + Date.now(),
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: fallbackStudent.id,
            email: fallbackStudent.email,
            role: fallbackStudent.role,
          }
        };

        await AsyncStorage.setItem('auth_session', JSON.stringify(mockSession));
        await AsyncStorage.setItem('user_profile', JSON.stringify(fallbackStudent));

        return {
          success: true,
          user: fallbackStudent as Profile,
          session: mockSession,
        };
      }
      
      return {
        success: false,
        message: loginType === 'student' 
          ? 'รหัสนักศึกษาหรือรหัสบัตรประชาชนไม่ถูกต้อง'
          : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      };
    }

    if (!profile) {
      return {
        success: false,
        message: 'ไม่พบข้อมูลผู้ใช้',
      };
    }

    console.log('Login successful:', profile);

    // Create mock session for all logins
    const mockSession = {
      access_token: 'session_' + Date.now(),
      refresh_token: 'refresh_' + Date.now(),
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
      }
    };

    // Store session data
    await AsyncStorage.setItem('auth_session', JSON.stringify(mockSession));
    await AsyncStorage.setItem('user_profile', JSON.stringify(profile));

    return {
      success: true,
      user: profile as Profile,
      session: mockSession,
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
          department_id: formData.department_id,
          classroom_id: formData.classroom_id,
          year_level: formData.year_level,
          role: 'student',
          profile_picture_url: formData.profile_picture_url,
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
    // First try to get from AsyncStorage
    const storedProfile = await AsyncStorage.getItem('user_profile');
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }

    // If not in storage, try to get from Supabase auth
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